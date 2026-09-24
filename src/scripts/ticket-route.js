// The route verb. A person edits the steps ahead of the pointer, and every
// leaf the ticket already reached stands as it stood. The verb takes the whole
// route as JSON, checks it with `aheadOnly`, and answers JSON on both roads.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]

import { entriesIn, readNote } from "../../.claude/skills/level0/lib/schema.js";
import { reRouted } from "../../.claude/skills/level0/lib/schema-mint.js";

const FLAG = "--steps=";

// The leaves a ticket reached: each one at or before the pointer, and each one the record names. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function reachedOf(front) {
  const step = String(front?.step ?? "").trim();
  const old = entriesIn(front?.steps, "steps");
  const at = old.findIndex((one) => one.path === step);
  const reached = new Set(
    old.filter((one, i) => one.leaf && at >= 0 && i <= at).map((one) => one.path),
  );
  for (const one of [front?.record ?? []].flat()) {
    if (one?.step) reached.add(String(one.step));
  }
  return reached;
}

// A route passes where it opens on the reached leaves, in their order and as they stood, and each phase holding one keeps its fields. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
export function aheadOnly(front, steps) {
  const pointer = String(front?.step ?? "").trim();
  const fresh = entriesIn(steps, "steps");
  if (pointer && !fresh.some((one) => one.leaf && one.path === pointer)) {
    return {
      why: `The route holds no ${pointer}, where the pointer stands. Keep the pointer's leaf.`,
      at: pointer,
    };
  }

  const reached = reachedOf(front);
  const old = entriesIn(front?.steps, "steps");
  const held = old.filter((one) => one.leaf && reached.has(one.path));
  const leaves = fresh.filter((one) => one.leaf);
  for (const [i, one] of held.entries()) {
    const got = leaves[i];
    if (got?.path === one.path && same(got.said, one.said)) continue;
    return {
      why: `${one.path} stands reached, so the route opens on it as it stood. Edit the steps past the pointer.`,
      at: one.path,
    };
  }

  const byPath = new Map(fresh.map((one) => [one.path, one]));
  for (const one of old.filter((it) => !it.leaf)) {
    if (!held.some((leaf) => leaf.path.startsWith(`${one.path}/`))) continue;
    const got = byPath.get(one.path);
    if (got && same(fieldsOf(got.said), fieldsOf(one.said))) continue;
    return {
      why: `${one.path} holds a reached leaf, so it keeps every field but steps.`,
      at: one.path,
    };
  }
  return { steps };
}

// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
export function routed(it, at, argv, schema) {
  const flag = (argv ?? []).find((one) => one.startsWith(FLAG));
  const steps = listIn(flag ? flag.slice(FLAG.length) : "");
  if (!steps) {
    return answer(1, {
      refused: `ticket route takes the whole route as a JSON list: ${FLAG}<json>.`,
      at: "",
    });
  }
  const text = it.disk.read(at.path);
  const front = readNote(text).front.said ?? {};
  const said = aheadOnly(front, steps);
  if (said.why) return answer(1, { refused: said.why, at: said.at });

  it.disk.write(at.path, reRouted(text, schema, said.steps));
  return answer(0, { ticket: at.said, step: String(front.step ?? ""), steps: said.steps });
}

function listIn(said) {
  try {
    const out = JSON.parse(said);
    return Array.isArray(out) ? out : null;
  } catch {
    return null;
  }
}

function answer(code, said) {
  console.log(JSON.stringify(said));
  return code;
}

function fieldsOf(said) {
  const { steps: _steps, ...rest } = said ?? {};
  return rest;
}

function same(a, b) {
  return canonical(a) === canonical(b);
}

function canonical(said) {
  if (Array.isArray(said)) return `[${said.map(canonical).join(",")}]`;
  if (said && typeof said === "object") {
    const keys = Object.keys(said).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonical(said[key])}`).join(",")}}`;
  }
  return JSON.stringify(said ?? null);
}
