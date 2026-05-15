import { describe, expect, it } from "vitest";
import { resolveMatchResultLifecycleStatus } from "../../features/match-results/utils/matchResultMaintenance.utils";

describe("matchResultMaintenance.utils", () => {
    const now = new Date("2026-05-15T18:00:00.000Z");

    it("returns scheduled before the six-hour reminder window", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "active",
                startDate: "2026-05-15T14:00:00.000Z",
                hasResult: false,
                now,
            })
        ).toBe("scheduled");
    });

    it("returns pending_result after six hours without a submitted result", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "active",
                startDate: "2026-05-15T11:00:00.000Z",
                hasResult: false,
                now,
            })
        ).toBe("pending_result");
    });

    it("returns pending_validation when a result exists but is not accepted", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "active",
                startDate: "2026-05-15T11:00:00.000Z",
                hasResult: true,
                resultValidationStatus: "pending",
                now,
            })
        ).toBe("pending_validation");
    });

    it("returns validated when the result has been accepted", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "active",
                startDate: "2026-05-15T11:00:00.000Z",
                hasResult: true,
                resultValidationStatus: "accepted",
                now,
            })
        ).toBe("validated");
    });

    it("returns expired once twenty-four hours pass without a valid result", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "active",
                startDate: "2026-05-14T17:00:00.000Z",
                hasResult: false,
                now,
            })
        ).toBe("expired");
    });

    it("keeps cancelled events cancelled", () => {
        expect(
            resolveMatchResultLifecycleStatus({
                eventStatus: "cancelled",
                startDate: "2026-05-14T17:00:00.000Z",
                hasResult: true,
                resultValidationStatus: "accepted",
                now,
            })
        ).toBe("cancelled");
    });
});
