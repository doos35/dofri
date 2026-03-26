import { RatingModel } from '../db/models';
import { RatingSummary } from '../types';

export async function rateLink(linkId: string, visitorId: string, score: number): Promise<RatingSummary> {
  await RatingModel.findOneAndUpdate(
    { linkId, visitorId },
    { score, createdAt: new Date().toISOString() },
    { upsert: true }
  );
  return getRatingSummary(linkId, visitorId);
}

export async function getRatingSummary(linkId: string, visitorId?: string): Promise<RatingSummary> {
  const agg = await RatingModel.aggregate([
    { $match: { linkId } },
    { $group: { _id: null, average: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);

  const result = agg[0] || { average: 0, count: 0 };
  let userRating: number | null = null;

  if (visitorId) {
    const doc = await RatingModel.findOne({ linkId, visitorId }).lean();
    if (doc) userRating = doc.score;
  }

  return {
    linkId,
    average: Math.round(result.average * 10) / 10,
    count: result.count,
    userRating,
  };
}

export async function getBulkRatingSummaries(visitorId?: string): Promise<RatingSummary[]> {
  const agg = await RatingModel.aggregate([
    { $group: { _id: '$linkId', average: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);

  const userRatings = new Map<string, number>();
  if (visitorId) {
    const docs = await RatingModel.find({ visitorId }).lean();
    for (const d of docs) userRatings.set(d.linkId, d.score);
  }

  return agg.map(r => ({
    linkId: r._id,
    average: Math.round(r.average * 10) / 10,
    count: r.count,
    userRating: userRatings.get(r._id) ?? null,
  }));
}
