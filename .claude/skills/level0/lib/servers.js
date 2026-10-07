// The editor files this tree tracks, the extensions they offer, and the
// binaries the settings name. The write door and the editor read one set of
// rules, so a person meets a breach as they type and the agent at the write.
// [[spec/design_output/editor#what-the-editor-runs]]

import { BIN } from "./tools.js";

export const EDITOR_SETTINGS = ".vscode/settings.json";
export const EDITOR_EXTENSIONS = ".vscode/extensions.json";

export const EXTENSIONS = ["biomejs.biome", "bierner.markdown-mermaid"];

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function namesTheBinaries(settings) {
  const read = settings ?? {};
  const biome = read["biome.lsp.bin"] ?? {};
  const paths = typeof biome === "string" ? [biome] : Object.values(biome);
  return {
    biome: paths.length > 0 && paths.every((one) => one.startsWith(`${BIN}/biome`)),
    biomeConfig: read["biome.configurationPath"] === "spec/config/biome.json",
  };
}
