// What the editor loads. It draws the sidebar and starts nothing: no engine,
// no server and no process, until a button says so. A folder carrying no
// quackitect tree gets nothing at all, not even the view.
// [[spec/design_output/extension#it-starts-silent]]

const { SCHEMA, sidebarOf } = require("./sidebar.js");
const { COMMAND, ticketLensOf } = require("./lib/lens.js");
const { serverAsk } = require("./lib/lsp.js");
const { toastsOf } = require("./lib/states.js");

const VIEW = "quackitect.sidebar";
const HERE = "quackitect.here";
const REST = "quackitect.rest";
// The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned by folders.js and spelled again here because the extension bundles alone.
const SHOW = ".se/.runtime/show-panel";

async function activate(context, given) {
  const door = given ?? require("./editor.js").editorDoor(context);
  if (!door.holds() || !(await door.read(SCHEMA))) return;
  door.marks(HERE, true);
  door.quiets();
  await startsServer(door);
  const sidebar = sidebarOf(door);

  // [[spec/design_output/extension#the-status-bar-says-it]]
  let shown = await sidebar.states();
  door.registers(REST, (key, value) => sidebar.took({ kind: "set", key, value }));
  door.shows(shown, REST);
  door.watch(sidebar.watches, async () => {
    const now = await sidebar.states();
    door.shows(now, REST);
    for (const one of toastsOf(shown, now)) door.toasts(one, REST);
    shown = now;
  });

  // [[spec/design_output/extension#a-ticket-carries-its-buttons]]
  const tickets = ticketLensOf(door);
  door.registers(COMMAND, tickets.took);
  door.lenses?.(tickets);

  // [[spec/design_output/extension#runme-opens-the-panel]]
  if ((await door.read(SHOW)).trim()) {
    await door.write(SHOW, "");
    door.reveals();
  }

  door.registerView(VIEW, async (page) => {
    door.takes(page);
    const draw = async () => page.set(await sidebar.html());

    page.onMessage((message) => sidebar.took(message));
    await sidebar.opened(door.pid());
    await draw();
    door.watch(sidebar.watches, draw);
    // [[spec/design_output/extension#the-hook-button]]
    door.onProcess?.(draw);
    await door.adoptsProcess?.("bridge.hook");
  });
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
async function startsServer(door) {
  if (!door.startsServer) return "";
  const ask = serverAsk(door.root(), process.platform);
  if (!(await door.list(ask.folder)).includes(ask.binary)) return "";
  return door.startsServer(ask);
}

function deactivate() {}

module.exports = { HERE, REST, SHOW, VIEW, activate, deactivate, startsServer };
