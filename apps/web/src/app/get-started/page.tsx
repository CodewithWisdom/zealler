import Link from "next/link";

export default function GetStarted() {
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

        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-10 text-center">
              <p
                className="text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "#0b7a75" }}
              >
                Welcome to Zealler
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
                Get Started
              </h1>

              <p className="mx-auto mt-4 max-w-sm leading-7 text-slate-600">
                Choose how you want to continue with Zealler.
              </p>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold transition hover:border-slate-950 hover:bg-slate-50"
            >
              <span className="text-lg font-bold">G</span>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase tracking-wider text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Login */}
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#0b7a75" }}
            >
              Login
            </Link>

            {/* Create Account */}
            <Link
              href="/create-account"
              className="mt-3 flex w-full items-center justify-center rounded-xl border-2 px-6 py-4 text-sm font-semibold transition hover:bg-teal-50"
              style={{
                borderColor: "#0b7a75",
                color: "#0b7a75",
              }}
            >
              Create Account
            </Link>

            {/* Back */}
            <Link
              href="/"
              className="mt-8 flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
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