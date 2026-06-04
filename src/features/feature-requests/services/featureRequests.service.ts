import { supabase } from "../../../config/supabase";
import type {
  CreateFeatureRequestPayload,
  FeatureRequest,
  FeatureRequestModerationStatus,
  FeatureRequestStatus,
} from "../types/featureRequest.types";

interface FeatureRequestRow {
  id: string;
  created_by: string;
  title: string;
  description: string;
  status: FeatureRequestStatus;
  moderation_status: FeatureRequestModerationStatus;
  duplicate_of: string | null;
  vote_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
}

function mapFeatureRequest(
  row: FeatureRequestRow,
  creatorNameById: Map<string, string>
): FeatureRequest {
  return {
    id: row.id,
    createdBy: row.created_by,
    creatorName: creatorNameById.get(row.created_by) ?? "Unknown player",
    title: row.title,
    description: row.description,
    status: row.status,
    moderationStatus: row.moderation_status,
    duplicateOf: row.duplicate_of,
    voteCount: row.vote_count ?? 0,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCreatorNameByIdMap(createdByIds: string[]) {
  if (createdByIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", createdByIds);

  if (error) {
    throw error;
  }

  return new Map(
    ((data ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile.full_name,
    ])
  );
}

export async function getFeatureRequests() {
  const { data, error } = await supabase
    .from("feature_requests")
    .select("*")
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as FeatureRequestRow[];
  const creatorNameById = await getCreatorNameByIdMap(
    Array.from(new Set(rows.map((row) => row.created_by)))
  );

  return rows.map((row) => mapFeatureRequest(row, creatorNameById));
}

export async function getCurrentUserFeatureRequestVotes(userId: string) {
  const { data, error } = await supabase
    .from("feature_request_votes")
    .select("feature_request_id")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return new Set((data ?? []).map((row) => row.feature_request_id as string));
}

export async function createFeatureRequest(
  payload: CreateFeatureRequestPayload,
  userId: string
) {
  const { error } = await supabase.from("feature_requests").insert({
    created_by: userId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: "open",
    moderation_status: "pending",
    is_public: true,
  });

  if (error) {
    throw error;
  }
}

export async function addFeatureRequestVote(
  featureRequestId: string,
  userId: string
) {
  const { error } = await supabase.from("feature_request_votes").insert({
    feature_request_id: featureRequestId,
    user_id: userId,
  });

  if (error) {
    throw error;
  }
}

export async function removeFeatureRequestVote(
  featureRequestId: string,
  userId: string
) {
  const { error } = await supabase
    .from("feature_request_votes")
    .delete()
    .eq("feature_request_id", featureRequestId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function updateFeatureRequestStatus(
  featureRequestId: string,
  status: FeatureRequestStatus
) {
  const moderationStatus = status === "hidden" ? "hidden" : "approved";

  const { error } = await supabase
    .from("feature_requests")
    .update({
      status,
      moderation_status: moderationStatus,
    })
    .eq("id", featureRequestId);

  if (error) {
    throw error;
  }
}

export async function updateFeatureRequestModerationStatus(
  featureRequestId: string,
  moderationStatus: FeatureRequestModerationStatus
) {
  const patch: {
    moderation_status: FeatureRequestModerationStatus;
    status?: FeatureRequestStatus;
  } = {
    moderation_status: moderationStatus,
  };

  if (moderationStatus === "hidden") {
    patch.status = "hidden";
  }

  const { error } = await supabase
    .from("feature_requests")
    .update(patch)
    .eq("id", featureRequestId);

  if (error) {
    throw error;
  }
}

export async function deleteFeatureRequest(featureRequestId: string) {
  const { error } = await supabase
    .from("feature_requests")
    .delete()
    .eq("id", featureRequestId);

  if (error) {
    throw error;
  }
}
