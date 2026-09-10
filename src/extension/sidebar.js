// The sidebar, with the editor handed in. Every step here is a read, a write
// or a string, so a fake door drives the whole of it: a message lands in the
// file, and the watcher draws the file again.
// [[spec/design_output/extension#the-view-holds-nothing]]

const { panelHtml } = require("./lib/panel.js");
const { opened } = require("./lib/session.js");
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

  return {
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
      if (message?.kind === "run") return door.runs(String(message.runs ?? ""));
      if (message?.kind !== "set" || !message.key) return undefined;

      const schema = parsed(await door.read(SCHEMA));
      const one = entriesIn(schema).find((each) => each.key === message.key);
      const was = await door.read(LOCAL);
      return door.write(
        LOCAL,
        withValue(was, message.key, asType(message.value, one?.type)),
      );
    },

    // [[spec/design_output/extension#the-local-file-dies]]
    async opened(pid) {
      const said = opened(await door.read(LOCAL), pid);
      if (!said.same) await door.write(LOCAL, said.text);
      return said;
    },
  };
}

module.exports = { SCHEMA, sidebarOf };
