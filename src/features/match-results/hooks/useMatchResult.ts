import { useEffect, useState } from "react";
import {
    acceptMatchResult,
    createMatchResult,
    getMatchResultByEventId,
    getResultValidationEligibility,
    rejectMatchResult,
    updateMatchResult,
} from "../services/matchResults.service";
import type {
    CreateMatchSetPayload,
    MatchResult,
    MatchSet,
} from "../types/matchResult.types";

interface UseMatchResultOptions {
    eventType?: string;
    currentUserId?: string;
    isEventManager?: boolean;
    validationContextKey?: string;
    canCheckValidationEligibility?: boolean;
}

function createEmptySet(setNumber: number): CreateMatchSetPayload {
    return {
        setNumber,
        teamAScore: 0,
        teamBScore: 0,
    };
}

function mapSetsForEditor(sets: MatchSet[]): CreateMatchSetPayload[] {
    if (sets.length === 0) {
        return [createEmptySet(1)];
    }

    return sets.map((set) => ({
        setNumber: set.setNumber,
        teamAScore: set.teamAScore,
        teamBScore: set.teamBScore,
    }));
}

function getErrorMessage(err: unknown, fallback: string) {
    if (err instanceof Error && err.message) {
        return err.message;
    }

    if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof err.message === "string"
    ) {
        return err.message;
    }

    return fallback;
}

export function useMatchResult(
    eventId?: string,
    options: UseMatchResultOptions = {}
) {
    const {
        eventType,
        currentUserId,
        isEventManager = false,
        validationContextKey,
        canCheckValidationEligibility = true,
    } = options;

    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [sets, setSets] = useState<CreateMatchSetPayload[]>([createEmptySet(1)]);
    const [loading, setLoading] = useState(eventType === "match");
    const [submitting, setSubmitting] = useState(false);
    const [validating, setValidating] = useState(false);
    const [canValidateResult, setCanValidateResult] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadMatchResult() {
            if (!eventId || eventType !== "match") {
                setMatchResult(null);
                setSets([createEmptySet(1)]);
                setCanValidateResult(false);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const result = await getMatchResultByEventId(eventId);
                setMatchResult(result);
                setSets(result ? mapSetsForEditor(result.sets) : [createEmptySet(1)]);

                if (currentUserId && result && canCheckValidationEligibility) {
                    const eligibility = await getResultValidationEligibility(
                        eventId,
                        currentUserId
                    );
                    setCanValidateResult(eligibility);
                } else {
                    setCanValidateResult(false);
            }
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not load match result"));
        } finally {
            setLoading(false);
        }
        }

        loadMatchResult();
    }, [eventId, eventType, currentUserId, validationContextKey, canCheckValidationEligibility]);

    function addSet() {
        setSets((currentSets) => [
            ...currentSets,
            createEmptySet(currentSets.length + 1),
        ]);
    }

    function removeSet(index: number) {
        setSets((currentSets) => {
            if (currentSets.length === 1) {
                return currentSets;
            }

            return currentSets
                .filter((_, setIndex) => setIndex !== index)
                .map((set, setIndex) => ({
                    ...set,
                    setNumber: setIndex + 1,
                }));
        });
    }

    function updateSet(
        index: number,
        field: keyof Omit<CreateMatchSetPayload, "setNumber">,
        value: number
    ) {
        setSets((currentSets) =>
            currentSets.map((set, setIndex) =>
                setIndex === index
                    ? {
                          ...set,
                          [field]: value,
                      }
                    : set
            )
        );
    }

    async function submitResult() {
        if (!eventId || !currentUserId || eventType !== "match") {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const result = matchResult
                ? await updateMatchResult(matchResult.id, sets)
                : await createMatchResult(eventId, currentUserId, sets);

            setMatchResult(result);
            setSets(mapSetsForEditor(result.sets));
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not save match result"));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleValidate() {
        if (!matchResult || !currentUserId) {
            return;
        }

        try {
            setValidating(true);
            setError("");

            const result = await acceptMatchResult(matchResult.id, currentUserId);
            setMatchResult(result);
            setCanValidateResult(false);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not validate match result"));
        } finally {
            setValidating(false);
        }
    }

    async function handleReject() {
        if (!matchResult || !currentUserId) {
            return;
        }

        try {
            setValidating(true);
            setError("");

            const result = await rejectMatchResult(matchResult.id, currentUserId);
            setMatchResult(result);
            setCanValidateResult(false);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Could not reject match result"));
        } finally {
            setValidating(false);
        }
    }

    const canManageResult =
        eventType === "match" &&
        isEventManager &&
        matchResult?.validationStatus !== "accepted";

    return {
        matchResult,
        sets,
        loading,
        submitting,
        validating,
        error,
        canManageResult,
        canValidateResult,
        addSet,
        removeSet,
        updateSet,
        submitResult,
        validateResult: handleValidate,
        rejectResult: handleReject,
    };
}
