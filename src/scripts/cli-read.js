// What the command line reads: the version, the index, the notes a reader
// asks for, and the walk over a folder.
// [[spec/design_output/tree#the-reader]]

import { join } from "node:path";
import { BIN as INDEX_BIN } from "../../.claude/skills/level0/lib/index.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { schemaFaults } from "../../.claude/skills/level0/lib/schema.js";
import { treeFaults } from "../../.claude/skills/level0/lib/tree.js";
import { findingsOver, readThrough, showOf, walkOver } from "../bridge/findings.js";
import { serverFaults, treeHere } from "./cli-check.js";
import { bin, biome, COL, files, it, outside, root, SHOWN } from "./cli-doors.js";

export function version() {
  try {
    return JSON.parse(files.read(join(root, "package.json"))).version ?? "0";
  } catch {
    return "0";
  }
}

// [[spec/design_output/index#the-door-owns-the-database]]
export function asksIndex(argv) {
  const at = join(root, `${INDEX_BIN}${process.platform === "win32" ? ".exe" : ""}`);
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
  return readThrough({ disk: files, join, root }, found);
}

// What the last lint heard, which the stamp reads beside the exit. [[spec/guidance/retro/collect]]
export const heard = { warned: false };

export async function lint(where) {
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  const began = it.clock.now().getTime();

  // [[spec/design_output/lsp]]
  const got = findingsOver(
    {
      disk: files,
      proc: outside,
      join,
      root,
      vale: bin,
      biome: files.exists(biome) ? biome : "",
      // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
      ceilings: {
        function: await it.config.ask("code.functionLines"),
        file: await it.config.ask("code.fileLines"),
      },
    },
    where,
  );
  if (got.fault) {
    console.error(got.fault);
    console.error("Vale read no file, so every rule it holds stands unchecked.");
    return 1;
  }
  const found = got.found;

  // [[spec/design_output/lsp#one-checker-every-front-asks]]
  const said = serverFaults(where);
  if (said) found.push(...said);

  // [[spec/design_output/tree#when-the-sweep-runs]]
  if (where.includes(".") && !said) {
    const tree = treeHere();
    found.push(...treeFaults(tree).filter((one) => one.rule !== "StopFolderIsData"));
    found.push(...schemaFaults(tree));
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

export function walk(where, wanted) {
  return walkOver({ disk: files, join, root }, where, wanted);
}

export function show(file) {
  return showOf({ root }, file);
}
