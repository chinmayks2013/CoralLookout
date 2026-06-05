import { migrateState } from "./migrate";
import { DEFAULT_STATE, type PlatformState } from "./types";

const STORAGE_KEY = "coral-lookout-platform-v2";

export function loadState(): PlatformState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("coral-lookout-platform-v1");
      if (legacy) {
        const parsed = migrateState({
          ...DEFAULT_STATE,
          ...JSON.parse(legacy),
        });
        saveState(parsed);
        return parsed;
      }
      return DEFAULT_STATE;
    }
    return migrateState({ ...DEFAULT_STATE, ...JSON.parse(raw) });
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PlatformState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("coral-lookout-platform-v1");
}
