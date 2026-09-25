// The warnings a push carries. Every function here takes rows and answers
// rows, so a test drives it over a fixture.
// [[spec/tickets/one-list-holds-the-warnings]]

export const WARNING = "warning";

// The findings that still refuse at a door: a lint that ran nowhere reads no rule, and a private name leaves the box. A reading of Vale's rows drops the style, so the name past the last dot decides. [[spec/design_output/level0#the-panel-holds-a-warning]]
const REFUSING = new Set(["VoiceRulesRan", "Private"]);

function refuses(one) {
  return REFUSING.has(String(one?.rule ?? "").split(".").pop());
}

// [[spec/design_output/level0#the-panel-holds-a-warning]]
export function refusesIn(found) {
  return [found ?? []].flat().filter(refuses);
}

// Every other finding is a break of form, whatever its level, so the door lets it land and warns. [[spec/design_output/level0#the-panel-holds-a-warning]]
export function formIn(found) {
  return [found ?? []].flat().filter((one) => !refuses(one));
}

// A push carries files, and the lint over those alone says what it adds. [[spec/tickets/one-list-holds-the-warnings]]
export function warningsOn(found, names) {
  const held = new Set([names ?? []].flat().filter(Boolean).map(String));
  return [found ?? []]
    .flat()
    .filter((one) => String(one?.severity ?? "") === WARNING)
    .filter((one) => held.has(String(one?.file ?? "")));
}

// One row as the log and the agent read it. [[spec/design_output/level0#the-panel-holds-a-warning]]
export function rowOf(one) {
  return `${one?.file ?? ""}:${one?.line ?? 0} ${one?.rule ?? ""}: ${one?.message ?? ""}`;
}

// What the agent reads after a write lands with a warning: the rows, and that the work goes on. [[spec/design_output/level0#the-panel-holds-a-warning]]
export function warnedNote(file, found) {
  return [
    `${found.length} line(s) of ${file} stand at warning, and the write lands. The warning stands in the Problems panel, and the push waits until the panel stands clear. Leave the lines as they stand and carry on with the ask.`,
    ...found.map((one) => `  ${rowOf(one)}`),
  ].join("\n");
}

// [[spec/tickets/one-list-holds-the-warnings]]
export function filesOn(found) {
  return [...new Set([found ?? []].flat().map((one) => String(one?.file ?? "")))]
    .filter(Boolean)
    .sort();
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
