// The window: where its binary stands, and a build whenever its source
// moves. A hash of every folder it builds from stands beside the binary, so a
// stale one rebuilds.
// [[spec/design_output/tui#the-verb-builds-it]]

import { BIN } from "../../.claude/skills/level0/lib/tools.js";
import { hashText } from "../../.claude/skills/level0/lib/hash.js";

export const SOURCE = "src/tui";
export const SHARED = [
  "quackitect/yaml",
  "src/yaml",
  "quackitect/config",
  "src/config",
];
export const STAMP = `${BIN}/.logview-source`;

// The mark a key joins on, which a reader of bytes reads as text. [[spec/design_output/index#a-rename-reaches-a-name]]
const JOIN = "\x1f";

export function viewerOf({ disk, proc, root, go = "go", windows = false }) {
  const exe = `${root}/${BIN}/logview${windows ? ".exe" : ""}`;
  const stamp = `${root}/${STAMP}`;
  const hash = sourceHash(disk, foldersOf(root));
  if (disk.exists(exe) && disk.exists(stamp) && disk.read(stamp).trim() === hash) {
    return { exe, why: "" };
  }

  // A running binary holds its file on Windows and renames alone, so the build lands beside it and swaps in. [[spec/design_output/tui#the-verb-builds-it]]
  const fresh = `${exe}.new`;
  const ran = built(proc, [go, "build", "-o", fresh, "."], `${root}/${SOURCE}`);
  if (ran.exitCode === 0 && disk.exists(fresh)) {
    swapsIn(disk, fresh, exe);
    disk.makeDir(`${root}/${BIN}`);
    disk.write(stamp, `${hash}\n`);
    return { exe, why: "" };
  }
  const why = ran.stderr.trim() || "go builds no viewer here";
  return disk.exists(exe)
    ? { exe, why: `the build fails, so the last one runs: ${why}` }
    : { exe: "", why };
}

// The old binary steps aside by rename, and the fresh one takes its name. [[spec/design_output/tui#the-verb-builds-it]]
export function swapsIn(disk, fresh, exe) {
  const old = `${exe}.old`;
  try {
    if (disk.exists(old)) disk.remove(old);
  } catch {}
  if (disk.exists(exe)) disk.move(exe, old);
  disk.move(fresh, exe);
}

// [[spec/design_output/tui#the-verb-builds-it]]
export function foldersOf(root) {
  const out = [`${root}/${SOURCE}`];
  for (let at = 1; at < SHARED.length; at += 2) {
    out.push(`${root}/${SHARED[at]}`);
  }
  return out;
}

export function sourceHash(disk, folders) {
  const parts = [];
  for (const folder of [folders].flat()) {
    for (const path of sourcesUnder(disk, folder)) {
      parts.push(`${path}${JOIN}${disk.read(path)}`);
    }
  }
  return hashText(parts.join(JOIN));
}

// Every source file under a folder and its packages, so a move under a tab's folder rebuilds the viewer. [[spec/design_output/tui#the-packages-the-window-holds]]
function sourcesUnder(disk, folder) {
  if (!disk.exists(folder)) return [];
  const out = [];
  for (const one of [...disk.list(folder)].sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (one.kind === "dir") {
      out.push(...sourcesUnder(disk, `${folder}/${one.name}`));
      continue;
    }
    if (
      one.kind === "file" &&
      /\.(go|mod|sum)$/.test(one.name) &&
      !one.name.endsWith("_test.go")
    ) {
      out.push(`${folder}/${one.name}`);
    }
  }
  return out;
}

function built(proc, argv, cwd) {
  try {
    return proc.run(argv, { cwd });
  } catch (err) {
    return { exitCode: 1, stdout: "", stderr: String(err?.message ?? err) };
  }
}
