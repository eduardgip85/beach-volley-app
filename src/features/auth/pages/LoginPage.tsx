import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>

      <p className="mt-2 text-sm text-slate-500">
        Login to create events or join beach volleyball matches.
      </p>

      <form className="mt-6 space-y-4">
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
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-blue-600">
          Register
        </Link>
      </p>
    </section>
  );
}