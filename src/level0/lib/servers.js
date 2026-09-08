// The two language servers this tree pins, and where each binary comes from.
// The write door and the editor read one set of rules, so a person meets a
// breach as they type and the agent meets the same rule at the write.
// [[spec/design_output/editor#what-the-editor-runs]]

export const VALE_LS = ".se/bin/vale-ls";
export const VALE_LS_VERSION = "0.5.1";
export const VALE_LS_RELEASES =
  "https://github.com/vale-cli/vale-ls/releases/download";

export function valeLsBin(platform) {
  return platform === "win32" ? `${VALE_LS}.exe` : VALE_LS;
}

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

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function namesTheBinaries(settings) {
  const read = settings ?? {};
  const biome = read["biome.lsp.bin"] ?? {};
  const paths = typeof biome === "string" ? [biome] : Object.values(biome);
  return {
    vale: read["vale.valeCLI.path"] === ".se/bin/vale",
    valeConfig: read["vale.valeCLI.config"] === ".vale.ini",
    managesVale: read["vale.valeCLI.installVale"] === false,
    biome: paths.length > 0 && paths.every((one) => one.startsWith(".se/bin/biome")),
    biomeConfig: read["biome.configurationPath"] === "spec/config/biome.json",
  };
}
