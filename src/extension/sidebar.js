// The sidebar, with the editor handed in. Every step here is a read, a write
// or a string, so a fake door drives the whole of it: a message lands in the
// file, and the watcher draws the file again.
// [[spec/design_output/extension#the-view-holds-nothing]]

const { fresh, pressed } = require("./lib/gesture.js");
const { logbookOf } = require("./lib/logbook.js");
const { panelHtml } = require("./lib/panel.js");
const { newestIn, rowsIn } = require("./lib/rows.js");
const { opened } = require("./lib/session.js");
const { statesOf } = require("./lib/states.js");
const { asType, parsed, withValue } = require("./lib/values.js");
const {
  LOCAL,
  TRACKED,
  entriesIn,
  groupsIn,
  treeIn,
  valuesOf,
} = require("./lib/widgets.js");

const SCHEMA = "spec/config/level0.schema.json";

function sidebarOf(door) {
  const readAll = async () => {
    const [schema, tracked, local] = await Promise.all([
      door.read(SCHEMA),
      door.read(TRACKED),
      door.read(LOCAL),
    ]);
    return { schema: parsed(schema), tracked: parsed(tracked), local: parsed(local) };
  };
  const valueNow = async (key) => {
    const said = await readAll();
    return valuesOf(said.tracked, said.local).get(key)?.value;
  };
  const logbook = logbookOf(door, async () => (await valueNow("log.level")) ?? "info");
  const held = new Map();

  const set = async (key, value, how) => {
    const schema = parsed(await door.read(SCHEMA));
    const one = entriesIn(schema).find((each) => each.key === key);
    const typed = asType(value, one?.type);
    await door.write(LOCAL, withValue(await door.read(LOCAL), key, typed));
    await logbook.say("info", "sidebar", `${key} is ${typed}`, { detail: how });
  };

  // [[spec/design_output/extension#a-gesture-picks-a-state]]
  const press = async (key) => {
    const said = await readAll();
    const one = entriesIn(said.schema).find((each) => each.key === key);
    if (!one) return undefined;
    const ran = pressed(held.get(key) ?? fresh(), door.now(), {
      options: one.options,
      value: valuesOf(said.tracked, said.local).get(key)?.value,
      gesture: one.gesture,
    });
    held.set(key, ran.state);
    if (ran.writes === undefined) return undefined;
    return set(key, ran.writes, ran.how);
  };

  return {
    logbook,

    // [[spec/design_output/extension#the-status-bar-says-it]]
    async states() {
      const said = await readAll();
      return statesOf(valuesOf(said.tracked, said.local));
    },
    watches: [SCHEMA, TRACKED, LOCAL],

    async html() {
      const said = await readAll();
      const values = valuesOf(said.tracked, said.local);
      return panelHtml({
        groups: groupsIn(said.schema, values),
        tree: treeIn(said.schema, [
          { path: TRACKED, said: said.tracked },
          { path: LOCAL, said: said.local },
        ]),
        script: door.scriptUri(),
        source: door.source(),
        nonce: door.nonce(),
      });
    },

    // [[spec/design_output/extension#a-click-writes-the-file]]
    async took(message) {
      if (message?.kind === "run") {
        const runs = String(message.runs ?? "");
        await logbook.say("info", "sidebar", `${message.key ?? "a button"} runs ${runs}`);
        return door.runs(runs);
      }
      if (message?.kind === "show") return shows(door, String(message.reads ?? ""));
      if (message?.kind === "press" && message.key) return press(String(message.key));
      if (message?.kind !== "set" || !message.key) return undefined;
      return set(String(message.key), message.value, "the config tree");
    },

    // [[spec/design_output/extension#the-local-file-dies]]
    async opened(pid) {
      const said = opened(await door.read(LOCAL), pid);
      if (!said.same) await door.write(LOCAL, said.text);
      return said;
    },
  };
}

// [[spec/design_output/extension#the-button-prints-the-log]]
async function shows(door, folder) {
  if (!folder) return undefined;
  const name = newestIn(await door.list(folder));
  if (!name) {
    return door.says(["No log stands yet. A door writes one the next time it says a line."]);
  }
  return door.says(rowsIn(await door.read(`${folder}/${name}`)));
}

module.exports = { SCHEMA, sidebarOf };
