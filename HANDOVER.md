---
kind: [[handover]]
status: held
urgency: whenever
depends_on: the-projection-writes-it
---

# The sidebar draws the tree

Open this folder in VS Code and press F5. A second window carries the
extension, and the duck stands in its activity bar.

Run `./RUNME.sh check` for the state of everything a box proves here.

# Tick these four, once

A string shows none of these, so open the editor and read them off:

- [ ] Nothing starts until a button says so.
- [ ] The sidebar reads as part of VS Code, in both themes.
- [ ] A click writes the file, and the widget follows the file.
- [ ] A slash command moves the widget: run `/se-stop-hold-stopped`.

Tick the third by clicking the hand five times, then reading
`.se/config.json`. Tick the fourth by watching the same widget move.

# Read these two first

| note | what it answers |
|---|---|
| [[spec/design_output/extension]] | what draws, what a field says, what waits |
| [[spec/rationales/extension]] | why the fields sit in the schema, and four more |

# Where each piece stands

| piece | where | who proves it |
|---|---|---|
| the extension | `src/extension`, one `package.json`, no build | a person |
| the widget fields | `spec/config/level0.schema.json` | `test/contract/tree.test.js` |
| the renderer | `lib/panel.js`, one string out | `test/level0/panel.test.js` |
| the webview script | `webview/clicks.js` | `test/level0/clicks.test.js` |
| the gesture | `webview/gesture.js` | `test/level0/gesture.test.js` |
| the watcher and the door | `sidebar.js`, `editor.js` | `test/level0/sidebar.test.js` |
| the grid check | `lib/grid.js`, under `./RUNME.sh lint` | `test/level0/grid.test.js` |
| the hold and the ask | `lib/controls.js` in the plugin | `test/level0/hooks.test.js` |

# What a person installs

Install the folder and nothing else. `src/extension` names no dependency and no
build step, and a contract test holds it there.

| road | what a person runs |
|---|---|
| F5 | this folder in VS Code, and the sidebar opens beside it |
| a vsix | `cd src/extension && npm run package`, fetching vsce through npx |

Try the vsix road and say what it costs. This box runs the first road alone.

# What DoorsOnly says

Nothing: it names an import from `node:`, `Date.now`, `new Date` and
`Math.random`, and the extension writes none of those. Leave `.vale.ini` as it
stands.

Hold the spirit of the rule as you edit:

| what reaches outside | where to write it |
|---|---|
| every `vscode` call | `editor.js`, and no other file |
| the clock a burst reads | `performance.now`, in the one wiring line |
| the random source | `crypto.randomUUID`, in the door |

# Where the session line falls

Watch the id across a reload, because this box proves the rule and a person
proves the id:

| do this | expect |
|---|---|
| Developer, Reload Window | `session.pid` holds, and the local values stay |
| quit, and open the folder again | `session.pid` moves, and the values go |

Where a reload moves the id, say so. The extension host carries its own start
time, and `lib/session.js` takes that in place of the id.

# Decide the engine mark

Pick play and stop, one per state, and write them into
`spec/config/level0.schema.json` under `engine.state`. The field waits there
with words in place of codepoints:

    "icon": "the owner picks one mark per state: play and stop"

Write the codepoints beside it as `at`, the way `stop.hold` carries
`U+270B U+1F916`.

# Take these next

- Project `src/extension/package.json` from the declaration, once a widget
  contributes a command. The design note names the target.
- Draw the environment layer in the bottom section. The sidebar reads the two
  files, and `./RUNME.sh config` names every layer today.
- Turn `.se/scripts/links.mjs` into a verb. It reads every `[[note#section]]`
  in the tree and names the ones landing nowhere.
- Draw the status light, `count`, `table` and the three level one controls. Add
  a `group` to each entry, and an engine to answer them.
