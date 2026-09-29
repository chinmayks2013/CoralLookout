import { NextResponse } from "next/server";
import { requireTeacherChapterWithPremium } from "@/lib/school/access";
import {
  createFieldwork,
  listFieldwork,
  updateFieldwork,
} from "@/lib/school/fieldwork";
import { isGalleryCloudEnabled, GALLERY_SETUP_MESSAGE } from "@/lib/supabase/config";
import type { SchoolFieldworkInput } from "@/lib/school/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFieldwork(value: unknown): SchoolFieldworkInput | string {
  if (!isRecord(value)) return "Invalid fieldwork data";

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const location = typeof value.location === "string" ? value.location.trim() : "";
  if (!title || title.length > 120) return "Title is required and must be under 120 characters";
  if (!location || location.length > 160) return "Location is required and must be under 160 characters";

  const visitAt = typeof value.visitAt === "string" ? new Date(value.visitAt) : null;
  if (!visitAt || !Number.isFinite(visitAt.getTime())) return "Choose a valid visit date";

  const sampledAt = typeof value.sampledAt === "string" && value.sampledAt
    ? new Date(value.sampledAt)
    : null;
  if (sampledAt && !Number.isFinite(sampledAt.getTime())) return "Choose a valid sample date";

  const groupSize = Number(value.groupSize);
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 1000) {
    return "Group size must be between 1 and 1000";
  }

  if (!Array.isArray(value.equipment) || value.equipment.length > 20) {
    return "Choose up to 20 equipment items";
  }
  const equipment = value.equipment.map((item) =>
    typeof item === "string" ? item.trim() : ""
  );
  if (equipment.some((item) => !item || item.length > 80)) {
    return "Equipment items must be between 1 and 80 characters";
  }

  const measurementLimits = [
    ["waterTempC", -5, 50],
    ["pH", 0, 14],
    ["salinityPpt", 0, 70],
    ["dissolvedOxygenMgL", 0, 50],
    ["nitrateMgL", 0, 1000],
    ["phosphateMgL", 0, 1000],
    ["alkalinityMgLCaCO3", 0, 2000],
  ] as const;
  const parsedMeasurements: Record<string, number | null> = {};
  for (const [key, min, max] of measurementLimits) {
    const raw = value[key];
    if (raw === null || raw === undefined || raw === "") {
      parsedMeasurements[key] = null;
      continue;
    }
    const number = Number(raw);
    if (!Number.isFinite(number) || number < min || number > max) {
      return `${key} must be between ${min} and ${max}`;
    }
    parsedMeasurements[key] = number;
  }

  const transportation = typeof value.transportation === "string" ? value.transportation.trim() : "";
  const safetyNotes = typeof value.safetyNotes === "string" ? value.safetyNotes.trim() : "";
  const sampleLabel = typeof value.sampleLabel === "string" ? value.sampleLabel.trim() : "";
  if (transportation.length > 240 || safetyNotes.length > 1000 || sampleLabel.length > 120) {
    return "Transportation, safety notes, or sample label is too long";
  }

  return {
    title,
    location,
    visitAt: visitAt.toISOString(),
    transportation,
    groupSize,
    equipment,
    safetyNotes,
    sampleLabel,
    sampledAt: sampledAt?.toISOString() ?? null,
    waterTempC: parsedMeasurements.waterTempC ?? null,
    pH: parsedMeasurements.pH ?? null,
    salinityPpt: parsedMeasurements.salinityPpt ?? null,
    dissolvedOxygenMgL: parsedMeasurements.dissolvedOxygenMgL ?? null,
    nitrateMgL: parsedMeasurements.nitrateMgL ?? null,
    phosphateMgL: parsedMeasurements.phosphateMgL ?? null,
    alkalinityMgLCaCO3: parsedMeasurements.alkalinityMgLCaCO3 ?? null,
  };
}

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (message.includes("school_fieldwork")) {
    return NextResponse.json(
      { error: "Fieldwork storage is not installed. Run supabase/migrations/009_school_fieldwork_chemistry.sql." },
      { status: 503 }
    );
  }
  const status = message.includes("access denied") || message.includes("subscription")
    ? 403
    : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");
  const teacherUserId = searchParams.get("teacherUserId");
  if (!chapterId || !teacherUserId) {
    return NextResponse.json({ error: "Missing chapterId or teacherUserId" }, { status: 400 });
  }

  try {
    await requireTeacherChapterWithPremium(teacherUserId, chapterId);
    const fieldwork = await listFieldwork(chapterId);
    return NextResponse.json({ fieldwork });
  } catch (error) {
    return errorResponse(error, "Failed to load fieldwork");
  }
}

export async function POST(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || typeof body.chapterId !== "string" || typeof body.teacherUserId !== "string") {
      return NextResponse.json({ error: "Missing chapterId or teacherUserId" }, { status: 400 });
    }
    const fieldwork = parseFieldwork(body.fieldwork);
    if (typeof fieldwork === "string") return NextResponse.json({ error: fieldwork }, { status: 400 });

    await requireTeacherChapterWithPremium(body.teacherUserId, body.chapterId);
    const record = await createFieldwork({
      chapterId: body.chapterId,
      teacherUserId: body.teacherUserId,
      fieldwork,
    });
    return NextResponse.json({ fieldwork: record });
  } catch (error) {
    return errorResponse(error, "Failed to save fieldwork");
  }
}

export async function PATCH(request: Request) {
  if (!isGalleryCloudEnabled()) {
    return NextResponse.json({ error: GALLERY_SETUP_MESSAGE }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    if (
      !isRecord(body) ||
      typeof body.id !== "string" ||
      typeof body.chapterId !== "string" ||
      typeof body.teacherUserId !== "string"
    ) {
      return NextResponse.json({ error: "Missing record id, chapterId, or teacherUserId" }, { status: 400 });
    }
    const fieldwork = parseFieldwork(body.fieldwork);
    if (typeof fieldwork === "string") return NextResponse.json({ error: fieldwork }, { status: 400 });

    await requireTeacherChapterWithPremium(body.teacherUserId, body.chapterId);
    const record = await updateFieldwork({
      id: body.id,
      chapterId: body.chapterId,
      teacherUserId: body.teacherUserId,
      fieldwork,
    });
    return NextResponse.json({ fieldwork: record });
  } catch (error) {
    return errorResponse(error, "Failed to update fieldwork");
  }
}