export type FeatureRequestStatus =
  | "open"
  | "planned"
  | "in_progress"
  | "done"
  | "rejected"
  | "duplicate"
  | "hidden";

export type FeatureRequestModerationStatus =
  | "pending"
  | "approved"
  | "hidden";

export interface FeatureRequest {
  id: string;
  createdBy: string;
  creatorName: string;
  title: string;
  description: string;
  status: FeatureRequestStatus;
  moderationStatus: FeatureRequestModerationStatus;
  duplicateOf: string | null;
  voteCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequestPayload {
  title: string;
  description: string;
}
