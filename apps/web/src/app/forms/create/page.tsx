"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Save,
  Settings2,
  Signature,
  Trash2,
  Type,
  Upload,
  X,
  Download,
} from "lucide-react";
import {
  ChangeEvent,
  PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path if your firebase file is elsewhere

type FieldType =
  | "short-text"
  | "long-text"
  | "number"
  | "date"
  | "dropdown"
  | "checkbox"
  | "yes-no"
  | "photo"
  | "signature";

type FormField = {
  id: string;
  type: FieldType;
  label: string;
  description: string;
  required: boolean;
  options?: string[];
};

type FileValue = { name: string; type: string; dataUrl: string };
type FieldValue = string | string[] | FileValue | null | undefined;

const OTHER_VALUE = "__other__";

const fieldTypes: {
  type: FieldType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { type: "short-text", label: "Short Text", description: "Single line response", icon: <Type size={18} /> },
  { type: "long-text", label: "Long Text", description: "Long written response", icon: <FileText size={18} /> },
  { type: "number", label: "Number", description: "Numeric response", icon: <span className="text-sm font-bold">123</span> },
  { type: "date", label: "Date", description: "Date selection", icon: <CalendarDays size={18} /> },
  { type: "dropdown", label: "Dropdown", description: "Select one option", icon: <ChevronDown size={18} /> },
  { type: "checkbox", label: "Checkbox", description: "Select multiple options", icon: <Check size={18} /> },
  { type: "yes-no", label: "Yes / No", description: "Simple yes or no", icon: <ClipboardCheck size={18} /> },
  { type: "photo", label: "Photo / File", description: "Upload evidence", icon: <ImageIcon size={18} /> },
  { type: "signature", label: "Signature", description: "Digital signature", icon: <Signature size={18} /> },
];

/* ---------- helpers ---------- */

function isFileValue(value: FieldValue): value is FileValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "dataUrl" in value
  );
}

function isEmptyValue(value: FieldValue, otherText?: string) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") {
    if (value === OTHER_VALUE) return !otherText?.trim();
    return value.trim() === "";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    if (value.includes(OTHER_VALUE) && !otherText?.trim() && value.length === 1) {
      return true;
    }
    return false;
  }
  return false;
}

function normalizeImage(
  src: string,
  format: "png" | "jpeg"
): Promise<{ data: string; w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 1;
      canvas.height = img.naturalHeight || 1;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      resolve({
        data: canvas.toDataURL(
          format === "jpeg" ? "image/jpeg" : "image/png",
          0.85
        ),
        w: canvas.width,
        h: canvas.height,
      });
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitSize(w: number, h: number, maxW: number, maxH: number) {
  const ratio = Math.min(maxW / w, maxH / h, 1);
  return { w: w * ratio, h: h * ratio };
}

async function saveFormToFirestore(
  formId: string | null,
  data: {
    name: string;
    description: string;
    category: string;
    companyLogo: string | null;
    fields: FormField[];
    status: "draft" | "published";
  }
) {
  const formsRef = collection(db, "forms");
  const id = formId || doc(formsRef).id;
  const ref = doc(db, "forms", id);

  // Strip undefined — Firestore rejects undefined field values
  const cleanFields = data.fields.map((field) => {
    const base: Record<string, unknown> = {
      id: field.id,
      type: field.type,
      label: field.label,
      description: field.description ?? "",
      required: field.required ?? false,
    };

    if (field.options && field.options.length > 0) {
      base.options = field.options;
    }

    return base;
  });

  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    description: data.description?.trim() ?? "",
    category: data.category,
    companyLogo: data.companyLogo ?? null,
    fields: cleanFields,
    status: data.status,
    updatedAt: serverTimestamp(),
  };

  if (!formId) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });
  return id;
}

/* ---------- page ---------- */

export default function CreateFormPage() {
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Inspections");

  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyLogoName, setCompanyLogoName] = useState("");

  const [fields, setFields] = useState<FormField[]>([
    {
      id: "field-1",
      type: "short-text",
      label: "Location / Area",
      description: "Enter the location being inspected.",
      required: true,
    },
  ]);

  const [selectedFieldId, setSelectedFieldId] = useState("field-1");
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [responses, setResponses] = useState<Record<string, FieldValue>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

  const [formId, setFormId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addField(type: FieldType) {
    const typeInfo = fieldTypes.find((item) => item.type === type);

    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      label: typeInfo?.label || "New Field",
      description: "",
      required: false,
      options:
        type === "dropdown" || type === "checkbox"
          ? ["Option 1", "Option 2"]
          : undefined,
    };

    setFields((current) => [...current, newField]);
    setSelectedFieldId(newField.id);
    setShowFieldMenu(false);
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  }

  function deleteField(id: string) {
    const remaining = fields.filter((field) => field.id !== id);

    setFields(remaining);

    if (selectedFieldId === id) {
      setSelectedFieldId(remaining[0]?.id || "");
    }

    setResponses((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    setOtherTexts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function updateResponse(id: string, value: FieldValue) {
    setResponses((current) => ({ ...current, [id]: value }));
  }

  function updateOtherText(id: string, value: string) {
    setOtherTexts((current) => ({ ...current, [id]: value }));
  }

  function addOption() {
    const field = fields.find((item) => item.id === selectedFieldId);
    if (!field) return;

    updateField(field.id, {
      options: [
        ...(field.options || []),
        `Option ${(field.options?.length || 0) + 1}`,
      ],
    });
  }

  function updateOption(index: number, value: string) {
    const field = fields.find((item) => item.id === selectedFieldId);
    if (!field) return;

    const options = [...(field.options || [])];
    options[index] = value;

    updateField(field.id, { options });
  }

  function deleteOption(index: number) {
    const field = fields.find((item) => item.id === selectedFieldId);
    if (!field) return;

    updateField(field.id, {
      options: (field.options || []).filter((_, i) => i !== index),
    });
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCompanyLogo(reader.result as string);
      setCompanyLogoName(file.name);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function saveDraft() {
    if (!formName.trim()) {
      alert("Please enter a form name.");
      return;
    }

    setSaving(true);
    try {
      const id = await saveFormToFirestore(formId, {
        name: formName,
        description,
        category,
        companyLogo,
        fields,
        status: "draft",
      });
      setFormId(id);
      alert("Draft saved.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to save draft: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  async function publishForm() {
    if (!formName.trim()) {
      alert("Please enter a form name.");
      return;
    }

    if (fields.length === 0) {
      alert("Please add at least one field.");
      return;
    }

    setSaving(true);
    try {
      const id = await saveFormToFirestore(formId, {
        name: formName,
        description,
        category,
        companyLogo,
        fields,
        status: "published",
      });
      setFormId(id);
      alert("Form published successfully.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to publish: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  function submitForm() {
    const missing = fields.filter(
      (field) =>
        field.required && isEmptyValue(responses[field.id], otherTexts[field.id])
    );

    if (missing.length > 0) {
      alert(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    console.log("Submission:", { responses, otherTexts });
    alert("Submission workflow will be connected next.");
  }

  async function downloadPdf() {
    if (!formName.trim()) {
      alert("Enter a form name before downloading the PDF.");
      return;
    }

    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    const margin = 15;
    const width = 180;
    const bottom = 278;
    let y = 18;

    const ensure = (height: number) => {
      if (y + height > bottom) {
        pdf.addPage();
        y = 20;
      }
    };

    const resetStyle = () => {
      pdf.setTextColor(0, 0, 0);
      pdf.setDrawColor(190, 190, 190);
      pdf.setFont("helvetica", "normal");
    };

    const box = (text: string, minHeight: number, placeholder = "") => {
      const shown = text || placeholder;
      const lines = shown ? pdf.splitTextToSize(shown, width - 4) : [];
      const h = Math.max(minHeight, lines.length * 5 + 6);

      ensure(h);
      pdf.rect(margin, y, width, h);

      if (shown) {
        if (!text) pdf.setTextColor(150, 150, 150);
        pdf.text(lines, margin + 2, y + 6);
        pdf.setTextColor(0, 0, 0);
      }

      y += h + 6;
    };

    if (companyLogo) {
      const logo = await normalizeImage(companyLogo, "png");

      if (logo) {
        const size = fitSize(logo.w, logo.h, 45, 25);
        pdf.addImage(logo.data, "PNG", margin, y, size.w, size.h);
        y += size.h + 8;
      }
    }

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(formName, width);
    pdf.text(titleLines, margin, y);
    y += titleLines.length * 8 + 2;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(11, 122, 117);
    pdf.text(`Category: ${category}`, margin, y);
    pdf.setTextColor(0, 0, 0);
    y += 7;

    if (description) {
      const lines = pdf.splitTextToSize(description, width);
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 3;
    }

    y += 4;

    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      const value = responses[field.id];
      const otherText = otherTexts[field.id] || "";

      resetStyle();
      ensure(30);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");

      const labelLines = pdf.splitTextToSize(
        `${index + 1}. ${field.label}${field.required ? " *" : ""}`,
        width
      );
      pdf.text(labelLines, margin, y);
      y += labelLines.length * 5.5 + 1;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      if (field.description) {
        pdf.setTextColor(110, 110, 110);
        const lines = pdf.splitTextToSize(field.description, width);
        pdf.text(lines, margin, y);
        pdf.setTextColor(0, 0, 0);
        y += lines.length * 4.5 + 2;
      }

      pdf.setFontSize(10);
      pdf.setDrawColor(190, 190, 190);

      const text =
        typeof value === "string"
          ? value === OTHER_VALUE
            ? otherText
            : value
          : "";

      switch (field.type) {
        case "short-text":
        case "number":
        case "date":
          box(text, 10);
          break;

        case "long-text":
          box(text, 24);
          break;

        case "dropdown":
          box(text, 10, "Select an option");
          break;

        case "checkbox": {
          const selected = Array.isArray(value) ? value : [];
          const options = [...(field.options || []), "Other"];

          options.forEach((option) => {
            const isOther = option === "Other";
            const checked = isOther
              ? selected.includes(OTHER_VALUE)
              : selected.includes(option);

            ensure(8);

            if (checked) {
              pdf.setFillColor(11, 122, 117);
              pdf.rect(margin + 1, y - 3.5, 4, 4, "FD");
            } else {
              pdf.rect(margin + 1, y - 3.5, 4, 4);
            }

            const label =
              isOther && checked && otherText.trim()
                ? `Other: ${otherText.trim()}`
                : option;
            pdf.text(label, margin + 9, y);
            y += 7;
          });

          y += 3;
          break;
        }

        case "yes-no": {
          ensure(12);

          ["Yes", "No"].forEach((option, i) => {
            const x = margin + 1 + i * 35;

            if (value === option) {
              pdf.setFillColor(11, 122, 117);
              pdf.rect(x, y - 3.5, 4, 4, "FD");
            } else {
              pdf.rect(x, y - 3.5, 4, 4);
            }

            pdf.text(option, x + 8, y);
          });

          y += 12;
          break;
        }

        case "photo": {
          if (isFileValue(value)) {
            if (value.type.startsWith("image/")) {
              const img = await normalizeImage(value.dataUrl, "jpeg");

              if (img) {
                const size = fitSize(img.w, img.h, 90, 65);
                ensure(size.h + 6);
                pdf.addImage(img.data, "JPEG", margin, y, size.w, size.h);
                y += size.h + 6;
                break;
              }
            }

            box(`Attached file: ${value.name}`, 10);
          } else {
            box("", 30, "Attach photo / file");
          }
          break;
        }

        case "signature": {
          if (typeof value === "string" && value) {
            const sig = await normalizeImage(value, "png");

            if (sig) {
              const size = fitSize(sig.w, sig.h, 80, 30);
              ensure(size.h + 8);
              pdf.rect(margin, y, width, size.h + 4);
              pdf.addImage(sig.data, "PNG", margin + 2, y + 2, size.w, size.h);
              y += size.h + 10;
              break;
            }
          }

          box("", 30, "Sign here");
          break;
        }
      }

      y += 2;
    }

    const pages = pdf.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Generated with Zealler  |  Page ${i} of ${pages}`, margin, 290);
    }

    pdf.save(`${formName.trim().replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  const selectedField = fields.find((field) => field.id === selectedFieldId);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex h-20 items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/forms"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Form Management
              </p>
              <h1 className="text-lg font-semibold">{formName || "Create Form"}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode((value) => !value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              {previewMode ? "Builder" : "Employee Preview"}
            </button>

            <button
              type="button"
              onClick={downloadPdf}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:flex"
            >
              <Download size={16} />
              PDF
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 md:flex disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={publishForm}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#0b7a75" }}
            >
              <Check size={16} />
              {saving ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      {previewMode ? (
        <EmployeePreview
          formName={formName}
          description={description}
          category={category}
          fields={fields}
          responses={responses}
          otherTexts={otherTexts}
          updateResponse={updateResponse}
          updateOtherText={updateOtherText}
          onDownload={downloadPdf}
          onSubmit={submitForm}
        />
      ) : (
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#0b7a7515", color: "#0b7a75" }}
              >
                <FileText size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Form Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure the information employees will see when using this form.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Form Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="e.g. Daily Safety Inspection"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0b7a75]"
                >
                  <option>Inspections</option>
                  <option>Incident Management</option>
                  <option>Safety</option>
                  <option>Operations</option>
                  <option>Human Resources</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Describe what this form is used for..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0b7a75] focus:ring-2 focus:ring-[#0b7a75]/10"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Company Logo</label>

                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center">
                  {companyLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={companyLogo}
                      alt="Company logo"
                      className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {companyLogoName || "Upload company logo"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      This logo will appear at the top of the generated PDF.
                    </p>
                  </div>

                  {companyLogo && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyLogo(null);
                        setCompanyLogoName("");
                      }}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}

                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <Upload size={16} />
                    Choose Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)_320px]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 px-2">
                <Plus size={17} style={{ color: "#0b7a75" }} />
                <h2 className="font-semibold">Add Field</h2>
              </div>

              <p className="px-2 pt-1 text-xs leading-5 text-slate-500">
                Add the fields employees will complete.
              </p>

              <div className="mt-4 space-y-1">
                {fieldTypes.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addField(item.type)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: "#0b7a7515", color: "#0b7a75" }}
                    >
                      {item.icon}
                    </span>

                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block text-xs text-slate-400">{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
              <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Form Canvas
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {fields.length} {fields.length === 1 ? "field" : "fields"} · click a
                      field name to rename it. Inputs work here so you can test them.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFieldMenu((value) => !value)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0b7a75] shadow-sm"
                  >
                    <Plus size={16} />
                    Add Field
                  </button>
                </div>

                {showFieldMenu && (
                  <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {fieldTypes.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => addField(item.type)}
                          className="flex items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-50"
                        >
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{ backgroundColor: "#0b7a7515", color: "#0b7a75" }}
                          >
                            {item.icon}
                          </span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="border-b border-slate-100 pb-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b7a75]">
                      {category}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {formName || "Untitled Form"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {description ||
                        "Add a description to explain the purpose of this form."}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4">
                    {fields.map((field, index) => (
                      <BuilderField
                        key={field.id}
                        field={field}
                        index={index}
                        selected={field.id === selectedFieldId}
                        onSelect={() => setSelectedFieldId(field.id)}
                        onDelete={() => deleteField(field.id)}
                        onRename={(label) => updateField(field.id, { label })}
                        value={responses[field.id]}
                        otherText={otherTexts[field.id] || ""}
                        updateResponse={updateResponse}
                        updateOtherText={updateOtherText}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addField("short-text")}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-500 hover:border-[#0b7a75] hover:text-[#0b7a75]"
                  >
                    <Plus size={16} />
                    Add another field
                  </button>
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Settings2 size={18} style={{ color: "#0b7a75" }} />
                <h2 className="font-semibold">Field Settings</h2>
              </div>

              {!selectedField ? (
                <p className="mt-8 text-center text-sm text-slate-400">
                  Select a field to edit it.
                </p>
              ) : (
                <div className="mt-5 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">Field Type</label>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium">
                      {fieldTypes.find((item) => item.type === selectedField.type)?.label}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">Field Label</label>
                    <input
                      type="text"
                      value={selectedField.label}
                      onChange={(event) =>
                        updateField(selectedField.id, { label: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0b7a75]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">Help Text</label>
                    <textarea
                      value={selectedField.description}
                      onChange={(event) =>
                        updateField(selectedField.id, { description: event.target.value })
                      }
                      rows={3}
                      placeholder="Optional instructions..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0b7a75]"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="text-sm font-semibold">Required</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Employee must complete this field.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={selectedField.required}
                      onChange={(event) =>
                        updateField(selectedField.id, { required: event.target.checked })
                      }
                      className="h-5 w-5 accent-[#0b7a75]"
                    />
                  </label>

                  {(selectedField.type === "dropdown" ||
                    selectedField.type === "checkbox") && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold">Options</label>
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-xs font-semibold text-[#0b7a75]"
                        >
                          + Add
                        </button>
                      </div>

                      <p className="mb-2 text-xs text-slate-400">
                        An &quot;Other&quot; option is always included so employees can type a custom answer.
                      </p>

                      <div className="space-y-2">
                        {(selectedField.options || []).map((option, index) => (
                          <div
                            key={`${selectedField.id}-option-${index}`}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={option}
                              onChange={(event) => updateOption(index, event.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0b7a75]"
                            />

                            <button
                              type="button"
                              onClick={() => deleteOption(index)}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
                          <span className="min-w-0 flex-1 text-sm text-slate-500">Other</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Always on
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteField(selectedField.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete Field
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- Builder field ---------- */

function BuilderField({
  field,
  index,
  selected,
  onSelect,
  onDelete,
  onRename,
  value,
  otherText,
  updateResponse,
  updateOtherText,
}: {
  field: FormField;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (label: string) => void;
  value: FieldValue;
  otherText: string;
  updateResponse: (id: string, value: FieldValue) => void;
  updateOtherText: (id: string, value: string) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-4 transition ${
        selected
          ? "border-[#0b7a75] bg-[#0b7a75]/[0.02] ring-2 ring-[#0b7a75]/10"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex gap-3">
        <div className="hidden pt-1 text-slate-300 sm:block">
          <GripVertical size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">
                Field {index + 1}
                {field.required && <span className="ml-1 text-red-500">* required</span>}
              </p>

              <input
                type="text"
                value={field.label}
                onChange={(event) => onRename(event.target.value)}
                onFocus={onSelect}
                onClick={(event) => event.stopPropagation()}
                placeholder="Untitled Field"
                className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 font-semibold outline-none hover:border-slate-200 focus:border-[#0b7a75]"
              />
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {field.description && (
            <p className="mt-1 px-1 text-xs text-slate-400">{field.description}</p>
          )}

          <div className="mt-4" onClick={(event) => event.stopPropagation()}>
            <FieldInput
              field={field}
              value={value}
              otherText={otherText}
              updateResponse={updateResponse}
              updateOtherText={updateOtherText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Employee preview ---------- */

function EmployeePreview({
  formName,
  description,
  category,
  fields,
  responses,
  otherTexts,
  updateResponse,
  updateOtherText,
  onDownload,
  onSubmit,
}: {
  formName: string;
  description: string;
  category: string;
  fields: FormField[];
  responses: Record<string, FieldValue>;
  otherTexts: Record<string, string>;
  updateResponse: (id: string, value: FieldValue) => void;
  updateOtherText: (id: string, value: string) => void;
  onDownload: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b7a75]">
          Employee Preview
        </p>
        <p className="mt-1 text-sm text-slate-500">
          This is the interactive version employees will complete.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b7a75]">
          {category}
        </p>

        <h1 className="mt-2 text-3xl font-semibold">{formName || "Untitled Form"}</h1>

        <p className="mt-3 leading-6 text-slate-500">
          {description || "No description provided."}
        </p>

        <div className="mt-8 space-y-7">
          {fields.map((field, index) => (
            <EmployeeField
              key={field.id}
              field={field}
              index={index}
              value={responses[field.id]}
              otherText={otherTexts[field.id] || ""}
              updateResponse={updateResponse}
              updateOtherText={updateOtherText}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "#0b7a75" }}
            onClick={onSubmit}
          >
            Submit Form
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Signature pad ---------- */

function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function start(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.setPointerCapture(event.pointerId);

    const { x, y } = getPoint(event);

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y);
    ctx.stroke();

    drawing.current = true;
  }

  function move(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;

    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <canvas
          ref={canvasRef}
          width={700}
          height={180}
          className="h-[180px] w-full touch-none bg-white"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-400">Draw your signature above.</p>

        {value && (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Clear Signature
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Shared live input ---------- */

function FieldInput({
  field,
  value,
  otherText,
  updateResponse,
  updateOtherText,
}: {
  field: FormField;
  value: FieldValue;
  otherText: string;
  updateResponse: (id: string, value: FieldValue) => void;
  updateOtherText: (id: string, value: string) => void;
}) {
  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateResponse(field.id, {
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  const textValue = typeof value === "string" ? value : "";
  const checkboxValues = Array.isArray(value) ? value : [];
  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0b7a75]";

  const otherSelectedDropdown = textValue === OTHER_VALUE;
  const otherSelectedCheckbox = checkboxValues.includes(OTHER_VALUE);

  switch (field.type) {
    case "short-text":
      return (
        <input
          type="text"
          value={textValue}
          onChange={(e) => updateResponse(field.id, e.target.value)}
          placeholder="Enter response..."
          className={inputClass}
        />
      );

    case "long-text":
      return (
        <textarea
          value={textValue}
          onChange={(e) => updateResponse(field.id, e.target.value)}
          placeholder="Enter your response..."
          rows={4}
          className={`${inputClass} resize-none`}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={textValue}
          onChange={(e) => updateResponse(field.id, e.target.value)}
          placeholder="Enter number..."
          className={inputClass}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={textValue}
          onChange={(e) => updateResponse(field.id, e.target.value)}
          className={inputClass}
        />
      );

    case "dropdown":
      return (
        <div className="space-y-3">
          <select
            value={otherSelectedDropdown ? OTHER_VALUE : textValue}
            onChange={(e) => {
              const next = e.target.value;
              updateResponse(field.id, next);
              if (next !== OTHER_VALUE) {
                updateOtherText(field.id, "");
              }
            }}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select an option</option>
            {(field.options || []).map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
            <option value={OTHER_VALUE}>Other</option>
          </select>

          {otherSelectedDropdown && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => updateOtherText(field.id, e.target.value)}
              placeholder="Please specify..."
              className={inputClass}
              autoFocus
            />
          )}
        </div>
      );

    case "checkbox":
      return (
        <div className="space-y-3">
          {(field.options || []).map((option, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={checkboxValues.includes(option)}
                onChange={(e) =>
                  updateResponse(
                    field.id,
                    e.target.checked
                      ? [...checkboxValues, option]
                      : checkboxValues.filter((item) => item !== option)
                  )
                }
                className="h-5 w-5 accent-[#0b7a75]"
              />
              <span className="text-sm text-slate-700">{option}</span>
            </label>
          ))}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
            <input
              type="checkbox"
              checked={otherSelectedCheckbox}
              onChange={(e) => {
                if (e.target.checked) {
                  updateResponse(field.id, [...checkboxValues, OTHER_VALUE]);
                } else {
                  updateResponse(
                    field.id,
                    checkboxValues.filter((item) => item !== OTHER_VALUE)
                  );
                  updateOtherText(field.id, "");
                }
              }}
              className="h-5 w-5 accent-[#0b7a75]"
            />
            <span className="text-sm text-slate-700">Other</span>
          </label>

          {otherSelectedCheckbox && (
            <input
              type="text"
              value={otherText}
              onChange={(e) => updateOtherText(field.id, e.target.value)}
              placeholder="Please specify..."
              className={inputClass}
              autoFocus
            />
          )}
        </div>
      );

    case "yes-no":
      return (
        <div className="flex gap-3">
          {["Yes", "No"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateResponse(field.id, option)}
              className={`rounded-xl border px-6 py-3 text-sm font-semibold transition ${
                value === option
                  ? "border-[#0b7a75] bg-[#0b7a75]/5 text-[#0b7a75]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );

    case "photo":
      return (
        <div className="rounded-xl border border-dashed border-slate-300 p-5">
          {isFileValue(value) ? (
            <div className="flex flex-col items-center gap-3">
              {value.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={value.dataUrl}
                  alt={value.name}
                  className="max-h-56 rounded-lg border border-slate-200 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <FileText size={18} />
                  {value.name}
                </div>
              )}

              <div className="flex items-center gap-4">
                <p className="text-xs text-slate-500">{value.name}</p>
                <button
                  type="button"
                  onClick={() => updateResponse(field.id, null)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#0b7a7515", color: "#0b7a75" }}
              >
                <Upload size={22} />
              </div>
              <p className="mt-3 text-sm font-semibold">Upload photo or file</p>
              <p className="mt-1 text-xs text-slate-400">
                Select a file from your device (max 5MB)
              </p>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          )}
        </div>
      );

    case "signature":
      return (
        <SignaturePad
          value={typeof value === "string" ? value : null}
          onChange={(next) => updateResponse(field.id, next)}
        />
      );

    default:
      return null;
  }
}

/* ---------- Employee field ---------- */

function EmployeeField({
  field,
  index,
  value,
  otherText,
  updateResponse,
  updateOtherText,
}: {
  field: FormField;
  index: number;
  value: FieldValue;
  otherText: string;
  updateResponse: (id: string, value: FieldValue) => void;
  updateOtherText: (id: string, value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        {index + 1}. {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.description && (
        <p className="mb-2 text-xs text-slate-400">{field.description}</p>
      )}

      <FieldInput
        field={field}
        value={value}
        otherText={otherText}
        updateResponse={updateResponse}
        updateOtherText={updateOtherText}
      />
    </div>
  );
}