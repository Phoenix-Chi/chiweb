export type MediaKind = "image" | "video" | "audio";

export interface StoredMediaAsset {
  url: string;
  thumbnailUrl?: string;
  filename: string;
  type: MediaKind;
  size: number;
  width?: number;
  height?: number;
}

export interface NodeMediaInput {
  fileId?: string;
  url: string;
  type: MediaKind;
  thumbnail?: string;
  size?: number;
  width?: number;
  height?: number;
}
