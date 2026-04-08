import { DEFAULT_SETTINGS, INITIAL_FLAGS, MAX_BACKLOG } from "./constants.js";

const state = {
  currentSceneId: "chapter1_intro_01",
  playerName: "",
  playerGender: "",
  flags: structuredClone(INITIAL_FLAGS),
  history: [],
  seenNodes: new Set(),
  endingsReached: new Set(),
  settings: structuredClone(DEFAULT_SETTINGS),
  skipMode: false,
  typing: null,
};

export function getState() {
  return state;
}

export function resetGameState() {
  state.currentSceneId = "chapter1_intro_01";
  state.flags = structuredClone(INITIAL_FLAGS);
  state.history = [];
  state.seenNodes = new Set();
  state.skipMode = false;
}

export function setPlayerProfile(name, gender) {
  state.playerName = name;
  state.playerGender = gender;
}

export function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    if (key in state.flags) {
      state.flags[key] += Number(value) || 0;
    }
  });
}

export function pushBacklog(line) {
  state.history.push(line);
  if (state.history.length > MAX_BACKLOG) {
    state.history.splice(0, state.history.length - MAX_BACKLOG);
  }
}

export function setSeen(id) {
  state.seenNodes.add(id);
}

export function markEnding(endingId) {
  state.endingsReached.add(endingId);
}

export function toggleSkip(force) {
  state.skipMode = typeof force === "boolean" ? force : !state.skipMode;
  return state.skipMode;
}
