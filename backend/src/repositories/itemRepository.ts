// Items repository - database operations using sql.js
import { getDb, saveDatabase } from '../db/schema.js';
import { v4 as uuidv4 } from 'uuid';
import type { Item, CreateItemInput, UpdateItemInput } from '../schemas/item.js';

export interface ListParams {
  q?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ListResult {
  data: Item[];
  meta: ListMeta;
}

function rowToItem(row: unknown[]): Item {
  return {
    id: row[0] as string,
    title: row[1] as string,
    description: row[2] as string,
    status: row[3] as 'active' | 'inactive',
    createdAt: row[4] as string,
    updatedAt: row[5] as string,
  };
}

export function listItems(params: ListParams = {}): ListResult {
  const {
    q = '',
    sortBy = 'createdAt',
    sortDir = 'desc',
    page = 1,
    pageSize = 10
  } = params;

  const validSortBy = ['title', 'createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
  const validSortDir = sortDir === 'asc' ? 'asc' : 'desc';
  const validPage = Math.max(1, Math.floor(page));
  const validPageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));

  const db = getDb();

  // Build WHERE clause
  let whereClause = '';
  const queryParams: (string | number)[] = [];
  
  if (q.trim()) {
    whereClause = 'WHERE (title LIKE ? OR description LIKE ?)';
    const searchTerm = `%${q.trim()}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM items ${whereClause}`;
  const countResult = db.exec(countSql, queryParams);
  const total = (countResult[0]?.values[0]?.[0] as number) || 0;

  // Get paginated data
  const offset = (validPage - 1) * validPageSize;
  const sql = `
    SELECT id, title, description, status, createdAt, updatedAt
    FROM items
    ${whereClause}
    ORDER BY ${validSortBy} ${validSortDir}
    LIMIT ? OFFSET ?
  `;
  
  const result = db.exec(sql, [...queryParams, validPageSize, offset]);
  const data = result.length > 0 ? result[0].values.map(rowToItem) : [];

  return {
    data,
    meta: {
      page: validPage,
      pageSize: validPageSize,
      total
    }
  };
}

export function getItem(id: string): Item | null {
  const db = getDb();
  const result = db.exec('SELECT id, title, description, status, createdAt, updatedAt FROM items WHERE id = ?', [id]);
  
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }
  
  return rowToItem(result[0].values[0]);
}

export function createItem(input: CreateItemInput): Item {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO items (id, title, description, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, input.title, input.description || '', input.status || 'active', now, now]);
  
  saveDatabase();
  
  return {
    id,
    title: input.title,
    description: input.description || '',
    status: input.status || 'active',
    createdAt: now,
    updatedAt: now
  };
}

export function updateItem(id: string, input: UpdateItemInput): Item | null {
  const existing = getItem(id);
  if (!existing) return null;

  const db = getDb();
  const now = new Date().toISOString();
  const updates: string[] = [];
  const params: (string | number)[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description);
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
  }

  if (updates.length === 0) return existing;

  updates.push('updatedAt = ?');
  params.push(now);
  params.push(id);

  db.run(`UPDATE items SET ${updates.join(', ')} WHERE id = ?`, params);
  saveDatabase();

  return getItem(id);
}

export function deleteItem(id: string): boolean {
  const db = getDb();
  const existing = getItem(id);
  if (!existing) return false;
  
  db.run('DELETE FROM items WHERE id = ?', [id]);
  saveDatabase();
  
  return true;
}
