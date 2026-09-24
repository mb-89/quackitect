// The warnings a push carries. One list stands, and the lint answers it, so the
// panel, the refactoring hand and both push doors read one thing. Every
// function here takes rows and answers rows, so a test drives it over a
// fixture, and `listsWarning` alone reads and writes the list file.
// [[spec/tickets/one-list-holds-the-warnings]]

import { join } from "node:path";
import { REFACTORS } from "./runs.js";

export const WARNING = "warning";

// A push carries files, and the lint over those alone says what it adds. [[spec/tickets/one-list-holds-the-warnings]]
export function warningsOn(found, names) {
  const held = new Set([names ?? []].flat().filter(Boolean).map(String));
  return [found ?? []]
    .flat()
    .filter((one) => String(one?.severity ?? "") === WARNING)
    .filter((one) => held.has(String(one?.file ?? "")));
}

// A write landing with a warning puts its rows on the list in place of the file's old rows, so the list follows every file as it changes. [[spec/design_output/level0#a-warning-feeds-the-list]]
export function mergedWarnings(list, file, found) {
  const kept = [list ?? []].flat().filter((one) => String(one?.file ?? "") !== file);
  const rows = [found ?? []]
    .flat()
    .filter((one) => String(one?.severity ?? "") === WARNING)
    .map((one) => ({ ...one, file, source: "door" }));
  return [...kept, ...rows];
}

// A refused write changes no line, so the file keeps its other rows, and each row here stands in place of the row its rule held. [[spec/design_output/level0#the-ceiling-feeds-the-list]]
export function ruledWarnings(list, file, found) {
  const rows = [found ?? []]
    .flat()
    .map((one) => ({ ...one, file, severity: WARNING, source: "door" }));
  const rules = new Set(rows.map((one) => String(one?.rule ?? "")));
  const kept = [list ?? []]
    .flat()
    .filter(
      (one) => String(one?.file ?? "") !== file || !rules.has(String(one?.rule ?? "")),
    );
  return [...kept, ...rows];
}

// Puts a refused file's rows on the list the refactoring hand drains, and answers the rows the list holds. [[spec/design_output/level0#the-ceiling-feeds-the-list]]
export function listsWarning(box, file, found) {
  const at = join(box.work, ...REFACTORS.split("/"));
  let list = [];
  try {
    list = JSON.parse(String(box.disk.read(at)));
  } catch {
    list = [];
  }
  const merged = ruledWarnings(Array.isArray(list) ? list : [], file, found);
  try {
    box.disk.write(at, `${JSON.stringify(merged, null, 2)}\n`);
  } catch {
    // The runtime folder stands on every box the server runs on, so a miss here is a fake with no folder. [[spec/design_output/level0#a-warning-feeds-the-list]]
  }
  return merged.length;
}

// One row as the log and the agent read it. [[spec/design_output/level0#a-warning-feeds-the-list]]
export function rowOf(one) {
  return `${one?.file ?? ""}:${one?.line ?? 0} ${one?.rule ?? ""}: ${one?.message ?? ""}`;
}

// What the agent reads after a write lands with a warning: the rows, and that the work goes on. [[spec/design_output/level0#a-warning-feeds-the-list]]
export function warnedNote(file, found, standing) {
  return [
    `${found.length} line(s) of ${file} stand at warning, and the write lands. The refactoring hand drains them, so leave the lines as they stand and carry on with the ask.`,
    ...found.map((one) => `  ${rowOf(one)}`),
    `The list holds ${standing} row(s) now.`,
  ].join("\n");
}

// [[spec/tickets/one-list-holds-the-warnings]]
export function filesOn(found) {
  return [...new Set([found ?? []].flat().map((one) => String(one?.file ?? "")))]
    .filter(Boolean)
    .sort();
}

// The list stands past the number where the count runs over it, and a number at zero switches the rule off. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function standsPast(count, most) {
  return Number(most) > 0 && Number(count) > Number(most);
}

// The hand takes one file. A write inside the window holds its file back, and the oldest of the rest goes. Both spans read seconds, as `git log --format=%ct` answers them. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function takesFile(files, wrote, now, window) {
  const at = (name) => Number(wrote?.[name] ?? 0);
  return (
    [files ?? []]
      .flat()
      .filter(Boolean)
      .filter((one) => at(one) > 0 && Number(now) - at(one) >= Number(window))
      .sort((a, b) => at(a) - at(b))[0] ?? ""
  );
}

// What the hand reads when it starts: one file, and the verbs that name what stands on it. [[spec/tickets/the-spawn-reaches-its-guidance]]
export function drains(file) {
  return [
    `Take ${file}, and drain the warnings the rules name on it.`,
    "",
    `Run \`./RUNME.sh lint ${file}\` to read them, and \`./RUNME.sh fix ${file}\` for what a program mends.`,
    // A cut comes first, because it moves the lines every other warning names. [[spec/design_output/level0#the-ceiling-feeds-the-list]]
    `Where the lint names FileCeiling, cut the file first: \`./RUNME.sh split ${file} --to <path> --lines <from>-<to>\`, one --to and --lines for each target, and --dry to read the cut before it writes.`,
    "Mend the rest by hand. Leave every line the rules pass, and commit this one file.",
  ].join("\n");
}

// [[spec/tickets/one-list-holds-the-warnings]]
export function refusedWarnings(found) {
  const files = filesOn(found);
  const rules = [...new Set(found.map((one) => String(one?.rule ?? "")))].filter(
    Boolean,
  );
  return [
    "A file this push carries stands at warning, and nothing leaves the box while one stands.",
    "",
    ...files.map((one) => `  ${one}`),
    "",
    `The rules naming them: ${rules.sort().join(", ")}.`,
    "",
    "Run `./RUNME.sh lint <file>` to read each one, and `./RUNME.sh fix` for what",
    "a program mends. A warning outside these files holds no push.",
  ].join("\n");
}
