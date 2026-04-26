import axios from 'axios';
import { Link, HealthStatus, CreateLinkDTO, UpdateLinkDTO, RatingSummary, DeadLinkReportWithLink, Notification, Discussion, DiscussionWithMessages, Message } from '../types';

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
  sort?: string;
}): Promise<Link[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.tags) params.set('tags', filters.tags);
  if (filters?.sort) params.set('sort', filters.sort);
  const { data } = await api.get<Link[]>(`/links?${params.toString()}`);
  return Array.isArray(data) ? data : [];
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/links/categories');
  return Array.isArray(data) ? data : [];
}

export async function fetchTags(): Promise<{ tag: string; count: number }[]> {
  const { data } = await api.get<{ tag: string; count: number }[]>('/links/tags');
  return Array.isArray(data) ? data : [];
}

export async function fetchHealthStatuses(): Promise<HealthStatus[]> {
  const { data } = await api.get<HealthStatus[]>('/health');
  return Array.isArray(data) ? data : [];
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

// Ratings
export async function fetchRatings(visitorId?: string): Promise<RatingSummary[]> {
  const params = visitorId ? `?visitorId=${visitorId}` : '';
  const { data } = await api.get<RatingSummary[]>(`/links/ratings${params}`);
  return Array.isArray(data) ? data : [];
}

export async function rateLink(linkId: string, visitorId: string, score: number): Promise<RatingSummary> {
  const { data } = await api.post<RatingSummary>(`/links/${linkId}/rate`, { visitorId, score });
  return data;
}

// Reports
export async function reportDeadLink(linkId: string, visitorId: string): Promise<void> {
  await api.post(`/links/${linkId}/report-dead`, { visitorId });
}

export async function fetchReports(): Promise<{ reports: DeadLinkReportWithLink[]; undismissedCount: number }> {
  const { data } = await api.get('/reports');
  return data;
}

export async function fetchReportCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/reports/count');
  return data.count;
}

export async function dismissReport(reportId: string): Promise<void> {
  await api.patch(`/reports/${reportId}/dismiss`);
}

export async function dismissAllReports(): Promise<void> {
  await api.post('/reports/dismiss-all');
}

// Reorder
export async function reorderLinks(orderedIds: string[]): Promise<void> {
  await api.put('/links/reorder', { orderedIds });
}

// Bulk import
export async function importLinks(links: Array<{
  title: string; url: string; category: string;
  description?: string; tags?: string[]; icon?: string;
}>): Promise<{ created: number; skipped: number; errors: string[] }> {
  const { data } = await api.post('/links/import', { links });
  return data;
}

// Notifications
export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications');
  return Array.isArray(data) ? data : [];
}

export async function createNotification(payload: {
  title: string;
  content?: string;
  badge?: Notification['badge'];
}): Promise<Notification> {
  const { data } = await api.post<Notification>('/notifications', payload);
  return data;
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}

// Screenshots
export async function generateAllScreenshots(): Promise<{
  total: number;
  generated: number;
  errors: number;
  alreadyCached: number;
}> {
  const { data } = await api.post('/screenshots/generate-all');
  return data;
}

// Discussions
export async function fetchDiscussions(): Promise<Discussion[]> {
  const { data } = await api.get<Discussion[]>('/discussions');
  return Array.isArray(data) ? data : [];
}

export async function fetchDiscussion(id: string): Promise<DiscussionWithMessages> {
  const { data } = await api.get<DiscussionWithMessages>(`/discussions/${id}`);
  return data;
}

export async function createDiscussion(payload: {
  title: string;
  authorName: string;
  authorId: string;
  content: string;
}): Promise<Discussion> {
  const { data } = await api.post<Discussion>('/discussions', payload);
  return data;
}

export async function postMessage(discussionId: string, payload: {
  authorName: string;
  authorId: string;
  content: string;
}): Promise<Message> {
  const { data } = await api.post<Message>(`/discussions/${discussionId}/messages`, payload);
  return data;
}

export async function deleteDiscussion(id: string): Promise<void> {
  await api.delete(`/discussions/${id}`);
}

export async function deleteMessage(discussionId: string, messageId: string): Promise<void> {
  await api.delete(`/discussions/${discussionId}/messages/${messageId}`);
}

export async function updateMessage(discussionId: string, messageId: string, payload: {
  authorId: string;
  content: string;
}): Promise<Message> {
  const { data } = await api.patch<Message>(`/discussions/${discussionId}/messages/${messageId}`, payload);
  return data;
}

export async function togglePinDiscussion(id: string): Promise<Discussion> {
  const { data } = await api.patch<Discussion>(`/discussions/${id}/pin`);
  return data;
}
