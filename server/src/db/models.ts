import mongoose, { Schema } from 'mongoose';
import { Link, HealthStatus } from '../types';

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

export const LinkModel = mongoose.model<Link>('Link', linkSchema);
export const HealthModel = mongoose.model<HealthStatus>('HealthStatus', healthSchema);
