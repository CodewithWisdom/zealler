"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  FileText,
  Filter,
  FolderOpen,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Users,
  X,
  AlertTriangle,
  BarChart3,
  ArrowRight,
  Clock3,
} from "lucide-react";

const forms = [
  {
    id: "daily-safety-inspection",
    name: "Daily Safety Inspection",
    category: "Inspections",
    submissions: 24,
    status: "Active",
    updated: "Today",
    description:
      "Routine workplace safety inspection used to identify hazards and unsafe conditions.",
  },
  {
    id: "incident-report",
    name: "Incident Report",
    category: "Incident Management",
    submissions: 8,
    status: "Active",
    updated: "Yesterday",
    description:
      "Record workplace incidents, injuries, property damage, and related details.",
  },
  {
    id: "safety-observation",
    name: "Safety Observation",
    category: "Safety",
    submissions: 31,
    status: "Active",
    updated: "2 days ago",
    description:
      "Capture positive and negative safety observations from the workplace.",
  },
  {
    id: "permit-to-work",
    name: "Permit to Work",
    category: "Operations",
    submissions: 12,
    status: "Draft",
    updated: "5 days ago",
    description:
      "Control and document high-risk work activities before work begins.",
  },
];

const categories = [
  "All Categories",
  "Inspections",
  "Incident Management",
  "Safety",
  "Operations",
];

const statuses = ["All Statuses", "Active", "Draft"];

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredForms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return forms.filter((form) => {
      const matchesSearch =
        !query ||
        form.name.toLowerCase().includes(query) ||
        form.category.toLowerCase().includes(query) ||
        form.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" || form.category === category;

      const matchesStatus =
        status === "All Statuses" || form.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  const activeForms = forms.filter((form) => form.status === "Active").length;
  const draftForms = forms.filter((form) => form.status === "Draft").length;

  function clearFilters() {
    setSearch("");
    setCategory("All Categories");
    setStatus("All Statuses");
  }

  const hasFilters =
    search.trim() !== "" ||
    category !== "All Categories" ||
    status !== "All Statuses";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-[-0.04em]"
              style={{ color: "#0b7a75" }}
            >
              ZEALLER
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-6">
            <SidebarItem
              href="/dashboard"
              icon={<LayoutDashboard size={18} />}
              label="Dashboard"
            />

            <SidebarItem
              href="#"
              icon={<ClipboardList size={18} />}
              label="Submissions"
            />

            <SidebarItem
              href="/forms"
              icon={<FileText size={18} />}
              label="Forms"
              active
            />

            <SidebarItem
              href="#"
              icon={<Users size={18} />}
              label="Employees"
            />

            <SidebarItem
              href="#"
              icon={<FolderOpen size={18} />}
              label="Documents"
            />

            <SidebarItem
              href="#"
              icon={<AlertTriangle size={18} />}
              label="Corrective Actions"
            />

            <SidebarItem
              href="#"
              icon={<BarChart3 size={18} />}
              label="Reports"
            />
          </nav>

          <div className="border-t border-slate-200 p-3">
            <SidebarItem
              href="#"
              icon={<Settings size={18} />}
              label="Settings"
            />
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div>
              <p className="text-sm text-slate-500">Workspace</p>
              <h1 className="text-xl font-semibold">Forms</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 sm:flex"
                aria-label="Notifications"
              >
                <Bell size={18} />
              </button>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "#0b7a75" }}
              >
                U
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-7xl">
              {/* Page Heading */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p
                    className="text-sm font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "#0b7a75" }}
                  >
                    Form Management
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    Forms
                  </h2>

                  <p className="mt-2 max-w-2xl text-slate-600">
                    Create, manage, and organize the digital forms used across
                    your organization.
                  </p>
                </div>

                <Link
                  href="/forms/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: "#0b7a75" }}
                >
                  <Plus size={18} />
                  Create Form
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <SmallStat
                  label="Total Forms"
                  value={String(forms.length)}
                  icon={<FileText size={18} />}
                />

                <SmallStat
                  label="Active Forms"
                  value={String(activeForms)}
                  icon={<ClipboardList size={18} />}
                />

                <SmallStat
                  label="Draft Forms"
                  value={String(draftForms)}
                  icon={<Clock3 size={18} />}
                />
              </div>

              {/* Filters */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Search forms..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Desktop Filters */}
                  <div className="hidden gap-3 lg:flex">
                    <FilterSelect
                      value={category}
                      onChange={setCategory}
                      options={categories}
                    />

                    <FilterSelect
                      value={status}
                      onChange={setStatus}
                      options={statuses}
                    />
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen((value) => !value)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 lg:hidden"
                  >
                    <Filter size={17} />
                    Filters
                    {(category !== "All Categories" ||
                      status !== "All Statuses") && (
                      <span
                        className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: "#0b7a75" }}
                      >
                        1
                      </span>
                    )}
                  </button>
                </div>

                {/* Mobile Filters */}
                {mobileFiltersOpen && (
                  <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 lg:hidden">
                    <FilterSelect
                      value={category}
                      onChange={setCategory}
                      options={categories}
                    />

                    <FilterSelect
                      value={status}
                      onChange={setStatus}
                      options={statuses}
                    />
                  </div>
                )}

                {hasFilters && (
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                      Showing {filteredForms.length} of {forms.length} forms
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-semibold text-[#0b7a75] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Forms */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Form
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Category
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Submissions
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Updated
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredForms.map((form) => (
                        <tr
                          key={form.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{
                                  backgroundColor: "#0b7a7515",
                                  color: "#0b7a75",
                                }}
                              >
                                <FileText size={18} />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold">{form.name}</p>

                                <p className="mt-1 max-w-sm truncate text-xs text-slate-400">
                                  {form.description}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {form.category}
                          </td>

                          <td className="px-6 py-5 text-sm font-medium">
                            {form.submissions}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge status={form.status} />
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {form.updated}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/forms/${form.id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              Open
                              <ArrowRight size={15} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="divide-y divide-slate-100 md:hidden">
                  {filteredForms.map((form) => (
                    <div key={form.id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: "#0b7a7515",
                              color: "#0b7a75",
                            }}
                          >
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold">{form.name}</p>

                            <p className="mt-1 text-xs text-slate-400">
                              {form.category}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={form.status} />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-500">
                        {form.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {form.submissions} submissions
                        </span>

                        <span className="text-slate-400">
                          {form.updated}
                        </span>
                      </div>

                      <Link
                        href={`/forms/${form.id}`}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Open Form
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredForms.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <FileText size={24} />
                    </div>

                    <h3 className="mt-4 font-semibold">No forms found</h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                      No forms match your current search or filters. Try
                      changing your search criteria.
                    </p>

                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                        style={{ backgroundColor: "#0b7a75" }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom helper */}
              <div className="mt-6 rounded-2xl border border-[#0b7a75]/10 bg-[#0b7a75]/5 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Need a new digital form?
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Build a custom form for inspections, incidents,
                      observations, permits, and more.
                    </p>
                  </div>

                  <Link
                    href="/forms/create"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b7a75] shadow-sm ring-1 ring-[#0b7a75]/10 transition hover:bg-slate-50"
                  >
                    <Plus size={16} />
                    Create Form
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* Sidebar */

function SidebarItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
        active
          ? "text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
      style={active ? { backgroundColor: "#0b7a75" } : undefined}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg">
        {icon}
      </span>

      {label}
    </Link>
  );
}

/* Filter */

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-[#0b7a75] lg:min-w-[180px]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* Small Stat */

function SmallStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "#0b7a7515",
            color: "#0b7a75",
          }}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

/* Status */

function StatusBadge({ status }: { status: string }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      {status}
    </span>
  );
}