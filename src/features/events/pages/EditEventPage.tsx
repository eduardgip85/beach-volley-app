import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { EventForm } from "../components/EventForm";
import { useEventForm } from "../hooks/useEventForm";
import {
  deleteEvent,
  getEventById,
  updateEvent,
} from "../services/events.service";
import type { CreateEventPayload, Event } from "../types/event.types";

export function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [pageError, setPageError] = useState("");

  const canManage = Boolean(
    profile && eventData && (profile.id === eventData.createdBy || isAdmin)
  );

  useEffect(() => {
    async function loadEvent() {
      if (!eventId) return;

      try {
        setLoading(true);
        setPageError("");

        const event = await getEventById(eventId);
        setEventData(event);
      } catch (err) {
        console.error(err);
        setPageError("Could not load event");
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function handleUpdateEvent(payload: CreateEventPayload) {
    if (!eventId) return;

    if (!canManage) {
      throw new Error("You do not have permission to edit this event");
    }

    const updatedEvent = await updateEvent(eventId, payload);
    navigate(`/events/${updatedEvent.id}`);
  }

  async function handleDelete() {
    if (!eventId) return;

    if (!canManage) {
      setPageError("You do not have permission to delete this event");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setPageError("");

      await deleteEvent(eventId);
      navigate("/events", { replace: true });
    } catch (err) {
      console.error(err);
      setPageError("Could not delete event");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading event...</p>;
  }

  if (pageError && !eventData) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Event not found</h1>
        <p className="mt-2 text-slate-500">{pageError}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          Back to events
        </Link>
      </section>
    );
  }

  if (!eventData) return null;

  if (!canManage) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">No permission</h1>
        <p className="mt-2 text-slate-500">
          You can only edit events created by you.
        </p>
        <Link
          to={`/events/${eventData.id}`}
          className="mt-4 inline-block text-blue-600"
        >
          Back to event
        </Link>
      </section>
    );
  }

  return (
    <EditEventContent
      eventData={eventData}
      deleting={deleting}
      pageError={pageError}
      onDelete={handleDelete}
      onSubmit={handleUpdateEvent}
    />
  );
}

function EditEventContent({
  eventData,
  deleting,
  pageError,
  onDelete,
  onSubmit,
}: {
  eventData: Event;
  deleting: boolean;
  pageError: string;
  onDelete: () => void;
  onSubmit: (payload: CreateEventPayload) => Promise<void>;
}) {
  const navigate = useNavigate();

  const form = useEventForm({
    initialEvent: eventData,
    onSubmit,
  });

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Edit Event</h1>
          <p className="mt-2 text-slate-500">
            Update your beach volleyball event details.
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
        >
          <Trash2 size={18} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <EventForm
        {...form.values}
        {...form.setters}
        error={form.state.error || pageError}
        submitting={form.state.submitting}
        searchingLocation={form.state.searchingLocation}
        onSubmit={form.actions.handleSubmit}
        onSearchLocation={form.actions.handleSearchLocation}
        onMapLocationChange={form.actions.handleMapLocationChange}
        onCancel={() => navigate(`/events/${eventData.id}`)}
        submitLabel="Save Changes"
        submittingLabel="Saving..."
      />
    </section>
  );
}
