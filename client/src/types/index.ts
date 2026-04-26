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

export interface Notification {
  id: string;
  title: string;
  content: string;
  badge: 'nouveau' | 'amélioration' | 'correction' | 'info';
  auto: boolean;
  linkCategory?: string;
  linkUrl?: string;
  createdAt: string;
}

export interface Discussion {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessageAt: string;
  pinned: boolean;
}

export interface Message {
  id: string;
  discussionId: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface DiscussionWithMessages extends Discussion {
  messages: Message[];
}
