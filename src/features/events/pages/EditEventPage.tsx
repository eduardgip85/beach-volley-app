import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        setPageError(t("editEvent.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId, t]);

  async function handleUpdateEvent(payload: CreateEventPayload) {
    if (!eventId) return;

    if (!canManage) {
      throw new Error(t("editEvent.permissionEditError"));
    }

    const updatedEvent = await updateEvent(eventId, payload);
    navigate(`/events/${updatedEvent.id}`);
  }

  async function handleDelete() {
    if (!eventId) return;

    if (!canManage) {
      setPageError(t("editEvent.permissionDeleteError"));
      return;
    }

    const confirmed = window.confirm(t("editEvent.deleteConfirm"));

    if (!confirmed) return;

    try {
      setDeleting(true);
      setPageError("");

      await deleteEvent(eventId);
      navigate("/events", { replace: true });
    } catch (err) {
      console.error(err);
      setPageError(t("editEvent.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">{t("editEvent.loading")}</p>;
  }

  if (pageError && !eventData) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{t("editEvent.notFoundTitle")}</h1>
        <p className="mt-2 text-slate-500">{pageError}</p>
        <Link to="/events" className="mt-4 inline-block text-blue-600">
          {t("editEvent.backToEvents")}
        </Link>
      </section>
    );
  }

  if (!eventData) return null;

  if (!canManage) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{t("editEvent.noPermissionTitle")}</h1>
        <p className="mt-2 text-slate-500">
          {t("editEvent.noPermissionBody")}
        </p>
        <Link
          to={`/events/${eventData.id}`}
          className="mt-4 inline-block text-blue-600"
        >
          {t("editEvent.backToEvent")}
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
  const { t } = useTranslation();

  const form = useEventForm({
    initialEvent: eventData,
    onSubmit,
  });

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">{t("editEvent.title")}</h1>
          <p className="mt-2 text-slate-500">
            {t("editEvent.body")}
          </p>
        </div>
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
        extraActions={
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-4 font-bold text-red-600 disabled:opacity-60"
          >
            <Trash2 size={18} />
            {deleting ? t("editEvent.deleting") : t("editEvent.delete")}
          </button>
        }
        submitLabel={t("editEvent.saveChanges")}
        submittingLabel={t("editEvent.saving")}
      />
    </section>
  );
}
