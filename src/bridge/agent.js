// The Agent door. A call waiting on its helper holds the turn, so the door
// refuses it and names the background road. A call naming no model of the
// tiers refuses too, so every spawn weighs the work it hands.
// [[spec/design_output/level0#an-agent-call-runs-behind]]

import { asks } from "./config.js";

export const SAYS = [
  "This Agent call carries run_in_background: false, and the turn waits on the helper while the owner waits on you.",
  "Call it again with run_in_background: true, and read its hand-back when it lands.",
].join(" ");

// The tiers, lightest first, each with the work it takes. The config names the model of each. [[spec/design_output/level0#a-spawn-names-its-tier]]
export const TIERS = [
  { tier: "find", work: "find, list, read and report: work you check by looking" },
  {
    tier: "change",
    work: "a scoped change in one to three files with its test, or a review against a list",
  },
  {
    tier: "decide",
    work: "a design, a cause nobody knows, a change across modules, or a verdict the owner reads",
  },
];

// A helper's own Agent call meets the same door. [[spec/design_output/level0#a-helper-ends-no-turn]]
export function onAgent(e, box) {
  if (e?.run_in_background === false) {
    box.log.say("debug", "gate", "refused an Agent call waiting on its helper", {
      tool: String(e?.tool ?? ""),
    });
    return { result: { deny: SAYS } };
  }
  const tiers = tiersOf(box);
  if (!tiers.length) return { pass: true };
  const model = String(e?.model ?? "").trim();
  if (tiers.some((one) => one.model === model)) return { pass: true };
  box.log.say("debug", "gate", `refused an Agent call naming model ${model || "none"}`, {
    tool: String(e?.tool ?? ""),
  });
  const named = model ? `names model ${model}, a model of no tier` : "names no model";
  return { result: { deny: `This Agent call ${named}. ${tiersText(box)}` } };
}

// The tiers the config names a model for. A tree whose config names none keeps the door off. [[spec/design_output/level0#a-spawn-names-its-tier]]
export function tiersOf(box) {
  const held = [];
  for (const one of TIERS) {
    let model = "";
    try {
      model = String(asks(box, `helper.${one.tier}`) ?? "").trim();
    } catch {
      return [];
    }
    if (model) held.push({ ...one, model });
  }
  return held;
}

// The line the tools block carries and the refusal repeats. [[spec/design_output/level0#a-spawn-names-its-tier]]
export function tiersText(box) {
  const tiers = tiersOf(box);
  if (!tiers.length) return "";
  const rows = tiers.map((one) => `${one.tier} takes \`${one.model}\`: ${one.work}.`);
  return [
    "Every `Agent` call names `model` by the tier of the work it hands.",
    ...rows,
    "Where you doubt, take the next tier up.",
  ].join(" ");
}
