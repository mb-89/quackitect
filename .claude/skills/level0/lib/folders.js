// The folders standing under the private one, and the rule placing a file in
// them. The folder a file stands in says which kind it is, so every writer
// takes its folder from here and a reader finds the names in one place.
// [[spec/design_input/the-runtime-files-stand-apart]]

export const PRIVATE = ".se";
export const RETRO = `${PRIVATE}/retro`;
export const RUN = `${PRIVATE}/run`;

// The names the runtime half took, so a spelling of one straight under the private folder is a reader the move left behind. [[spec/design_output/private#three-kinds-stand-apart]]
export const MOVED = [
  "bin",
  "box.json",
  "check.json",
  "copilot",
  "copilot-cloud",
  "hold",
  "index.db",
  "index.json",
  "log",
  "lsp.json",
  "measure",
  "review",
  "session.json",
  "show-panel",
  "tools.json",
  "undo",
];

// [[spec/design_input/the-runtime-files-stand-apart]]
export const HOLDS = `${RUN}/hold`;
export const NOTES = `${PRIVATE}/notes`;
export const TICKETS = `${PRIVATE}/tickets`;

// [[spec/design_input/the-runtime-files-stand-apart]]
export function inRetro(name) {
  return `${RETRO}/${name}`;
}

// [[spec/design_input/the-runtime-files-stand-apart]]
export function inRun(name) {
  return `${RUN}/${name}`;
}

// [[spec/design_input/the-runtime-files-stand-apart]]
export function runs(path) {
  const said = String(path ?? "")
    .split("\\")
    .join("/")
    .replace(/^\.\//, "");
  return said === RUN || said.startsWith(`${RUN}/`);
}
