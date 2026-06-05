import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Check,
    MapPin,
    ShieldCheck,
    Sparkles,
    Target,
    Trophy,
    Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type {
    AvailabilityStatus,
    PreferredCourtSide,
    PreferredHand,
    PreferredMatchMode,
    PreferredPlayDay,
} from "../../auth/types/auth.types";
import { useAuth } from "../../auth/context/AuthContext";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import {
    getCountrySuggestions,
    isKnownCountry,
} from "../../settings/services/locationSuggestions.service";
import {
    completeBasicOnboarding,
    completeRatingPlacement,
} from "../services/ratingPlacement.service";
import type {
    RatingPlacementAnswers,
    RatingPlacementQuestion,
    RatingPlacementResult,
} from "../types/ratingPlacement.types";
import {
    getRatingPlacementQuestion,
    isStepComplete,
    PROVISIONAL_MATCHES_TOTAL,
    ratingPlacementSteps,
} from "../utils/ratingPlacementSurvey";

type OnboardingPhase = "intent" | "location" | "preferences" | "rating";
type PlayerGoal =
    | "casual"
    | "friends"
    | "organize"
    | "competitive"
    | "tournaments"
    | "explore";
type CompletionState =
    | { kind: "basic" }
    | { kind: "rating"; result: RatingPlacementResult };

interface OnboardingCopy {
    eyebrow: string;
    title: string;
    body: string;
    progress: string;
    intentTitle: string;
    intentBody: string;
    locationTitle: string;
    locationBody: string;
    countryTitle: string;
    countryBody: string;
    countryPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    countryHelper: string;
    preferencesTitle: string;
    preferencesBody: string;
    matchModeTitle: string;
    daysTitle: string;
    availabilityTitle: string;
    styleTitle: string;
    equipmentTitle: string;
    rankingTitle: string;
    rankingBody: string;
    rankingSkipTitle: string;
    rankingSkipBody: string;
    back: string;
    next: string;
    finish: string;
    saving: string;
    skipOptional: string;
    skipRanking: string;
    countryRequiredError: string;
    saveError: string;
    basicResultEyebrow: string;
    basicResultTitle: string;
    basicResultBody: string;
    ratingResultEyebrow: string;
    ratingResultTitle: string;
    ratingResultBody: string;
    resultRatingLabel: string;
    continueCta: string;
    completeRankingCta: string;
    provisionalTitle: string;
    provisionalBody: string;
    modeCasual: string;
    modeCompetitive: string;
    availabilityAvailable: string;
    availabilityLooking: string;
    availabilityBusy: string;
    availabilityOffline: string;
    rightHand: string;
    leftHand: string;
    bothHands: string;
    rightSide: string;
    leftSide: string;
    bothSides: string;
    ball: string;
    net: string;
    selected: string;
    recommended: string;
}

const dayOptions: Array<{ value: PreferredPlayDay; short: string }> = [
    { value: "monday", short: "L" },
    { value: "tuesday", short: "M" },
    { value: "wednesday", short: "X" },
    { value: "thursday", short: "J" },
    { value: "friday", short: "V" },
    { value: "saturday", short: "S" },
    { value: "sunday", short: "D" },
];

function getSafeRedirectTarget(rawRedirect: string | null) {
    if (!rawRedirect || !rawRedirect.startsWith("/")) {
        return "/profile";
    }

    if (rawRedirect.startsWith("/onboarding/competitive-rating")) {
        return "/profile";
    }

    return rawRedirect;
}

function getCopy(isSpanish: boolean): OnboardingCopy {
    if (isSpanish) {
        return {
            eyebrow: "Onboarding de jugador",
            title: "Preparamos Sandset para como juegas tu",
            body:
                "Primero entendemos que buscas. El ranking solo aparece si quieres competir o desbloquear partidos competitivos.",
            progress: "Progreso",
            intentTitle: "Que vienes a buscar?",
            intentBody:
                "Esto decide si vamos por una entrada casual, social o competitiva.",
            locationTitle: "Donde y cuando juegas?",
            locationBody:
                "La app usa tu zona para mapa, calendario, eventos cercanos y ranking local.",
            countryTitle: "Pais principal",
            countryBody: "Necesitamos al menos tu pais para activar la app local.",
            countryPlaceholder: "Ej. Spain",
            cityLabel: "Ciudad o zona habitual",
            cityPlaceholder: "Ej. Barcelona, Valencia, Malaga...",
            countryHelper:
                "La ciudad ayuda a futuras recomendaciones, pero puedes dejarla vacia.",
            preferencesTitle: "Tu estilo de juego",
            preferencesBody:
                "Estas preferencias se pueden saltar y editar despues desde ajustes.",
            matchModeTitle: "Modo preferido",
            daysTitle: "Dias favoritos",
            availabilityTitle: "Disponibilidad",
            styleTitle: "Detalles de pista",
            equipmentTitle: "Material",
            rankingTitle: "Quieres desbloquear competitivo?",
            rankingBody:
                "El test estima un rating inicial. Sin el, puedes jugar casual, pero no crear partidos competitivos.",
            rankingSkipTitle: "Puedes saltarlo ahora",
            rankingSkipBody:
                "Tu perfil quedara listo para eventos casuales. Cuando quieras competir, vuelves y completas ranking.",
            back: "Atras",
            next: "Continuar",
            finish: "Finalizar",
            saving: "Guardando...",
            skipOptional: "Saltar preferencias",
            skipRanking: "Saltar ranking",
            countryRequiredError: "Elige un pais valido para continuar.",
            saveError: "No se ha podido guardar el onboarding",
            basicResultEyebrow: "Perfil listo",
            basicResultTitle: "Ya puedes jugar casual",
            basicResultBody:
                "Mapa, calendario, open plays, amigos e ideas quedan disponibles. El competitivo se desbloquea completando ranking.",
            ratingResultEyebrow: "Ranking listo",
            ratingResultTitle: "Tu nivel inicial esta preparado",
            ratingResultBody:
                "Este rating es provisional y se ajustara con tus primeros partidos aceptados.",
            resultRatingLabel: "Rating provisional",
            continueCta: "Entrar en Sandset",
            completeRankingCta: "Completar ranking",
            provisionalTitle: "{{count}} partidos provisionales",
            provisionalBody:
                "Durante tus primeros resultados aceptados, el sistema ajustara rapido tu nivel.",
            modeCasual: "Casual",
            modeCompetitive: "Competitivo",
            availabilityAvailable: "Disponible",
            availabilityLooking: "Buscando partido",
            availabilityBusy: "Ocupado",
            availabilityOffline: "Mas adelante",
            rightHand: "Diestro",
            leftHand: "Zurdo",
            bothHands: "Ambas manos",
            rightSide: "Lado derecho",
            leftSide: "Lado izquierdo",
            bothSides: "Ambos lados",
            ball: "Pelota",
            net: "Red",
            selected: "Seleccionado",
            recommended: "Recomendado",
        };
    }

    return {
        eyebrow: "Player onboarding",
        title: "We set up Sandset for how you play",
        body:
            "First we understand what you want. Ranking only appears if you want to compete or unlock competitive matches.",
        progress: "Progress",
        intentTitle: "What are you looking for?",
        intentBody:
            "This decides whether we start casual, social or competitive.",
        locationTitle: "Where and when do you play?",
        locationBody:
            "The app uses your area for map, calendar, nearby events and local ranking.",
        countryTitle: "Main country",
        countryBody: "We need at least your country to activate the local app.",
        countryPlaceholder: "Example: Spain",
        cityLabel: "Usual city or area",
        cityPlaceholder: "Example: Barcelona, Valencia, Malaga...",
        countryHelper:
            "City helps future recommendations, but you can leave it empty.",
        preferencesTitle: "Your playing style",
        preferencesBody:
            "These preferences can be skipped and edited later in settings.",
        matchModeTitle: "Preferred mode",
        daysTitle: "Favorite days",
        availabilityTitle: "Availability",
        styleTitle: "Court details",
        equipmentTitle: "Gear",
        rankingTitle: "Want to unlock competitive?",
        rankingBody:
            "The test estimates a starting rating. Without it, you can play casual, but cannot create competitive matches.",
        rankingSkipTitle: "You can skip it now",
        rankingSkipBody:
            "Your profile will be ready for casual events. When you want to compete, come back and complete ranking.",
        back: "Back",
        next: "Continue",
        finish: "Finish",
        saving: "Saving...",
        skipOptional: "Skip preferences",
        skipRanking: "Skip ranking",
        countryRequiredError: "Choose a valid country to continue.",
        saveError: "Could not save onboarding",
        basicResultEyebrow: "Profile ready",
        basicResultTitle: "You can now play casual",
        basicResultBody:
            "Map, calendar, open plays, friends and ideas are available. Competitive unlocks after completing ranking.",
        ratingResultEyebrow: "Ranking ready",
        ratingResultTitle: "Your starting level is prepared",
        ratingResultBody:
            "This rating is provisional and will adjust with your first accepted matches.",
        resultRatingLabel: "Provisional rating",
        continueCta: "Enter Sandset",
        completeRankingCta: "Complete ranking",
        provisionalTitle: "{{count}} provisional matches",
        provisionalBody:
            "During your first accepted results, the system will quickly adjust your level.",
        modeCasual: "Casual",
        modeCompetitive: "Competitive",
        availabilityAvailable: "Available",
        availabilityLooking: "Looking for match",
        availabilityBusy: "Busy",
        availabilityOffline: "Later",
        rightHand: "Right hand",
        leftHand: "Left hand",
        bothHands: "Both hands",
        rightSide: "Right side",
        leftSide: "Left side",
        bothSides: "Both sides",
        ball: "Ball",
        net: "Net",
        selected: "Selected",
        recommended: "Recommended",
    };
}

function interpolate(template: string, values: Record<string, string | number>) {
    return Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{{${key}}}`, String(value)),
        template
    );
}

function getGoalOptions(isSpanish: boolean) {
    return [
        {
            value: "casual" as const,
            icon: <CalendarDays size={22} />,
            title: "Open plays",
            body: isSpanish
                ? "Quiero encontrar planes para jugar sin complicarme."
                : "I want to find simple plans to play.",
            tone: "blue" as const,
        },
        {
            value: "friends" as const,
            icon: <Users size={22} />,
            title: isSpanish ? "Gente para jugar" : "People to play with",
            body: isSpanish
                ? "Busco conocer jugadores y repetir equipo."
                : "I want to meet players and repeat teams.",
            tone: "emerald" as const,
        },
        {
            value: "organize" as const,
            icon: <MapPin size={22} />,
            title: isSpanish ? "Organizar quedadas" : "Organize meetups",
            body: isSpanish
                ? "Quiero crear eventos y llenar pista."
                : "I want to create events and fill courts.",
            tone: "amber" as const,
        },
        {
            value: "competitive" as const,
            icon: <Target size={22} />,
            title: isSpanish ? "Competir" : "Compete",
            body: isSpanish
                ? "Quiero partidos con resultado y rating."
                : "I want matches with results and rating.",
            tone: "violet" as const,
        },
        {
            value: "tournaments" as const,
            icon: <Trophy size={22} />,
            title: isSpanish ? "Torneos" : "Tournaments",
            body: isSpanish
                ? "Me interesan cuadros, ranking y progresion."
                : "I care about brackets, ranking and progression.",
            tone: "slate" as const,
        },
        {
            value: "explore" as const,
            icon: <Sparkles size={22} />,
            title: isSpanish ? "Explorar" : "Explore",
            body: isSpanish
                ? "Prefiero mirar primero y completar despues."
                : "I prefer to look around and complete later.",
            tone: "sky" as const,
        },
    ];
}

function getPreferredModeForGoal(goal: PlayerGoal | null): NonNullable<PreferredMatchMode> {
    return goal === "competitive" || goal === "tournaments"
        ? "competitive"
        : "casual";
}

function shouldOfferRanking(
    goal: PlayerGoal | null,
    preferredMatchMode: PreferredMatchMode
) {
    return (
        goal === "competitive" ||
        goal === "tournaments" ||
        preferredMatchMode === "competitive"
    );
}

export function CompetitiveRatingOnboardingPage() {
    const { i18n, t } = useTranslation();
    const { profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isSpanish =
        i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
    const copy = useMemo(() => getCopy(isSpanish), [isSpanish]);
    const pageTopRef = useRef<HTMLDivElement | null>(null);
    const redirectTarget = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return getSafeRedirectTarget(params.get("redirect"));
    }, [location.search]);
    const wantsRatingOnly = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("mode") === "rating";
    }, [location.search]);

    const [phase, setPhase] = useState<OnboardingPhase>("intent");
    const [initializedProfileId, setInitializedProfileId] = useState<string | null>(
        null
    );
    const [ratingModeInitialized, setRatingModeInitialized] = useState(false);
    const [ratingStepIndex, setRatingStepIndex] = useState(0);
    const [goal, setGoal] = useState<PlayerGoal | null>(null);
    const [country, setCountry] = useState(profile?.country ?? "");
    const [city, setCity] = useState(profile?.city ?? "");
    const [countryFocused, setCountryFocused] = useState(false);
    const [preferredMatchMode, setPreferredMatchMode] =
        useState<NonNullable<PreferredMatchMode>>(
            profile?.preferredMatchMode ?? "casual"
        );
    const [availabilityStatus, setAvailabilityStatus] =
        useState<AvailabilityStatus>(profile?.availabilityStatus ?? null);
    const [preferredPlayDays, setPreferredPlayDays] = useState<PreferredPlayDay[]>(
        profile?.preferredPlayDays ?? []
    );
    const [preferredHand, setPreferredHand] = useState<PreferredHand>(
        profile?.preferredHand ?? null
    );
    const [preferredCourtSide, setPreferredCourtSide] =
        useState<PreferredCourtSide>(profile?.preferredCourtSide ?? null);
    const [hasBall, setHasBall] = useState(profile?.hasBall ?? false);
    const [hasNet, setHasNet] = useState(profile?.hasNet ?? false);
    const [answers, setAnswers] = useState<RatingPlacementAnswers>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [completed, setCompleted] = useState<CompletionState | null>(null);

    const countrySuggestions = useMemo(
        () => getCountrySuggestions(country),
        [country]
    );
    const isCountryValid = isKnownCountry(country);
    const ratingStep = ratingPlacementSteps[ratingStepIndex];
    const ratingQuestions = useMemo(
        () =>
            ratingStep.questionIds
                .map((questionId) => getRatingPlacementQuestion(questionId))
                .filter((question): question is RatingPlacementQuestion =>
                    Boolean(question)
                ),
        [ratingStep.questionIds]
    );
    const ratingStepComplete = isStepComplete(ratingStep.questionIds, answers);
    const isLastRatingStep = ratingStepIndex === ratingPlacementSteps.length - 1;
    const offerRanking = shouldOfferRanking(goal, preferredMatchMode);
    const progress = getProgress(phase, ratingStepIndex, offerRanking);

    if (profile && initializedProfileId !== profile.id) {
        setInitializedProfileId(profile.id);
        setCountry(profile.country ?? "");
        setCity(profile.city ?? "");
        setPreferredMatchMode(profile.preferredMatchMode ?? "casual");
        setAvailabilityStatus(profile.availabilityStatus ?? null);
        setPreferredPlayDays(profile.preferredPlayDays ?? []);
        setPreferredHand(profile.preferredHand ?? null);
        setPreferredCourtSide(profile.preferredCourtSide ?? null);
        setHasBall(profile.hasBall);
        setHasNet(profile.hasNet);
    }

    if (
        profile &&
        wantsRatingOnly &&
        !ratingModeInitialized &&
        profile.country &&
        profile.preferredMatchMode &&
        !profile.ratingPlacementCompletedAt
    ) {
        setRatingModeInitialized(true);
        setGoal("competitive");
        setPreferredMatchMode("competitive");
        setPhase("rating");
    }

    useEffect(() => {
        pageTopRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [phase, ratingStepIndex]);

    useEffect(() => {
        if (wantsRatingOnly && profile?.ratingPlacementCompletedAt && !completed) {
            navigate(redirectTarget, { replace: true });
        }
    }, [
        completed,
        navigate,
        profile?.ratingPlacementCompletedAt,
        redirectTarget,
        wantsRatingOnly,
    ]);

    if (!profile) {
        return (
            <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-10">
                <p className="text-sm text-slate-500">{t("common.loadingPage")}</p>
            </section>
        );
    }
    const currentProfile = profile;

    function selectGoal(nextGoal: PlayerGoal) {
        setGoal(nextGoal);
        setPreferredMatchMode(getPreferredModeForGoal(nextGoal));
        setSubmitError("");
    }

    function updateAnswer(questionId: RatingPlacementQuestion["id"], value: string) {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
        setSubmitError("");
    }

    function toggleDay(day: PreferredPlayDay) {
        setPreferredPlayDays((current) =>
            current.includes(day)
                ? current.filter((item) => item !== day)
                : [...current, day]
        );
    }

    function buildBasicPayload(includeOptional: boolean) {
        return {
            userId: currentProfile.id,
            country: country.trim(),
            city: city.trim() || null,
            preferredMatchMode,
            ...(includeOptional
                ? {
                      availabilityStatus,
                      preferredPlayDays,
                      preferredHand,
                      preferredCourtSide,
                      hasBall,
                      hasNet,
                  }
                : {}),
        };
    }

    async function saveBasic(includeOptional = true) {
        if (!isCountryValid) {
            setSubmitError(copy.countryRequiredError);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");
            await completeBasicOnboarding(buildBasicPayload(includeOptional));
            await refreshProfile();
            setCompleted({ kind: "basic" });
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : copy.saveError
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function finishRating() {
        if (!isCountryValid) {
            setSubmitError(copy.countryRequiredError);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");
            const result = await completeRatingPlacement({
                ...buildBasicPayload(true),
                answers,
            });
            await refreshProfile();
            setCompleted({ kind: "rating", result });
        } catch (error) {
            setSubmitError(
                error instanceof Error ? error.message : copy.saveError
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleContinue() {
        if (submitting) {
            return;
        }

        if (phase === "intent") {
            if (!goal) {
                return;
            }

            setPhase("location");
            return;
        }

        if (phase === "location") {
            if (!isCountryValid) {
                setSubmitError(copy.countryRequiredError);
                return;
            }

            setSubmitError("");
            setPhase("preferences");
            return;
        }

        if (phase === "preferences") {
            if (offerRanking) {
                setPhase("rating");
                return;
            }

            await saveBasic(true);
            return;
        }

        if (phase === "rating") {
            if (!ratingStepComplete) {
                return;
            }

            if (!isLastRatingStep) {
                setRatingStepIndex((current) => current + 1);
                return;
            }

            await finishRating();
        }
    }

    function handleBack() {
        if (submitting) {
            return;
        }

        if (phase === "rating" && ratingStepIndex > 0) {
            setRatingStepIndex((current) => current - 1);
            return;
        }

        if (phase === "rating") {
            setPhase("preferences");
            return;
        }

        if (phase === "preferences") {
            setPhase("location");
            return;
        }

        if (phase === "location") {
            setPhase("intent");
        }
    }

    const canContinue =
        phase === "intent"
            ? Boolean(goal)
            : phase === "location"
              ? isCountryValid
              : phase === "rating"
                ? ratingStepComplete
                : true;

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
            <div ref={pageTopRef} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_360px] xl:grid-cols-[minmax(0,1.35fr)_390px]">
                <main className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff7ed_0%,#eff6ff_52%,#dcfce7_100%)] p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
                    <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/10 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">
                                    {copy.eyebrow}
                                </p>
                                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-none tracking-[-0.05em] sm:text-5xl">
                                    {copy.title}
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                                    {copy.body}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/10 px-4 py-3 text-left ring-1 ring-white/10 sm:text-right">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    {copy.progress}
                                </p>
                                <p className="mt-1 text-2xl font-black">{progress}%</p>
                            </div>
                        </div>

                        <div className="mt-6 h-2 rounded-full bg-white/10">
                            <div
                                className="h-2 rounded-full bg-[linear-gradient(90deg,#60a5fa_0%,#34d399_100%)] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        {phase === "intent" ? (
                            <IntentStep
                                copy={copy}
                                isSpanish={isSpanish}
                                selectedGoal={goal}
                                onSelect={selectGoal}
                            />
                        ) : null}

                        {phase === "location" ? (
                            <LocationStep
                                copy={copy}
                                country={country}
                                city={city}
                                countryFocused={countryFocused}
                                countrySuggestions={countrySuggestions}
                                onCountryFocus={() => setCountryFocused(true)}
                                onCountryBlur={() => {
                                    window.setTimeout(
                                        () => setCountryFocused(false),
                                        120
                                    );
                                }}
                                onCountryChange={(value) => {
                                    setCountry(value);
                                    setSubmitError("");
                                }}
                                onCityChange={setCity}
                                onCountrySuggestion={(suggestion) => {
                                    setCountry(suggestion);
                                    setCountryFocused(false);
                                    setSubmitError("");
                                }}
                            />
                        ) : null}

                        {phase === "preferences" ? (
                            <PreferencesStep
                                copy={copy}
                                preferredMatchMode={preferredMatchMode}
                                preferredPlayDays={preferredPlayDays}
                                availabilityStatus={availabilityStatus}
                                preferredHand={preferredHand}
                                preferredCourtSide={preferredCourtSide}
                                hasBall={hasBall}
                                hasNet={hasNet}
                                onPreferredMatchMode={setPreferredMatchMode}
                                onToggleDay={toggleDay}
                                onAvailabilityStatus={setAvailabilityStatus}
                                onPreferredHand={setPreferredHand}
                                onPreferredCourtSide={setPreferredCourtSide}
                                onHasBall={setHasBall}
                                onHasNet={setHasNet}
                            />
                        ) : null}

                        {phase === "rating" ? (
                            <RatingStep
                                copy={copy}
                                ratingStep={ratingStep}
                                ratingQuestions={ratingQuestions}
                                answers={answers}
                                onAnswer={updateAnswer}
                                t={t}
                            />
                        ) : null}
                    </div>

                    {submitError ? (
                        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                            {submitError}
                        </p>
                    ) : null}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={submitting || phase === "intent"}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ArrowLeft size={16} />
                            {copy.back}
                        </button>

                        <div className="grid gap-3 sm:flex">
                            {phase === "preferences" ? (
                                <button
                                    type="button"
                                    onClick={() => void saveBasic(false)}
                                    disabled={submitting}
                                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copy.skipOptional}
                                </button>
                            ) : null}

                            {phase === "rating" ? (
                                <button
                                    type="button"
                                    onClick={() => void saveBasic(true)}
                                    disabled={submitting}
                                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copy.skipRanking}
                                </button>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => void handleContinue()}
                                disabled={!canContinue || submitting}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting
                                    ? copy.saving
                                    : phase === "rating" && isLastRatingStep
                                      ? copy.finish
                                      : copy.next}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </main>

                <aside className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3 text-blue-100">
                        <ShieldCheck size={20} />
                    </div>
                    <h2 className="mt-5 text-2xl font-black">
                        {phase === "rating"
                            ? copy.rankingSkipTitle
                            : copy.preferencesTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        {phase === "rating"
                            ? copy.rankingSkipBody
                            : copy.preferencesBody}
                    </p>

                    <div className="mt-6 grid gap-3">
                        <InfoPill
                            label={copy.modeCasual}
                            active={preferredMatchMode === "casual"}
                        />
                        <InfoPill
                            label={copy.modeCompetitive}
                            active={preferredMatchMode === "competitive"}
                        />
                        <div className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                            <p className="text-sm font-black">
                                {interpolate(copy.provisionalTitle, {
                                    count: PROVISIONAL_MATCHES_TOTAL,
                                })}
                            </p>
                            <p className="mt-2 text-xs leading-6 text-slate-400">
                                {copy.provisionalBody}
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {completed ? (
                <CompletionModal
                    copy={copy}
                    completed={completed}
                    onContinue={() => navigate(redirectTarget, { replace: true })}
                    onCompleteRanking={() => {
                        setCompleted(null);
                        setGoal("competitive");
                        setPreferredMatchMode("competitive");
                        setPhase("rating");
                    }}
                />
            ) : null}
        </section>
    );
}

function getProgress(
    phase: OnboardingPhase,
    ratingStepIndex: number,
    offerRanking: boolean
) {
    if (phase === "intent") return 20;
    if (phase === "location") return 40;
    if (phase === "preferences") return offerRanking ? 58 : 78;
    return Math.min(
        96,
        64 + Math.round(((ratingStepIndex + 1) / ratingPlacementSteps.length) * 32)
    );
}

function IntentStep({
    copy,
    isSpanish,
    selectedGoal,
    onSelect,
}: {
    copy: OnboardingCopy;
    isSpanish: boolean;
    selectedGoal: PlayerGoal | null;
    onSelect: (goal: PlayerGoal) => void;
}) {
    const goals = getGoalOptions(isSpanish);

    return (
        <StepShell title={copy.intentTitle} body={copy.intentBody}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {goals.map((goal) => (
                    <ChoiceCard
                        key={goal.value}
                        icon={goal.icon}
                        title={goal.title}
                        body={goal.body}
                        selected={selectedGoal === goal.value}
                        tone={goal.tone}
                        badge={
                            goal.value === "competitive" || goal.value === "tournaments"
                                ? copy.recommended
                                : undefined
                        }
                        onClick={() => onSelect(goal.value)}
                    />
                ))}
            </div>
            <span className="sr-only">{isSpanish ? "Paso inicial" : "First step"}</span>
        </StepShell>
    );
}

function LocationStep({
    copy,
    country,
    city,
    countryFocused,
    countrySuggestions,
    onCountryFocus,
    onCountryBlur,
    onCountryChange,
    onCityChange,
    onCountrySuggestion,
}: {
    copy: OnboardingCopy;
    country: string;
    city: string;
    countryFocused: boolean;
    countrySuggestions: string[];
    onCountryFocus: () => void;
    onCountryBlur: () => void;
    onCountryChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onCountrySuggestion: (value: string) => void;
}) {
    return (
        <StepShell title={copy.locationTitle} body={copy.locationBody}>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <article className="rounded-[1.75rem] bg-white/86 p-5 shadow-sm ring-1 ring-white">
                    <h3 className="text-lg font-black text-slate-950">
                        {copy.countryTitle}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                        {copy.countryBody}
                    </p>

                    <div className="relative mt-4">
                        <input
                            value={country}
                            onFocus={onCountryFocus}
                            onBlur={onCountryBlur}
                            onChange={(event) => onCountryChange(event.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                            placeholder={copy.countryPlaceholder}
                        />

                        {countryFocused &&
                        country.trim().length > 0 &&
                        countrySuggestions.length > 0 ? (
                            <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                                {countrySuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => onCountrySuggestion(suggestion)}
                                        className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </article>

                <article className="rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-sm">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3 text-blue-100">
                        <MapPin size={20} />
                    </div>
                    <label className="mt-5 block text-sm font-black">
                        {copy.cityLabel}
                    </label>
                    <input
                        value={city}
                        onChange={(event) => onCityChange(event.target.value)}
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-400/20"
                        placeholder={copy.cityPlaceholder}
                    />
                    <p className="mt-4 text-xs leading-6 text-slate-400">
                        {copy.countryHelper}
                    </p>
                </article>
            </div>
        </StepShell>
    );
}

function PreferencesStep({
    copy,
    preferredMatchMode,
    preferredPlayDays,
    availabilityStatus,
    preferredHand,
    preferredCourtSide,
    hasBall,
    hasNet,
    onPreferredMatchMode,
    onToggleDay,
    onAvailabilityStatus,
    onPreferredHand,
    onPreferredCourtSide,
    onHasBall,
    onHasNet,
}: {
    copy: OnboardingCopy;
    preferredMatchMode: NonNullable<PreferredMatchMode>;
    preferredPlayDays: PreferredPlayDay[];
    availabilityStatus: AvailabilityStatus;
    preferredHand: PreferredHand;
    preferredCourtSide: PreferredCourtSide;
    hasBall: boolean;
    hasNet: boolean;
    onPreferredMatchMode: (value: NonNullable<PreferredMatchMode>) => void;
    onToggleDay: (day: PreferredPlayDay) => void;
    onAvailabilityStatus: (value: AvailabilityStatus) => void;
    onPreferredHand: (value: PreferredHand) => void;
    onPreferredCourtSide: (value: PreferredCourtSide) => void;
    onHasBall: (value: boolean) => void;
    onHasNet: (value: boolean) => void;
}) {
    return (
        <StepShell title={copy.preferencesTitle} body={copy.preferencesBody}>
            <div className="grid gap-4 lg:grid-cols-2">
                <PreferencePanel title={copy.matchModeTitle}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <SegmentCard
                            label={copy.modeCasual}
                            selected={preferredMatchMode === "casual"}
                            onClick={() => onPreferredMatchMode("casual")}
                        />
                        <SegmentCard
                            label={copy.modeCompetitive}
                            selected={preferredMatchMode === "competitive"}
                            onClick={() => onPreferredMatchMode("competitive")}
                        />
                    </div>
                </PreferencePanel>

                <PreferencePanel title={copy.daysTitle}>
                    <div className="grid grid-cols-7 gap-2">
                        {dayOptions.map((day) => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => onToggleDay(day.value)}
                                className={`flex h-11 items-center justify-center rounded-2xl text-sm font-black transition ${
                                    preferredPlayDays.includes(day.value)
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
                                }`}
                            >
                                {day.short}
                            </button>
                        ))}
                    </div>
                </PreferencePanel>

                <PreferencePanel title={copy.availabilityTitle}>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <SegmentCard
                            label={copy.availabilityAvailable}
                            selected={availabilityStatus === "available"}
                            onClick={() => onAvailabilityStatus("available")}
                        />
                        <SegmentCard
                            label={copy.availabilityLooking}
                            selected={availabilityStatus === "looking_for_match"}
                            onClick={() =>
                                onAvailabilityStatus("looking_for_match")
                            }
                        />
                        <SegmentCard
                            label={copy.availabilityBusy}
                            selected={availabilityStatus === "busy"}
                            onClick={() => onAvailabilityStatus("busy")}
                        />
                        <SegmentCard
                            label={copy.availabilityOffline}
                            selected={availabilityStatus === "offline"}
                            onClick={() => onAvailabilityStatus("offline")}
                        />
                    </div>
                </PreferencePanel>

                <PreferencePanel title={copy.styleTitle}>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <SegmentCard
                            label={copy.rightHand}
                            selected={preferredHand === "right"}
                            onClick={() => onPreferredHand("right")}
                        />
                        <SegmentCard
                            label={copy.leftHand}
                            selected={preferredHand === "left"}
                            onClick={() => onPreferredHand("left")}
                        />
                        <SegmentCard
                            label={copy.bothHands}
                            selected={preferredHand === "both"}
                            onClick={() => onPreferredHand("both")}
                        />
                        <SegmentCard
                            label={copy.rightSide}
                            selected={preferredCourtSide === "right"}
                            onClick={() => onPreferredCourtSide("right")}
                        />
                        <SegmentCard
                            label={copy.leftSide}
                            selected={preferredCourtSide === "left"}
                            onClick={() => onPreferredCourtSide("left")}
                        />
                        <SegmentCard
                            label={copy.bothSides}
                            selected={preferredCourtSide === "both"}
                            onClick={() => onPreferredCourtSide("both")}
                        />
                    </div>
                </PreferencePanel>

                <PreferencePanel title={copy.equipmentTitle}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <SegmentCard
                            label={copy.ball}
                            selected={hasBall}
                            onClick={() => onHasBall(!hasBall)}
                        />
                        <SegmentCard
                            label={copy.net}
                            selected={hasNet}
                            onClick={() => onHasNet(!hasNet)}
                        />
                    </div>
                </PreferencePanel>
            </div>
        </StepShell>
    );
}

function RatingStep({
    copy,
    ratingStep,
    ratingQuestions,
    answers,
    onAnswer,
    t,
}: {
    copy: OnboardingCopy;
    ratingStep: (typeof ratingPlacementSteps)[number];
    ratingQuestions: RatingPlacementQuestion[];
    answers: RatingPlacementAnswers;
    onAnswer: (questionId: RatingPlacementQuestion["id"], value: string) => void;
    t: (key: string) => string;
}) {
    return (
        <StepShell title={copy.rankingTitle} body={copy.rankingBody}>
            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">
                    {t(ratingStep.eyebrowKey)}
                </p>
                <h2 className="mt-2 text-2xl font-black">
                    {t(ratingStep.titleKey)}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                    {t(ratingStep.bodyKey)}
                </p>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {ratingQuestions.map((question) => (
                    <article
                        key={question.id}
                        className="rounded-[1.75rem] bg-white/86 p-5 shadow-sm ring-1 ring-white"
                    >
                        <h3 className="text-lg font-black text-slate-950">
                            {t(question.titleKey)}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                            {t(question.descriptionKey)}
                        </p>

                        <div className="mt-4 grid gap-2">
                            {question.options.map((option) => {
                                const isSelected =
                                    answers[question.id] === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            onAnswer(question.id, option.value)
                                        }
                                        className={`flex items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold leading-6 transition ${
                                            isSelected
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                                        }`}
                                    >
                                        {t(option.labelKey)}
                                        {isSelected ? (
                                            <Check className="mt-1 shrink-0" size={15} />
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </article>
                ))}
            </div>
        </StepShell>
    );
}

function CompletionModal({
    copy,
    completed,
    onContinue,
    onCompleteRanking,
}: {
    copy: OnboardingCopy;
    completed: CompletionState;
    onContinue: () => void;
    onCompleteRanking: () => void;
}) {
    const isRating = completed.kind === "rating";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                    {isRating ? copy.ratingResultEyebrow : copy.basicResultEyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">
                    {isRating ? copy.ratingResultTitle : copy.basicResultTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                    {isRating ? copy.ratingResultBody : copy.basicResultBody}
                </p>

                {isRating ? (
                    <div className="mt-6 rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(37,99,235,0.08)_0%,rgba(20,184,166,0.12)_100%)] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            {copy.resultRatingLabel}
                        </p>
                        <p className="mt-2 text-5xl font-black tracking-[-0.04em] text-slate-950">
                            {formatCompetitiveRating(completed.result.estimatedRating)}
                        </p>
                    </div>
                ) : null}

                <div className="mt-6 grid gap-3">
                    {!isRating ? (
                        <button
                            type="button"
                            onClick={onCompleteRanking}
                            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
                        >
                            {copy.completeRankingCta}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={onContinue}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                        {copy.continueCta}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepShell({
    title,
    body,
    children,
}: {
    title: string;
    body: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[1.75rem] bg-white/45 p-4 ring-1 ring-white/70 backdrop-blur-sm sm:p-5">
            <div className="mb-5">
                <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                    {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                    {body}
                </p>
            </div>
            {children}
        </section>
    );
}

function ChoiceCard({
    icon,
    title,
    body,
    selected,
    tone,
    badge,
    onClick,
}: {
    icon: ReactNode;
    title: string;
    body: string;
    selected: boolean;
    tone: "blue" | "emerald" | "amber" | "violet" | "slate" | "sky";
    badge?: string;
    onClick: () => void;
}) {
    const tones = {
        blue: "from-blue-50 to-white text-blue-700",
        emerald: "from-emerald-50 to-white text-emerald-700",
        amber: "from-amber-50 to-white text-amber-700",
        violet: "from-violet-50 to-white text-violet-700",
        slate: "from-slate-100 to-white text-slate-700",
        sky: "from-sky-50 to-white text-sky-700",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br p-5 text-left shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-lg ${
                selected ? "ring-blue-500" : "ring-white"
            } ${tones[tone]}`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                    {icon}
                </span>
                {selected ? (
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white">
                        OK
                    </span>
                ) : badge ? (
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                        {badge}
                    </span>
                ) : null}
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        </button>
    );
}

function PreferencePanel({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <article className="rounded-[1.5rem] bg-white/84 p-5 shadow-sm ring-1 ring-white">
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                {title}
            </h3>
            {children}
        </article>
    );
}

function SegmentCard({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                selected
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
        >
            {label}
        </button>
    );
}

function InfoPill({ label, active }: { label: string; active: boolean }) {
    return (
        <div
            className={`flex items-center justify-between rounded-2xl p-4 ring-1 ${
                active
                    ? "bg-emerald-400 text-emerald-950 ring-emerald-300"
                    : "bg-white/8 text-slate-300 ring-white/10"
            }`}
        >
            <span className="text-sm font-black">{label}</span>
            {active ? <Check size={16} /> : null}
        </div>
    );
}
