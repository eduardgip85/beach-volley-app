import i18n from "../../../i18n";

export const DEFAULT_COMPETITIVE_RATING = 2;
export const MIN_COMPETITIVE_RATING = 0;
export const MAX_COMPETITIVE_RATING = 10;

export interface CompetitiveRatingLegendBand {
    range: string;
    label: string;
}

export interface CompetitiveRatingLegendLevel {
    rating: string;
    title: string;
    tier: string;
    description: string;
}

export function normalizeCompetitiveRating(value: number | null | undefined) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return DEFAULT_COMPETITIVE_RATING;
    }

    return Math.min(
        MAX_COMPETITIVE_RATING,
        Math.max(MIN_COMPETITIVE_RATING, Number(value.toFixed(2)))
    );
}

export function formatCompetitiveRating(value: number | null | undefined) {
    return normalizeCompetitiveRating(value).toFixed(2);
}

export function formatCompetitiveRatingDelta(value: number | null | undefined) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return null;
    }

    const normalizedDelta = Number(value.toFixed(2));

    return normalizedDelta > 0
        ? `+${normalizedDelta.toFixed(2)}`
        : normalizedDelta.toFixed(2);
}

export function getCompetitiveRatingLegend() {
    return [
        { range: "0.00 - 1.99", label: i18n.t("ratingGuide.bandStarter") },
        { range: "2.00 - 3.99", label: i18n.t("ratingGuide.bandBeginner") },
        { range: "4.00 - 5.99", label: i18n.t("ratingGuide.bandIntermediate") },
        { range: "6.00 - 7.49", label: i18n.t("ratingGuide.bandAdvanced") },
        { range: "7.50 - 8.99", label: i18n.t("ratingGuide.bandExpert") },
        { range: "9.00 - 10.00", label: i18n.t("ratingGuide.bandElite") },
    ] satisfies CompetitiveRatingLegendBand[];
}

export function getCompetitiveRatingDetailedLegend() {
    return [
        {
            rating: "0.0",
            title: i18n.t("ratingGuide.newToTheGameTitle"),
            tier: i18n.t("ratingGuide.initiation"),
            description: i18n.t("ratingGuide.newToTheGameDescription"),
        },
        {
            rating: "0.5",
            title: i18n.t("ratingGuide.firstContactsTitle"),
            tier: i18n.t("ratingGuide.initiation"),
            description: i18n.t("ratingGuide.firstContactsDescription"),
        },
        {
            rating: "1.0",
            title: i18n.t("ratingGuide.beginnerBasicsTitle"),
            tier: i18n.t("ratingGuide.initiation"),
            description: i18n.t("ratingGuide.beginnerBasicsDescription"),
        },
        {
            rating: "1.5",
            title: i18n.t("ratingGuide.learningRalliesTitle"),
            tier: i18n.t("ratingGuide.initiationIntermediate"),
            description: i18n.t("ratingGuide.learningRalliesDescription"),
        },
        {
            rating: "2.0",
            title: i18n.t("ratingGuide.casualStarterTitle"),
            tier: i18n.t("ratingGuide.initiationIntermediate"),
            description: i18n.t("ratingGuide.casualStarterDescription"),
        },
        {
            rating: "2.5",
            title: i18n.t("ratingGuide.basicControlTitle"),
            tier: i18n.t("ratingGuide.intermediate"),
            description: i18n.t("ratingGuide.basicControlDescription"),
        },
        {
            rating: "3.0",
            title: i18n.t("ratingGuide.reliableCasualTitle"),
            tier: i18n.t("ratingGuide.intermediate"),
            description: i18n.t("ratingGuide.reliableCasualDescription"),
        },
        {
            rating: "3.5",
            title: i18n.t("ratingGuide.structuredGameTitle"),
            tier: i18n.t("ratingGuide.intermediate"),
            description: i18n.t("ratingGuide.structuredGameDescription"),
        },
        {
            rating: "4.0",
            title: i18n.t("ratingGuide.strongIntermediateTitle"),
            tier: i18n.t("ratingGuide.intermediateHigh"),
            description: i18n.t("ratingGuide.strongIntermediateDescription"),
        },
        {
            rating: "4.5",
            title: i18n.t("ratingGuide.competitiveBaseTitle"),
            tier: i18n.t("ratingGuide.intermediateHigh"),
            description: i18n.t("ratingGuide.competitiveBaseDescription"),
        },
        {
            rating: "5.0",
            title: i18n.t("ratingGuide.solidAllRoundTitle"),
            tier: i18n.t("ratingGuide.highAdvanced"),
            description: i18n.t("ratingGuide.solidAllRoundDescription"),
        },
        {
            rating: "5.5",
            title: i18n.t("ratingGuide.advancedClubTitle"),
            tier: i18n.t("ratingGuide.advanced"),
            description: i18n.t("ratingGuide.advancedClubDescription"),
        },
        {
            rating: "6.0",
            title: i18n.t("ratingGuide.advancedCompetitorTitle"),
            tier: i18n.t("ratingGuide.advanced"),
            description: i18n.t("ratingGuide.advancedCompetitorDescription"),
        },
        {
            rating: "6.5",
            title: i18n.t("ratingGuide.topLocalTitle"),
            tier: i18n.t("ratingGuide.advancedElite"),
            description: i18n.t("ratingGuide.topLocalDescription"),
        },
        {
            rating: "7.0",
            title: i18n.t("ratingGuide.eliteAmateurTitle"),
            tier: i18n.t("ratingGuide.elite"),
            description: i18n.t("ratingGuide.eliteAmateurDescription"),
        },
        {
            rating: "7.5",
            title: i18n.t("ratingGuide.regionalStandoutTitle"),
            tier: i18n.t("ratingGuide.elite"),
            description: i18n.t("ratingGuide.regionalStandoutDescription"),
        },
        {
            rating: "8.0",
            title: i18n.t("ratingGuide.nationalCompetitiveTitle"),
            tier: i18n.t("ratingGuide.elitePro"),
            description: i18n.t("ratingGuide.nationalCompetitiveDescription"),
        },
        {
            rating: "8.5",
            title: i18n.t("ratingGuide.nationalEliteTitle"),
            tier: i18n.t("ratingGuide.elitePro"),
            description: i18n.t("ratingGuide.nationalEliteDescription"),
        },
        {
            rating: "9.0",
            title: i18n.t("ratingGuide.professionalPathTitle"),
            tier: i18n.t("ratingGuide.pro"),
            description: i18n.t("ratingGuide.professionalPathDescription"),
        },
        {
            rating: "9.5",
            title: i18n.t("ratingGuide.topProfessionalTitle"),
            tier: i18n.t("ratingGuide.pro"),
            description: i18n.t("ratingGuide.topProfessionalDescription"),
        },
        {
            rating: "10.0",
            title: i18n.t("ratingGuide.worldClassTitle"),
            tier: i18n.t("ratingGuide.proElite"),
            description: i18n.t("ratingGuide.worldClassDescription"),
        },
    ] satisfies CompetitiveRatingLegendLevel[];
}
