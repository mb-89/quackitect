// What the editor hands the language client, worked out with no editor here.
// The command, the arguments and the documents it watches are data, so a test
// reads them on every platform and the door alone touches vscode.
// [[spec/design_output/lsp#one-checker-every-front-asks]]

const { COMMAND } = require("./lens.js");

// The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned by src/modules/check/folders.go and spelled again here because the extension bundles alone.
const BIN = ".se/.runtime/bin";
// The index binary, whose lsp verb relays the editor to the lsp IO module. indexBinary in src/index/binary.go owns the name, spelled again here because the extension bundles alone. [[spec/tickets/the-lsp-server-leaves]]
const NAME = "se-index";
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
  { scheme: "file", pattern: "**/install.sh" },
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

// The client the editor starts quack lsp through. The client's own handler stops at a cap of starts again, and a rebuild or a stale binary ends the server as often as the source moves. So every close starts it again. [[spec/design_output/lsp#the-client-starts-it-again]]
function clientOf(node, ask, wait, middleware) {
  return new node.LanguageClient(ask.id, ask.name, ask.server, {
    ...ask.client,
    middleware,
    errorHandler: {
      error: () => ({ action: node.ErrorAction.Continue }),
      closed: async () => {
        await wait(PAUSE);
        return { action: node.CloseAction.Restart };
      },
    },
  });
}

// The code of the hint the server publishes at each field a take still wants. [[spec/design_output/lsp#a-take-marks-the-fields]]
const HELD = "HeldField";
const HANDS_BACK = new Set(["pass", "fail", "back"]);
// The place the reason takes among the press's arguments: act, ticket, path, reason. [[spec/design_output/lsp#a-ticket-carries-its-buttons]]
const REASON = 3;

const heldIn = (row) => (row?.code?.value ?? row?.code) === HELD;

// The client's middleware over the door: a fail asks its reason, a hand-back saves first, and a held field draws as the underline. [[spec/design_output/lsp#a-ticket-carries-its-buttons]] [[spec/design_output/lsp#a-take-marks-the-fields]]
function middlewareOf(door) {
  return {
    async executeCommand(command, args, next) {
      if (command !== COMMAND) return next(command, args);
      const [act, ticket, path] = args ?? [];
      let given = args;
      if (act === "fail" && given.length <= REASON) {
        const reason = String((await door.asksLine(`Why does ${ticket} fail back?`)) ?? "");
        if (!reason.trim()) return undefined;
        given = [act, ticket, path, reason];
      }
      if (HANDS_BACK.has(act)) await door.saves(path);
      return next(command, given);
    },
    handleDiagnostics(uri, rows, next) {
      const all = rows ?? [];
      door.marksFields(
        uri,
        all.filter(heldIn).map((one) => one.range.start.line),
      );
      return next(
        uri,
        all.filter((one) => !heldIn(one)),
      );
    },
  };
}

module.exports = { BIN, ID, NAME, WATCHES, binaryOf, clientOf, middlewareOf, serverAsk };
