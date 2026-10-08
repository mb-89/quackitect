// The doors the extension reaches the outside through, loaded once out of the
// tree's own src/doors and handed on as one hand.
// [[spec/design_output/doors#one-door-per-outside-thing]]

const vscode = require("vscode");
// level0: OutsideInDoors - the realpath finds the tree holding src/doors, so it cannot reach through a door it has yet to find
const { realpathSync } = require("node:fs");
const { join } = require("node:path");

const LOADED = ["clock", "disk", "http"];

// The link under the editor's extensions folder points at src/extension, so its real path two folders up is the tree. [[spec/design_output/extension#the-link-stands]]
function homeOf(context) {
  return join(realpathSync.native(context.extensionPath), "..", "..");
}

// Node's import takes a URL, and refuses a bare drive path on Windows. [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]
function imported(path) {
  return import(vscode.Uri.file(path).toString());
}

// [[spec/design_output/doors#one-door-per-outside-thing]]
async function doorsOf(context, load = imported) {
  const home = homeOf(context);
  const at = (name) => join(home, "src", "doors", `${name}.js`);
  const modules = await Promise.all(LOADED.map((name) => load(at(name))));
  const [clock, disk, http] = LOADED.map((name, place) => modules[place][name]());
  // [[spec/design_output/doors#a-door-standing-on-another]]
  const proc = (await load(at("proc"))).proc(clock);
  return { home, clock, disk, http, proc };
}

module.exports = { doorsOf };
