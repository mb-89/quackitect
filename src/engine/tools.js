// Where a caller finds a tool: the survey file src/quack/survey.go writes, read
// in place of a guess, and the guess where the file names none.
// [[spec/design_output/tools#where-a-caller-looks]]

// The runtime folder folders.go owns, and the survey file and binaries' folder src/quack/survey.go names under it, spelled again because JavaScript imports no Go.
const RUN = ".se/.runtime";
export const TOOLS = `${RUN}/tools.json`;
const BIN = `${RUN}/bin`;

// [[spec/design_output/tools#where-a-caller-looks]]
export function surveyOf(text) {
  let read;
  try {
    read = JSON.parse(text || "{}");
  } catch {
    return {};
  }
  return read && typeof read === "object" ? read : {};
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function pathOf(survey, name) {
  const one = survey?.[name];
  return one && typeof one.path === "string" ? one.path : "";
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function guesses(name) {
  return [`${BIN}/${name}.exe`, `${BIN}/${name}`];
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function readTools(files, root) {
  const at = `${root}/${TOOLS}`;
  return files.exists(at) ? surveyOf(files.read(at)) : {};
}

// [[spec/design_output/tools#where-a-caller-looks]]
export function whereIs(files, root, name, known) {
  const said = pathOf(known, name);
  if (said && files.exists(said)) return said;
  for (const guess of guesses(name)) {
    const at = `${root}/${guess}`;
    if (files.exists(at)) return at;
  }
  return name;
}
