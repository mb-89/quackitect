// The emitter. A process file is data, and its drawing derives from it. This
// reads a route, and a record where a ticket carries one, into a graph. It
// answers a graph and no picture, so the editor holds every colour and this
// holds none.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]

import {
  entriesIn,
  entryNamed,
  readNote,
  readYaml,
  sectionAt,
} from "../../.claude/skills/level0/lib/schema.js";
import { reachedOf } from "./ticket-route.js";

export const PHASE = "phase";
export const LEAF = "leaf";
export const PASS = "pass";
export const FAIL = "fail";
export const HOLDS = "holds";

// A note's sections give each node the chapter it writes under, and a process hands none. [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
export function graphOf(front, sections = []) {
  const said = front ?? {};
  const walk = entriesIn(said.steps, "steps");
  const record = recordOf(said.record);
  const reached = reachedOf(said);
  return {
    nodes: walk.map((one) =>
      placed(nodeOf(one, said, record, reached), sections),
    ),
    edges: [...holdEdges(walk), ...passEdges(walk), ...failEdges(walk)],
  };
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function graphIn(text) {
  const said = String(text ?? "");
  if (!said.startsWith("---")) return graphOf(readYaml(said));
  const note = readNote(said);
  return graphOf(note.front.said ?? {}, note.sections);
}

// [[spec/design_input/the-editor-draws-the-ticket#the-engine-answers-the-editor]]
function placed(node, sections) {
  const at = sectionAt(sections, node.id);
  if (at < 0) return node;
  const one = sections[at];
  return { ...node, chapter: `${"#".repeat(one.level)} ${one.header}`, line: one.line };
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function nodeOf(one, front, record, reached) {
  const said = one.said ?? {};
  const held = record.get(one.path) ?? {};
  const node = {
    id: one.path,
    name: one.name,
    kind: one.leaf ? LEAF : PHASE,
    parent: one.parent,
  };
  if (said.does) node.does = String(said.does);
  if (said.when) {
    node.when = String(said.when);
    node.dotted = true;
  }
  if (String(said.by ?? "") === "person") node.person = true;
  if (one.path === String(front.step ?? "")) node.at = true;
  if (held.skipped) {
    node.skipped = true;
    node.why = String(held.why ?? "");
  }
  if (Number(held.returns) > 0) node.returns = Number(held.returns);
  if (holdsReached(one.path, reached)) node.reached = true;
  return node;
}

// A leaf the ticket reached, or a phase holding one, stands as it stood under `ticket route`. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
function holdsReached(path, reached) {
  for (const one of reached) if (one === path || one.startsWith(`${path}/`)) return true;
  return false;
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function holdEdges(walk) {
  return walk
    .filter((one) => one.parent)
    .map((one) => ({ from: one.parent, to: one.path, kind: HOLDS, label: HOLDS }));
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function passEdges(walk) {
  const out = [];
  for (const [at, one] of walk.entries()) {
    const next = walk.slice(at + 1).find((it) => it.parent === one.parent);
    if (next) out.push({ from: one.path, to: next.path, kind: PASS, label: PASS });
  }
  return out;
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function failEdges(walk) {
  const out = [];
  for (const one of walk) {
    const said = String(one.said?.on_fail ?? "").trim();
    if (!said) continue;
    const back = entryNamed(walk, said, one);
    if (!back) continue;
    out.push({ from: one.path, to: back.path, kind: FAIL, label: FAIL });
  }
  return out;
}

function recordOf(said) {
  return new Map(
    [said ?? []]
      .flat()
      .filter((one) => one?.step)
      .map((one) => [String(one.step), one]),
  );
}
