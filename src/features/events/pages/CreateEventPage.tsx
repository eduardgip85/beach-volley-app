import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import { EventForm } from "../components/EventForm";
import { useEventForm } from "../hooks/useEventForm";
import { createEvent } from "../services/events.service";
import type { CreateEventPayload } from "../types/event.types";

export function CreateEventPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();

  async function handleCreateEvent(payload: CreateEventPayload) {
    if (!profile) {
      throw new Error(t("createEventPage.authRequired"));
    }

    const createdEvent = await createEvent(payload, profile.id);
    navigate(`/events/${createdEvent.id}`);
  }

  const form = useEventForm({
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
