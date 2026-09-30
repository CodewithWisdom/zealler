"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Users,
  Folder,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Plus,
  Upload,
  Clock,
  Bell,
  LucideIcon,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Submission statistics
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  /*
   * Listen for the currently logged-in user and then
   * listen for submissions belonging to their company.
   */
  useEffect(() => {
    let unsubscribeSubmissions: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // User is not logged in
      if (!user) {
        setTotalSubmissions(0);
        setPendingReviews(0);
        setLoadingSubmissions(false);
        return;
      }

      /*
       * TEMPORARY COMPANY ID
       *
       * For now we use the user's UID as the company ID.
       *
       * Once company/workspace creation is connected,
       * this will be replaced with the actual companyId
       * stored for the user.
       */
      const companyId = user.uid;

      const submissionsRef = collection(
        db,
        "companies",
        companyId,
        "submissions"
      );

      const submissionsQuery = query(submissionsRef);

      unsubscribeSubmissions = onSnapshot(
        submissionsQuery,
        (snapshot) => {
          // Total number of submissions
          setTotalSubmissions(snapshot.size);

          // Count submissions waiting for review
          const pending = snapshot.docs.filter((submission) => {
            const data = submission.data();

            return (
              data.status === "pending_review" ||
              data.status === "under_review"
            );
          }).length;

          setPendingReviews(pending);
          setLoadingSubmissions(false);
        },
        (error) => {
          console.error("Error loading submissions:", error);
          setLoadingSubmissions(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeSubmissions) {
        unsubscribeSubmissions();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-[-0.04em] text-[#0b7a75]"
            >
              ZEALLER
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-6">
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />

            <NavItem
              href="/submissions"
              icon={CheckSquare}
              label="Submissions"
            />

            <NavItem
              href="/forms"
              icon={FileText}
              label="Forms"
            />

            <NavItem
              href="/employees"
              icon={Users}
              label="Employees"
            />

            <NavItem
              href="/documents"
              icon={Folder}
              label="Documents"
            />

            <NavItem
              href="/corrective-actions"
              icon={AlertTriangle}
              label="Corrective Actions"
            />

            <NavItem
              href="/reports"
              icon={BarChart3}
              label="Reports"
            />
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-slate-200 p-3">
            <NavItem
              href="/settings"
              icon={Settings}
              label="Settings"
            />

            <button
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm">
                <LogOut className="h-5 w-5" />
              </span>

              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Bar */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Open menu"
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-sm text-slate-500">Overview</p>

                <h1 className="text-xl font-semibold tracking-[-0.02em]">
                  Dashboard
                </h1>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <button
                className="hidden flex-row items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:flex"
                type="button"
              >
                <Bell className="h-4 w-4" />

                <span>Notifications</span>
              </button>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b7a75] text-sm font-semibold text-white">
                U
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              {/* Welcome */}
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0b7a75]">
                  Your workspace
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                  Welcome to Zealler
                </h2>

                <p className="mt-2 max-w-2xl text-slate-600">
                  Manage your HSE activities, documentation, submissions,
                  employees, and corrective actions from one place.
                </p>
              </div>

              {/* Stats */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {/* Total Submissions */}
                <StatCard
                  description={
                    loadingSubmissions
                      ? "Loading submissions..."
                      : totalSubmissions === 0
                        ? "No submissions yet"
                        : `${totalSubmissions} submission${
                            totalSubmissions === 1 ? "" : "s"
                          } received`
                  }
                  icon={CheckSquare}
                  label="Total Submissions"
                  value={
                    loadingSubmissions
                      ? "..."
                      : String(totalSubmissions)
                  }
                />

                {/* Pending Reviews */}
                <StatCard
                  description={
                    loadingSubmissions
                      ? "Loading reviews..."
                      : pendingReviews === 0
                        ? "Nothing awaiting review"
                        : `${pendingReviews} submission${
                            pendingReviews === 1 ? "" : "s"
                          } awaiting review`
                  }
                  icon={Clock}
                  label="Pending Reviews"
                  value={
                    loadingSubmissions
                      ? "..."
                      : String(pendingReviews)
                  }
                />

                {/* Employees */}
                <StatCard
                  description="Add your first employee"
                  icon={Users}
                  label="Employees"
                  value="0"
                />

                {/* Corrective Actions */}
                <StatCard
                  description="No corrective actions"
                  icon={AlertTriangle}
                  label="Open Actions"
                  value="0"
                />
              </div>

              {/* Main Grid */}
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Quick Actions
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Start managing your organization.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <QuickAction
                      href="/forms/new"
                      description="Build a digital HSE or operational form."
                      icon={Plus}
                      title="Create a Form"
                    />

                    <QuickAction
                      href="/employees/new"
                      description="Register an employee in your workspace."
                      icon={Users}
                      title="Add Employee"
                    />

                    <QuickAction
                      href="/documents/upload"
                      description="Add controlled documents and records."
                      icon={Upload}
                      title="Upload Document"
                    />

                    <QuickAction
                      href="/corrective-actions/new"
                      description="Track an issue through to closure."
                      icon={AlertTriangle}
                      title="Create Corrective Action"
                    />
                  </div>
                </section>

                {/* Workspace */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold">
                    Workspace
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Your organization
                  </p>

                  <div className="mt-6 rounded-xl bg-slate-50 p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b7a75] text-lg font-bold text-white">
                      Z
                    </div>

                    <h4 className="mt-4 font-semibold">
                      Your Company
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Owner
                    </p>
                  </div>

                  <button
                    className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    type="button"
                  >
                    Manage Workspace
                  </button>
                </section>
              </div>

              {/* Recent Activity */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div>
                  <h3 className="text-lg font-semibold">
                    Recent Activity
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Activity from your workspace will appear here.
                  </p>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Clock className="h-6 w-6" />
                  </div>

                  <h4 className="mt-4 font-medium text-slate-700">
                    No activity yet
                  </h4>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Once you start creating forms, adding employees,
                    and submitting records, your activity will appear
                    here.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- */
/* Navigation Item               */
/* ----------------------------- */

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#0b7a75] text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm">
        <Icon className="h-5 w-5" />
      </span>

      {label}
    </Link>
  );
}

/* ----------------------------- */
/* Stat Card                     */
/* ----------------------------- */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b7a75]/10 text-[#0b7a75]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ----------------------------- */
/* Quick Action                  */
/* ----------------------------- */

function QuickAction({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#0b7a75]/40 hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b7a75]/10 text-[#0b7a75]">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h4 className="font-semibold group-hover:text-[#0b7a75]">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </Link>
  );
}