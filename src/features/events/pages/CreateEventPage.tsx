import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { EventForm } from "../components/EventForm";
import { useEventForm } from "../hooks/useEventForm";
import { createEvent } from "../services/events.service";
import type { CreateEventPayload } from "../types/event.types";

export function CreateEventPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  async function handleCreateEvent(payload: CreateEventPayload) {
    if (!profile) {
      throw new Error("You need to be logged in to create an event");
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
        <h1 className="text-3xl font-bold text-slate-950">Create Event</h1>
        <p className="mt-2 text-slate-500">
          Set up your next beach volleyball match or open play session.
        </p>
      </div>

      <EventForm
        {...form.values}
        {...form.setters}
        error={form.state.error}
        submitting={form.state.submitting}
        searchingLocation={form.state.searchingLocation}
        onSubmit={form.actions.handleSubmit}
        onSearchLocation={form.actions.handleSearchLocation}
        onMapLocationChange={form.actions.handleMapLocationChange}
        onCancel={() => navigate("/events")}
        submitLabel="Create Event"
        submittingLabel="Creating..."
      />
    </section>
  );
}
