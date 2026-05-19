import { afterEach, describe, expect, it, vi } from "vitest";
import {
    detectBrowserLanguage,
    getPreferredAppLanguage,
    normalizePreferredLanguage,
} from "../../i18n/detection";

describe("i18n detection", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        window.localStorage.clear();
    });

    it("normalizes catalan and spanish variants to spanish", () => {
        expect(normalizePreferredLanguage("ca")).toBe("es");
        expect(normalizePreferredLanguage("es-ES")).toBe("es");
    });

    it("detects spanish for Spain browser locales", () => {
        vi.stubGlobal("navigator", {
            languages: ["es-ES"],
            language: "es-ES",
        });

        expect(detectBrowserLanguage()).toBe("es");
    });

    it("prefers stored language over browser detection", () => {
        window.localStorage.setItem("beach-volley-app-language", "en");

        vi.stubGlobal("navigator", {
            languages: ["es-ES"],
            language: "es-ES",
        });

        expect(getPreferredAppLanguage()).toBe("en");
    });

    it("prefers profile language over stored language", () => {
        window.localStorage.setItem("beach-volley-app-language", "en");

        expect(getPreferredAppLanguage("es")).toBe("es");
    });
});
