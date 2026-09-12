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
} from "../../.claude/skills/level0/lib/schema.js";

export const PHASE = "phase";
export const LEAF = "leaf";
export const PASS = "pass";
export const FAIL = "fail";
export const HOLDS = "holds";

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function graphOf(front) {
  const said = front ?? {};
  const walk = entriesIn(said.steps, "steps");
  const record = recordOf(said.record);
  return {
    nodes: walk.map((one) => nodeOf(one, said, record)),
    edges: [...holdEdges(walk), ...passEdges(walk), ...failEdges(walk)],
  };
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function graphIn(text) {
  const said = String(text ?? "");
  return graphOf(
    said.startsWith("---") ? (readNote(said).front.said ?? {}) : readYaml(said),
  );
}

// A node per phase and per leaf. A `when` draws it dotted, a person step marks
// it, and the record says where the ticket stands and what it skipped.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function nodeOf(one, front, record) {
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
  return node;
}

// A phase holds its steps, and the edge says so. Every edge carries a label.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function holdEdges(walk) {
  return walk
    .filter((one) => one.parent)
    .map((one) => ({ from: one.parent, to: one.path, kind: HOLDS, label: HOLDS }));
}

// A pass edge between neighbours, which are the siblings in their order.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function passEdges(walk) {
  const out = [];
  for (const [at, one] of walk.entries()) {
    const next = walk.slice(at + 1).find((it) => it.parent === one.parent);
    if (next) out.push({ from: one.path, to: next.path, kind: PASS, label: PASS });
  }
  return out;
}

// A fail edge back, from the step that fails to the step `on_fail` names.
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
