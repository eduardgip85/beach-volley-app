import { Globe2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { updateProfileLocation } from "../services/profile.service";

export function ProfileLocationCard() {
    const { profile, refreshProfile } = useAuth();
    const [country, setCountry] = useState(profile?.country ?? "");
    const [city, setCity] = useState(profile?.city ?? "");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setCountry(profile?.country ?? "");
        setCity(profile?.city ?? "");
    }, [profile?.country, profile?.city]);

    if (!profile) {
        return null;
    }

    const profileId = profile.id;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setMessage("");

            await updateProfileLocation({
                userId: profileId,
                country,
                city,
            });
            await refreshProfile();

            setMessage("Location updated");
        } catch (submitError) {
            console.error(submitError);
            setError("Could not update location");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                    <Globe2 />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Ranking location
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Add your country and city so local competitive ranking can
                        place you in the right leaderboard.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">
                        Country
                    </span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <Globe2 size={18} className="text-slate-400" />
                        <input
                            value={country}
                            onChange={(event) => setCountry(event.target.value)}
                            placeholder="Spain"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">City</span>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <MapPin size={18} className="text-slate-400" />
                        <input
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                            placeholder="Barcelona"
                            className="w-full bg-transparent text-sm text-slate-900 outline-none"
                        />
                    </div>
                </label>

                <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-6">
                        {message ? (
                            <p className="text-sm font-semibold text-emerald-600">
                                {message}
                            </p>
                        ) : null}
                        {error ? (
                            <p className="text-sm font-semibold text-red-600">{error}</p>
                        ) : null}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {loading ? "Saving..." : "Save location"}
                    </button>
                </div>
            </form>
        </section>
    );
}
