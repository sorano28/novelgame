import { DEFAULT_SETTINGS, SAVE_SLOT_COUNT, STORAGE_KEYS } from "./constants.js";

function parse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export function isStorageAvailable() {
  try {
    localStorage.setItem("__test", "1");
    localStorage.removeItem("__test");
    return true;
  } catch {
    return false;
  }
}

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...parse(localStorage.getItem(STORAGE_KEYS.settings), {}) };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function saveGame(slotId, payload) {
  localStorage.setItem(`${STORAGE_KEYS.savePrefix}${slotId}`, JSON.stringify(payload));
}

export function loadGame(slotId) {
  return parse(localStorage.getItem(`${STORAGE_KEYS.savePrefix}${slotId}`), null);
}

export function getAllSlots() {
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, i) => {
    const slotId = i + 1;
    const data = loadGame(slotId);
    return { slotId, data };
  });
}

export function loadSeen() {
  return new Set(parse(localStorage.getItem(STORAGE_KEYS.seen), []));
}

export function saveSeen(seenSet) {
  localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify(Array.from(seenSet)));
}

export function loadGallery() {
  return new Set(parse(localStorage.getItem(STORAGE_KEYS.gallery), []));
}

export function saveGallery(endingsSet) {
  localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(Array.from(endingsSet)));
}
