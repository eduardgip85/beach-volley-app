import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MatchSetEditor } from "./MatchSetEditor";
import { MatchResultSummary } from "./MatchResultSummary";
import type {
    CreateMatchSetPayload,
    MatchResult,
} from "../types/matchResult.types";

interface MatchResultSectionProps {
    result: MatchResult | null;
    sets: CreateMatchSetPayload[];
    eventMode?: "casual" | "competitive" | null;
    isCompetitiveFixedSets?: boolean;
    loading: boolean;
    submitting: boolean;
    validating: boolean;
    error: string;
    canManageResult: boolean;
    canValidateResult: boolean;
    onAddSet: () => void;
    onRemoveSet: (index: number) => void;
    onUpdateSet: (
        index: number,
        field: keyof Omit<CreateMatchSetPayload, "setNumber">,
        value: number
    ) => void;
    onSubmit: () => void;
    onValidate: () => void;
    onReject: () => void;
}

export function MatchResultSection({
    result,
    sets,
    eventMode = null,
    isCompetitiveFixedSets = false,
    loading,
    submitting,
    validating,
    error,
    canManageResult,
    canValidateResult,
    onAddSet,
    onRemoveSet,
    onUpdateSet,
    onSubmit,
    onValidate,
    onReject,
}: MatchResultSectionProps) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">{t("matchResult.title")}</h2>
                <p className="mt-3 text-sm text-slate-500">{t("matchResult.loading")}</p>
            </section>
        );
    }

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t("matchResult.title")}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {result
                            ? t("matchResult.existingBody")
                            : t("matchResult.newBody")}
                    </p>
                </div>

                {result && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                        {result.validationStatus}
                    </span>
                )}
            </div>

            {error && (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {result && (
                <div className="mt-6">
                    <MatchResultSummary result={result} />
                </div>
            )}

            {canManageResult && (
                <div className="mt-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                            {result ? t("matchResult.editSets") : t("matchResult.addResult")}
                        </h3>

                        {!isCompetitiveFixedSets && (
                            <button
                                type="button"
                                onClick={onAddSet}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                            >
                                <Plus size={16} />
                                {t("matchResult.addSet")}
                            </button>
                        )}
                    </div>

                    {eventMode === "competitive" && (
                        <div className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            {t("matchResult.competitiveFormat")}
                        </div>
                    )}

                    <div className="space-y-4">
                        {sets.map((set, index) => (
                            <MatchSetEditor
                                key={`${set.setNumber}-${index}`}
                                set={set}
                                canRemove={!isCompetitiveFixedSets && sets.length > 1}
                                targetScore={
                                    eventMode === "competitive"
                                        ? set.setNumber === 3
                                            ? 15
                                            : 21
                                        : undefined
                                }
                                helperText={
                                    eventMode === "competitive"
                                        ? set.setNumber === 3
                                            ? t("matchResult.decidingSetHelper")
                                            : t("matchResult.regularSetHelper")
                                        : undefined
                                }
                                disabled={submitting}
                                onChange={(field, value) =>
                                    onUpdateSet(index, field, value)
                                }
                                onRemove={() => onRemoveSet(index)}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={submitting}
                        className="mt-5 rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-60"
                    >
                        {submitting
                            ? t("matchResult.savingResult")
                            : result
                              ? t("matchResult.updateResult")
                              : t("matchResult.submitResult")}
                    </button>
                </div>
            )}

            {result && canValidateResult && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={onValidate}
                        disabled={validating}
                        className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
                    >
                        {validating ? t("matchResult.saving") : t("matchResult.acceptResult")}
                    </button>

                    <button
                        type="button"
                        onClick={onReject}
                        disabled={validating}
                        className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 disabled:opacity-60"
                    >
                        {validating ? t("matchResult.saving") : t("matchResult.rejectResult")}
                    </button>
                </div>
            )}
        </section>
    );
}
