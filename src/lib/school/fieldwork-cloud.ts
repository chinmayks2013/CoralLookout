import type { SchoolFieldwork, SchoolFieldworkInput } from "./types";

export async function fetchFieldwork(
  chapterId: string,
  teacherUserId: string
): Promise<SchoolFieldwork[]> {
  const params = new URLSearchParams({ chapterId, teacherUserId });
  const res = await fetch(`/api/school/fieldwork?${params}`, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load fieldwork");
  return data.fieldwork as SchoolFieldwork[];
}

export async function saveFieldwork(input: {
  id?: string;
  chapterId: string;
  teacherUserId: string;
  fieldwork: SchoolFieldworkInput;
}): Promise<SchoolFieldwork> {
  const { id, ...body } = input;
  const res = await fetch("/api/school/fieldwork", {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(id ? { ...body, id } : body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to save fieldwork");
  return data.fieldwork as SchoolFieldwork;
}