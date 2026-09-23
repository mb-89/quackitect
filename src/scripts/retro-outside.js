// What a retro's collect copies from outside the tree: the transcripts and the
// memory the harness keeps under home, and the scratchpads under temp. Each
// source is a folder named off this tree's path, and a session run from a
// folder inside the tree names one of its own, so the match takes both.
// [[spec/guidance/retro/collect]]

const MEMORY = "memory";
// A repository's own store and a package folder carry no record of the work, and git keeps its objects read-only. [[spec/guidance/retro/collect]]
const STORES = [".git", "node_modules"];
// Where the harness keeps each source, under home or under temp. [[spec/guidance/retro/collect]]
const SOURCES = [
  { kind: "transcripts", base: "home", under: [".claude", "projects"] },
  { kind: "scratch", base: "temp", under: ["claude"] },
];

// The harness names a folder off a path by turning every mark past a letter or a digit into a dash. [[spec/guidance/retro/collect]]
export function slugOf(root) {
  return String(root).replace(/[^A-Za-z0-9]/g, "-");
}

// A folder belongs to this tree where it carries the tree's own name, a folder inside it, or a scratch folder named off it. A sibling tree, as `quackitect-old` beside `quackitect`, names a folder the tree holds nowhere, so it stays out. [[spec/guidance/retro/collect]]
export function belongs(name, slug, inside = []) {
  const said = String(name).toLowerCase();
  const own = String(slug).toLowerCase();
  if (!own) return false;
  for (let at = said.indexOf(own); at >= 0; at = said.indexOf(own, at + 1)) {
    if (at > 0 && said[at - 1] !== "-") continue;
    const rest = said.slice(at + own.length);
    if (!rest || rest.startsWith("--")) return true;
    if (!rest.startsWith("-")) continue;
    if (at > 0) return true;
    const next = rest.slice(1);
    if (inside.some((one) => next === one || next.startsWith(`${one}-`))) return true;
  }
  return false;
}

// The folders standing at the tree's top, named the way the harness names them. [[spec/guidance/retro/collect]]
function insideOf(it) {
  return listed(it, it.root)
    .filter((one) => one.kind === "dir")
    .map((one) => slugOf(one.name).toLowerCase());
}

// Copies every source into the input folder, and answers the lines it takes and the files it refuses. [[spec/guidance/retro/collect]]
export function outsideInto(it, into, since) {
  const out = { taken: [], refused: [], folders: [] };
  const slug = slugOf(it.root);
  const inside = insideOf(it);
  for (const source of SOURCES) {
    const base = it[source.base];
    if (!base) continue;
    const at = it.join(base, ...source.under);
    for (const one of listed(it, at)) {
      if (one.kind !== "dir" || !belongs(one.name, slug, inside)) continue;
      out.folders.push(`${source.kind}/${one.name}`);
      const from = it.join(at, one.name);
      if (source.kind === "transcripts") {
        copyTree(it, from, it.join(into, "transcripts", one.name), since, out, [
          MEMORY,
        ]);
        // The memory is standing state and no event, so the boundary passes it whole. [[spec/guidance/retro/collect]]
        copyTree(
          it,
          it.join(from, MEMORY),
          it.join(into, MEMORY, one.name),
          0,
          out,
          [],
        );
      } else {
        copyTree(it, from, it.join(into, source.kind, one.name), since, out, []);
      }
    }
  }
  return out;
}

function copyTree(it, from, to, since, out, skips) {
  for (const one of listed(it, from)) {
    if (skips.includes(one.name) || STORES.includes(one.name)) continue;
    const was = it.join(from, one.name);
    const now = it.join(to, one.name);
    if (one.kind === "dir") {
      copyTree(it, was, now, since, out, []);
      continue;
    }
    try {
      // A file older than the last collect stands in that retro already. [[spec/guidance/retro/collect]]
      if (since && it.disk.modified(was) < since) continue;
      it.disk.makeDir(to);
      it.disk.copy(was, now);
      out.taken.push(now);
    } catch (error) {
      out.refused.push({
        path: was,
        refused: error?.code ?? error?.message ?? String(error),
      });
    }
  }
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}
