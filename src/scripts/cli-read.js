// What the command line reads: the version, the index, the notes a reader
// asks for, and the walk over a folder.
// [[spec/design_output/tree#the-tree-handed-in]]

import { join } from "node:path";
import { BIN as INDEX_BIN } from "../../.claude/skills/level0/lib/index.js";
import { line as asLine } from "../../.claude/skills/level0/lib/refuse.js";
import { schemaFaults } from "../../.claude/skills/level0/lib/schema.js";
import { treeFaults } from "../../.claude/skills/level0/lib/tree.js";
import { WARNING } from "../../.claude/skills/level0/lib/warnings.js";
import {
  aloneOver,
  biomeFor,
  findingsOver,
  pastHistory,
  readThrough,
  showOf,
  walkOver,
} from "../bridge/findings.js";
import { readTools } from "../engine/tools.js";
import { treeHere } from "./cli-check.js";
import { bin, COL, files, it, outside, root, SHOWN } from "./cli-doors.js";
import { serverFaults } from "./cli-served.js";

// What the last lint left standing at warning. The stamp takes it, and `branch done` reads the stamp. [[spec/design_output/work#the-battery-answers-first]]
let stood = [];

export function warningsStood() {
  return stood;
}

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

// The command line's own reading, which `lint` prints and a case counts. [[spec/design_output/lsp#one-checker-every-front-asks]]
// The server's list comes in where a caller holds one already, so one reading of the server serves both fronts. [[spec/design_output/lsp#one-checker-every-front-asks]]
// The server runs Vale and Biome itself, so its list stands alone beside the rules it holds nowhere yet, and each row reads once. [[spec/design_output/lsp#a-port-serves-the-list]]
export async function readingFor(where, served) {
  const said = served === undefined ? await serverFaults(where) : served;
  if (said)
    return {
      found: pastHistory({ disk: files, join, root }, [
        ...said,
        ...aloneOver({ disk: files, join, root }, where),
      ]),
      fault: "",
    };

  // [[spec/design_output/lsp]]
  const got = await findingsOver(
    {
      disk: files,
      proc: outside,
      join,
      root,
      vale: bin,
      biome: biomeFor(files, root, readTools(files, root)),
      // The check names what stands past a ceiling as a warning, and the write door refuses the growth. [[spec/design_output/level0#the-size-ceiling]]
      ceilings: {
        function: await it.config.ask("code.functionLines"),
        file: await it.config.ask("code.fileLines"),
      },
    },
    where,
  );
  if (got.fault) return { found: [], fault: got.fault };
  const found = got.found;

  // [[spec/design_output/tree#when-the-sweep-runs]]
  if (where.includes(".")) {
    const tree = treeHere();
    found.push(...treeFaults(tree).filter((one) => one.rule !== "StopFolderIsData"));
    found.push(...schemaFaults(tree));
  }
  return { found: pastHistory({ disk: files, join, root }, found), fault: "" };
}

export async function lint(where) {
  stood = [];
  if (!files.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }
  const began = it.clock.now().getTime();

  const got = await readingFor(where);
  if (got.fault) {
    console.error(got.fault);
    console.error("Vale read no file, so every rule it holds stands unchecked.");
    return 1;
  }
  const found = got.found;

  const ms = it.clock.now().getTime() - began;
  if (!found.length) {
    // The rules passing is the expected road, so the row stands at debug and the floor hides it. [[spec/design_output/log#which-kind-says-what]]
    await it.log.say("debug", "vale", `the rules pass over ${where.join(" ")}`, { ms });
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

  // [[spec/design_output/schema#warning-now-and-error-later]]
  stood = found.filter((one) => one.severity === WARNING);
  const refused = found.length - stood.length;
  const note = refused
    ? []
    : [
        "",
        `${found.length} stand at warning. They stand in the Problems panel, and the push waits until the panel stands clear.`,
      ];
  for (const row of lintRows(
    found,
    (one) => asLine(one, show(one.file ?? where[0])),
    note,
  ))
    console.log(row);
  if (refused) return 1;
  // A warning turns nothing red, because the doors let it land and the push waits on the panel. [[spec/design_output/config#the-engine-controls]]
  return 0;
}

// The count reads first, and the finding lines stand last, where the reader's eye lands. [[spec/design_output/lsp#the-lint-ends-on-findings]]
export function lintRows(found, lineOf, note = []) {
  const perRule = new Map();
  for (const one of found) perRule.set(one.rule, (perRule.get(one.rule) ?? 0) + 1);
  return [
    ...[...perRule]
      .sort((a, b) => b[1] - a[1])
      .map(([rule, count]) => `${String(count).padStart(COL.count)}  ${rule}`),
    `${String(found.length).padStart(COL.count)}  in all`,
    ...note,
    "",
    ...found.map(lineOf),
  ];
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
