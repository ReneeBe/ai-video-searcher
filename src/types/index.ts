export type Phase = 'setup' | 'upload' | 'processing' | 'ready';

export interface UploadedFile {
  name: string;      // e.g. "files/abc123"
  uri: string;       // e.g. "https://generativelanguage.googleapis.com/v1beta/files/abc123"
  mimeType: string;
  displayName: string;
}

export interface Timestamp {
  timestamp: string;   // "MM:SS"
  seconds: number;
  description: string;
}

export interface QueryResult {
  id: string;
  query: string;
  timestamps: Timestamp[];
  loading: boolean;
  error: string | null;
}
