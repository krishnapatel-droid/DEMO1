import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { itemsApi } from './api';
import type { Item, ListParams } from './api';

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ListParams['sortBy']>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'active' as 'active' | 'inactive' });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await itemsApi.list({ q: search, sortBy, sortDir, page, pageSize });
      setItems(result.data);
      setTotal(result.meta.total);
    } catch {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortDir, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description, status: item.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemsApi.update(editingItem.id, formData);
      } else {
        await itemsApi.create(formData);
      }
      setShowModal(false);
      fetchItems();
    } catch {
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsApi.delete(id);
      fetchItems();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const toggleStatus = async (item: Item) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      await itemsApi.update(item.id, { status: newStatus });
      fetchItems();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>📋 My Tasks</h1>
        <p className="app-subtitle">Manage your daily tasks efficiently</p>
      </header>

      <main className="app-main">
        {/* Search and Controls */}
        <div className="controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit">Search</button>
          </form>

          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as ListParams['sortBy']); setPage(1); }}>
              <option value="createdAt">Created</option>
              <option value="updatedAt">Updated</option>
              <option value="title">Title</option>
            </select>
            <select value={sortDir} onChange={(e) => { setSortDir(e.target.value as 'asc' | 'desc'); setPage(1); }}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <button className="btn-primary" onClick={openCreateModal}>+ Add Item</button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Items List */}
            <div className="items-list">
              {items.length === 0 ? (
                <div className="empty-state">No items found</div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={`item-card ${item.status}`}>
                    <div className="item-header">
                      <h3>{item.title}</h3>
                      <span className={`status-badge ${item.status}`}>{item.status}</span>
                    </div>
                    <p className="item-description">{item.description || 'No description'}</p>
                    <div className="item-meta">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => toggleStatus(item)}>
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => openEditModal(item)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Item' : 'Create Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
