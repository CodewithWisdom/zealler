import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-[-0.04em]"
          style={{ color: "#0b7a75" }}
        >
          ZEALLER
        </Link>

        {/* Top CTA */}
        <Link
          href="/get-started"
          className="rounded-full px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          style={{ backgroundColor: "#0b7a75" }}
        >
          Get Started
        </Link>
      </header>

      {/* Full Width Hero */}
      <section
        className="w-full"
        style={{ backgroundColor: "#444444" }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-7xl flex-col items-center justify-center px-6 py-28 text-center lg:px-10 lg:py-36">
          
          <div className="max-w-4xl">
            {/* Hero Label */}
            <p className="mb-10 text-sm font-semibold uppercase tracking-[0.25em] text-white">
              HSE & Operations Platform
            </p>

            {/* Main Heading */}
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-6xl lg:text-8xl">
              Smarter HSE.
              <br />
              Better operations.
            </h1>

            {/* Description */}
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              Zealler helps organizations digitize safety processes, manage
              operational documentation, track compliance, and keep their teams
              connected from one platform.
            </p>

            {/* How It Works */}
            <div className="mt-10">
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/40 underline-offset-8 transition hover:decoration-white"
              >
                How It Works
                <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>

          {/* Large CTA */}
          <div className="mt-20 w-full max-w-2xl">
            <Link
              href="/get-started"
              className="group flex w-full items-center justify-between rounded-2xl px-7 py-6 text-left text-white transition hover:-translate-y-1 hover:opacity-90"
              style={{ backgroundColor: "#0b7a75" }}
            >
              <div>
                <span className="block text-2xl font-semibold">
                  Get Started
                </span>

                <span className="mt-1 block text-sm text-teal-100">
                  Start building your organization on Zealler
                </span>
              </div>

              <span
                aria-hidden="true"
                className="text-3xl transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-t border-slate-200 bg-slate-50"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-2xl">
            <p
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#0b7a75" }}
            >
              How It Works
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              One platform for your safety and operations.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8">
              <span
                className="text-sm font-semibold"
                style={{ color: "#0b7a75" }}
              >
                01
              </span>

              <h3 className="mt-8 text-xl font-semibold">
                Digitize your processes
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Replace paper-based safety and operational processes with
                structured digital workflows.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8">
              <span
                className="text-sm font-semibold"
                style={{ color: "#0b7a75" }}
              >
                02
              </span>

              <h3 className="mt-8 text-xl font-semibold">
                Manage your records
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Keep forms, submissions, documents, employees, and compliance
                records organized in one workspace.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8">
              <span
                className="text-sm font-semibold"
                style={{ color: "#0b7a75" }}
              >
                03
              </span>

              <h3 className="mt-8 text-xl font-semibold">
                Track and improve
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Review activities, identify corrective actions, and turn your
                operational data into useful insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <Link
            href="/"
            className="text-lg font-bold tracking-[-0.04em]"
            style={{ color: "#0b7a75" }}
          >
            ZEALLER
          </Link>

          <p className="text-sm text-slate-500">
            HSE & Operations Management Platform
          </p>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Zealler
          </p>
        </div>
      </footer>
    </main>
  );
}