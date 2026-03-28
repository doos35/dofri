import { v4 as uuidv4 } from 'uuid';
import { LinkModel, NotificationModel } from '../db/models';
import { Link, CreateLinkDTO, UpdateLinkDTO } from '../types';

const PROJ = { _id: 0, __v: 0 };

export async function getAllLinks(filters?: {
  search?: string;
  category?: string;
  tags?: string;
  sort?: string;
}): Promise<Link[]> {
  const query: Record<string, unknown> = {};

  if (filters?.category) {
    const escaped = filters.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.category = { $regex: new RegExp(`^${escaped}$`, 'i') };
  }

  if (filters?.tags) {
    const filterTags = filters.tags.split(',').map(t => t.trim());
    query.tags = { $in: filterTags.map(t => {
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^${escaped}$`, 'i');
    }) };
  }

  // Recherche : regex sur titre/description/url/tags (supporte les sous-chaînes)
  if (filters?.search) {
    const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    query.$or = [
      { title: regex },
      { description: regex },
      { url: regex },
      { tags: regex },
    ];
  }

  // Tri
  let sortOption: Record<string, 1 | -1> = {};
  switch (filters?.sort) {
    case 'clicks':
      sortOption = { clicks: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'title':
      sortOption = { title: 1 };
      break;
    default:
      sortOption = { category: 1, order: 1, title: 1 };
  }

  return LinkModel.find(query, PROJ).sort(sortOption).lean<Link[]>();
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
    order: 0,
    createdAt: now,
    updatedAt: now,
  };

  await LinkModel.create(newLink);

  // Notification automatique
  NotificationModel.create({
    id: uuidv4(),
    title: newLink.title,
    content: newLink.description || '',
    badge: 'nouveau',
    auto: true,
    linkCategory: newLink.category,
    linkUrl: newLink.url,
    createdAt: now,
  }).catch(() => {});

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

  const urlChanged = data.url && data.url !== existing.url;

  const updated = await LinkModel.findOneAndUpdate(
    { id },
    { ...data, updatedAt: new Date().toISOString() },
    { returnDocument: 'after', projection: PROJ }
  ).lean<Link>();

  if (urlChanged && updated) {
    NotificationModel.create({
      id: uuidv4(),
      title: updated.title,
      content: `Nouvelle adresse : ${updated.url}`,
      badge: 'amélioration',
      auto: true,
      linkCategory: updated.category,
      linkUrl: updated.url,
      createdAt: new Date().toISOString(),
    }).catch(() => {});
  }

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
    { returnDocument: 'after', projection: PROJ }
  ).lean<Link>();

  return updated ?? null;
}

export async function trackClick(id: string): Promise<Link | null> {
  const updated = await LinkModel.findOneAndUpdate(
    { id },
    { $inc: { clicks: 1 } },
    { returnDocument: 'after', projection: PROJ }
  ).lean<Link>();

  return updated ?? null;
}

export async function reorderLinks(orderedIds: string[]): Promise<void> {
  const ops = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { id },
      update: { order: index },
    },
  }));
  await LinkModel.bulkWrite(ops);
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
