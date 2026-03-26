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
    createdAt: String,
    updatedAt: String,
  },
  { versionKey: false }
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

export const LinkModel = mongoose.model<Link>('Link', linkSchema);
export const HealthModel = mongoose.model<HealthStatus>('HealthStatus', healthSchema);
export const RatingModel = mongoose.model<RatingDoc>('Rating', ratingSchema);
export const ReportModel = mongoose.model<DeadLinkReport>('DeadLinkReport', reportSchema);
