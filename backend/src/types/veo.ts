export type VeoJobStatus = "queued" | "processing" | "complete" | "error" | "demo";

export interface VeoUserDetails {
  fullName?: string;
  brandName?: string;
  role?: string;
  audience?: string;
  product?: string;
  platform?: string;
  region?: string;
}

export interface VeoCreativeDetails {
  tone?: string;
  style?: string;
  mood?: string;
  language?: string;
  camera?: string;
  lighting?: string;
  colorPalette?: string;
  pacing?: string;
  callToAction?: string;
}

export interface VeoVideoSettings {
  durationSeconds?: number;
  aspectRatio?: string;
  fps?: number;
  resolution?: string;
  music?: string;
  voiceover?: string;
}

export interface VeoGenerateRequest {
  prompt: string;
  userDetails?: VeoUserDetails;
  creative?: VeoCreativeDetails;
  video?: VeoVideoSettings;
  scenes?: string[];
  negativePrompt?: string;
}

export interface VeoGenerateResponse {
  status: VeoJobStatus;
  jobId?: string;
  videoUrl?: string;
  tunedPrompt: string;
  message?: string;
  provider?: "veo3" | "demo";
  metadata?: Record<string, unknown>;
}
