import {
  defaultSttModelId,
  loadSttModelPreference,
  saveSttModelPreference,
} from "@/services/sttModelPreferenceService";
import { describe, expect, it } from "vitest";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("sttModelPreferenceService", () => {
  it("defaults to Parakeet v3 when nothing is saved", () => {
    expect(loadSttModelPreference(createMemoryStorage())).toBe(
      defaultSttModelId,
    );
  });

  it("persists the selected model and ignores empty ids", () => {
    const storage = createMemoryStorage();

    expect(saveSttModelPreference(" whisper-small ", storage)).toBe(
      "whisper-small",
    );
    expect(saveSttModelPreference("", storage)).toBe("whisper-small");
    expect(loadSttModelPreference(storage)).toBe("whisper-small");
  });
});
