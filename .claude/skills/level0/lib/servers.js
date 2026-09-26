// The language servers this tree pins, and where each binary comes from.
// The write door and the editor read one set of rules, so a person meets a
// breach as they type and the agent meets the same rule at the write.
// [[spec/design_output/editor#what-the-editor-runs]]

import { BIN } from "./tools.js";

export const VALE_LS_VERSION = "0.5.1";
export const VALE_LS_RELEASES = "https://github.com/vale-cli/vale-ls/releases/download";

// [[spec/design_output/editor#the-asset-matrix]]
const TARGETS = {
  "Linux-64-bit": "x86_64-unknown-linux-gnu",
  "Linux-arm64": "aarch64-unknown-linux-gnu",
  "macOS-64-bit": "x86_64-apple-darwin",
  "macOS-arm64": "aarch64-apple-darwin",
  "Windows-64-bit": "x86_64-pc-windows-gnu",
  "Windows-arm64": "aarch64-pc-windows-msvc",
};

export function valeLsAsset(os, arch) {
  const target = TARGETS[`${os}-${arch}`];
  return target ? `vale-ls-${target}.zip` : "";
}

export function valeLsUrl(os, arch, version = VALE_LS_VERSION) {
  const asset = valeLsAsset(os, arch);
  return asset ? `${VALE_LS_RELEASES}/v${version}/${asset}` : "";
}

export const EDITOR_SETTINGS = ".vscode/settings.json";
export const EDITOR_EXTENSIONS = ".vscode/extensions.json";

export const EXTENSIONS = ["chrischinchilla.vale-vscode", "biomejs.biome"];

// The config the Vale extension reads, which turns on no style, so the panel draws Vale off the battery's list. [[spec/design_output/lsp#the-panel-reads-the-battery]]
export const EDITOR_VALE_INI = "spec/config/editor.vale.ini";

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function namesTheBinaries(settings) {
  const read = settings ?? {};
  const biome = read["biome.lsp.bin"] ?? {};
  const paths = typeof biome === "string" ? [biome] : Object.values(biome);
  return {
    // The install writes vale.exe on Windows, so either name holds. [[spec/tickets/the-small-faults-land]]
    vale: [`${BIN}/vale`, `${BIN}/vale.exe`].includes(read["vale.valeCLI.path"]),
    valeConfig: read["vale.valeCLI.config"] === EDITOR_VALE_INI,
    managesVale: read["vale.valeCLI.installVale"] === false,
    biome: paths.length > 0 && paths.every((one) => one.startsWith(`${BIN}/biome`)),
    biomeConfig: read["biome.configurationPath"] === "spec/config/biome.json",
  };
}
