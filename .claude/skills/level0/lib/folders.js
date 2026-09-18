// The folders standing under the private one, and the rule placing a file in
// them. The folder a file stands in says which kind it is, so every writer
// takes its folder from here and a reader finds the names in one place.
// [[spec/design_input/the-runtime-files-stand-apart]]

export const PRIVATE = ".se";
export const RETRO = `${PRIVATE}/retro`;
export const RUN = `${PRIVATE}/run`;

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
