import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface CountrySetupNoticeProps {
  visible: boolean;
}

export function CountrySetupNotice({ visible }: CountrySetupNoticeProps) {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Globe size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">
            {t("common.countryRequiredTitle")}
          </p>
          <p className="mt-1 text-sm text-amber-800/90">
            {t("common.countryRequiredBody")}
          </p>

          <Link
            to="/settings"
            className="mt-3 inline-flex rounded-xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            {t("common.countryRequiredCta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
