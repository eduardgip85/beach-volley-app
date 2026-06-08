import { supabase } from "../../../config/supabase";

export type AccountDeletionRequestStatus =
  | "pending"
  | "verified"
  | "completed"
  | "rejected";

export interface AccountDeletionRequest {
  id: string;
  email: string;
  details: string | null;
  language: string;
  userAgent: string | null;
  adminNote: string | null;
  status: AccountDeletionRequestStatus;
  requestedAt: string;
  processedAt: string | null;
}

interface AccountDeletionRequestRow {
  id: string;
  email: string;
  details: string | null;
  language: string;
  user_agent: string | null;
  admin_note: string | null;
  status: AccountDeletionRequestStatus;
  requested_at: string;
  processed_at: string | null;
}

function mapRequest(row: AccountDeletionRequestRow): AccountDeletionRequest {
  return {
    id: row.id,
    email: row.email,
    details: row.details,
    language: row.language,
    userAgent: row.user_agent,
    adminNote: row.admin_note,
    status: row.status,
    requestedAt: row.requested_at,
    processedAt: row.processed_at,
  };
}

export async function getAccountDeletionRequests() {
  const { data, error } = await supabase
    .from("account_deletion_requests")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) throw error;

  return (data as AccountDeletionRequestRow[]).map(mapRequest);
}

export async function updateAccountDeletionRequest(
  id: string,
  status: AccountDeletionRequestStatus,
  adminNote: string
) {
  const { error } = await supabase
    .from("account_deletion_requests")
    .update({
      status,
      admin_note: adminNote.trim() || null,
      processed_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}
