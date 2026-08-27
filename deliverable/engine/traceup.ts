// THE TRACE, WALKED UPWARD. What a thing derives from, and what that derives
// from, to the root.
//
// WHY IT EXISTS. A state that builds something owes the reading of what that
// thing traces to. Not the whole corpus and not one file somebody named: the
// chain above the artifact under the hand, computed rather than listed.
//
// see dsp-the-work-store.md#a-building-state-owes-its-own-trace
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readNode } from "./notes.ts";

/** THE UPWARD KEY EACH NODE TYPE OWES, from the trace schema's own direction:
 *  the newer artifact points at what it derives from. A type absent here is a
 *  root and owes nothing upward.
 *
 *  ONE COPY. `bin/record-inspect.ts` reads the same map from here rather than
 *  keeping its own, because two copies of a graph's shape diverge silently and
 *  only their disagreement is visible. */
export const UPWARD: Record<string, string[]> = {
  story: ["refines"],
  "use-case": ["refines"],
  requirement: ["refines"],
  function: ["satisfies"],
  element: ["implements"],
  interface: ["carries"],
  "design-spec": ["realizes"],
  "test-spec": ["verifies", "demonstrates"],
};

const TRACE = ["spec", "trace"];

/** Every id the corpus holds, mapped to the file that carries it.
 *
 *  THE FOLDER NAMES THE TYPE, which is what lets the upward keys be looked up
 *  without opening a file to ask what it is. */
function index(root: string): Map<string, { path: string; type: string }> {
  const out = new Map<string, { path: string; type: string }>();
  const base = join(root, ...TRACE);
  if (!existsSync(base)) return out;
  for (const type of readdirSync(base)) {
    const dir = join(base, type);
    let names: string[];
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith(".md")) continue;
      out.set(name.slice(0, -3), { path: join(...TRACE, type, name), type });
    }
  }
  return out;
}

/** THE IDS ONE NODE POINTS AT, read off its own frontmatter.
 *
 *  BOTH SHAPES ARE READ. A key may carry one id on its own line or a list
 *  beneath it, and a reader that knows only one of them silently drops half the
 *  graph. */
function pointsAt(text: string, keys: string[]): string[] {
  const out: string[] = [];
  for (const key of keys) {
    const inline = new RegExp(`^${key}:[ \\t]*([^\\s#][^\\n]*)$`, "m").exec(text);
    if (inline !== null) {
      const one = inline[1]
        .trim()
        .replace(/^["'[]|["'\]]$/g, "")
        .trim();
      if (one !== "" && one !== "none")
        out.push(
          ...one
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
        );
      continue;
    }
    const block = new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]*-[^\\n]*\\n?)+)`, "m").exec(text);
    if (block === null) continue;
    for (const line of block[1].split("\n")) {
      const item = /^[ \t]*-[ \t]*(.+)$/.exec(line);
      if (item === null) continue;
      const id = item[1]
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim();
      if (id !== "" && id !== "none") out.push(id);
    }
  }
  // A REFERENCE MAY BE WRITTEN AS A LINK, and the id is what the graph needs.
  return out.map((s) => s.replace(/^\[\[|\]\]$/g, "").trim()).filter((s) => s !== "");
}

/** EVERY NODE ABOVE THIS ONE, as root-relative paths, nearest first.
 *
 *  THE START IS NOT INCLUDED. A state builds the thing at the bottom; what it
 *  owes reading of is everything the thing rests on.
 *
 *  A CYCLE CANNOT HANG IT. Each id is visited once, so a corpus that points
 *  back at itself costs one extra step rather than forever.
 *
 *  AN ID THAT RESOLVES TO NOTHING IS SKIPPED IN SILENCE HERE. A dangling
 *  reference is a real defect and the corpus sweep is what reports it; making
 *  the reading demand throw would block a walk over somebody else's typo. */
export function upwardFrom(root: string, startId: string): string[] {
  const nodes = index(root);
  if (!nodes.has(startId)) return [];
  const seen = new Set<string>([startId]);
  const queue = [startId];
  const out: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (id === undefined) continue;
    const at = nodes.get(id);
    if (at === undefined) continue;
    const keys = UPWARD[at.type];
    if (keys === undefined) continue;
    for (const next of pointsAt(readNode(join(root, at.path)), keys)) {
      if (seen.has(next)) continue;
      seen.add(next);
      const to = nodes.get(next);
      if (to === undefined) continue;
      out.push(to.path);
      queue.push(next);
    }
  }
  return out;
}

/** THE TRACE NODE A STATE BUILDS, where the corpus carries one.
 *
 *  THE STEP ID IS THE DESIGN SPEC'S NAME. A build chunk called
 *  `the-work-store` builds `dsp-the-work-store`, and that convention is what
 *  lets the anchor be computed rather than authored twice.
 *
 *  NOTHING IS RETURNED WHERE NO SUCH NODE STANDS, so a state that builds no
 *  named artifact owes no chain and the demand is simply absent. */
export function anchorOf(root: string, stateId: string): string | undefined {
  const bare = stateId.slice(stateId.lastIndexOf("/") + 1);
  const id = `dsp-${bare}`;
  return existsSync(join(root, ...TRACE, "design-spec", `${id}.md`)) ? id : undefined;
}
