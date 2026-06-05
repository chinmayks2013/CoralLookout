import { challenges } from "@/lib/data/challenges";
import { migrateState } from "./migrate";
import { safeNumber } from "./numbers";
import { DEFAULT_STATE, type PlatformAction, type PlatformState } from "./types";

function ensureUserId(state: PlatformState): PlatformState {
  if (state.userId) return state;
  return { ...state, userId: crypto.randomUUID() };
}

function addCorals(state: PlatformState, amount: number): PlatformState {
  return {
    ...state,
    corals: safeNumber(state.corals) + safeNumber(amount),
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(state: PlatformState): PlatformState {
  const today = todayISO();
  if (state.lastActiveDate === today) return state;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const streak =
    state.lastActiveDate === yesterdayStr ? state.streak + 1 : 1;

  return { ...state, streak, lastActiveDate: today };
}

function addPoints(state: PlatformState, amount: number): PlatformState {
  return {
    ...state,
    points: safeNumber(state.points) + safeNumber(amount),
  };
}

function getAutoProgress(state: PlatformState, id: string): number {
  switch (id) {
    case "c1":
      return Math.min(state.scans.length, 5);
    case "c5":
      return Math.min(state.completedLessons.length, 3);
    case "c2":
      return state.cleanupLogged ? 1 : 0;
    case "c3":
      return state.awarenessPosted ? 1 : 0;
    case "c4":
      return state.stemSubmitted ? 1 : 0;
    default:
      return state.challengeProgress[id] ?? 0;
  }
}

function awardChallengeCompletions(state: PlatformState): PlatformState {
  let next = state;
  for (const c of challenges) {
    const wasDone = getAutoProgress(state, c.id) >= c.total;
    const nowDone = getAutoProgress(next, c.id) >= c.total;
    if (!wasDone && nowDone) {
      next = addPoints(next, Math.floor(c.points / 2));
    }
  }
  return next;
}

export function platformReducer(
  state: PlatformState,
  action: PlatformAction
): PlatformState {
  switch (action.type) {
    case "HYDRATE":
      return migrateState(action.state);
    case "RESET":
      return { ...DEFAULT_STATE };
    case "ENSURE_USER_ID":
      return ensureUserId(state);
    case "REGISTER": {
      const profile = {
        ...action.profile,
        joinedAt:
          action.profile.joinedAt ??
          state.profile?.joinedAt ??
          new Date().toISOString(),
      };
      let next = ensureUserId(updateStreak({
        ...state,
        profile,
        ...(action.userId && !state.userId ? { userId: action.userId } : {}),
      }));
      if (!state.profile) {
        next = addPoints(next, 25);
        next = addCorals(next, 50);
      }
      return next;
    }
    case "ADD_CORALS":
      return addCorals(state, action.amount);
    case "SPEND_CORALS":
      return {
        ...state,
        corals: Math.max(0, safeNumber(state.corals) - safeNumber(action.amount)),
      };
    case "RECORD_COMMENT":
      return addCorals(
        { ...state, commentsMade: safeNumber(state.commentsMade) + 1 },
        2
      );
    case "RECORD_DONATION": {
      const amount = safeNumber(action.amount);
      return {
        ...state,
        coralsDonated: safeNumber(state.coralsDonated) + amount,
        corals: Math.max(0, safeNumber(state.corals) - amount),
      };
    }
    case "RECEIVE_DONATION": {
      const amount = safeNumber(action.amount);
      return addCorals(
        { ...state, coralsReceived: safeNumber(state.coralsReceived) + amount },
        amount
      );
    }
    case "SYNC_CORALS_RECEIVED": {
      const total = safeNumber(action.total);
      const received = safeNumber(state.coralsReceived);
      const delta = total - received;
      if (delta <= 0) return { ...state, coralsReceived: total };
      return addCorals({ ...state, coralsReceived: total }, delta);
    }
    case "RECORD_SCAN": {
      let next = ensureUserId(state);
      const scan = {
        id: action.scanId,
        timestamp: new Date().toISOString(),
        health: action.result.health,
        label: action.result.label,
        confidence: action.result.confidence,
        locationName: action.location.locationName,
        lat: action.location.lat,
        lng: action.location.lng,
      };
      next = updateStreak({
        ...next,
        scans: [...next.scans, scan],
      });
      next = addPoints(next, 50);
      return awardChallengeCompletions(next);
    }
    case "COMPLETE_LESSON": {
      if (state.completedLessons.includes(action.lessonId)) return state;
      let next = updateStreak({
        ...state,
        completedLessons: [...state.completedLessons, action.lessonId],
      });
      next = addPoints(next, 100);
      return awardChallengeCompletions(next);
    }
    case "MARK_AWARENESS": {
      if (state.awarenessPosted) return state;
      let next = updateStreak({ ...state, awarenessPosted: true });
      next = addPoints(next, 150);
      return awardChallengeCompletions(next);
    }
    case "MARK_CLEANUP": {
      if (state.cleanupLogged) return state;
      let next = updateStreak({ ...state, cleanupLogged: true });
      next = addPoints(next, 400);
      return awardChallengeCompletions(next);
    }
    case "MARK_STEM": {
      if (state.stemSubmitted) return state;
      let next = updateStreak({ ...state, stemSubmitted: true });
      next = addPoints(next, 500);
      return awardChallengeCompletions(next);
    }
    case "SET_SCHOOL_CHAPTER":
      return {
        ...state,
        schoolChapterId: action.chapterId,
        schoolChapterRole: action.role,
      };
    case "CLEAR_SCHOOL_CHAPTER":
      return {
        ...state,
        schoolChapterId: undefined,
        schoolChapterRole: undefined,
      };
    default:
      return state;
  }
}
