// A box over fake doors for one shared hold case: its config under the method
// root, its cloud flag, and every event leading in driven through decide. The
// answer to the case's call reads as the word the Go door's OldDecisionOf reads.
// [[spec/tickets/cage-call-holds-port]]

import { boxOf, decide } from "../../src/bridge/server.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const ROOT = "/tree";
const TRACKED = "spec/config/level0.json";

// The case's dotted keys, nested the way spec/config/level0.json holds them. [[spec/tickets/cage-call-holds-port]]
function nested(config) {
  const out = {};
  for (const [key, value] of Object.entries(config ?? {})) {
    const [section, leaf] = key.split(".");
    out[section] = { ...(out[section] ?? {}), [leaf]: value };
  }
  return out;
}

export function boxFor(one) {
  const box = boxOf(ROOT, ROOT, {
    disk: fakeDisk({ [`${ROOT}/${TRACKED}`]: JSON.stringify(nested(one.config)) }),
    clock: fakeClock(),
    log: fakeLog(),
    proc: fakeProc({}),
    env: {},
    index: { dead: () => "", fault: () => "", warm: () => ({ warmed: false }) },
    vale: { stands: () => false },
    biome: { stands: () => false },
  });
  box.cloud = Boolean(one.cloud);
  return box;
}

// The decision word the Go door's OldDecisionOf reads off an answer. [[spec/tickets/cage-tool-block-reads-refuse]]
export function decisionOf(said) {
  if (said?.needs) return "hold";
  if (said?.result?.deny !== undefined || said?.result?.block !== undefined)
    return "refuse";
  return "pass";
}

export async function answerOf(one) {
  const box = boxFor(one);
  for (const each of one.events) await decide(each, box);
  const said = await decide(one.call, box);
  return {
    decision: decisionOf(said),
    text: String(said?.result?.deny ?? said?.result?.block ?? ""),
  };
}
