import { SAVE_SLOT_COUNT } from "./constants.js";

const qs = (id) => document.getElementById(id);

const ui = {
  screens: {
    title: qs("title-screen"),
    game: qs("game-screen"),
    ending: qs("ending-screen"),
  },
  modals: {
    name: qs("name-modal"),
    gender: qs("gender-modal"),
    menu: qs("menu-overlay"),
    save: qs("save-modal"),
    load: qs("load-modal"),
    settings: qs("settings-modal"),
    backlog: qs("backlog-modal"),
  },
  bg: qs("background-layer"),
  speaker: qs("speaker"),
  text: qs("text"),
  choice: qs("choice-container"),
  next: qs("next-indicator"),
  skipBtn: document.querySelector('[data-action="toggle-skip"]'),
  endingTitle: qs("ending-title"),
  endingText: qs("ending-text"),
  saveSlots: qs("save-slots"),
  loadSlots: qs("load-slots"),
  volumeValue: qs("volume-value"),
  volumeSlider: qs("volume-slider"),
  backlogList: qs("backlog-list"),
  toast: qs("toast"),
  endings: qs("title-endings"),
};

export function switchScreen(kind) {
  Object.values(ui.screens).forEach((node) => node.classList.remove("active"));
  ui.screens[kind].classList.add("active");
}

export function closeAllModals() {
  Object.values(ui.modals).forEach((node) => node.classList.add("hidden"));
}

export function openModal(kind) {
  closeAllModals();
  ui.modals[kind].classList.remove("hidden");
}

export function setBackground(bg) {
  const preset = {
    "bg/ruins_awake.webp": "linear-gradient(135deg, #2b2f3e 0%, #0b0e1e 50%, #070811 100%)",
    "bg/city_ruin.webp": "linear-gradient(135deg, #384050 0%, #171d2d 55%, #0a0c17 100%)",
    "bg/station.webp": "linear-gradient(135deg, #4f5866 0%, #202838 58%, #0b0c13 100%)",
    "bg/lab.webp": "linear-gradient(135deg, #4d4f5d 0%, #1f2230 55%, #0b0d18 100%)",
    "bg/sea.webp": "linear-gradient(135deg, #5b6475 0%, #222d43 58%, #080a16 100%)",
    "bg/core.webp": "linear-gradient(135deg, #58424f 0%, #271926 52%, #06060d 100%)",
  };
  ui.bg.style.backgroundImage = preset[bg] ?? preset["bg/ruins_awake.webp"];
}

export function setSpeakerText(speaker, text) {
  ui.speaker.textContent = speaker || "";
  ui.text.textContent = text || "";
}

export function setTypingText(text) {
  ui.text.textContent = text;
}

export function setNextVisible(show) {
  ui.next.classList.toggle("show", !!show);
}

export function setSkipState(enabled) {
  ui.skipBtn.textContent = `スキップ:${enabled ? "ON" : "OFF"}`;
}

export function renderChoices(options, onPick) {
  ui.choice.classList.remove("hidden");
  ui.choice.innerHTML = "";
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = option.text;
    btn.addEventListener("click", () => onPick(option));
    ui.choice.appendChild(btn);
  });
}

export function hideChoices() {
  ui.choice.classList.add("hidden");
  ui.choice.innerHTML = "";
}

export function renderSlots(container, slots, onClick) {
  container.innerHTML = "";
  Array.from({ length: SAVE_SLOT_COUNT }, (_, idx) => idx + 1).forEach((id) => {
    const slot = slots.find((entry) => entry.slotId === id);
    const btn = document.createElement("button");
    btn.className = `slot ${slot?.data ? "" : "empty"}`;
    if (slot?.data) {
      const d = slot.data;
      btn.innerHTML = `#${id} ${d.timestamp}<br>${d.chapterTitle ?? "章情報なし"}<br>${d.sceneSummary ?? d.currentSceneId}`;
    } else {
      btn.textContent = `#${id} [空]`;
    }
    btn.addEventListener("click", () => onClick(id, slot?.data ?? null));
    container.appendChild(btn);
  });
}

export function syncSettings(volume) {
  ui.volumeSlider.value = String(volume);
  ui.volumeValue.textContent = String(volume);
}

export function renderBacklog(lines) {
  ui.backlogList.innerHTML = "";
  [...lines].reverse().forEach((line) => {
    const p = document.createElement("p");
    p.className = "backlog-item";
    p.textContent = line;
    ui.backlogList.appendChild(p);
  });
}

export function showEnding(title, text) {
  ui.endingTitle.textContent = title;
  ui.endingText.textContent = text;
  switchScreen("ending");
}

export function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.remove("hidden");
  setTimeout(() => ui.toast.classList.add("hidden"), 1800);
}

export function setTitleEndingCount(count) {
  ui.endings.textContent = `到達エンド: ${count} / 5`;
}
