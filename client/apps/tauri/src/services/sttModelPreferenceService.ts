import {
  getWorkspaceStorageItem,
  setWorkspaceStorageItem,
} from "@/services/workspaceStorage";

export const defaultSttModelId = "parakeet-tdt-0.6b-v3";

const storageKey = "openbrief.stt-model";

/**
 * Preferred local transcription model id. Availability is resolved against
 * the platform catalog at use time, so an unsupported id falls back there.
 */
export function loadSttModelPreference(
  storage = browserLocalStorage(),
): string {
  try {
    return (
      getWorkspaceStorageItem(storageKey, storage)?.trim() || defaultSttModelId
    );
  } catch {
    return defaultSttModelId;
  }
}

export function saveSttModelPreference(
  modelId: string,
  storage = browserLocalStorage(),
): string {
  const trimmed = modelId.trim();
  if (!trimmed) return loadSttModelPreference(storage);

  try {
    setWorkspaceStorageItem(storageKey, trimmed, storage);
  } catch {
    // Storage unavailable; keep the in-memory selection.
  }
  return trimmed;
}

function browserLocalStorage() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}
