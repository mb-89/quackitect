// The folders standing under the private one, and the rule placing a file in
// them. The folder a file stands in says which kind it is, so every writer
// takes its folder from here and a reader finds the names in one place.
// [[spec/design_input/the-runtime-files-stand-apart]]

export const PRIVATE = ".se";
export const RETRO = `${PRIVATE}/.retro`;
export const RUN = `${PRIVATE}/.runtime`;

// The names the runtime half took, so a spelling of one straight under the private folder is a reader the move left behind. [[spec/design_output/private#three-kinds-stand-apart]]
export const MOVED = [
  "bin",
  "box.json",
  "check.json",
  "config.json",
  "copilot",
  "copilot-cloud",
  "hold",
  "identity.json",
  "index.db",
  "index.json",
  "lsp.json",
  "measure",
  "project.json",
  "registry.json",
  "review",
  "session.json",
  "show-panel",
  "tools.json",
  "undo",
  "vehicle.json",
];

// The older names of the runtime folder, which the installer renames before anything else. [[spec/design_input/the-runtime-files-stand-apart]]
export const RENAMED = ["run", "runtime"];

// The older places of the log, which stands outside the half because the retro collects it. [[spec/design_input/the-runtime-files-stand-apart]]
export const LOGGED = ["log", "run/log", "runtime/log", ".runtime/log"];

// A name one side holds alone, with the side missing it and the reason. [[spec/design_input/the-runtime-files-stand-apart]]
export const APART = {
  "hold.json": { side: "rule", why: "the hold folder beside it carries the spelling" },
  "registry.json": { side: "loop", why: "the home register moves in a block of its own" },
};

// [[spec/design_input/the-runtime-files-stand-apart]]
export const HOLDS = `${RUN}/hold`;
// The one file a hold stands in beside the folder, which an older box still writes. [[spec/design_output/pull#the-hand-and-the-hold]]
export const HOLD = `${RUN}/hold.json`;
// The log stands outside the runtime folder, because the retro collects it. Its dot keeps the private folder empty while a session writes it through a retro. [[spec/guidance/retro/collect]]
export const LOG = `${PRIVATE}/.log`;
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
