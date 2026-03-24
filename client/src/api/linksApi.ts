import axios from 'axios';
import { Link, HealthStatus, CreateLinkDTO, UpdateLinkDTO } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: BASE_URL });

// Inject auth token on every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lp_token');
      localStorage.removeItem('lp_username');
      // Redirect to login if on admin page
      if (window.location.pathname === '/admin') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchLinks(filters?: {
  search?: string;
  category?: string;
  tags?: string;
}): Promise<Link[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.tags) params.set('tags', filters.tags);
  const { data } = await api.get<Link[]>(`/links?${params.toString()}`);
  return data;
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/links/categories');
  return data;
}

export async function fetchTags(): Promise<{ tag: string; count: number }[]> {
  const { data } = await api.get<{ tag: string; count: number }[]>('/links/tags');
  return data;
}

export async function fetchHealthStatuses(): Promise<HealthStatus[]> {
  const { data } = await api.get<HealthStatus[]>('/health');
  return data;
}

export async function createLink(linkData: CreateLinkDTO): Promise<Link> {
  const { data } = await api.post<Link>('/links', linkData);
  return data;
}

export async function updateLink(id: string, linkData: UpdateLinkDTO): Promise<Link> {
  const { data } = await api.put<Link>(`/links/${id}`, linkData);
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  await api.delete(`/links/${id}`);
}

export async function triggerHealthCheck(): Promise<{ message: string; results: HealthStatus[] }> {
  const { data } = await api.post<{ message: string; results: HealthStatus[] }>('/health/check');
  return data;
}

export async function trackClick(id: string): Promise<{ clicks: number }> {
  const { data } = await api.post<{ clicks: number }>(`/links/${id}/click`);
  return data;
}

export async function toggleFavorite(id: string): Promise<Link> {
  const { data } = await api.patch<Link>(`/links/${id}/favorite`);
  return data;
}
