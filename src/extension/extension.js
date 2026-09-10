// What the editor loads. It draws the sidebar and starts nothing: no engine,
// no server and no process, until a button says so.
// [[spec/design_output/extension#it-starts-silent]]

const { sidebarOf } = require("./sidebar.js");

const VIEW = "quackitect.sidebar";

function activate(context, given) {
  const door = given ?? require("./editor.js").editorDoor(context);
  if (!door.holds()) return;
  const sidebar = sidebarOf(door);

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

module.exports = { VIEW, activate, deactivate };
