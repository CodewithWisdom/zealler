"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function CreateAccount() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!company.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
      });

      console.log("Account created:", userCredential.user.uid);

      // Temporary success state.
      // We will connect this to company/workspace creation next.
      window.location.href = "/get-started";
    } catch (error: unknown) {
      console.error(error);

      if (
        error &&
        typeof error === "object" &&
        "code" in error
      ) {
        const firebaseError = error as { code: string };

        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError(
              "An account already exists with this email address."
            );
            break;

          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/weak-password":
            setError("Your password is too weak.");
            break;

          case "auth/network-request-failed":
            setError(
              "Network error. Please check your internet connection."
            );
            break;

          default:
            setError("Unable to create your account. Please try again.");
        }
      } else {
        setError("Unable to create your account. Please try again.");
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
                Create your account
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                Welcome to Zealler
              </h1>

              <p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">
                Create your account to start building your organization on
                Zealler.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateAccount} className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              {/* Work Email */}
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

              {/* Company Name */}
              <div>
                <label
                  htmlFor="company"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Company Name
                </label>

                <input
                  id="company"
                  name="company"
                  type="text"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Enter your company name"
                  autoComplete="organization"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              {/* Create Account */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "#0b7a75" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
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

            {/* Login */}
            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold"
                style={{ color: "#0b7a75" }}
              >
                Login
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