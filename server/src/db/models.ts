import mongoose, { Schema } from 'mongoose';
import { Link, HealthStatus, DeadLinkReport } from '../types';

interface RatingDoc {
  linkId: string;
  visitorId: string;
  score: number;
  createdAt: string;
}

const linkSchema = new Schema<Link>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    tags: [String],
    icon: { type: String, default: '' },
    favorite: { type: Boolean, default: false },
    clicks: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    createdAt: String,
    updatedAt: String,
  },
  { versionKey: false }
);

// Index texte pour la recherche rapide
linkSchema.index(
  { title: 'text', description: 'text', url: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, description: 3, url: 1 }, default_language: 'french' }
);

const healthSchema = new Schema<HealthStatus>(
  {
    linkId: { type: String, required: true, unique: true },
    status: String,
    httpCode: Schema.Types.Mixed,
    responseTimeMs: Schema.Types.Mixed,
    lastCheckedAt: String,
  },
  { versionKey: false }
);

const ratingSchema = new Schema<RatingDoc>(
  {
    linkId: { type: String, required: true },
    visitorId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    createdAt: String,
  },
  { versionKey: false }
);
ratingSchema.index({ linkId: 1, visitorId: 1 }, { unique: true });

const reportSchema = new Schema<DeadLinkReport>(
  {
    id: { type: String, required: true, unique: true },
    linkId: { type: String, required: true },
    visitorId: { type: String, required: true },
    createdAt: String,
    dismissed: { type: Boolean, default: false },
    dismissedAt: String,
  },
  { versionKey: false }
);
reportSchema.index({ linkId: 1, visitorId: 1 }, { unique: true });

interface ScreenshotCacheDoc {
  url: string;
  imageData: Buffer;
  contentType: string;
  cachedAt: Date;
}

const screenshotCacheSchema = new Schema<ScreenshotCacheDoc>(
  {
    url: { type: String, required: true, unique: true },
    imageData: { type: Buffer, required: true },
    contentType: { type: String, default: 'image/png' },
    cachedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Auto-expire après 7 jours
screenshotCacheSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

interface NotificationDoc {
  id: string;
  title: string;
  content: string;
  badge: 'nouveau' | 'amélioration' | 'correction' | 'info';
  auto: boolean;
  linkCategory?: string;
  linkUrl?: string;
  createdAt: string;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    badge: { type: String, default: 'nouveau' },
    auto: { type: Boolean, default: false },
    linkCategory: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    createdAt: String,
  },
  { versionKey: false }
);

export const LinkModel = mongoose.model<Link>('Link', linkSchema);
export const HealthModel = mongoose.model<HealthStatus>('HealthStatus', healthSchema);
export const RatingModel = mongoose.model<RatingDoc>('Rating', ratingSchema);
export const ReportModel = mongoose.model<DeadLinkReport>('DeadLinkReport', reportSchema);
export const ScreenshotCacheModel = mongoose.model<ScreenshotCacheDoc>('ScreenshotCache', screenshotCacheSchema);
export const NotificationModel = mongoose.model<NotificationDoc>('Notification', notificationSchema);
