import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Create account</h1>

      <p className="mt-2 text-sm text-slate-500">
        Register to create events and join tournaments.
      </p>

      <form className="mt-6 space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border px-4 py-3"
        />

        <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blue-600">
          Login
        </Link>
      </p>
    </section>
  );
}