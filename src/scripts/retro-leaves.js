// The material a retro's own reading needs, laid out one file a leaf. A leaf
// then reads one file and runs nothing, so a reader repeats the reading with no
// tree beside them. The copy itself stands in retro-collect.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

const LEAVES = "leaves";
const END = ".jsonl";
const TICKETS = "spec/tickets";
// The word a shell line opens with, which names the job it belongs to. [[spec/design_input/the-agent-pulls-tickets]]
const SHELL = "bash";
const WRITE = "write";
const RULE = /^([A-Za-z][\w.]*) /;

// [[spec/design_input/the-agent-pulls-tickets]]
export function leavesOut(it, into, rows) {
  const log = loggedIn(it, into, rows);
  const said = {
    shell: grouped(
      log.filter((one) => one.kind === SHELL),
      jobOf,
      "job",
    ),
    refusals: grouped(
      log.filter((one) => one.level === "warn"),
      ruleOf,
      "rule",
    ),
    tickets: closedIn(it),
    scripts: rows.filter((one) => String(one.path).startsWith("scripts/")),
    runs: mergedIn(it),
    retros: standingRetros(it),
    unread: rows,
  };

  const out = [];
  for (const [name, lines] of Object.entries(said)) {
    const path = `${LEAVES}/${name}${END}`;
    it.disk.makeDir(it.join(into, LEAVES));
    const text = `${lines.map((one) => JSON.stringify(one)).join("\n")}\n`;
    it.disk.write(it.join(into, LEAVES, `${name}${END}`), text);
    out.push({ path, size: text.length, from: LEAVES });
  }
  return out;
}

// The copies carry the log, so the leaves read it where it lands. [[spec/design_input/the-agent-pulls-tickets]]
function loggedIn(it, into, rows) {
  const out = [];
  for (const one of rows) {
    if (!String(one.path ?? "").startsWith("log/")) continue;
    const text = read(it, it.join(into, ...String(one.path).split("/")));
    for (const line of text.split("\n")) {
      const said = parsed(line);
      if (said) out.push(said);
    }
  }
  return out;
}

function grouped(rows, keyOf, name) {
  const held = new Map();
  for (const one of rows) {
    const key = keyOf(one);
    if (!key) continue;
    const said = held.get(key) ?? { [name]: key, count: 0, example: one.said ?? "" };
    said.count += 1;
    held.set(key, said);
  }
  return [...held.values()].sort((a, b) => b.count - a.count);
}

function jobOf(one) {
  return (
    String(one.said ?? "")
      .trim()
      .split(/\s+/)[0] ?? ""
  );
}

function ruleOf(one) {
  if (one.kind !== WRITE) return "";
  const found = RULE.exec(String(one.said ?? "").trim());
  return found ? found[1] : "";
}

// [[spec/tickets/the-retro-lays-its-leaves]]
function closedIn(it) {
  const out = [];
  for (const commit of commitsIn(it, TICKETS)) {
    for (const path of namesIn(it, commit)) {
      if (!path.startsWith(`${TICKETS}/`)) continue;
      const text = shown(it, `${commit}:${path}`);
      if (!/^state: closed$/m.test(text)) continue;
      out.push({ ticket: named(path), commit, text });
    }
  }
  return out;
}

// [[spec/tickets/the-retro-lays-its-leaves]]
function mergedIn(it) {
  return closedIn(it)
    .filter((one) => /^process: \[\[.*group\]\]$/m.test(one.text))
    .map((one) => ({ group: one.ticket, commit: one.commit, text: one.text }));
}

// The score step reads what stands, so no leaf runs git for it. [[spec/tickets/the-retro-lays-its-leaves]]
function standingRetros(it) {
  const at = it.join(it.root, ...TICKETS.split("/"));
  const rows = listed(it, at).filter(
    (one) => one.kind === "file" && one.name.startsWith("retro-"),
  );
  return rows.map((one) => ({
    retro: one.name.replace(/\.md$/, ""),
    text: read(it, it.join(at, one.name)),
  }));
}

function commitsIn(it, path) {
  const from = firstOf(it);
  if (!from) return [];
  return said(it, ["log", "--format=%H", `${from}..HEAD`, "--", path])
    .split("\n")
    .filter(Boolean);
}

// A first retro opens at the tree's first commit, because no retro closes before it. [[spec/tickets/the-retro-cuts-its-window]]
function firstOf(it) {
  return (
    said(it, ["rev-list", "--max-parents=0", "HEAD"]).split("\n").filter(Boolean)[0] ??
    ""
  );
}

function namesIn(it, commit) {
  return said(it, ["show", commit, "--name-only", "--format="])
    .split("\n")
    .filter(Boolean);
}

function shown(it, what) {
  return said(it, ["show", what]);
}

function said(it, argv) {
  const ran = it.git.run(argv, true);
  return ran?.ok ? String(ran.out ?? "") : "";
}

function named(path) {
  return String(path).split("/").pop().replace(/\.md$/, "");
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}

function read(it, at) {
  try {
    return it.disk.read(at);
  } catch {
    return "";
  }
}

function parsed(line) {
  try {
    const said = JSON.parse(line);
    return said && typeof said === "object" ? said : null;
  } catch {
    return null;
  }
}
