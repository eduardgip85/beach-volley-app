import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import { EventForm } from "../components/EventForm";
import { useEventForm } from "../hooks/useEventForm";
import { createEvent } from "../services/events.service";
import type { CreateEventPayload, EventType } from "../types/event.types";

function getInitialEventType(value: string | null): EventType | undefined {
  return value === "match" || value === "open_play" || value === "tournament"
    ? value
    : undefined;
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const hasCompetitiveRanking = Boolean(profile?.ratingPlacementCompletedAt);
  const initialType = getInitialEventType(searchParams.get("type"));

  async function handleCreateEvent(payload: CreateEventPayload) {
    if (!profile) {
      throw new Error(t("createEventPage.authRequired"));
    }

    if (
      payload.type === "match" &&
      payload.mode === "competitive" &&
      !profile.ratingPlacementCompletedAt
    ) {
      throw new Error(t("createEventPage.competitiveRatingRequired"));
    }

    const createdEvent = await createEvent(payload, profile.id);
    navigate(`/events/${createdEvent.id}`);
  }

  const form = useEventForm({
    initialType,
    onSubmit: handleCreateEvent,
  });

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-950">
          {t("createEventPage.title")}
        </h1>
        <p className="mt-2 text-slate-500">
          {t("createEventPage.body")}
        </p>
      </div>

      {form.values.type === "match" &&
      form.values.mode === "competitive" &&
      !hasCompetitiveRanking ? (
        <div className="mb-6 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#fef3c7_0%,#fee2e2_100%)] p-5 shadow-sm ring-1 ring-amber-200">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">
            {t("createEventPage.rankingGateEyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {t("createEventPage.rankingGateTitle")}
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            {t("createEventPage.rankingGateBody")}
          </p>
          <Link
            to="/onboarding/competitive-rating?mode=rating&redirect=%2Fevents%2Fcreate"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            {t("createEventPage.rankingGateCta")}
          </Link>
        </div>
      ) : null}

      <EventForm
        {...form.values}
        {...form.setters}
        error={form.state.error}
        submitting={form.state.submitting}
        searchingLocation={form.state.searchingLocation}
        onDismissError={() => form.actions.setError("")}
        onSubmit={form.actions.handleSubmit}
        onSearchLocation={form.actions.handleSearchLocation}
        onMapLocationChange={form.actions.handleMapLocationChange}
        onCancel={() => navigate("/events")}
        submitLabel={t("createEventPage.submit")}
        submittingLabel={t("createEventPage.submitting")}
      />
    </section>
  );
}
