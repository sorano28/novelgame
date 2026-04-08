let scenarioCache = null;

export async function loadScenario() {
  if (scenarioCache) {
    return scenarioCache;
  }
  const response = await fetch("./data/scenario.json");
  if (!response.ok) {
    throw new Error(`シナリオの読み込みに失敗しました: ${response.status}`);
  }
  scenarioCache = await response.json();
  return scenarioCache;
}

export function getNode(scenario, sceneId) {
  return scenario.nodes[sceneId] ?? null;
}
