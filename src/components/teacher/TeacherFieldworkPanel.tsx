"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, FlaskConical, LoaderCircle, MapPinned, Pencil, Save } from "lucide-react";
import { fetchFieldwork, saveFieldwork } from "@/lib/school/fieldwork-cloud";
import type { SchoolFieldwork, SchoolFieldworkInput } from "@/lib/school/types";

const EQUIPMENT_OPTIONS = [
  "Water test kit",
  "Calibrated pH meter",
  "Salinity refractometer",
  "Dissolved oxygen meter",
  "Thermometer",
  "Sterile sample bottles",
  "Gloves and eye protection",
  "First aid kit",
] as const;

const CHEMISTRY_FIELDS = [
  { key: "waterTempC", label: "Water temperature", unit: "°C", min: -5, max: 50, step: 0.1 },
  { key: "pH", label: "pH", unit: "0–14", min: 0, max: 14, step: 0.01 },
  { key: "salinityPpt", label: "Salinity", unit: "ppt", min: 0, max: 70, step: 0.1 },
  { key: "dissolvedOxygenMgL", label: "Dissolved oxygen", unit: "mg/L", min: 0, max: 50, step: 0.01 },
  { key: "nitrateMgL", label: "Nitrate", unit: "mg/L", min: 0, max: 1000, step: 0.001 },
  { key: "phosphateMgL", label: "Phosphate", unit: "mg/L", min: 0, max: 1000, step: 0.001 },
  { key: "alkalinityMgLCaCO3", label: "Alkalinity", unit: "mg/L as CaCO₃", min: 0, max: 2000, step: 0.01 },
] as const;

type MeasurementKey = (typeof CHEMISTRY_FIELDS)[number]["key"];

interface FieldworkDraft {
  title: string;
  location: string;
  visitAt: string;
  transportation: string;
  groupSize: string;
  equipment: string[];
  otherEquipment: string;
  safetyNotes: string;
  sampleLabel: string;
  sampledAt: string;
  waterTempC: string;
  pH: string;
  salinityPpt: string;
  dissolvedOxygenMgL: string;
  nitrateMgL: string;
  phosphateMgL: string;
  alkalinityMgLCaCO3: string;
}

const EMPTY_DRAFT: FieldworkDraft = {
  title: "",
  location: "",
  visitAt: "",
  transportation: "",
  groupSize: "1",
  equipment: [],
  otherEquipment: "",
  safetyNotes: "",
  sampleLabel: "",
  sampledAt: "",
  waterTempC: "",
  pH: "",
  salinityPpt: "",
  dissolvedOxygenMgL: "",
  nitrateMgL: "",
  phosphateMgL: "",
  alkalinityMgLCaCO3: "",
};

function localDateTime(value?: string): string {
  const date = value ? new Date(value) : new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function recordToDraft(record: SchoolFieldwork): FieldworkDraft {
  const knownEquipment = record.equipment.filter((item) =>
    EQUIPMENT_OPTIONS.includes(item as (typeof EQUIPMENT_OPTIONS)[number])
  );
  const values = Object.fromEntries(
    CHEMISTRY_FIELDS.map(({ key }) => [key, record[key] === null ? "" : String(record[key])])
  ) as Pick<FieldworkDraft, MeasurementKey>;

  return {
    ...EMPTY_DRAFT,
    ...values,
    title: record.title,
    location: record.location,
    visitAt: localDateTime(record.visitAt),
    transportation: record.transportation,
    groupSize: String(record.groupSize),
    equipment: knownEquipment,
    otherEquipment: record.equipment.filter((item) => !knownEquipment.includes(item)).join(", "),
    safetyNotes: record.safetyNotes,
    sampleLabel: record.sampleLabel,
    sampledAt: record.sampledAt ? localDateTime(record.sampledAt) : "",
  };
}

function measurementValue(value: number | null, unit: string): string {
  return value === null ? "Not recorded" : `${value} ${unit}`;
}

export function TeacherFieldworkPanel({
  chapterId,
  teacherUserId,
}: {
  chapterId: string;
  teacherUserId: string;
}) {
  const [records, setRecords] = useState<SchoolFieldwork[]>([]);
  const [draft, setDraft] = useState<FieldworkDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchFieldwork(chapterId, teacherUserId)
      .then((items) => {
        if (!cancelled) setRecords(items);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Could not load fieldwork");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId, teacherUserId]);

  function resetForm() {
    setDraft({ ...EMPTY_DRAFT, visitAt: localDateTime() });
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const numberOrNull = (value: string) => value.trim() ? Number(value) : null;
      const otherEquipment = draft.otherEquipment
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const fieldwork: SchoolFieldworkInput = {
        title: draft.title.trim(),
        location: draft.location.trim(),
        visitAt: new Date(draft.visitAt).toISOString(),
        transportation: draft.transportation.trim(),
        groupSize: Number(draft.groupSize),
        equipment: [...draft.equipment, ...otherEquipment],
        safetyNotes: draft.safetyNotes.trim(),
        sampleLabel: draft.sampleLabel.trim(),
        sampledAt: draft.sampledAt ? new Date(draft.sampledAt).toISOString() : null,
        waterTempC: numberOrNull(draft.waterTempC),
        pH: numberOrNull(draft.pH),
        salinityPpt: numberOrNull(draft.salinityPpt),
        dissolvedOxygenMgL: numberOrNull(draft.dissolvedOxygenMgL),
        nitrateMgL: numberOrNull(draft.nitrateMgL),
        phosphateMgL: numberOrNull(draft.phosphateMgL),
        alkalinityMgLCaCO3: numberOrNull(draft.alkalinityMgLCaCO3),
      };
      const saved = await saveFieldwork({
        id: editingId ?? undefined,
        chapterId,
        teacherUserId,
        fieldwork,
      });
      setRecords((current) =>
        [saved, ...current.filter((record) => record.id !== saved.id)].sort(
          (left, right) => new Date(right.visitAt).getTime() - new Date(left.visitAt).getTime()
        )
      );
      setMessage(editingId ? "Fieldwork record updated." : "Fieldwork plan saved.");
      setDraft({ ...EMPTY_DRAFT, visitAt: localDateTime() });
      setEditingId(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save fieldwork");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-xl border border-teal-500/20 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-100">
              <MapPinned className="h-4 w-4 text-teal-300" />
              Fieldwork logistics
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Plan the visit, crew, transport, gear, and safety notes.
            </p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-cyan-300 hover:text-cyan-200">
              Cancel edit
            </button>
          )}
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-950/20 px-3 py-2 text-sm text-red-300">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-lg border border-teal-500/30 bg-teal-950/20 px-3 py-2 text-sm text-teal-200">{message}</p>}

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-400 sm:col-span-2">
              Field session
              <input required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. North reef water survey" className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
            </label>
            <label className="text-xs text-slate-400">
              Site / station
              <input required maxLength={160} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Beach, reef, or station name" className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
            </label>
            <label className="text-xs text-slate-400">
              Visit date and time
              <input required type="datetime-local" value={draft.visitAt} onChange={(event) => setDraft({ ...draft, visitAt: event.target.value })} className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100" />
            </label>
            <label className="text-xs text-slate-400">
              Group size
              <input required type="number" min={1} max={1000} step={1} value={draft.groupSize} onChange={(event) => setDraft({ ...draft, groupSize: event.target.value })} className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
            </label>
            <label className="text-xs text-slate-400">
              Transport / meeting point
              <input maxLength={240} value={draft.transportation} onChange={(event) => setDraft({ ...draft, transportation: event.target.value })} placeholder="Bus, walk, launch time, pickup point" className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase text-slate-400">Equipment checklist</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label key={item} className="flex min-h-10 items-center gap-2 rounded-lg border border-cyan-500/10 px-3 text-sm text-slate-300">
                  <input type="checkbox" checked={draft.equipment.includes(item)} onChange={(event) => setDraft({ ...draft, equipment: event.target.checked ? [...draft.equipment, item] : draft.equipment.filter((selected) => selected !== item) })} className="accent-teal-400" />
                  {item}
                </label>
              ))}
            </div>
            <input value={draft.otherEquipment} onChange={(event) => setDraft({ ...draft, otherEquipment: event.target.value })} placeholder="Other equipment, comma separated" className="mt-2 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
          </fieldset>

          <label className="block text-xs text-slate-400">
            Safety / access notes
            <textarea maxLength={1000} rows={2} value={draft.safetyNotes} onChange={(event) => setDraft({ ...draft, safetyNotes: event.target.value })} placeholder="Tide, weather, permissions, accessibility, emergency contact" className="mt-1 w-full resize-y rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
          </label>

          <div className="border-t border-cyan-500/15 pt-5">
            <h4 className="flex items-center gap-2 font-semibold text-slate-100">
              <FlaskConical className="h-4 w-4 text-cyan-300" />
              Reef water chemistry
            </h4>
            <p className="mb-4 mt-1 text-xs text-slate-500">
              Record instrument readings with units. These are observations, not a water-quality diagnosis.
            </p>
            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-400">
                Sample station / ID
                <input maxLength={120} value={draft.sampleLabel} onChange={(event) => setDraft({ ...draft, sampleLabel: event.target.value })} placeholder="e.g. Station A, surface sample" className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
              </label>
              <label className="text-xs text-slate-400">
                Sample date and time
                <input type="datetime-local" value={draft.sampledAt} onChange={(event) => setDraft({ ...draft, sampledAt: event.target.value })} className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CHEMISTRY_FIELDS.map((field) => (
                <label key={field.key} className="text-xs text-slate-400">
                  {field.label} <span className="text-slate-600">({field.unit})</span>
                  <input type="number" min={field.min} max={field.max} step={field.step} value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100" />
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-cyan-500/15 pt-4">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50">
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : editingId ? "Update field session" : "Save field session"}
            </button>
            {!editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">Clear form</button>}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-100">Saved field sessions</h3>
          <span className="text-xs text-slate-500">{records.length} records</span>
        </div>
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Loading fieldwork…</p>
        ) : records.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cyan-500/20 px-4 py-6 text-center text-sm text-slate-500">No field sessions yet.</p>
        ) : (
          <ul className="space-y-3">
            {records.map((record) => (
              <li key={record.id} className="rounded-xl border border-cyan-500/15 bg-slate-950/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-100">{record.title}</h4>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><MapPinned className="h-3 w-3" />{record.location}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{new Date(record.visitAt).toLocaleString()}</span>
                      <span>{record.groupSize} participants</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => { setDraft(recordToDraft(record)); setEditingId(record.id); setError(null); setMessage(null); }} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/25 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/10">
                    <Pencil className="h-3.5 w-3.5" />Edit
                  </button>
                </div>
                {(record.transportation || record.equipment.length > 0 || record.safetyNotes) && (
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    {record.transportation && <p><span className="text-slate-500">Transport:</span> {record.transportation}</p>}
                    {record.equipment.length > 0 && <p><span className="text-slate-500">Gear:</span> {record.equipment.join(", ")}</p>}
                    {record.safetyNotes && <p><span className="text-slate-500">Safety:</span> {record.safetyNotes}</p>}
                  </div>
                )}
                <div className="mt-3 grid gap-2 border-t border-cyan-500/10 pt-3 sm:grid-cols-2 lg:grid-cols-4">
                  {CHEMISTRY_FIELDS.map((field) => (
                    <p key={field.key} className="text-xs text-slate-400">
                      <span className="text-slate-500">{field.label}:</span> {measurementValue(record[field.key], field.unit)}
                    </p>
                  ))}
                </div>
                {(record.sampleLabel || record.sampledAt) && <p className="mt-2 text-xs text-slate-500">Sample {record.sampleLabel}{record.sampledAt ? ` · ${new Date(record.sampledAt).toLocaleString()}` : ""}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}