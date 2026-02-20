import axios from 'axios';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Item {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ListParams {
  q?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ListResponse {
  data: Item[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export const itemsApi = {
  list: async (params: ListParams = {}): Promise<ListResponse> => {
    const response = await api.get<ListResponse>('/items', { params });
    return response.data;
  },

  get: async (id: string): Promise<Item> => {
    const response = await api.get<{ data: Item }>(`/items/${id}`);
    return response.data.data;
  },

  create: async (data: { title: string; description?: string; status?: string }): Promise<Item> => {
    const response = await api.post<{ data: Item }>('/items', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{ title: string; description: string; status: string }>): Promise<Item> => {
    const response = await api.put<{ data: Item }>(`/items/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};
