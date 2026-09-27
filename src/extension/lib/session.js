// A session is one window. The main process of the editor outlives a window
// reload and dies on a quit, so its id draws the line: the local values stand
// beside that id, and an id that differs takes them with it.
// [[spec/design_output/extension#the-local-file-dies]]

const { parsed, valueAt, withValue } = require("./values.js");

const KEY = "session.pid";
// The binding holds until the owner changes it, so a new window carries it over. [[spec/tickets/the-window-keeps-the-binding]]
const KEPT = ["engine.binding"];

function opened(text, pid) {
  const held = valueAt(text, KEY);
  if (held === pid) return { text: String(text ?? ""), cleared: [], same: true };
  let fresh = withValue("{}", KEY, pid);
  for (const key of KEPT) {
    const value = valueAt(text, key);
    if (value !== undefined) fresh = withValue(fresh, key, value);
  }
  return { text: fresh, cleared: keysIn(text), same: false };
}

function keysIn(text) {
  const out = [];
  for (const [section, held] of Object.entries(parsed(text))) {
    if (!held || typeof held !== "object") continue;
    for (const leaf of Object.keys(held)) {
      const key = `${section}.${leaf}`;
      if (key !== KEY && !KEPT.includes(key)) out.push(key);
    }
  }
  return out.sort();
}

module.exports = { KEY, opened };
