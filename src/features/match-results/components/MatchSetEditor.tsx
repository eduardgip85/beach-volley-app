import { MinusCircle } from "lucide-react";
import type { CreateMatchSetPayload } from "../types/matchResult.types";

interface MatchSetEditorProps {
    set: CreateMatchSetPayload;
    canRemove: boolean;
    targetScore?: number;
    helperText?: string;
    disabled?: boolean;
    onChange: (
        field: keyof Omit<CreateMatchSetPayload, "setNumber">,
        value: number
    ) => void;
    onRemove: () => void;
}

export function MatchSetEditor({
    set,
    canRemove,
    targetScore,
    helperText,
    disabled = false,
    onChange,
    onRemove,
}: MatchSetEditorProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    Set {set.setNumber}
                </p>

                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={disabled}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                        <MinusCircle size={16} />
                        Remove
                    </button>
                )}
            </div>

            {(targetScore || helperText) && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                    {helperText ?? `Target score: ${targetScore}`}
                </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Team A Score
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={set.teamAScore}
                        disabled={disabled}
                        onChange={(event) =>
                            onChange("teamAScore", Number(event.target.value))
                        }
                        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500 disabled:opacity-60"
                    />
                </label>

                <label className="block">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        Team B Score
                    </span>
                    <input
                        type="number"
                        min={0}
                        value={set.teamBScore}
                        disabled={disabled}
                        onChange={(event) =>
                            onChange("teamBScore", Number(event.target.value))
                        }
                        className="mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3 text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-blue-500 disabled:opacity-60"
                    />
                </label>
            </div>
        </div>
    );
}
