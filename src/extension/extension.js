// What the editor loads. It draws the sidebar and starts nothing: no engine,
// no server and no process, until a button says so. A folder carrying no
// quackitect tree gets nothing at all, not even the view.
// [[spec/design_output/extension#it-starts-silent]]

const { SCHEMA, sidebarOf } = require("./sidebar.js");
const { fieldMarksOf } = require("./lib/fields.js");
const { COMMAND, ticketLensOf } = require("./lib/lens.js");
const { serverAsk } = require("./lib/lsp.js");
const { FLIP, routeHostOf } = require("./lib/route-host.js");
const { BURST, settled } = require("./lib/settle.js");
const { toastsOf } = require("./lib/states.js");

const VIEW = "quackitect.sidebar";
const HERE = "quackitect.here";
const REST = "quackitect.rest";
// The runtime folder of [[spec/design_input/the-runtime-files-stand-apart]], owned by src/modules/check/folders.go and spelled again here because the extension bundles alone.
const SHOW = ".se/.runtime/show-panel";

// The root: it builds the doors once and hands them on. [[spec/design_output/doors#one-door-per-outside-thing]]
async function activate(context, given, load) {
  const door = given ?? (await editorOf(context, load));
  if (!door.holds() || !(await door.read(SCHEMA))) return;
  door.marks(HERE, true);
  door.quiets();
  await startsServer(door);
  const sidebar = sidebarOf(door);

  // [[spec/design_output/extension#the-status-bar-says-it]]
  let shown = await sidebar.states();
  door.registers(REST, (key, value) => sidebar.took({ kind: "set", key, value }));
  door.shows(shown, REST);
  // [[spec/tickets/the-sidebar-reads-v1]]
  door.index?.watch(sidebar.names, async () => {
    const now = await sidebar.states();
    door.shows(now, REST);
    for (const one of toastsOf(shown, now)) door.toasts(one, REST);
    shown = now;
  });

  // [[spec/design_output/extension#a-ticket-carries-its-buttons]]
  const tickets = ticketLensOf(door);
  door.registers(COMMAND, tickets.took);
  // The lens, the marks and the drawing wake on the index values they read. [[spec/tickets/the-lens-reads-v1]]
  door.index?.watch(tickets.names, () => door.lensChanged?.());
  // The drawing over a ticket, and its flip beside the ticket's buttons. [[spec/tickets/the-inset-folds-the-frontmatter]]
  const route = routeHostOf(door);
  door.index?.watch(route.names, () => route.refreshed());
  door.registers(FLIP, (path) => {
    route.flipped(path);
    door.lensChanged?.();
  });
  door.lenses?.({
    ...tickets,
    lenses: async (path, text) => [
      ...route.lenses(path),
      ...(await tickets.lenses(path, text)),
    ],
  });
  // [[spec/design_output/extension#a-take-marks-the-fields]]
  const fields = door.marksFields ? fieldMarksOf(door) : null;
  if (fields) {
    await fields.starts();
    door.index?.watch(fields.names, () => fields.held());
  }
  door.onEditors?.(async (path, text) => {
    await Promise.all([route.opened(path, text), fields?.sees(path, text)]);
    door.lensChanged?.();
  });
  door.onChange?.((path, text) =>
    Promise.all([route.changed(path, text), fields?.sees(path, text)]),
  );
  door.onTheme?.(() => route.themed());
  // [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
  door.onSave?.(tickets.saved);

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
    // A burst of index events draws the panel once it settles. [[spec/tickets/the-sidebar-reads-v1]]
    door.index?.watch(sidebar.names, settled(draw, BURST, door.later));
    // [[spec/design_output/extension#the-hook-button]]
    door.onProcess?.(draw);
    await door.adoptsProcess?.("bridge.hook");
  });
}

async function editorOf(context, load) {
  const doors = await require("./editor-doors.js").doorsOf(context, load);
  return require("./editor.js").editorDoor(context, doors);
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
