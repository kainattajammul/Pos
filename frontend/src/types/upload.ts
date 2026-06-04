export type StorageProvider = "supabase" | "local";

export interface UploadedFile {
  url: string;
  path: string;
  provider: StorageProvider;
  mimeType: string;
  size: number;
}

export interface UploadImageResponse {
  file: UploadedFile;
}
