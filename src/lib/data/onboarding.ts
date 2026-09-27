export const TEACHER_CHECKLIST = [
  {
    id: "create-chapter",
    title: "Create your school chapter",
    href: "/teacher",
    detail: "Name your school and generate a join code.",
  },
  {
    id: "invite",
    title: "Invite students",
    href: "/teacher/join-guide",
    detail: "Print or share the join instructions page.",
  },
  {
    id: "first-assignment",
    title: "Create a first assignment",
    href: "/teacher#assignments",
    detail: "Try “Scan a reef image + pin location”.",
  },
] as const;

export const STUDENT_CHECKLIST = [
  {
    id: "join",
    title: "Join your class",
    href: "/class",
    detail: "Enter the join code from your teacher.",
  },
  {
    id: "scan",
    title: "Run your first scan",
    href: "/scanner",
    detail: "Upload a reef photo (file or drag from the web).",
  },
  {
    id: "pin",
    title: "Pin a location",
    href: "/scanner",
    detail: "Add GPS or place a pin before saving.",
  },
  {
    id: "gallery",
    title: "Share to the gallery (optional)",
    href: "/gallery",
    detail: "Confirm image rights, then publish for class credit.",
  },
] as const;
