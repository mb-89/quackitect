// What the editor loads. It draws the sidebar and starts nothing: no engine,
// no server and no process, until a button says so. A folder carrying no
// quackitect tree gets nothing at all, not even the view.
// [[spec/design_output/extension#it-starts-silent]]

const { SCHEMA, sidebarOf } = require("./sidebar.js");
const { toastsOf } = require("./lib/states.js");

const VIEW = "quackitect.sidebar";
const HERE = "quackitect.here";
const REST = "quackitect.rest";
const SHOW = ".se/show-panel";

async function activate(context, given) {
  const door = given ?? require("./editor.js").editorDoor(context);
  if (!door.holds() || !(await door.read(SCHEMA))) return;
  door.marks(HERE, true);
  door.quiets();
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
  });
}

function deactivate() {}

module.exports = { HERE, REST, SHOW, VIEW, activate, deactivate };
