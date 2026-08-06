// A REMEDY IS AN ASSERTION, AND ASSERTIONS GET PROVED.
//
// Every typed refusal carries a remedy: "this call exists, make it." That is
// a claim about the tool surface, written by hand at the throw site, and
// nothing executes it. A remedy nobody ever ran is prose that happens to live
// in a .ts file — it rots exactly like guidance rots, and the reader finds out
// at the worst moment, holding a refusal whose fix does not work.
//
// Two shipped that way: `se_pull {to: "retro"}`, and a remedy naming a tool
// called se_state that has never existed. The walk is aimed by taking an
// offered door, never by naming a target, so the first could not exist by
// design and the second could not exist at all.
//
// THIS IS THE CHEAP CHECK, so it is a check rather than a register entry. The
// remedy names a tool and its arguments; the tool declares its arguments in
// the same repo. Comparing them costs milliseconds and fires at write time.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(here, "..", "engine");

// THE TOLL RIDES EVERY TOOL. `update` is injected by the narration layer
// rather than declared per tool, so a per-tool schema read alone would call
// it unknown everywhere.
const UNIVERSAL = ["update"];

/** The text of an object literal starting at the `{` at `open`. */
function balanced(src: string, open: number): string {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return "";
}

/** Top-level keys of an object literal body, ignoring nested ones. */
function topKeys(body: string): string[] {
  const keys: string[] = [];
  let depth = 0;
  let atKey = true;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === "," && depth === 0) atKey = true;
    else if (depth === 0 && atKey && /[A-Za-z_]/.test(c)) {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*:/.exec(body.slice(i));
      if (m !== null) keys.push(m[1]);
      atKey = false;
    }
  }
  return keys;
}

function engineSources(): { file: string; src: string }[] {
  const out: { file: string; src: string }[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".ts")) out.push({ file: p, src: readFileSync(p, "utf8") });
    }
  };
  walk(ENGINE);
  return out;
}

/** Every tool the surface declares, with the arguments it accepts. */
function toolArgs(): Map<string, Set<string>> {
  const src = readFileSync(join(ENGINE, "tools.ts"), "utf8");
  const tools = new Map<string, Set<string>>();
  const nameRe = /name:\s*"(se_[a-z_]+)"/g;
  let m: RegExpExecArray | null = nameRe.exec(src);
  while (m !== null) {
    const props = src.indexOf("properties:", m.index);
    if (props !== -1) {
      const open = src.indexOf("{", props);
      // Stop if the next tool declaration starts before this properties block —
      // that tool takes no arguments of its own.
      const nextName = src.slice(m.index + 1).search(/name:\s*"se_[a-z_]+"/);
      const nextAt = nextName === -1 ? Number.POSITIVE_INFINITY : m.index + 1 + nextName;
      if (open !== -1 && open < nextAt) tools.set(m[1], new Set([...topKeys(balanced(src, open)), ...UNIVERSAL]));
      else tools.set(m[1], new Set(UNIVERSAL));
    }
    m = nameRe.exec(src);
  }
  return tools;
}

/** One remedy literal, reduced to the claim it makes. */
interface Claim {
  file: string;
  tool: string;
  args: string[];
}

function claims(): Claim[] {
  const out: Claim[] = [];
  for (const { file, src } of engineSources()) {
    const re = /remedy:\s*\{/g;
    let m: RegExpExecArray | null = re.exec(src);
    while (m !== null) {
      const body = balanced(src, re.lastIndex - 1);
      const tool = /tool:\s*"(se_[a-z_]+)"/.exec(body)?.[1];
      const argsAt = body.indexOf("args:");
      const open = argsAt === -1 ? -1 : body.indexOf("{", argsAt);
      if (tool !== undefined && open !== -1) out.push({ file, tool, args: topKeys(balanced(body, open)) });
      m = re.exec(src);
    }
  }
  return out;
}

test("the tool surface is readable and non-trivial", () => {
  const tools = toolArgs();
  assert.ok(tools.size > 10, `expected the real tool surface — parsed ${tools.size} tools`);
  assert.ok(tools.get("se_pull")?.has("form"), "se_pull takes form");
  assert.ok(tools.get("se_pull")?.has("escape"), "se_pull takes escape");
  assert.ok(!tools.get("se_pull")?.has("to"), "se_pull has never taken a target — the walk is aimed by an offered door");
});

test("every remedy names arguments its tool actually accepts", () => {
  const tools = toolArgs();
  const found = claims();
  const broken: string[] = [];

  for (const c of found) {
    const known = tools.get(c.tool);
    if (known === undefined) {
      broken.push(`${c.file}: remedy names unknown tool ${c.tool}`);
      continue;
    }
    for (const k of c.args) if (!known.has(k)) broken.push(`${c.file}: ${c.tool} has no argument "${k}"`);
  }

  // The red behind the green: a parser that finds nothing would pass silently.
  assert.ok(found.length > 20, `expected many remedies to check — found ${found.length}`);
  assert.deepEqual(broken, [], "a remedy that cannot be executed is a refusal with no way out");
});
