// The retro's collect: it copies the private folder into the retro's own,
// passes the two folders the owner names, and writes a manifest naming every
// line it takes. The note drain stands in retro.js beside this file.
// [[spec/design_input/the-agent-pulls-tickets]]

const PRIVATE = ".se";
const RETRO = "retro";
const HOLDS = "hold";
// The two folders collect passes: the state a box keeps while it works, and its own copies. [[spec/tickets/the-retro-takes-the-box]]
const SKIPS = ["runtime", RETRO];
const MANIFEST = "manifest.jsonl";
// The folders an outside source lands in, so a reader tells them from the rest. [[spec/tickets/the-retro-takes-the-box]]
const OUTSIDE = [
  { key: "scratch", into: "scratch" },
  { key: "transcripts", into: "transcripts" },
];

// [[spec/design_input/the-agent-pulls-tickets]]
export function collect(it, name) {
  if (!name) {
    console.error("retro collect names the ticket it collects for:");
    console.error("  ./RUNME.sh retro collect <ticket>");
    return 2;
  }

  const holding = holdsHere(it);
  if (holding) {
    console.error(
      `${holding} stands under ${PRIVATE}/${HOLDS}, and a hand holds a ticket.`,
    );
    console.error("Hand that step back, then run collect again.");
    return 1;
  }

  const from = it.join(it.root, PRIVATE);
  const into = it.join(from, RETRO, name);
  if (it.disk.exists(it.join(into, MANIFEST))) {
    console.error(
      `${PRIVATE}/${RETRO}/${name} stands already, and its manifest holds a whole run.`,
    );
    console.error("Read that run, or collect for a retro of its own.");
    return 1;
  }

  const rows = copied(it, from, into, kept(it, from), PRIVATE);
  for (const one of OUTSIDE) {
    const where = String(it[one.key] ?? "").trim();
    if (!where) continue;
    rows.push(...copied(it, where, it.join(into, one.into), under(it, where), one.key));
  }

  it.disk.makeDir(into);
  it.disk.write(
    it.join(into, MANIFEST),
    `${rows.map((one) => JSON.stringify(one)).join("\n")}\n`,
  );
  console.log(
    `${PRIVATE}/${RETRO}/${name} holds the run, and its manifest names every line.`,
  );
  return 0;
}

// A hand mid-step writes files, and a copy of one of those tears. [[spec/tickets/the-retro-takes-the-box]]
function holdsHere(it) {
  const at = it.join(it.root, PRIVATE, HOLDS);
  if (!it.disk.exists(at)) return "";
  const rows = listed(it, at).filter((one) => one.kind === "file");
  return rows.length ? rows[0].name : "";
}

// Every path under the private folder the two skips leave standing. [[spec/tickets/the-retro-takes-the-box]]
function kept(it, from) {
  return under(it, from).filter((path) => !SKIPS.includes(path.split("/")[0]));
}

// [[spec/design_input/the-agent-pulls-tickets]]
function under(it, from, rel = "") {
  const at = rel ? it.join(from, ...rel.split("/")) : from;
  const out = [];
  for (const one of listed(it, at)) {
    const path = rel ? `${rel}/${one.name}` : one.name;
    if (one.kind === "dir") out.push(...under(it, from, path));
    else out.push(path);
  }
  return out;
}

// [[spec/design_input/the-agent-pulls-tickets]]
function copied(it, from, into, paths, source) {
  const rows = [];
  for (const path of paths) {
    const parts = path.split("/");
    let text;
    try {
      text = it.disk.read(it.join(from, ...parts));
    } catch {
      continue;
    }
    const holder = parts.slice(0, -1);
    it.disk.makeDir(holder.length ? it.join(into, ...holder) : into);
    it.disk.write(it.join(into, ...parts), text);
    rows.push({ path, size: text.length, from: source });
  }
  return rows;
}

function listed(it, at) {
  try {
    return it.disk.exists(at) ? it.disk.list(at) : [];
  } catch {
    return [];
  }
}
