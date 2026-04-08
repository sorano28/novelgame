export const FLAG_KEYS = ["like", "accept", "blameSelf", "blameOther", "memory", "trust"];
export const INITIAL_FLAGS = Object.freeze({
  like: 0,
  accept: 0,
  blameSelf: 0,
  blameOther: 0,
  memory: 0,
  trust: 0,
});

export const SAVE_SLOT_COUNT = 12;
export const MAX_BACKLOG = 250;

export const STORAGE_KEYS = Object.freeze({
  settings: "novelgame_settings",
  seen: "novelgame_seen",
  gallery: "novelgame_gallery",
  savePrefix: "novelgame_save_",
});

export const DEFAULT_SETTINGS = Object.freeze({
  seVolume: 80,
  uiAnimation: true,
});
