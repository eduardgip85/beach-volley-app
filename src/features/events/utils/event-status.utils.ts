import type {
  Event,
  EventResultValidationStatus,
  EventStatus,
  EventType,
} from "../types/event.types";
import i18n from "../../../i18n";

const MATCH_ACCEPTANCE_GRACE_MS = 24 * 60 * 60 * 1000;

export function isPastEventDate(startDate: string) {
  return new Date(startDate) < new Date();
}

export function hasMatchAcceptanceGraceExpired(startDate: string) {
  return new Date(startDate).getTime() + MATCH_ACCEPTANCE_GRACE_MS < Date.now();
}

export function resolveEventStatus({
  type,
  status,
  startDate,
  resultValidationStatus,
  participantCount,
}: {
  type: EventType;
  status: unknown;
  startDate: string;
  resultValidationStatus?: EventResultValidationStatus | null;
  participantCount?: number;
}): EventStatus {
  if (status === "cancelled") {
    return "cancelled";
  }

  if (type === "match") {
    if (status === "completed" || resultValidationStatus === "accepted") {
      return "completed";
    }

    if (
      isPastEventDate(startDate) &&
      typeof participantCount === "number" &&
      participantCount < 4
    ) {
      return "cancelled";
    }

    if (hasMatchAcceptanceGraceExpired(startDate)) {
      return "cancelled";
    }

    return "active";
  }

  if (status === "completed" || isPastEventDate(startDate)) {
    return "completed";
  }

  return "active";
}

export function getResolvedEventDisplayStatus(
  event: Pick<
    Event,
    "type" | "status" | "startDate" | "resultValidationStatus" | "participantCount"
  >
) {
  if (event.status === "cancelled") {
    return i18n.t("eventStatus.cancelled");
  }

  if (
    event.type === "match" &&
    event.status !== "completed" &&
    event.resultValidationStatus !== "accepted" &&
    isPastEventDate(event.startDate) &&
    !hasMatchAcceptanceGraceExpired(event.startDate)
  ) {
    return i18n.t("eventStatus.pendingResult");
  }

  if (event.status === "completed") {
    return i18n.t("eventStatus.finished");
  }

  if (event.type !== "match" && isPastEventDate(event.startDate)) {
    return i18n.t("eventStatus.finished");
  }

  return i18n.t("eventStatus.active");
}

export function getResolvedEventStatusReason(
  event: Pick<
    Event,
    "type" | "status" | "startDate" | "resultValidationStatus" | "participantCount"
  >
) {
  if (event.type !== "match" || event.status !== "cancelled") {
    return "";
  }

  if (
    isPastEventDate(event.startDate) &&
    typeof event.participantCount === "number" &&
    event.participantCount < 4
  ) {
    return i18n.t("eventStatusReasons.notEnoughPlayers");
  }

  if (hasMatchAcceptanceGraceExpired(event.startDate)) {
    return i18n.t("eventStatusReasons.unvalidatedResult");
  }

  return "";
}
