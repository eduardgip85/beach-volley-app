import type { EventType } from "../types/event.types";

export interface EventCoverOption {
    id: string;
    imageUrl: string;
    titleKey: string;
}

const eventCoverOptions: Record<EventType, EventCoverOption[]> = {
    match: [
        {
            id: "match-competitive",
            imageUrl: "/beach-match-comp.webp",
            titleKey: "eventForm.covers.options.matchCompetitiveTitle",
        },
        {
            id: "match-net",
            imageUrl: "/beach-match-net.webp",
            titleKey: "eventForm.covers.options.matchNetTitle",
        },
        {
            id: "match-beach-ball",
            imageUrl: "/beach-ball.png",
            titleKey: "eventForm.covers.options.matchBeachBallTitle",
        },
    ],
    open_play: [
        {
            id: "open-play-main",
            imageUrl: "/beach-open-play.webp",
            titleKey: "eventForm.covers.options.openPlayMainTitle",
        },
        {
            id: "open-play-sunset",
            imageUrl: "/beach-open-play2.webp",
            titleKey: "eventForm.covers.options.openPlaySunsetTitle",
        },
        {
            id: "open-play-net",
            imageUrl: "/beach-volley-net.png",
            titleKey: "eventForm.covers.options.openPlayNetTitle",
        },
    ],
    tournament: [
        {
            id: "tournament-main",
            imageUrl: "/beach-match-tournament.webp",
            titleKey: "eventForm.covers.options.tournamentMainTitle",
        },
        {
            id: "tournament-sunset",
            imageUrl: "/tournament-beach-1.png",
            titleKey: "eventForm.covers.options.tournamentSunsetTitle",
        },
        {
            id: "tournament-crowd",
            imageUrl: "/tournament-beach-2.png",
            titleKey: "eventForm.covers.options.tournamentCrowdTitle",
        },
    ],
};

export function getEventCoverOptions(eventType: EventType) {
    return eventCoverOptions[eventType];
}

export function getDefaultEventCoverForType(eventType: EventType) {
    return eventCoverOptions[eventType][0]?.imageUrl ?? null;
}
