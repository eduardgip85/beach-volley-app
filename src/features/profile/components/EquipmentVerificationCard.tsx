import { CheckCircle2, ImagePlus, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  verifyEquipmentImage,
  type EquipmentVerificationResult,
} from "../services/equipment.service";

export function EquipmentVerificationCard() {
    const { profile, refreshProfile } = useAuth();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [result, setResult] = useState<EquipmentVerificationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!profile) return null;

    function handleImageChange(file?: File) {
        if (!file) return;

        setImageFile(file);
        setResult(null);
        setError("");
        setPreviewUrl(URL.createObjectURL(file));
    }

    async function handleVerify() {

        if (!profile) return;

        if (!imageFile) {
        setError("Please upload an image first");
        return;
        }

        try {
        setLoading(true);
        setError("");

        const verificationResult = await verifyEquipmentImage(imageFile);

        await refreshProfile();

        setResult(verificationResult);
        } catch (err: any) {
            console.log("verify equipment error", err)
            if(err?.context){
                const body = await err.context.json();
                console.log("function error body", body);
            }
        setError("Could not verify equipment");
        } finally {
        setLoading(false);
        }
    }

    return (
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <ShieldCheck />
            </div>

            <div>
            <h2 className="text-2xl font-bold text-slate-900">
                Equipment verification
            </h2>
            <p className="mt-2 text-sm text-slate-500">
                Upload a photo showing your volleyball ball and net. AI will check
                if the equipment is valid.
            </p>
            </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.2fr]">
            <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:bg-slate-100">
            {previewUrl ? (
                <img
                src={previewUrl}
                alt="Equipment preview"
                className="h-64 w-full rounded-2xl object-cover"
                />
            ) : (
                <>
                <ImagePlus className="text-blue-600" size={36} />
                <p className="mt-4 font-bold text-slate-900">Upload photo</p>
                <p className="mt-2 text-sm text-slate-500">
                    Ball and net should be clearly visible.
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

            <div className="rounded-3xl bg-slate-50 p-6">
            <h3 className="font-bold text-slate-900">Current status</h3>

            <div className="mt-4 space-y-3">
                <StatusRow label="Ball" active={profile.hasBall} />
                <StatusRow label="Net" active={profile.hasNet} />
                <StatusRow label="Verified" active={profile.equipmentVerified} />
            </div>

            {result && (
                <div className="mt-5 rounded-2xl bg-white p-4">
                <p className="font-bold text-slate-900">AI result</p>
                <p className="mt-2 text-sm text-slate-500">{result.reason}</p>
                </div>
            )}

            {error && (
                <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
                {error}
                </p>
            )}

            <button
                onClick={handleVerify}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white disabled:opacity-60"
            >
                {loading ? "Verifying..." : "Verify equipment"}
            </button>
            </div>
        </div>
        </section>
    );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
        <span className="font-semibold text-slate-700">{label}</span>

        {active ? (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600">
            <CheckCircle2 size={17} />
            Yes
            </span>
        ) : (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-400">
            <XCircle size={17} />
            No
            </span>
        )}
        </div>
    );
}