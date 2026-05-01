import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../services/auth.service";

export function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirectTo = searchParams.get("redirect") || "/events";

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await registerUser({
                fullName,
                email,
                password,
            });

            navigate(redirectTo);
        } catch {
            setError("Could not create account");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>

        <p className="mt-2 text-sm text-slate-500">
            Register to create events and join tournaments.
        </p>

        {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
            </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
            />

            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border px-4 py-3"
            required
            minLength={6}
            />

            <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-60"
            >
            {loading ? "Creating account..." : "Register"}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
            to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-blue-600"
            >
                Login
            </Link>
        </p>
        </section>
    );
}