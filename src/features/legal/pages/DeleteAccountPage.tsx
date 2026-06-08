import { CheckCircle2, KeyRound, ShieldAlert, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { LegalPageLayout, LegalSection } from "../components/LegalPageLayout";
import { requestAccountDeletion } from "../services/accountDeletionRequest.service";

export function DeleteAccountPage() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const copy = isSpanish
    ? {
        title: "Eliminar tu cuenta de Sandset",
        description:
          "Solicita la eliminacion permanente de tu cuenta y los datos personales asociados.",
        directTitle: "Si todavia puedes acceder a tu cuenta",
        directBody:
          "La forma mas rapida y segura es iniciar sesion y eliminarla desde Ajustes. Tendras que confirmar la accion antes de que se procese.",
        directCta: isAuthenticated ? "Ir a Ajustes" : "Iniciar sesion para eliminarla",
        noAccessTitle: "Si no puedes acceder a tu cuenta",
        noAccessBody:
          "Envia una solicitud con el email asociado a Sandset. Revisaremos tu identidad antes de procesar la eliminacion.",
        email: "Email de la cuenta",
        details: "Informacion adicional (opcional)",
        detailsPlaceholder:
          "Por ejemplo, por que no puedes acceder o algun detalle que ayude a verificar la cuenta.",
        submit: "Solicitar eliminacion",
        sending: "Enviando solicitud...",
        successTitle: "Solicitud recibida",
        successBody:
          "La solicitud se ha registrado. Revisaremos la identidad y los datos asociados antes de completar la eliminacion.",
        error: "No se pudo enviar la solicitud. Intentalo de nuevo mas tarde.",
        processTitle: "Que ocurrira",
        processItems: [
          "Verificaremos que eres el propietario de la cuenta.",
          "Eliminaremos o anonimizaremos los datos asociados cuando corresponda.",
          "Podremos conservar informacion minima si existe una obligacion legal o de seguridad.",
        ],
        warning:
          "Eliminar una cuenta es permanente. Perderas tu perfil, amistades, inscripciones, historial y acceso a Sandset.",
      }
    : {
        title: "Delete your Sandset account",
        description:
          "Request permanent deletion of your account and its associated personal data.",
        directTitle: "If you can still access your account",
        directBody:
          "The fastest and safest option is to sign in and delete it from Settings. You will be asked to confirm before it is processed.",
        directCta: isAuthenticated ? "Open Settings" : "Sign in to delete it",
        noAccessTitle: "If you cannot access your account",
        noAccessBody:
          "Submit a request using the email associated with Sandset. We will verify your identity before processing deletion.",
        email: "Account email",
        details: "Additional information (optional)",
        detailsPlaceholder:
          "For example, why you cannot sign in or any detail that can help verify the account.",
        submit: "Request deletion",
        sending: "Sending request...",
        successTitle: "Request received",
        successBody:
          "Your request has been registered. We will verify your identity and associated data before completing deletion.",
        error: "The request could not be sent. Please try again later.",
        processTitle: "What happens next",
        processItems: [
          "We will verify that you own the account.",
          "Associated data will be deleted or anonymized where applicable.",
          "Minimum information may be retained where legally or security-related required.",
        ],
        warning:
          "Account deletion is permanent. You will lose your profile, friendships, registrations, history and access to Sandset.",
      };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      await requestAccountDeletion({
        email,
        details,
        language: isSpanish ? "es" : "en",
      });
      setSubmitted(true);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LegalPageLayout
      title={copy.title}
      description={copy.description}
      canonicalPath="/delete-account"
    >
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0" size={20} />
          <p className="font-semibold">{copy.warning}</p>
        </div>
      </div>

      <LegalSection title={copy.directTitle}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-blue-100 p-3 text-blue-700">
              <KeyRound size={20} />
            </span>
            <div>
              <p>{copy.directBody}</p>
              <Link
                to={isAuthenticated ? "/settings" : "/login?redirect=%2Fsettings"}
                className="mt-4 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                {copy.directCta}
              </Link>
            </div>
          </div>
        </div>
      </LegalSection>

      <LegalSection title={copy.noAccessTitle}>
        <p>{copy.noAccessBody}</p>
        {submitted ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0" size={21} />
              <div>
                <p className="font-black">{copy.successTitle}</p>
                <p className="mt-1">{copy.successBody}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <label className="block">
              <span className="text-sm font-bold text-slate-800">{copy.email}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-800">{copy.details}</span>
              <textarea
                rows={4}
                maxLength={1000}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder={copy.detailsPlaceholder}
                className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 size={17} />
              {loading ? copy.sending : copy.submit}
            </button>
          </form>
        )}
      </LegalSection>

      <LegalSection title={copy.processTitle}>
        <ul className="list-disc space-y-2 pl-5">
          {copy.processItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
