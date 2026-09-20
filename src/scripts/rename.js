// The rename verb. One name moves, and every reach the tree writes moves with
// it: an import, a path, a note link and a word in prose.
// [[spec/design_output/index#a-rename-reaches-a-name]]

// The folders a walk leaves alone, as the findings reader leaves them. [[spec/design_output/index#a-rename-reaches-a-name]]
const SKIP = new Set([".git", "node_modules", ".se", ".claude-plugin", "bin"]);
// How far into a file the reader looks for the byte a text file holds nowhere. [[spec/design_output/index#a-rename-reaches-a-name]]
const SNIFF = 4096;

function edged(name) {
  return new RegExp(
    `(?<![\\w-])${String(name).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(?![\\w-])`,
    "g",
  );
}

// A line naming the old name, with the number a reader opens. [[spec/design_output/index#a-rename-reaches-a-name]]
export function reachesIn(text, from) {
  const out = [];
  const rows = String(text ?? "").split("\n");
  for (let at = 0; at < rows.length; at++) {
    if (edged(from).test(rows[at])) out.push({ line: at + 1, said: rows[at] });
  }
  return out;
}

// The text with each reach rewritten, and a longer word left standing. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renamedText(text, from, to) {
  return String(text ?? "").replace(edged(from), String(to));
}

// Every file under a folder, whatever its ending. A caller names the part it wants. [[spec/design_output/index#a-rename-reaches-a-name]]
export function filesUnder(it, where) {
  const out = [];
  const into = (at) => {
    let held;
    try {
      held = it.disk.list(at);
    } catch {
      return;
    }
    for (const one of held) {
      if (SKIP.has(one.name)) continue;
      const next = it.join(at, one.name);
      if (one.kind === "dir") into(next);
      else out.push(next);
    }
  };
  into(where);
  return out.sort();
}

// A text file holds no zero byte, so the reader looks for one and leaves the ending alone. [[spec/design_output/index#a-rename-reaches-a-name]]
export function readsAsText(said) {
  return !String(said ?? "")
    .slice(0, SNIFF)
    .includes("\u0000");
}

// The files a rewrite reads, beside the ones its reader leaves out. A rule that skips says what it skips. [[spec/design_output/index#a-rename-reaches-a-name]]
export function writtenFiles(it, where) {
  const read = [];
  const skipped = [];
  for (const one of filesUnder(it, where)) {
    if (readsAsText(it.disk.read(one))) read.push(one);
    else skipped.push(one);
  }
  read.skipped = skipped;
  return read;
}

// A note reaches a reader two ways, as a path and as a link without its ending. [[spec/design_output/index#a-rename-reaches-a-name]]
export function formsOf(from, to) {
  const out = [[String(from), String(to)]];
  const bare = String(from).replace(/\.md$/, "");
  if (bare !== String(from)) out.push([bare, String(to).replace(/\.md$/, "")]);
  return out;
}

// A name standing as no path, such as a module's, which rewrites and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renamingText(it, from, to) {
  const wrote = [];
  const held = writtenFiles(it, it.root);
  for (const file of held) {
    const text = it.disk.read(file);
    const said = renamedText(text, from, to);
    if (said === text) continue;
    it.disk.write(file, said);
    wrote.push(slashed(file.slice(it.root.length + 1)));
  }
  return { moved: [], wrote, skipped: shortened(it, held.skipped), why: "" };
}

// A path the answer names reads with slashes on every box, the way the tree spells it. [[spec/design_output/index#a-rename-reaches-a-name]]
function slashed(one) {
  return String(one).replaceAll("\\", "/");
}

function shortened(it, files) {
  return [...(files ?? [])].map((one) => slashed(one.slice(it.root.length + 1)));
}

// The move: the folder carries, then every reach rewrites. [[spec/design_output/index#a-rename-reaches-a-name]]
export function renaming(it, from, to) {
  const source = it.join(it.root, ...String(from).split("/"));
  if (!it.disk.exists(source)) {
    return { moved: [], wrote: [], why: `${from} stands nowhere under this tree.` };
  }
  const target = it.join(it.root, ...String(to).split("/"));
  if (it.disk.exists(target)) {
    return { moved: [], wrote: [], why: `${to} stands already, so the move stops.` };
  }

  const moved = [];
  const held = filesUnder(it, source);
  if (held.length) {
    for (const file of held) {
      const rest = file.slice(source.length + 1);
      const landing = it.join(target, ...rest.split("/"));
      it.disk.makeDir(landing.slice(0, landing.lastIndexOf("/")));
      it.disk.write(landing, it.disk.read(file));
      moved.push(slashed(rest));
    }
  } else {
    it.disk.write(target, it.disk.read(source));
    moved.push(String(to));
  }
  it.disk.remove(source);
  // Every reader of the tree asks git for its file list, so the move reaches git too. [[spec/design_output/index#a-rename-reaches-a-name]]
  it.git?.run(["add", "-A", String(from), String(to)], true);

  const wrote = [];
  const read = writtenFiles(it, it.root);
  for (const file of read) {
    const text = it.disk.read(file);
    const said = formsOf(from, to).reduce(
      (one, [name, other]) => renamedText(one, name, other),
      text,
    );
    if (said === text) continue;
    it.disk.write(file, said);
    wrote.push(slashed(file.slice(it.root.length + 1)));
  }
  return { moved, wrote, skipped: shortened(it, read.skipped), why: "" };
}
