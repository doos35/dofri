import { v4 as uuidv4 } from 'uuid';
import { LinkModel } from '../db/models';
import { Link, CreateLinkDTO, UpdateLinkDTO } from '../types';

const PROJ = { _id: 0, __v: 0 };

export async function getAllLinks(filters?: {
  search?: string;
  category?: string;
  tags?: string;
}): Promise<Link[]> {
  const query: Record<string, unknown> = {};

  if (filters?.category) {
    query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
  }

  if (filters?.tags) {
    const filterTags = filters.tags.split(',').map(t => t.trim());
    query.tags = { $in: filterTags.map(t => new RegExp(`^${t}$`, 'i')) };
  }

  let links = await LinkModel.find(query, PROJ).lean<Link[]>();

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
  const doc = await LinkModel.findOne({ id }, PROJ).lean<Link>();
  return doc ?? undefined;
}

export async function createLink(data: CreateLinkDTO): Promise<Link> {
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

  await LinkModel.create(newLink);
  return newLink;
}

export async function updateLink(id: string, data: UpdateLinkDTO): Promise<Link | null> {
  const existing = await LinkModel.findOne({ id }, PROJ).lean<Link>();
  if (!existing) return null;

  if (data.url && data.url !== existing.url && !data.icon) {
    try {
      const domain = new URL(data.url).hostname;
      data.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {}
  }

  const updated = await LinkModel.findOneAndUpdate(
    { id },
    { ...data, updatedAt: new Date().toISOString() },
    { new: true, projection: PROJ }
  ).lean<Link>();

  return updated ?? null;
}

export async function deleteLink(id: string): Promise<boolean> {
  const result = await LinkModel.deleteOne({ id });
  return result.deletedCount > 0;
}

export async function toggleFavorite(id: string): Promise<Link | null> {
  const link = await LinkModel.findOne({ id }, PROJ).lean<Link>();
  if (!link) return null;

  const updated = await LinkModel.findOneAndUpdate(
    { id },
    { favorite: !link.favorite, updatedAt: new Date().toISOString() },
    { new: true, projection: PROJ }
  ).lean<Link>();

  return updated ?? null;
}

export async function trackClick(id: string): Promise<Link | null> {
  const updated = await LinkModel.findOneAndUpdate(
    { id },
    { $inc: { clicks: 1 } },
    { new: true, projection: PROJ }
  ).lean<Link>();

  return updated ?? null;
}

export async function getCategories(): Promise<string[]> {
  const categories = await LinkModel.distinct('category');
  return (categories as string[]).sort();
}

export async function getTags(): Promise<{ tag: string; count: number }[]> {
  return LinkModel.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);
}
