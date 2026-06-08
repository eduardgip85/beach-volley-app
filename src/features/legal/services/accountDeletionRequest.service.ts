import { supabase } from "../../../config/supabase";

export async function requestAccountDeletion({
  email,
  details,
  language,
}: {
  email: string;
  details: string;
  language: string;
}) {
  const { error } = await supabase.rpc("request_account_deletion", {
    p_email: email.trim().toLowerCase(),
    p_details: details.trim() || null,
    p_language: language,
    p_user_agent: navigator.userAgent,
  });

  if (error) throw error;
}
