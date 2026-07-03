export type Section = {
  title: string;
  body: string;
};

export type Timestamp = {
  time: string;
  label: string;
};

export type Session = {
  id: string;
  title: string;
  speakers: string;
  track: string;
  youtubeUrl: string;
  sourceUrl: string;
  status: string;
  relevance: number;
  summaryPath: string;
  watchTier: string;
  excerpt: string;
  sections: Section[];
  timestamps: Timestamp[];
  topics: string[];
};

export type SiteData = {
  generatedAt: string;
  notice: string;
  stats: {
    manifestRows: number;
    summaries: number;
    processedYoutube: number;
    duplicates: number;
    unavailable: number;
    missing: number;
    longStreamSegments: number;
  };
  topics: Array<{ id: string; label: string; count: number }>;
  sessions: Session[];
};
