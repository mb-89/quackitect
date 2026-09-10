// A session is one window. The main process of the editor outlives a window
// reload and dies on a quit, so its id draws the line: the local values stand
// beside that id, and an id that differs takes them with it.
// [[spec/design_output/extension#the-local-file-dies]]

const { parsed, valueAt, withValue } = require("./values.js");

const KEY = "session.pid";

function opened(text, pid) {
  const held = valueAt(text, KEY);
  if (held === pid) return { text: String(text ?? ""), cleared: [], same: true };
  return { text: withValue("{}", KEY, pid), cleared: keysIn(text), same: false };
}

function keysIn(text) {
  const out = [];
  for (const [section, held] of Object.entries(parsed(text))) {
    if (!held || typeof held !== "object") continue;
    for (const leaf of Object.keys(held)) {
      if (`${section}.${leaf}` !== KEY) out.push(`${section}.${leaf}`);
    }
  }
  return out.sort();
}

module.exports = { KEY, opened };
