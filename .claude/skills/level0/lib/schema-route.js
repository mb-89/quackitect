// The route checks: the keywords naming a step, the slots a route
// feeds, and the hash the drawing carries.
// [[spec/design_output/schema#keywords-that-name-a-step]]

import { hashText } from "./hash.js";
import { fault, show } from "./schema-fault.js";
import { readYaml } from "./schema-yaml.js";

// [[spec/design_output/schema#keywords-that-name-a-step]]
export function refersFaults(key, value, rule, held, at, line) {
  const earlier = rule["x-earlier"];
  const list = rule["x-names"] ?? earlier;
  if (!list) return [];

  const walk = entriesIn(held.root?.[list], list);
  const holder = holderOf(walk, at);
  const out = [];

  for (const one of [value].flat()) {
    const said = wanted(String(one ?? "").trim(), rule);
    if (said === null) continue;
    const found = entryNamed(walk, said, holder);
    if (!found) {
      if (fieldBefore(walk, holder, said, rule)) continue;
      out.push(
        fault(
          key,
          held.where,
          line,
          `${key} names ${show(said)}, and ${list} holds ${names(walk) || "no entry"}.`,
        ),
      );
      continue;
    }
    if (rule["x-leaf"] && !found.leaf) {
      out.push(
        fault(
          key,
          held.where,
          line,
          `${key} names a leaf, and ${found.path} holds steps.`,
        ),
      );
    }
    if (earlier && holder && walk.indexOf(found) >= walk.indexOf(holder)) {
      if (fieldBefore(walk, holder, said, rule)) continue;
      out.push(
        fault(
          key,
          held.where,
          line,
          `${key} names ${found.path}, and a ${held.kind} names a step standing before ${holder.path}.`,
        ),
      );
    }
  }
  return out;
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
function fieldBefore(walk, holder, said, rule) {
  const list = rule["x-fields"];
  if (!list || !holder) return false;
  const until = walk.indexOf(holder);
  return walk.some(
    (one, at) =>
      at < until &&
      [one.said?.[list] ?? []].flat().some((field) => field?.name === said),
  );
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
export function wanted(said, rule) {
  if (!said) return null;
  if ([rule["x-words"] ?? []].flat().includes(said)) return null;
  const prefix = rule["x-prefix"];
  if (!prefix) return said;
  return said.startsWith(`${prefix} `) ? said.slice(prefix.length + 1).trim() : said;
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
export function entriesIn(list, base, parent = "", out = []) {
  const held = [list ?? []].flat();
  for (let i = 0; i < held.length; i++) {
    const one = held[i];
    if (!one || typeof one !== "object") continue;
    const name = String(one.name ?? "");
    const path = parent ? `${parent}/${name}` : name;
    const at = `${base}[${i}]`;
    const under = [one.steps ?? []].flat().filter((it) => it && typeof it === "object");
    out.push({ name, path, parent, at, said: one, leaf: under.length === 0 });
    if (under.length) entriesIn(one.steps, `${at}.steps`, path, out);
  }
  return out;
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
function holderOf(walk, at) {
  let out = null;
  for (const one of walk) {
    if (!String(at).startsWith(`${one.at}.`)) continue;
    if (!out || one.at.length > out.at.length) out = one;
  }
  return out;
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
export function entryNamed(walk, said, holder) {
  const want = String(said ?? "").trim();
  if (!want) return null;
  if (want.includes("/")) return walk.find((one) => one.path === want) ?? null;
  const parent = holder ? holder.parent : "";
  const sibling = walk.find((one) => one.parent === parent && one.name === want);
  if (sibling) return sibling;
  return walk.find((one) => one.parent === "" && one.name === want) ?? null;
}

export function names(walk) {
  return walk.map((one) => one.path).join(", ");
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
export const OUTSIDE = ["ask", "diff"];

const ENGINE_READS = ["command", "verdict"];

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
export function slotFaults(said, where, lines) {
  const walk = entriesIn(said?.steps, "steps");
  if (!walk.length) return [];
  const held = { where, lines: lines ?? {} };
  const readers = walk.map((one, at) => ({
    one,
    at,
    tokens: inputOf(one.said),
  }));
  return [...unfedIn(walk, readers, held), ...orphansIn(walk, readers, held)];
}

function slotLine(held, at) {
  return held.lines?.[at] ?? 1;
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function unfedIn(walk, readers, held) {
  const out = [];
  for (const { one, at, tokens } of readers) {
    for (const token of tokens) {
      if (OUTSIDE.includes(token)) continue;
      if (feedsIt(walk, one, at, token)) continue;
      out.push(
        fault(
          "Input",
          held.where,
          slotLine(held, `${one.at}.input`),
          `${one.path} reads ${token}, and no step before it holds that. A step reads ${OUTSIDE.join(", ")}, an earlier step, or an earlier field.`,
        ),
      );
    }
  }
  return out;
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function feedsIt(walk, holder, at, token) {
  const step = entryNamed(walk, token, holder);
  if (step && walk.indexOf(step) < at) return true;
  return walk.some(
    (one, i) =>
      i < at &&
      [one.said?.evidence ?? []].flat().some((field) => field?.name === token),
  );
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function orphansIn(walk, readers, held) {
  const out = [];
  for (const [at, one] of walk.entries()) {
    if (!one.leaf) continue;
    const fields = [one.said?.evidence ?? []].flat();
    for (const [i, field] of fields.entries()) {
      if (!field?.name) continue;
      if (ENGINE_READS.includes(String(field.form))) continue;
      if (handedOn(walk, one)) continue;
      if (readIn(walk, readers, at, one, field.name)) continue;
      out.push(
        fault(
          "Output",
          held.where,
          slotLine(held, `${one.at}.evidence[${i}].name`),
          `${one.path} writes ${field.name}, and nothing reads it. Name it under a later step's input, or say who takes the output under to.`,
        ),
      );
    }
  }
  return out;
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function handedOn(walk, leaf) {
  let at = leaf;
  while (at) {
    if (String(at.said?.to ?? "").trim()) return true;
    at = walk.find((one) => one.path === at.parent) ?? null;
  }
  return false;
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function readIn(walk, readers, at, leaf, field) {
  const mine = new Set(ancestryOf(leaf));
  return readers.some(({ one, at: seat, tokens }) => {
    if (seat <= at || mine.has(one.path)) return false;
    return tokens.some(
      (token) => token === field || mine.has(entryNamed(walk, token, one)?.path ?? ""),
    );
  });
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
function ancestryOf(leaf) {
  const out = [leaf.path];
  const parts = String(leaf.path).split("/");
  while (parts.length > 1) {
    parts.pop();
    out.push(parts.join("/"));
  }
  return out;
}

function inputOf(said) {
  return [said?.input ?? []]
    .flat()
    .map((one) => String(one ?? "").trim())
    .filter(Boolean);
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function canonicalOf(said) {
  if (Array.isArray(said)) return said.map(canonicalOf);
  if (said && typeof said === "object") {
    const out = {};
    for (const key of Object.keys(said).sort()) out[key] = canonicalOf(said[key]);
    return out;
  }
  return said === undefined || said === null ? "" : String(said);
}

// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
export function hashOf(said) {
  return hashText(JSON.stringify(canonicalOf(said)));
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function processHash(said) {
  const held = typeof said === "string" ? readYaml(said) : (said ?? {});
  return hashOf({ ask: held.ask ?? [], steps: held.steps ?? [] });
}
