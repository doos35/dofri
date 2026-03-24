import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../storage/fileStore';
import { Link, CreateLinkDTO, UpdateLinkDTO } from '../types';

const LINKS_FILE = 'links.json';

export async function getAllLinks(filters?: {
  search?: string;
  category?: string;
  tags?: string;
}): Promise<Link[]> {
  let links = await readJSON<Link[]>(LINKS_FILE);

  if (filters?.category) {
    links = links.filter(l => l.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.tags) {
    const filterTags = filters.tags.split(',').map(t => t.trim().toLowerCase());
    links = links.filter(l =>
      filterTags.some(ft => l.tags.map(t => t.toLowerCase()).includes(ft))
    );
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    links = links.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.url.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return links;
}

export async function getLinkById(id: string): Promise<Link | undefined> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  return links.find(l => l.id === id);
}

export async function createLink(data: CreateLinkDTO): Promise<Link> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const now = new Date().toISOString();

  let icon = data.icon || '';
  if (!icon && data.url) {
    try {
      const domain = new URL(data.url).hostname;
      icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {}
  }

  const newLink: Link = {
    id: uuidv4(),
    title: data.title,
    url: data.url,
    description: data.description || '',
    category: data.category,
    tags: data.tags || [],
    icon,
    favorite: data.favorite || false,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
  };

  links.push(newLink);
  await writeJSON(LINKS_FILE, links);
  return newLink;
}

export async function updateLink(id: string, data: UpdateLinkDTO): Promise<Link | null> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;

  const existing = links[index];

  if (data.url && data.url !== existing.url && !data.icon) {
    try {
      const domain = new URL(data.url).hostname;
      data.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {}
  }

  const updated: Link = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  links[index] = updated;
  await writeJSON(LINKS_FILE, links);
  return updated;
}

export async function deleteLink(id: string): Promise<boolean> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const filtered = links.filter(l => l.id !== id);
  if (filtered.length === links.length) return false;
  await writeJSON(LINKS_FILE, filtered);
  return true;
}

export async function toggleFavorite(id: string): Promise<Link | null> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;

  links[index].favorite = !links[index].favorite;
  links[index].updatedAt = new Date().toISOString();
  await writeJSON(LINKS_FILE, links);
  return links[index];
}

export async function trackClick(id: string): Promise<Link | null> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;

  links[index].clicks = (links[index].clicks || 0) + 1;
  await writeJSON(LINKS_FILE, links);
  return links[index];
}

export async function getCategories(): Promise<string[]> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  return [...new Set(links.map(l => l.category))].sort();
}

export async function getTags(): Promise<{ tag: string; count: number }[]> {
  const links = await readJSON<Link[]>(LINKS_FILE);
  const tagMap = new Map<string, number>();
  for (const link of links) {
    for (const tag of link.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
