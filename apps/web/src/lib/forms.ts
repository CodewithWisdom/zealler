import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type FormFieldPayload = {
  id: string;
  type: string;
  label: string;
  description: string;
  required: boolean;
  options?: string[];
};

export type FormPayload = {
  name: string;
  description: string;
  category: string;
  companyLogo: string | null;
  fields: FormFieldPayload[];
  status: "draft" | "published";
  updatedAt: ReturnType<typeof serverTimestamp>;
  createdAt?: ReturnType<typeof serverTimestamp>;
};

export async function saveForm(
  formId: string | null,
  data: {
    name: string;
    description: string;
    category: string;
    companyLogo: string | null;
    fields: FormFieldPayload[];
    status: "draft" | "published";
  }
) {
  const formsRef = collection(db, "forms");
  const id = formId || doc(formsRef).id;
  const ref = doc(db, "forms", id);

  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    companyLogo: data.companyLogo,
    fields: data.fields,
    status: data.status,
    updatedAt: serverTimestamp(),
  };

  // Only set createdAt on first write
  if (!formId) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });
  return id;
}