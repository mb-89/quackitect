// The folders standing under the private one, and the rule placing a file in
// them. The folder a file stands in says which kind it is, so every writer
// takes its folder from here and a reader finds the names in one place.
// [[spec/design_input/the-runtime-files-stand-apart]]

export const PRIVATE = ".se";
export const RETRO = `${PRIVATE}/.retro`;
export const RUN = `${PRIVATE}/.runtime`;

// The names the runtime half took, its older names, the older places of the log, and a name one side holds alone, stand in src/modules/check/folders.go. [[spec/design_output/private#three-kinds-stand-apart]]

// [[spec/design_input/the-runtime-files-stand-apart]]
export const HOLDS = `${RUN}/hold`;
// The one file a hold stands in beside the folder, which an older box still writes. [[spec/design_output/pull#the-hand-and-the-hold]]
export const HOLD = `${RUN}/hold.json`;
// The log stands outside the runtime folder, because the retro collects it. Its dot keeps the private folder empty while a session writes it through a retro. [[spec/guidance/retro/collect]]
export const LOG = `${PRIVATE}/.log`;
export const NOTES = `${PRIVATE}/notes`;
export const TICKETS = `${PRIVATE}/tickets`;
// The public tickets and the end every note carries. src/engine/group.js reads them here, because the plugin imports nothing outside its folder. [[spec/design_output/level0#a-write-names-its-ticket]]
export const PUBLIC_TICKETS = "spec/tickets";
export const NOTE_END = ".md";
// The handover one session leaves the next on this box, which the first read deletes. [[spec/design_output/work#one-handover-stands]]
export const HANDOVER = `${PRIVATE}/HANDOVER.md`;
// The mark the context door leaves where the session goes due, so the pull hands the clear's tickets after the ticket in hand. [[spec/design_input/the-clear-hands-ephemeral-tickets]]
export const DUE = `${RUN}/due.json`;

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
