// What the editor hands the language client, worked out with no editor here.
// The command, the arguments and the documents it watches are data, so a test
// reads them on every platform and the door alone touches vscode.
// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]

const BIN = ".se/bin";
const NAME = "se-lsp";
const ID = "quackitect";

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
function binaryOf(platform) {
  return platform === "win32" ? `${NAME}.exe` : NAME;
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
const WATCHES = [
  { scheme: "file", language: "markdown" },
  { scheme: "file", pattern: "**/.vscode/settings.json" },
  { scheme: "file", pattern: "**/.vscode/extensions.json" },
  { scheme: "file", pattern: "**/src/scripts/install.sh" },
  { scheme: "file", pattern: "**/.vale.ini" },
];

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
function serverAsk(root, platform) {
  const name = binaryOf(platform);
  const at = `${BIN}/${name}`;
  return {
    id: ID,
    name: NAME,
    folder: BIN,
    binary: name,
    at,
    server: {
      command: `${root}/${at}`.split("\\").join("/"),
      args: ["lsp"],
      options: { cwd: root },
    },
    client: { documentSelector: WATCHES },
  };
}

module.exports = { BIN, ID, NAME, WATCHES, binaryOf, serverAsk };
