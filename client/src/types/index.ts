export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  favorite: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface HealthStatus {
  linkId: string;
  status: 'ok' | 'slow' | 'dead' | 'unknown';
  httpCode: number | null;
  responseTimeMs: number | null;
  lastCheckedAt: string;
}

export interface LinkWithHealth extends Link {
  health: HealthStatus;
}

export interface CreateLinkDTO {
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  icon?: string;
  favorite?: boolean;
}

export interface UpdateLinkDTO {
  title?: string;
  url?: string;
  description?: string;
  category?: string;
  tags?: string[];
  icon?: string;
  favorite?: boolean;
}

export interface RatingSummary {
  linkId: string;
  average: number;
  count: number;
  userRating: number | null;
}

export interface DeadLinkReport {
  id: string;
  linkId: string;
  visitorId: string;
  createdAt: string;
  dismissed: boolean;
  dismissedAt?: string;
}

export interface DeadLinkReportWithLink extends DeadLinkReport {
  linkTitle: string;
  linkUrl: string;
}
