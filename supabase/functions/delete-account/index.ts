import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function ensureNoError(step: string, error: { message?: string } | null) {
  if (!error) {
    return;
  }

  throw new Error(`${step}: ${error.message ?? "Unknown error"}`);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed",
      },
      405
    );
  }

  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return jsonResponse(
        {
          error:
            "Missing Supabase environment variables for delete-account. Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        500
      );
    }

    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return jsonResponse(
        {
          error: "Missing authorization header",
        },
        401
      );
    }

    const userClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: getUserError,
    } = await userClient.auth.getUser();

    if (getUserError || !user) {
      return jsonResponse(
        {
          error: "Unauthorized",
        },
        401
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: ownedEvents, error: ownedEventsError } = await adminClient
      .from("events")
      .select("id")
      .eq("created_by", user.id);

    ensureNoError("Could not load owned events", ownedEventsError);

    const ownedEventIds = (ownedEvents ?? []).map((event) => event.id);

    if (ownedEventIds.length > 0) {
      const { data: ownedResults, error: ownedResultsError } = await adminClient
        .from("match_results")
        .select("id")
        .in("event_id", ownedEventIds);

      ensureNoError("Could not load owned match results", ownedResultsError);

      const ownedResultIds = (ownedResults ?? []).map((result) => result.id);

      if (ownedResultIds.length > 0) {
        const { error: matchSetsDeleteError } = await adminClient
          .from("match_sets")
          .delete()
          .in("result_id", ownedResultIds);

        ensureNoError("Could not delete owned match sets", matchSetsDeleteError);
      }

      const { error: ratingHistoryByEventDeleteError } = await adminClient
        .from("rating_history")
        .delete()
        .in("match_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned rating history",
        ratingHistoryByEventDeleteError
      );

      const { error: eventInvitationsByEventDeleteError } = await adminClient
        .from("event_invitations")
        .delete()
        .in("event_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned event invitations",
        eventInvitationsByEventDeleteError
      );

      const { error: joinRequestsByEventDeleteError } = await adminClient
        .from("event_join_requests")
        .delete()
        .in("event_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned join requests",
        joinRequestsByEventDeleteError
      );

      const { error: registrationsByEventDeleteError } = await adminClient
        .from("registrations")
        .delete()
        .in("event_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned registrations",
        registrationsByEventDeleteError
      );

      const { error: matchPlayersByEventDeleteError } = await adminClient
        .from("match_players")
        .delete()
        .in("event_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned match players",
        matchPlayersByEventDeleteError
      );

      const { error: matchResultsByEventDeleteError } = await adminClient
        .from("match_results")
        .delete()
        .in("event_id", ownedEventIds);

      ensureNoError(
        "Could not delete owned match results",
        matchResultsByEventDeleteError
      );

      const { error: ownedEventsDeleteError } = await adminClient
        .from("events")
        .delete()
        .in("id", ownedEventIds);

      ensureNoError("Could not delete owned events", ownedEventsDeleteError);
    }

    const { error: validatedByCleanupError } = await adminClient
      .from("match_results")
      .update({ validated_by: null })
      .eq("validated_by", user.id);

    ensureNoError("Could not clear match validation references", validatedByCleanupError);

    const { error: userInvitationsDeleteError } = await adminClient
      .from("event_invitations")
      .delete()
      .or(`inviter_id.eq.${user.id},invitee_id.eq.${user.id}`);

    ensureNoError("Could not delete user invitations", userInvitationsDeleteError);

    const { error: userJoinRequestsDeleteError } = await adminClient
      .from("event_join_requests")
      .delete()
      .eq("requester_id", user.id);

    ensureNoError("Could not delete user join requests", userJoinRequestsDeleteError);

    const { error: userRegistrationsDeleteError } = await adminClient
      .from("registrations")
      .delete()
      .eq("user_id", user.id);

    ensureNoError("Could not delete user registrations", userRegistrationsDeleteError);

    const { error: userMatchPlayersDeleteError } = await adminClient
      .from("match_players")
      .delete()
      .eq("user_id", user.id);

    ensureNoError("Could not delete user match players", userMatchPlayersDeleteError);

    const { error: userFriendRequestsDeleteError } = await adminClient
      .from("friend_requests")
      .delete()
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    ensureNoError("Could not delete friend requests", userFriendRequestsDeleteError);

    const { error: userRatingHistoryDeleteError } = await adminClient
      .from("rating_history")
      .delete()
      .eq("profile_id", user.id);

    ensureNoError("Could not delete user rating history", userRatingHistoryDeleteError);

    const { error: profileDeleteError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", user.id);

    ensureNoError("Could not delete profile", profileDeleteError);

    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    ensureNoError("Could not delete auth user", authDeleteError);

    return jsonResponse({
        success: true,
      });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected delete-account error";

    console.error("delete-account failed", message);

    return jsonResponse(
      {
        error: message,
      },
      500
    );
  }
});
