import type { MatchResult } from "../types/matchResult.types";
import i18n from "../../../i18n";

interface MatchResultSummaryProps {
    result: MatchResult;
}

function getValidationLabel(validationStatus: MatchResult["validationStatus"]) {
    switch (validationStatus) {
        case "accepted":
            return i18n.t("matchResult.validated");
        case "rejected":
        case "disputed":
            return i18n.t("matchResult.rejectedDisputed");
        case "expired":
            return i18n.t("matchResult.expired");
        default:
            return i18n.t("matchResult.pendingValidation");
    }
}

function getValidationClasses(validationStatus: MatchResult["validationStatus"]) {
    switch (validationStatus) {
        case "accepted":
            return "bg-emerald-100 text-emerald-700";
        case "rejected":
        case "disputed":
            return "bg-red-100 text-red-700";
        case "expired":
            return "bg-slate-200 text-slate-700";
        default:
            return "bg-amber-100 text-amber-700";
    }
}

export function MatchResultSummary({ result }: MatchResultSummaryProps) {
    const winningTeamLabel =
        result.winningTeam === "team_a"
            ? i18n.t("matchResult.teamAWins")
            : result.winningTeam === "team_b"
              ? i18n.t("matchResult.teamBWins")
              : i18n.t("matchResult.winnerPending");

    return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-3">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getValidationClasses(
                        result.validationStatus
                    )}`}
                >
                    {getValidationLabel(result.validationStatus)}
                </span>

                <span className="text-sm text-slate-500">
                    {i18n.t("matchResult.set", { count: result.sets.length })}
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                    {winningTeamLabel}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {result.sets.map((set) => (
                    <div
                        key={set.id}
                        className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"
                    >
                        <span className="text-sm font-bold text-slate-500">
                            {i18n.t("matchResult.setLabel", { number: set.setNumber })}
                        </span>

                        <span className="text-lg font-black text-slate-900">
                            {set.teamAScore} - {set.teamBScore}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
