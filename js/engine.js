import { playSe } from "./audio.js";
import { getNode } from "./scenario-loader.js";
import { applyEffects, getState, markEnding, pushBacklog, setSeen, toggleSkip } from "./state.js";
import {
  hideChoices,
  renderChoices,
  setBackground,
  setNextVisible,
  setSpeakerText,
  setTypingText,
  setSkipState,
  showEnding,
} from "./ui.js";

function evalCondition(expr, flags) {
  try {
    return Function("flags", `return (${expr});`)(flags);
  } catch {
    return false;
  }
}

function resolveEnding(scenario, selected) {
  const flags = getState().flags;
  if (selected === "kill") {
    return flags.blameOther >= 3 && flags.accept >= 2 ? "end1_kill" : "end4_fail";
  }
  if (selected === "together") {
    return flags.like >= 4 ? "end2_together" : "end4_fail";
  }
  if (selected === "world") {
    return flags.like <= 2 && flags.trust >= 3 ? "end3_world" : "end4_fail";
  }
  if (selected === "save") {
    return flags.accept >= 3 ? "end3_world" : "end4_fail";
  }
  if (selected === "suicide") {
    return "end5_suicide";
  }
  return scenario.meta.fallbackEnding;
}

export async function runNode(scenario, sceneId, onContinue) {
  const state = getState();
  const node = getNode(scenario, sceneId);
  if (!node) {
    throw new Error(`sceneIdが見つかりません: ${sceneId}`);
  }

  state.currentSceneId = sceneId;
  setSeen(sceneId);
  hideChoices();
  setNextVisible(false);

  if (node.background) {
    setBackground(node.background);
  }

  if (node.type === "dialogue") {
    if (node.effects) {
      applyEffects(node.effects);
    }
    typeText(node.speaker || "", replaceName(node.text, state.playerName), state.settings.seVolume, () => {
      pushBacklog(`${node.speaker || ""} ${replaceName(node.text, state.playerName)}`.trim());
      if (state.skipMode) {
        setTimeout(() => onContinue(node.next), 120);
      } else {
        setNextVisible(true);
        state.typing = { complete: true, next: node.next };
      }
    });
    return;
  }

  if (node.type === "choice") {
    if (state.skipMode) {
      toggleSkip(false);
      setSkipState(false);
    }
    setSpeakerText("", node.question);
    renderChoices(node.options, (option) => {
      playSe("decide", state.settings.seVolume);
      applyEffects(option.effects);
      onContinue(option.next);
    });
    return;
  }

  if (node.type === "branch") {
    const next = node.conditions.find((rule) => evalCondition(rule.if, state.flags))?.next ?? node.defaultNext;
    onContinue(next);
    return;
  }

  if (node.type === "endingChoice") {
    if (state.skipMode) {
      toggleSkip(false);
      setSkipState(false);
    }
    const options = node.options.filter((opt) => !opt.requires || evalCondition(opt.requires, state.flags));
    setSpeakerText("", node.question);
    renderChoices(options, (opt) => {
      const endingNodeId = resolveEnding(scenario, opt.select);
      onContinue(endingNodeId);
    });
    return;
  }

  if (node.type === "ending") {
    markEnding(node.id);
    showEnding(node.title, replaceName(node.text, state.playerName));
  }
}

export function handleAdvance(onContinue) {
  const state = getState();
  if (!state.typing) {
    return;
  }
  if (!state.typing.complete) {
    state.typing.completeInstant();
    return;
  }
  if (state.typing.next) {
    const next = state.typing.next;
    state.typing = null;
    onContinue(next);
  }
}

function replaceName(text, name) {
  return text.replaceAll("{name}", name || "あなた");
}

function typeText(speaker, text, volume, done) {
  const state = getState();
  setSpeakerText(speaker, "");
  let index = 0;
  let displayed = "";
  let timer = null;

  const tick = () => {
    displayed += text[index] ?? "";
    setTypingText(displayed);
    index += 1;
    if (index < text.length) {
      timer = setTimeout(tick, 23);
    } else {
      state.typing = null;
      done();
    }
  };

  state.typing = {
    complete: false,
    next: null,
    completeInstant: () => {
      if (timer) {
        clearTimeout(timer);
      }
      setTypingText(text);
      state.typing = null;
      done();
    },
  };

  playSe("click", volume);
  tick();
}
