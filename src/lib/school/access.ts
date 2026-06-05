import { chapterHasPremiumAccess, subscriptionBlockedMessage } from "./config";
import { fetchChapterByTeacherId } from "./db";
import type { SchoolChapter } from "./types";

export async function requireTeacherChapterWithPremium(
  teacherUserId: string,
  chapterId: string
): Promise<SchoolChapter> {
  const chapter = await fetchChapterByTeacherId(teacherUserId);
  if (!chapter || chapter.id !== chapterId) {
    throw new Error("Chapter not found or access denied");
  }
  if (!chapterHasPremiumAccess(chapter)) {
    throw new Error(subscriptionBlockedMessage());
  }
  return chapter;
}
