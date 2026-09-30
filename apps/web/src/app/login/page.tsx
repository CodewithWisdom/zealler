"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("Logged in:", userCredential.user.uid);

      // Temporary redirect.
      // We will replace this with the real dashboard next.
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      console.error(error);

      if (error && typeof error === "object" && "code" in error) {
        const firebaseError = error as { code: string };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
            setError("Incorrect email or password.");
            break;

          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/too-many-requests":
            setError(
              "Too many failed login attempts. Please try again later."
            );
            break;

          case "auth/network-request-failed":
            setError(
              "Network error. Please check your internet connection."
            );
            break;

          case "auth/user-disabled":
            setError(
              "This account has been disabled. Please contact support."
            );
            break;

          default:
            setError("Unable to log in. Please try again.");
        }
      } else {
        setError("Unable to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 lg:px-10">

        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[-0.04em]"
            style={{ color: "#0b7a75" }}
          >
            ZEALLER
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            Home
          </Link>
        </header>

        {/* Main */}
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-lg">

            {/* Heading */}
            <div className="mb-8 text-center">
              <p
                className="text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#0b7a75" }}
              >
                Welcome back
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                Login to Zealler
              </h1>

              <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
                Sign in to access your Zealler workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Work Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium transition hover:opacity-70"
                    style={{ color: "#0b7a75" }}
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      /* Eye Off */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.6 10.6a2 2 0 102.8 2.8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 4.3A10.8 10.8 0 0112 4c5.2 0 8.7 4.8 9.8 7.2a1.7 1.7 0 010 1.6 15.4 15.4 0 01-3.1 4"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.6 6.6a15.3 15.3 0 00-4.4 5.6 1.7 1.7 0 000 1.6C3.3 16.2 6.8 20 12 20c1.4 0 2.7-.3 3.8-.8"
                        />
                      </svg>
                    ) : (
                      /* Eye */
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                        />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#0b7a75" }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase tracking-wider text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold transition hover:border-slate-950 hover:bg-slate-50"
            >
              <span className="text-lg font-bold">G</span>
              Continue with Google
            </button>

            {/* Create Account */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/create-account"
                className="font-semibold"
                style={{ color: "#0b7a75" }}
              >
                Create Account
              </Link>
            </p>

            {/* Back */}
            <Link
              href="/get-started"
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              <span aria-hidden="true">←</span>
              Back
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-8 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Zealler
          </p>
        </footer>
      </div>
    </main>
  );
}