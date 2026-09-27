// What the editor hands the language client, worked out with no editor here.
// The command, the arguments and the documents it watches are data, so a test
// reads them on every platform and the door alone touches vscode.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

// The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned by folders.js and spelled again here because the extension bundles alone.
const BIN = ".se/.runtime/bin";
const NAME = "se-lsp";
const ID = "quackitect";

// [[spec/design_output/lsp#one-checker-every-front-asks]]
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

// [[spec/design_output/lsp#one-checker-every-front-asks]]
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

// The pause before each start again, so a server falling at its start loops once a second. [[spec/design_output/lsp#the-client-starts-it-again]]
const PAUSE = 1000;

// The client the editor starts se-lsp through. The client's own handler stops at a cap of starts again, and a rebuild or a stale binary ends the server as often as the source moves. So every close starts it again. [[spec/design_output/lsp#the-client-starts-it-again]]
function clientOf(node, ask, wait = sleep) {
  return new node.LanguageClient(ask.id, ask.name, ask.server, {
    ...ask.client,
    errorHandler: {
      error: () => ({ action: node.ErrorAction.Continue }),
      closed: async () => {
        await wait(PAUSE);
        return { action: node.CloseAction.Restart };
      },
    },
  });
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

module.exports = { BIN, ID, NAME, WATCHES, binaryOf, clientOf, serverAsk };
