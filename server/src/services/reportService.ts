import { v4 as uuidv4 } from 'uuid';
import { ReportModel, LinkModel } from '../db/models';
import { DeadLinkReport, DeadLinkReportWithLink } from '../types';

export async function reportDeadLink(linkId: string, visitorId: string): Promise<DeadLinkReport | null> {
  const existing = await ReportModel.findOne({ linkId, visitorId }).lean();
  if (existing) return null; // already reported

  const report: DeadLinkReport = {
    id: uuidv4(),
    linkId,
    visitorId,
    createdAt: new Date().toISOString(),
    dismissed: false,
  };

  await ReportModel.create(report);
  return report;
}

export async function getUndismissedReports(): Promise<DeadLinkReportWithLink[]> {
  const reports = await ReportModel.find({ dismissed: false }, { _id: 0, __v: 0 })
    .sort({ createdAt: -1 })
    .lean<DeadLinkReport[]>();

  const linkIds = [...new Set(reports.map(r => r.linkId))];
  const links = await LinkModel.find({ id: { $in: linkIds } }).lean();
  const linkMap = new Map(links.map(l => [l.id, l]));

  return reports.map(r => {
    const link = linkMap.get(r.linkId);
    return {
      ...r,
      linkTitle: link?.title ?? 'Lien supprimé',
      linkUrl: link?.url ?? '',
    };
  });
}

export async function getUndismissedCount(): Promise<number> {
  return ReportModel.countDocuments({ dismissed: false });
}

export async function dismissReport(reportId: string): Promise<boolean> {
  const result = await ReportModel.updateOne(
    { id: reportId },
    { dismissed: true, dismissedAt: new Date().toISOString() }
  );
  return result.modifiedCount > 0;
}

export async function dismissAllReports(): Promise<number> {
  const result = await ReportModel.updateMany(
    { dismissed: false },
    { dismissed: true, dismissedAt: new Date().toISOString() }
  );
  return result.modifiedCount;
}
