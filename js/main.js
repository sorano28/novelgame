import { playSe } from "./audio.js";
import { runNode, handleAdvance } from "./engine.js";
import { loadScenario } from "./scenario-loader.js";
import { getState, resetGameState, setPlayerProfile, toggleSkip } from "./state.js";
import {
  getAllSlots,
  isStorageAvailable,
  loadGallery,
  loadSeen,
  loadSettings,
  saveGallery,
  saveGame,
  saveSeen,
  saveSettings,
} from "./storage.js";
import {
  closeAllModals,
  openModal,
  renderBacklog,
  renderSlots,
  setSkipState,
  setTitleEndingCount,
  showToast,
  switchScreen,
  syncSettings,
} from "./ui.js";

let scenario;

async function boot() {
  if (!isStorageAvailable()) {
    alert("LocalStorage が利用できないため、保存機能は使えません。");
  }

  scenario = await loadScenario();
  const state = getState();
  state.settings = loadSettings();
  state.seenNodes = loadSeen();
  state.endingsReached = loadGallery();

  syncSettings(state.settings.seVolume);
  setTitleEndingCount(state.endingsReached.size);
  bindEvents();
  switchScreen("title");
}

function bindEvents() {
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.dataset.gender) {
      onSelectGender(target.dataset.gender);
      return;
    }

    const action = target.dataset.action;
    if (!action) {
      return;
    }

    const state = getState();
    if (action !== "toggle-skip") {
      playSe("menu", state.settings.seVolume);
    }

    if (action === "new-game") {
      if (confirm("新しくはじめます。現在の進行は保存してから続けてください。")) {
        openModal("name");
      }
    } else if (action === "confirm-name") {
      const nameInput = document.getElementById("name-input");
      const name = nameInput.value.trim() || "そらの";
      setPlayerProfile(name, "");
      openModal("gender");
    } else if (action === "open-settings") {
      syncSettings(getState().settings.seVolume);
      openModal("settings");
    } else if (action === "open-save") {
      renderSaveSlots();
      openModal("save");
    } else if (action === "open-load") {
      renderLoadSlots();
      openModal("load");
    } else if (action === "open-backlog") {
      renderBacklog(getState().history);
      openModal("backlog");
    } else if (action === "close-modal") {
      closeAllModals();
    } else if (action === "toggle-skip") {
      const value = toggleSkip();
      setSkipState(value);
    } else if (action === "return-title") {
      returnTitle();
    }
  });

  document.getElementById("menu-toggle").addEventListener("click", () => openModal("menu"));

  document.getElementById("volume-slider").addEventListener("input", (event) => {
    const value = Number(event.target.value);
    const state = getState();
    state.settings.seVolume = value;
    syncSettings(value);
    saveSettings(state.settings);
    playSe("click", value);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["enter", " "].includes(key)) {
      advance();
    } else if (key === "escape") {
      openModal("menu");
    } else if (key === "control") {
      const value = toggleSkip();
      setSkipState(value);
    } else if (key === "s") {
      renderSaveSlots();
      openModal("save");
    } else if (key === "l") {
      renderLoadSlots();
      openModal("load");
    } else if (key === "b") {
      renderBacklog(getState().history);
      openModal("backlog");
    }
  });

  document.getElementById("game-screen").addEventListener("click", (event) => {
    if (event.target.closest("button")) {
      return;
    }
    advance();
  });

  document.getElementById("game-screen").addEventListener("contextmenu", (event) => {
    event.preventDefault();
    openModal("menu");
  });

  document.getElementById("game-screen").addEventListener("wheel", (event) => {
    if (event.deltaY < 0) {
      renderBacklog(getState().history);
      openModal("backlog");
    }
  });
}

function onSelectGender(gender) {
  const state = getState();
  setPlayerProfile(state.playerName || "そらの", gender);
  closeAllModals();
  switchScreen("game");
  resetGameState();
  setSkipState(false);
  goToScene("chapter1_intro_01");
}

function advance() {
  handleAdvance((nextId) => goToScene(nextId));
}

async function goToScene(sceneId) {
  try {
    await runNode(scenario, sceneId, (nextId) => goToScene(nextId));
  } catch (error) {
    console.error(error);
    alert("シーン遷移エラーが発生したため、タイトルへ戻ります。");
    returnTitle();
  }
}

function renderSaveSlots() {
  renderSlots(document.getElementById("save-slots"), getAllSlots(), (slotId) => {
    const state = getState();
    const node = scenario.nodes[state.currentSceneId] || {};
    saveGame(slotId, {
      slotId,
      timestamp: new Date().toISOString(),
      currentSceneId: state.currentSceneId,
      playerName: state.playerName,
      playerGender: state.playerGender,
      flags: state.flags,
      history: state.history,
      settingsSnapshot: { seVolume: state.settings.seVolume },
      chapterTitle: node.chapterTitle || "不明な章",
      sceneSummary: node.text?.slice(0, 32) || node.question || "",
    });
    showToast(`スロット ${slotId} に保存しました`);
    renderSaveSlots();
  });
}

function renderLoadSlots() {
  renderSlots(document.getElementById("load-slots"), getAllSlots(), (slotId, data) => {
    if (!data) {
      showToast("空のスロットです");
      return;
    }
    if (!confirm(`スロット ${slotId} をロードしますか？`)) {
      return;
    }
    const state = getState();
    state.currentSceneId = data.currentSceneId;
    state.playerName = data.playerName;
    state.playerGender = data.playerGender;
    state.flags = data.flags;
    state.history = data.history || [];
    state.settings.seVolume = data.settingsSnapshot?.seVolume ?? state.settings.seVolume;
    syncSettings(state.settings.seVolume);
    closeAllModals();
    switchScreen("game");
    goToScene(state.currentSceneId);
    showToast(`スロット ${slotId} をロードしました`);
  });
}

function returnTitle() {
  const state = getState();
  saveSeen(state.seenNodes);
  saveGallery(state.endingsReached);
  setTitleEndingCount(state.endingsReached.size);
  closeAllModals();
  switchScreen("title");
}

window.addEventListener("beforeunload", () => {
  const state = getState();
  saveSeen(state.seenNodes);
  saveGallery(state.endingsReached);
});

boot().catch((error) => {
  console.error(error);
  alert(`初期化に失敗しました: ${error.message}`);
});
