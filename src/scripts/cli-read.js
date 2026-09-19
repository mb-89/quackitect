// What the command line reads: the version, the index, the notes a reader
// asks for, and the walk over a folder.
// [[spec/design_output/tree#the-reader]]

import { join, relative, sep } from "node:path";
import {
  CONFIG_DIR,
  fromJson as codeRows,
} from "../../.claude/skills/level0/lib/code.js";
import { codeFaults } from "../../.claude/skills/level0/lib/magic.js";
import { isDraft } from "../../.claude/skills/level0/lib/paths.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { schemaFaults } from "../../.claude/skills/level0/lib/schema.js";
import { SIZED } from "../../.claude/skills/level0/lib/size.js";
import { stopFolderIsData, treeFaults } from "../../.claude/skills/level0/lib/tree.js";
import {
  CONFIG,
  faultIn,
  fromJson,
  unreasoned,
} from "../../.claude/skills/level0/lib/vale.js";
import { withoutFalsePast } from "../bridge/tense.js";
import { gridFaults, serverFaults, treeHere } from "./cli-check.js";
import {
  bin,
  biome,
  COL,
  files,
  it,
  OURS,
  outside,
  root,
  run,
  SHOWN,
} from "./cli-doors.js";

export function version() {
  try {
    return JSON.parse(files.read(join(root, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

// [[spec/design_output/index#the-door-owns-the-database]]
export function asksIndex(argv) {
  const at = join(
    root,
    ".se",
    "bin",
    `se-index${process.platform === "win32" ? ".exe" : ""}`,
  );
  if (!files.exists(at)) {
    console.error("The index stands unbuilt here, so nothing answers.");
    console.error("Run ./RUNME.sh once, which builds it where a C compiler stands.");
    return 1;
  }

  const said = it.proc.run([at, ...argv], { cwd: root, inherit: true });
  return said.exitCode;
}

// [[spec/design_output/level0#the-tense-reader]]
export function readThroughTheReader(found) {
  const byFile = new Map();
  for (const one of found) {
    const list = byFile.get(one.file) ?? [];
    list.push(one);
    byFile.set(one.file, list);
  }
  const kept = [];
  for (const [file, list] of byFile) {
    let text = "";
    try {
      text = files.read(join(root, file));
    } catch {}
    kept.push(...withoutFalsePast(text, list));
  }
  return kept;
}

// What the last lint heard, which the stamp reads beside the exit. [[spec/guidance/retro/collect]]
export const heard = { warned: false };

export async function lint(where) {
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  const began = it.clock.now().getTime();

  const ran = await run([
    bin,
    `--config=${CONFIG}`,
    "--output=JSON",
    "--no-exit",
    OURS,
    ...where,
  ]);
  const fault =
    faultIn(ran.stdout) || (ran.exitCode !== 0 && !ran.stdout ? ran.stderr.trim() : "");
  if (fault) {
    console.error(fault);
    console.error("Vale read no file, so every rule it holds stands unchecked.");
    return 1;
  }
  const found = readThroughTheReader(fromJson(ran.stdout));

  for (const file of walk(where)) {
    for (const one of unreasoned(files.read(file))) {
      found.push({ ...one, file: show(file) });
    }
  }

  // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
  const ceilings = {
    function: await it.config.ask("code.functionLines"),
    file: await it.config.ask("code.fileLines"),
  };
  for (const file of walk(where, SIZED)) {
    found.push(...codeFaults(files.read(file), show(file), ceilings));
  }

  // [[spec/design_output/lsp#one-checker-every-front-asks]]
  const said = serverFaults(where);
  if (said) found.push(...said);

  // [[spec/design_output/tree#when-the-sweep-runs]]
  if (where.includes(".")) {
    const tree = treeHere();
    if (said) {
      // [[spec/design_output/lsp#one-checker-every-front-asks]]
      found.push(...stopFolderIsData(tree));
    } else {
      found.push(...treeFaults(tree));
      found.push(...schemaFaults(tree));
    }
  }

  found.push(...gridFaults(where));

  if (files.exists(biome)) {
    const code = outside.run(
      [
        biome,
        "lint",
        `--config-path=${CONFIG_DIR}`,
        "--reporter=json",
        "--max-diagnostics=none",
        ...where,
      ],
      { cwd: root },
    );
    found.push(...codeRows(code.stdout, where[0]).filter((one) => !isDraft(one.file)));
  }

  const ms = it.clock.now().getTime() - began;
  // A warning passes the check and still holds a retro shut, so the stamp carries whether one stands. [[spec/guidance/retro/collect]]
  heard.warned = found.length > 0;
  if (!found.length) {
    await it.log.say("info", "vale", `the rules pass over ${where.join(" ")}`, { ms });
    console.log("The rules pass.");
    return 0;
  }
  await it.log.say("warn", "vale", `${found.length} line(s) break a rule`, {
    ms,
    detail: found
      .slice(0, SHOWN)
      .map((one) => `${show(one.file ?? where[0])}:${one.line} ${one.rule}`)
      .join(", "),
  });

  const perRule = new Map();
  for (const one of found) {
    perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
    console.log(asLine(one, show(one.file ?? where[0])));
  }
  console.log("");
  for (const [rule, count] of [...perRule].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(COL.count)}  ${rule}`);
  }
  console.log(`${String(found.length).padStart(COL.count)}  in all`);

  // [[spec/design_output/schema#warning-now-and-error-later]]
  const refused = found.filter((one) => one.severity !== "warning").length;
  if (refused) return 1;
  console.log("");
  console.log(
    `${found.length} stand at warning, which the panel draws and check allows.`,
  );
  return 0;
}

// [[spec/design_output/tree#the-tree-handed-in]]
// [[spec/design_output/lsp#one-checker-every-front-asks]]

export function namesIn(at, end) {
  return files
    .list(at)
    .filter((one) => one.kind === "file" && one.name.endsWith(end))
    .map((one) => one.name);
}

export function walk(where, wanted = /\.(md|markdown|txt)$/i) {
  const out = [];
  const SKIP = new Set([".git", "node_modules", ".se", ".claude", ".claude-plugin"]);
  const into = (path) => {
    for (const entry of files.list(path)) {
      if (SKIP.has(entry.name) || isDraft(entry.name)) continue;
      const under = join(path, entry.name);
      if (entry.kind === "dir") into(under);
      else if (wanted.test(entry.name)) out.push(under);
    }
  };
  for (const one of where) {
    const path = join(root, one);
    try {
      into(path);
    } catch {
      if (wanted.test(path)) out.push(path);
    }
  }
  return out;
}

export function show(file) {
  const path = String(file);
  const from = path.includes(root) ? relative(root, path) : path;
  return from.split(sep).join("/");
}
