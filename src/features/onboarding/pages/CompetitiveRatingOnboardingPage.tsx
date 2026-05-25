import { ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
    getCountrySuggestions,
    isKnownCountry,
} from "../../settings/services/locationSuggestions.service";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import {
    completeRatingPlacement,
    saveOnboardingCountry,
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

function getSafeRedirectTarget(rawRedirect: string | null) {
    if (!rawRedirect || !rawRedirect.startsWith("/")) {
        return "/profile";
    }

    if (rawRedirect.startsWith("/onboarding/competitive-rating")) {
        return "/profile";
    }

    return rawRedirect;
}

export function CompetitiveRatingOnboardingPage() {
    const { t } = useTranslation();
    const { profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<RatingPlacementAnswers>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [completedResult, setCompletedResult] =
        useState<RatingPlacementResult | null>(null);
    const [country, setCountry] = useState(profile?.country ?? "");
    const [countryFocused, setCountryFocused] = useState(false);
    const pageTopRef = useRef<HTMLDivElement | null>(null);

    const redirectTarget = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return getSafeRedirectTarget(params.get("redirect"));
    }, [location.search]);

    const currentStep = ratingPlacementSteps[currentStepIndex];
    const currentQuestions = useMemo(
        () =>
            currentStep.questionIds
                .map((questionId) => getRatingPlacementQuestion(questionId))
                .filter((question): question is RatingPlacementQuestion =>
                    Boolean(question)
                ),
        [currentStep.questionIds]
    );
    const canContinue = isStepComplete(currentStep.questionIds, answers);
    const isLastStep = currentStepIndex === ratingPlacementSteps.length - 1;
    const countrySuggestions = useMemo(
        () => getCountrySuggestions(country),
        [country]
    );
    const isCountryValid = isKnownCountry(country);

    useEffect(() => {
        if (completedResult) {
            return;
        }

        pageTopRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, [completedResult, currentStepIndex]);

    useEffect(() => {
        setCountry(profile?.country ?? "");
    }, [profile?.country]);

    if (!profile) {
        return (
            <section className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-10">
                <p className="text-sm text-slate-500">{t("common.loadingPage")}</p>
            </section>
        );
    }

    const currentProfile = profile;
    const requiresCountryOnly = Boolean(
        currentProfile.ratingPlacementCompletedAt && !currentProfile.country
    );
    const progress = requiresCountryOnly
        ? 100
        : Math.round(
              ((currentStepIndex + 1) / ratingPlacementSteps.length) * 100
          );
    const effectiveCanContinue = requiresCountryOnly ? isCountryValid : canContinue;

    function updateAnswer(questionId: RatingPlacementQuestion["id"], value: string) {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }));
        setSubmitError("");
    }

    async function handleContinue() {
        if (!effectiveCanContinue || submitting) {
            return;
        }

        if (!isCountryValid) {
            setSubmitError(t("onboardingRating.countryRequiredError"));
            return;
        }

        if (requiresCountryOnly) {
            try {
                setSubmitting(true);
                setSubmitError("");
                await saveOnboardingCountry(currentProfile.id, country.trim());
                await refreshProfile();
                navigate(redirectTarget, { replace: true });
            } catch (error) {
                setSubmitError(
                    error instanceof Error
                        ? error.message
                        : t("onboardingRating.saveError")
                );
            } finally {
                setSubmitting(false);
            }

            return;
        }

        if (!isLastStep) {
            setCurrentStepIndex((current) => current + 1);
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");
            const result = await completeRatingPlacement({
                userId: currentProfile.id,
                answers,
                country: country.trim(),
            });
            await refreshProfile();
            setCompletedResult(result);
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : t("onboardingRating.saveError")
            );
        } finally {
            setSubmitting(false);
        }
    }

    function handleBack() {
        if (submitting || currentStepIndex === 0 || requiresCountryOnly) {
            return;
        }

        setCurrentStepIndex((current) => current - 1);
    }

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-10">
            <div ref={pageTopRef} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                                    {t(currentStep.eyebrowKey)}
                                </p>
                                <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
                                    {t("onboardingRating.title")}
                                </h1>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    {t("onboardingRating.progressLabel")}
                                </p>
                                <p className="mt-1 text-lg font-black text-slate-950">
                                    {progress}%
                                </p>
                            </div>
                        </div>

                        <p className="max-w-3xl text-sm leading-7 text-slate-600">
                            {t(
                                requiresCountryOnly
                                    ? "onboardingRating.countryOnlyBody"
                                    : "onboardingRating.body"
                            )}
                        </p>

                        <div className="h-2 rounded-full bg-slate-100">
                            <div
                                className="h-2 rounded-full bg-[linear-gradient(90deg,_#2563eb_0%,_#14b8a6_100%)] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-8 rounded-[1.75rem] border border-blue-100 bg-[linear-gradient(180deg,_rgba(239,246,255,0.88)_0%,_rgba(255,255,255,0.96)_100%)] p-5">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
                            {t(
                                requiresCountryOnly
                                    ? "onboardingRating.countryEyebrow"
                                    : currentStep.eyebrowKey
                            )}
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-slate-950">
                            {t(
                                requiresCountryOnly
                                    ? "onboardingRating.countryTitle"
                                    : currentStep.titleKey
                            )}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            {t(
                                requiresCountryOnly
                                    ? "onboardingRating.countryBody"
                                    : currentStep.bodyKey
                            )}
                        </p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                            <h3 className="text-lg font-black text-slate-950">
                                {t("onboardingRating.countryQuestionTitle")}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                                {t("onboardingRating.countryQuestionBody")}
                            </p>

                            <div className="relative mt-4">
                                <input
                                    value={country}
                                    onFocus={() => setCountryFocused(true)}
                                    onBlur={() => {
                                        window.setTimeout(
                                            () => setCountryFocused(false),
                                            120
                                        );
                                    }}
                                    onChange={(event) => {
                                        setCountry(event.target.value);
                                        setSubmitError("");
                                    }}
                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                                    placeholder={t("onboardingRating.countryPlaceholder")}
                                />

                                {countryFocused &&
                                country.trim().length > 0 &&
                                countrySuggestions.length > 0 ? (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                                        {countrySuggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                type="button"
                                                onMouseDown={(event) =>
                                                    event.preventDefault()
                                                }
                                                onClick={() => {
                                                    setCountry(suggestion);
                                                    setCountryFocused(false);
                                                    setSubmitError("");
                                                }}
                                                className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <p className="mt-3 text-xs leading-6 text-slate-500">
                                {t("onboardingRating.countryHelper")}
                            </p>
                        </article>

                        {!requiresCountryOnly
                            ? currentQuestions.map((question) => (
                                  <article
                                      key={question.id}
                                      className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5"
                                  >
                                      <h3 className="text-lg font-black text-slate-950">
                                          {t(question.titleKey)}
                                      </h3>
                                      <p className="mt-2 text-sm leading-7 text-slate-600">
                                          {t(question.descriptionKey)}
                                      </p>

                                      <div className="mt-4 grid gap-3">
                                          {question.options.map((option) => {
                                              const isSelected =
                                                  answers[question.id] === option.value;

                                              return (
                                                  <button
                                                      key={option.value}
                                                      type="button"
                                                      onClick={() =>
                                                          updateAnswer(
                                                              question.id,
                                                              option.value
                                                          )
                                                      }
                                                      className={[
                                                          "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition",
                                                          isSelected
                                                              ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                              : "border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50/50",
                                                      ].join(" ")}
                                                  >
                                                      <span className="text-sm font-semibold leading-6">
                                                          {t(option.labelKey)}
                                                      </span>
                                                      <span
                                                          className={[
                                                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                                                              isSelected
                                                                  ? "border-white bg-white text-blue-700"
                                                                  : "border-slate-300 bg-white text-transparent",
                                                          ].join(" ")}
                                                      >
                                                          <span className="text-[10px] font-black">
                                                              {isSelected
                                                                  ? "OK"
                                                                  : "OK"}
                                                          </span>
                                                      </span>
                                                  </button>
                                              );
                                          })}
                                      </div>
                                  </article>
                              ))
                            : null}
                    </div>

                    {submitError ? (
                        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {submitError}
                        </p>
                    ) : null}

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStepIndex === 0 || submitting}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ArrowLeft size={16} />
                            {t("onboardingRating.back")}
                        </button>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={!effectiveCanContinue || submitting}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting
                                ? t("onboardingRating.saving")
                                : requiresCountryOnly
                                ? t("onboardingRating.countryOnlyCta")
                                : isLastStep
                                ? t("onboardingRating.finish")
                                : t("onboardingRating.next")}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <aside className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(15,23,42,0.98)_0%,_rgba(29,78,216,0.96)_100%)] p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)] sm:p-6">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3 text-blue-100">
                        <Sparkles size={20} />
                    </div>
                    <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                        {t(
                            requiresCountryOnly
                                ? "onboardingRating.countryPreviewEyebrow"
                                : "onboardingRating.previewEyebrow"
                        )}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                        {t(
                            requiresCountryOnly
                                ? "onboardingRating.countryPreviewTitle"
                                : "onboardingRating.previewTitle"
                        )}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-blue-50/90">
                        {t(
                            requiresCountryOnly
                                ? "onboardingRating.countryPreviewBody"
                                : "onboardingRating.previewBody"
                        )}
                    </p>

                    <div className="mt-6 rounded-[1.75rem] bg-white/8 p-5 backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-1 shrink-0 text-emerald-300" size={18} />
                            <div>
                                <p className="text-sm font-black text-white">
                                    {requiresCountryOnly
                                        ? t("onboardingRating.countryPreviewCardTitle")
                                        : t("onboardingRating.provisionalTitle", {
                                              count: PROVISIONAL_MATCHES_TOTAL,
                                          })}
                                </p>
                                <p className="mt-2 text-sm leading-7 text-blue-50/90">
                                    {t(
                                        requiresCountryOnly
                                            ? "onboardingRating.countryPreviewCardBody"
                                            : "onboardingRating.provisionalBody"
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {completedResult ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-7">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                            {t("onboardingRating.resultEyebrow")}
                        </p>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-slate-950">
                            {t("onboardingRating.resultTitle")}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            {t("onboardingRating.resultBody")}
                        </p>

                        <div className="mt-6 rounded-[1.75rem] bg-[linear-gradient(135deg,_rgba(37,99,235,0.08)_0%,_rgba(20,184,166,0.12)_100%)] p-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                                {t("onboardingRating.resultRatingLabel")}
                            </p>
                            <p className="mt-2 text-5xl font-black tracking-[-0.04em] text-slate-950">
                                {formatCompetitiveRating(completedResult.estimatedRating)}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {t("onboardingRating.provisionalTitle", {
                                    count: PROVISIONAL_MATCHES_TOTAL,
                                })}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate(redirectTarget, { replace: true })}
                            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            {t("onboardingRating.resultCta")}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ) : null}
        </section>
    );
}
