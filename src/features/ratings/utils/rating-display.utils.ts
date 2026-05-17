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
        { range: "0.00 - 1.99", label: "Starter" },
        { range: "2.00 - 3.99", label: "Beginner" },
        { range: "4.00 - 5.99", label: "Intermediate" },
        { range: "6.00 - 7.49", label: "Advanced" },
        { range: "7.50 - 8.99", label: "Expert" },
        { range: "9.00 - 10.00", label: "Elite" },
    ] satisfies CompetitiveRatingLegendBand[];
}

export function getCompetitiveRatingDetailedLegend() {
    return [
        {
            rating: "0.0",
            title: "New to the game",
            tier: "Initiation",
            description:
                "Has never really played beach volleyball or is just starting to understand the basics.",
        },
        {
            rating: "0.5",
            title: "First contacts",
            tier: "Initiation",
            description:
                "Very early stage. Limited ball control, no real match rhythm yet, and still learning the movement patterns.",
        },
        {
            rating: "1.0",
            title: "Beginner basics",
            tier: "Initiation",
            description:
                "Can keep a few easy touches alive but still struggles with serve receive, positioning, and consistency.",
        },
        {
            rating: "1.5",
            title: "Learning rallies",
            tier: "Initiation / Intermediate",
            description:
                "Starts to pass and send free balls with intention. Can play occasional points but with frequent unforced mistakes.",
        },
        {
            rating: "2.0",
            title: "Casual starter",
            tier: "Initiation / Intermediate",
            description:
                "Can join casual games, return manageable serves, and hold basic rallies at a low pace.",
        },
        {
            rating: "2.5",
            title: "Basic control",
            tier: "Intermediate",
            description:
                "Controls the main contacts better and can direct simple plays, but still loses consistency under pressure.",
        },
        {
            rating: "3.0",
            title: "Reliable casual player",
            tier: "Intermediate",
            description:
                "Moves with more structure, passes playable balls, and understands the flow of a normal casual match.",
        },
        {
            rating: "3.5",
            title: "Structured game",
            tier: "Intermediate",
            description:
                "Can pass, set, and attack easier balls with purpose. Reads the rally better but still makes errors in fast exchanges.",
        },
        {
            rating: "4.0",
            title: "Strong intermediate",
            tier: "Intermediate / High",
            description:
                "Controls most core actions and can sustain real match rhythm with decent serving, positioning, and transitions.",
        },
        {
            rating: "4.5",
            title: "Competitive-ready base",
            tier: "Intermediate / High",
            description:
                "Comfortable in stronger games. Can side out, defend, and convert easier attacks with good repeatability.",
        },
        {
            rating: "5.0",
            title: "Solid all-round player",
            tier: "High / Advanced",
            description:
                "Balanced technique and tactics. Ready for competitive matches at a good pace with stable fundamentals.",
        },
        {
            rating: "5.5",
            title: "Advanced club level",
            tier: "Advanced",
            description:
                "Good technical control, stronger decision-making, and the ability to play faster rallies with intent.",
        },
        {
            rating: "6.0",
            title: "Advanced competitor",
            tier: "Advanced",
            description:
                "Understands shot selection, defensive reads, and tempo changes. Can perform well in serious competitive games.",
        },
        {
            rating: "6.5",
            title: "Top local competitor",
            tier: "Advanced / Elite",
            description:
                "Strong side-out game, better physical coverage, and more reliable execution under pressure than most local players.",
        },
        {
            rating: "7.0",
            title: "Elite amateur",
            tier: "Elite",
            description:
                "High-level amateur player with strong tactical awareness and consistent performance in demanding matches.",
        },
        {
            rating: "7.5",
            title: "Regional standout",
            tier: "Elite",
            description:
                "One of the strongest players in regular competitive circuits, with real weapons in serve, attack, and defense.",
        },
        {
            rating: "8.0",
            title: "National competitive",
            tier: "Elite / Pro",
            description:
                "Very high-level player able to compete consistently in strong national-level environments.",
        },
        {
            rating: "8.5",
            title: "National elite",
            tier: "Elite / Pro",
            description:
                "Highly refined technical and tactical game, with very few weak points and strong physical consistency.",
        },
        {
            rating: "9.0",
            title: "Professional pathway",
            tier: "Pro",
            description:
                "Professional-caliber player with advanced shot quality, high consistency, and strong competitive resilience.",
        },
        {
            rating: "9.5",
            title: "Top professional",
            tier: "Pro",
            description:
                "Exceptional execution and decision-making. Performs at the top end of the competitive spectrum.",
        },
        {
            rating: "10.0",
            title: "World class",
            tier: "Pro / Elite",
            description:
                "Reference-level player. Outstanding technical, tactical, physical, and mental performance.",
        },
    ] satisfies CompetitiveRatingLegendLevel[];
}
