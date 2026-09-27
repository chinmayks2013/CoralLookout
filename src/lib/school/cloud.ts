import type {
  ChapterLeaderboardEntry,
  SchoolChapter,
  SchoolRosterMember,
} from "./types";

export async function fetchTeacherChapter(
  teacherUserId: string
): Promise<{
  chapter: SchoolChapter | null;
  demoMode?: boolean;
  annualBillingAvailable?: boolean;
  error?: string;
}> {
  const res = await fetch(
    `/api/school/chapter?teacherUserId=${encodeURIComponent(teacherUserId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) return { chapter: null, error: data.error };
  return {
    chapter: data.chapter as SchoolChapter | null,
    demoMode: Boolean(data.demoMode),
    annualBillingAvailable: Boolean(data.annualBillingAvailable),
  };
}

export async function createTeacherChapter(input: {
  teacherUserId: string;
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
}): Promise<{ chapter: SchoolChapter; demoMode: boolean }> {
  const res = await fetch("/api/school/chapter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create chapter");
  return {
    chapter: data.chapter as SchoolChapter,
    demoMode: Boolean(data.demoMode),
  };
}

export async function updateChapterBranding(input: {
  chapterId: string;
  teacherUserId: string;
  schoolName?: string;
  brandingTagline?: string | null;
  brandingAccent?: string;
  cohort?: string | null;
  region?: string | null;
}): Promise<SchoolChapter> {
  const res = await fetch("/api/school/chapter", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to update chapter");
  return data.chapter as SchoolChapter;
}

export async function startSchoolCheckout(input: {
  chapterId: string;
  teacherUserId: string;
  teacherEmail: string;
  billingInterval?: "month" | "year";
}): Promise<string> {
  const res = await fetch("/api/school/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Checkout failed");
  return data.url as string;
}

export async function openBillingPortal(input: {
  chapterId: string;
  teacherUserId: string;
}): Promise<string> {
  const res = await fetch("/api/school/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Billing portal failed");
  return data.url as string;
}

export async function fetchRoster(
  chapterId: string,
  teacherUserId: string
): Promise<SchoolRosterMember[]> {
  const res = await fetch(
    `/api/school/roster?chapterId=${encodeURIComponent(chapterId)}&teacherUserId=${encodeURIComponent(teacherUserId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load roster");
  return data.roster as SchoolRosterMember[];
}

export async function addRosterMember(input: {
  chapterId: string;
  teacherUserId: string;
  displayName: string;
  email?: string;
}): Promise<SchoolRosterMember> {
  const res = await fetch("/api/school/roster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to add student");
  return data.member as SchoolRosterMember;
}

export async function bulkAddRoster(input: {
  chapterId: string;
  teacherUserId: string;
  members: { displayName: string; email?: string }[];
}): Promise<SchoolRosterMember[]> {
  const res = await fetch("/api/school/roster/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Bulk import failed");
  return data.members as SchoolRosterMember[];
}

export async function removeRosterMember(input: {
  rosterId: string;
  chapterId: string;
  teacherUserId: string;
}): Promise<void> {
  const res = await fetch("/api/school/roster", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to remove student");
}

export async function joinSchoolChapter(input: {
  joinCode: string;
  userId: string;
  displayName: string;
  email?: string;
}): Promise<{ chapter: SchoolChapter; roster: SchoolRosterMember }> {
  const res = await fetch("/api/school/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not join chapter");
  return {
    chapter: data.chapter as SchoolChapter,
    roster: data.roster as SchoolRosterMember,
  };
}

export async function fetchChapterLeaderboard(
  chapterId: string,
  teacherUserId: string
): Promise<ChapterLeaderboardEntry[]> {
  const res = await fetch(
    `/api/school/leaderboard?chapterId=${encodeURIComponent(chapterId)}&teacherUserId=${encodeURIComponent(teacherUserId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load leaderboard");
  return data.leaderboard as ChapterLeaderboardEntry[];
}

export async function fetchChapterInsights(
  chapterId: string,
  teacherUserId: string
): Promise<import("./types").ChapterInsights> {
  const res = await fetch(
    `/api/school/insights?chapterId=${encodeURIComponent(chapterId)}&teacherUserId=${encodeURIComponent(teacherUserId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load insights");
  return data.insights as import("./types").ChapterInsights;
}

export function getChapterExportUrl(
  chapterId: string,
  teacherUserId: string
): string {
  return `/api/school/export?chapterId=${encodeURIComponent(chapterId)}&teacherUserId=${encodeURIComponent(teacherUserId)}`;
}

export interface SchoolAssignmentDto {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  requiresScan: boolean;
  requiresPin: boolean;
  dueAt: string | null;
  createdBy: string;
  createdAt: string;
}

export async function fetchAssignments(
  chapterId: string
): Promise<SchoolAssignmentDto[]> {
  const res = await fetch(
    `/api/school/assignments?chapterId=${encodeURIComponent(chapterId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load assignments");
  return data.assignments as SchoolAssignmentDto[];
}

export async function createAssignment(input: {
  chapterId: string;
  teacherUserId: string;
  title: string;
  description?: string;
  requiresScan?: boolean;
  requiresPin?: boolean;
  dueAt?: string | null;
}): Promise<SchoolAssignmentDto> {
  const res = await fetch("/api/school/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create assignment");
  return data.assignment as SchoolAssignmentDto;
}

export interface AssignmentCompletionDto {
  id: string;
  assignmentId: string;
  userId: string;
  scanId: string | null;
  completedAt: string;
}

export async function fetchAssignment(
  assignmentId: string
): Promise<SchoolAssignmentDto> {
  const res = await fetch(
    `/api/school/assignments?assignmentId=${encodeURIComponent(assignmentId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load assignment");
  return data.assignment as SchoolAssignmentDto;
}

export async function fetchAssignmentsWithCompletions(chapterId: string): Promise<{
  assignments: SchoolAssignmentDto[];
  completions: AssignmentCompletionDto[];
}> {
  const res = await fetch(
    `/api/school/assignments?chapterId=${encodeURIComponent(chapterId)}&includeCompletions=1`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load assignments");
  return {
    assignments: data.assignments as SchoolAssignmentDto[],
    completions: (data.completions ?? []) as AssignmentCompletionDto[],
  };
}

export async function fetchAssignmentCompletions(
  assignmentId: string
): Promise<AssignmentCompletionDto[]> {
  const res = await fetch(
    `/api/school/assignments/complete?assignmentId=${encodeURIComponent(assignmentId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load completions");
  return data.completions as AssignmentCompletionDto[];
}

export async function completeAssignment(input: {
  assignmentId: string;
  userId: string;
  scanId?: string;
}): Promise<AssignmentCompletionDto> {
  const res = await fetch("/api/school/assignments/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to mark complete");
  return data.completion as AssignmentCompletionDto;
}

export interface CoTeacherDto {
  id: string;
  chapterId: string;
  userId: string;
  displayName: string;
  email: string | null;
  role: "owner" | "co_teacher" | "ta";
  createdAt: string;
}

export async function fetchCoTeachers(chapterId: string): Promise<CoTeacherDto[]> {
  const res = await fetch(
    `/api/school/teachers?chapterId=${encodeURIComponent(chapterId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load co-teachers");
  return data.teachers as CoTeacherDto[];
}

export async function inviteCoTeacher(input: {
  chapterId: string;
  teacherUserId: string;
  displayName: string;
  email?: string;
}): Promise<CoTeacherDto> {
  const res = await fetch("/api/school/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to invite co-teacher");
  return data.teacher as CoTeacherDto;
}

export interface StudentClassDashboard {
  enrolled: boolean;
  classActive?: boolean;
  chapter?: SchoolChapter;
  classmates?: SchoolRosterMember[];
  leaderboard?: ChapterLeaderboardEntry[];
  myRank?: number;
  myStats?: ChapterLeaderboardEntry | null;
  assignments?: SchoolAssignmentDto[];
  myCompletions?: AssignmentCompletionDto[];
}

export async function fetchStudentClass(
  userId: string
): Promise<StudentClassDashboard> {
  const res = await fetch(
    `/api/school/student?userId=${encodeURIComponent(userId)}`,
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to load class");
  return data as StudentClassDashboard;
}
