import { JWT } from "npm:google-auth-library@9";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface NotificationRecord {
  id: string;
  recipient_id: string;
  category: string;
  title_key: string;
  body_key: string;
  data: Record<string, string> | null;
  deep_link: string | null;
}

interface WebhookPayload {
  type: "INSERT";
  table: "notifications";
  schema: "public";
  record: NotificationRecord;
}

const translations = {
  en: {
    statuses: { accepted: "accepted", declined: "declined", rejected: "rejected", pending: "pending" },
    titles: {
      "notifications.items.friendRequestReceivedTitle": "New friend request",
      "notifications.items.friendRequestAcceptedTitle": "Friend request accepted",
      "notifications.items.eventInvitationTitle": "You have been invited",
      "notifications.items.eventInvitationResponseTitle": "Invitation updated",
      "notifications.items.eventJoinRequestTitle": "New access request",
      "notifications.items.eventJoinRequestResponseTitle": "Access request updated",
      "notifications.items.matchResultPendingTitle": "Result waiting for validation",
      "notifications.items.matchResultUpdatedTitle": "Competitive result updated",
      "notifications.items.tournamentInvitationTitle": "Tournament team invitation",
      "notifications.items.tournamentInvitationResponseTitle": "Tournament invitation updated",
    },
    bodies: {
      "notifications.items.friendRequestReceivedBody": "{{actorName}} wants to connect with you.",
      "notifications.items.friendRequestAcceptedBody": "{{actorName}} accepted your friend request.",
      "notifications.items.eventInvitationBody": "{{actorName}} invited you to {{eventTitle}}.",
      "notifications.items.eventInvitationResponseBody": "{{actorName}} marked the invitation to {{eventTitle}} as {{status}}.",
      "notifications.items.eventJoinRequestBody": "{{actorName}} wants to join {{eventTitle}}.",
      "notifications.items.eventJoinRequestResponseBody": "Your request for {{eventTitle}} was {{status}}.",
      "notifications.items.matchResultPendingBody": "A result was submitted for {{eventTitle}}.",
      "notifications.items.matchResultUpdatedBody": "The result for {{eventTitle}} was {{status}}.",
      "notifications.items.tournamentInvitationBody": "{{actorName}} invited you to join {{teamName}} in {{eventTitle}}.",
      "notifications.items.tournamentInvitationResponseBody": "{{actorName}} marked the invitation to {{eventTitle}} as {{status}}.",
    },
  },
  es: {
    statuses: { accepted: "aceptada", declined: "rechazada", rejected: "rechazada", pending: "pendiente" },
    titles: {
      "notifications.items.friendRequestReceivedTitle": "Nueva solicitud de amistad",
      "notifications.items.friendRequestAcceptedTitle": "Solicitud de amistad aceptada",
      "notifications.items.eventInvitationTitle": "Te han invitado",
      "notifications.items.eventInvitationResponseTitle": "Invitacion actualizada",
      "notifications.items.eventJoinRequestTitle": "Nueva solicitud de acceso",
      "notifications.items.eventJoinRequestResponseTitle": "Solicitud de acceso actualizada",
      "notifications.items.matchResultPendingTitle": "Resultado pendiente de validar",
      "notifications.items.matchResultUpdatedTitle": "Resultado competitivo actualizado",
      "notifications.items.tournamentInvitationTitle": "Invitacion a equipo de torneo",
      "notifications.items.tournamentInvitationResponseTitle": "Invitacion de torneo actualizada",
    },
    bodies: {
      "notifications.items.friendRequestReceivedBody": "{{actorName}} quiere conectar contigo.",
      "notifications.items.friendRequestAcceptedBody": "{{actorName}} ha aceptado tu solicitud de amistad.",
      "notifications.items.eventInvitationBody": "{{actorName}} te ha invitado a {{eventTitle}}.",
      "notifications.items.eventInvitationResponseBody": "{{actorName}} ha marcado la invitacion a {{eventTitle}} como {{status}}.",
      "notifications.items.eventJoinRequestBody": "{{actorName}} quiere unirse a {{eventTitle}}.",
      "notifications.items.eventJoinRequestResponseBody": "Tu solicitud para {{eventTitle}} ha sido {{status}}.",
      "notifications.items.matchResultPendingBody": "Se ha enviado un resultado para {{eventTitle}}.",
      "notifications.items.matchResultUpdatedBody": "El resultado de {{eventTitle}} ha sido {{status}}.",
      "notifications.items.tournamentInvitationBody": "{{actorName}} te ha invitado a unirte a {{teamName}} en {{eventTitle}}.",
      "notifications.items.tournamentInvitationResponseBody": "{{actorName}} ha marcado la invitacion a {{eventTitle}} como {{status}}.",
    },
  },
} as const;

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function render(template: string, data: Record<string, string>, language: "en" | "es") {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (key === "status") {
      return translations[language].statuses[data[key] as keyof typeof translations.en.statuses] ?? data[key] ?? "";
    }
    return data[key] ?? "";
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const firebaseServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");

  if (!supabaseUrl || !serviceRoleKey || !firebaseServiceAccount) {
    return json({ error: "Missing Supabase or Firebase secrets" }, 500);
  }

  try {
    const payload = (await request.json()) as WebhookPayload;
    const notification = payload.record;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const [{ data: devices }, { data: preference }, { data: profile }] = await Promise.all([
      supabase
        .from("push_devices")
        .select("token")
        .eq("user_id", notification.recipient_id)
        .eq("platform", "android")
        .eq("enabled", true),
      supabase.from("notification_preferences").select("*").eq("user_id", notification.recipient_id).maybeSingle(),
      supabase.from("profiles").select("preferred_language").eq("id", notification.recipient_id).maybeSingle(),
    ]);

    const categoryEnabled = preference?.[`${notification.category}_enabled`] ?? true;
    if (!preference?.push_enabled || !categoryEnabled || !devices?.length) {
      return json({ sent: 0, skipped: true });
    }

    const language: "en" | "es" = profile?.preferred_language === "es" ? "es" : "en";
    const copy = translations[language];
    const titleTemplate = copy.titles[notification.title_key as keyof typeof copy.titles] ?? "Sandset";
    const bodyTemplate = copy.bodies[notification.body_key as keyof typeof copy.bodies] ?? "You have a new update.";
    const data = notification.data ?? {};
    const serviceAccount = JSON.parse(firebaseServiceAccount);
    const auth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    const accessToken = await auth.getAccessToken();
    let sent = 0;

    for (const device of devices) {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              token: device.token,
              notification: {
                title: render(titleTemplate, data, language),
                body: render(bodyTemplate, data, language),
              },
              data: {
                notificationId: notification.id,
                deepLink: notification.deep_link ?? "/notifications",
              },
              android: {
                priority: "high",
                notification: {
                  channel_id: "sandset_activity",
                  icon: "push_icon",
                  color: "#2563EB",
                },
              },
            },
          }),
        }
      );

      if (response.ok) {
        sent += 1;
      } else {
        const responseBody = await response.text();
        if (
          response.status === 404 ||
          responseBody.includes("UNREGISTERED") ||
          responseBody.includes("INVALID_ARGUMENT")
        ) {
          await supabase
            .from("push_devices")
            .update({ enabled: false })
            .eq("token", device.token);
        }
      }
    }

    if (sent > 0) {
      await supabase
        .from("notifications")
        .update({ push_sent_at: new Date().toISOString() })
        .eq("id", notification.id);
    }

    return json({ sent });
  } catch (error) {
    console.error("send-push failed", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected push error" }, 500);
  }
});
