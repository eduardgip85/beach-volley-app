import {
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  ShieldCheck,
  Volleyball,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import {
  verifyEquipmentImage,
  type EquipmentTarget,
  type EquipmentVerificationResult,
} from "../services/equipment.service";

interface EquipmentVerificationCardProps {
  embedded?: boolean;
  collapsible?: boolean;
}

export function EquipmentVerificationCard({
  embedded = false,
  collapsible = true,
}: EquipmentVerificationCardProps = {}) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(!collapsible);

  if (!profile) return null;

  return (
    <section
      className={
        embedded
          ? "rounded-[1.75rem] bg-slate-50 p-5 md:p-6"
          : "rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
      }
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-start justify-between gap-4 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <ShieldCheck />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t("equipmentVerification.title")}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {t("equipmentVerification.body")}
              </p>
            </div>
          </div>

          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <ChevronDown
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div className={`${collapsible ? "mt-6" : ""} grid gap-5 md:grid-cols-2`}>
          <EquipmentVerifyItem
            target="ball"
            title={t("equipmentVerification.ballTitle")}
            description={t("equipmentVerification.ballDescription")}
            alreadyVerified={profile.hasBall}
          />

          <EquipmentVerifyItem
            target="net"
            title={t("equipmentVerification.netTitle")}
            description={t("equipmentVerification.netDescription")}
            alreadyVerified={profile.hasNet}
          />
        </div>
      ) : null}
    </section>
  );
}

function EquipmentVerifyItem({
  target,
  title,
  description,
  alreadyVerified,
}: {
  target: EquipmentTarget;
  title: string;
  description: string;
  alreadyVerified: boolean;
}) {
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<EquipmentVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(file?: File) {
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  async function handleVerify() {
    if (alreadyVerified) {
      setError(t("equipmentVerification.alreadyVerifiedError"));
      return;
    }

    if (!imageFile) {
      setError(t("equipmentVerification.uploadFirst"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const verificationResult = await verifyEquipmentImage(imageFile, target);

      await refreshProfile();

      setResult(verificationResult);
    } catch (err: any) {
      console.error("Verify equipment error:", err);

      const status = err?.context?.status;

      if (status === 429) {
        setError(t("equipmentVerification.tooManyAttempts"));
        return;
      }

      if (status === 409) {
        setError(t("equipmentVerification.alreadyVerifiedError"));
        return;
      }

      setError(t("equipmentVerification.verifyError"));
    } finally {
      setLoading(false);
    }
  }

  const icon =
    target === "ball" ? (
      <Volleyball size={22} />
    ) : (
      <span className="text-xl">🥅</span>
    );

  return (
    <article className="rounded-3xl bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-2xl p-3 ${
              alreadyVerified
                ? "bg-emerald-100 text-emerald-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {alreadyVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={14} />
            {t("equipmentVerification.verified")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-500">
            <XCircle size={14} />
            {t("equipmentVerification.pending")}
          </span>
        )}
      </div>

      {!alreadyVerified && (
        <>
          <label className="mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-4 text-center hover:bg-slate-50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`${target} preview`}
                className="h-52 w-full rounded-2xl object-cover"
              />
            ) : (
              <>
                <ImagePlus className="text-blue-600" size={32} />
                <p className="mt-3 font-bold text-slate-900">
                  {t("equipmentVerification.uploadPhoto")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("equipmentVerification.selectClearImage")}
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
            />
          </label>

          {result && (
            <div
              className={`mt-4 rounded-2xl p-4 ${
                result.detected
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <p className="font-bold">
                {result.detected
                  ? t("equipmentVerification.detected")
                  : t("equipmentVerification.notDetected")}
              </p>
              <p className="mt-1 text-sm">{result.reason}</p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white disabled:opacity-60"
          >
            {loading ? t("equipmentVerification.verifying") : title}
          </button>
        </>
      )}

      {alreadyVerified && (
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="font-bold text-emerald-700">
            {t("equipmentVerification.alreadyVerified")}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {t("equipmentVerification.alreadyVerifiedBody")}
          </p>
        </div>
      )}
    </article>
  );
}
