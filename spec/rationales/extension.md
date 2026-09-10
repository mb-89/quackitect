---
kind: [[rationale]]
explains: [[spec/design_output/extension]]
---

# Why

The branch that built the sidebar met four questions its brief left open, and
one it settled against the brief. Each answer stands here, so the design record
carries the mechanism alone.

## 1. The fields join the schema

The brief puts the widget fields in `spec/config/level0.json`, beside the
value. That file holds values alone, and `flatten` reads every object under a
section as more keys. A `group` beside a value flattened to `stop.hold.group`,
and the resolver answered that as a key of its own.

The branch before this one split the declaration in two:

| file | holds |
|---|---|
| `spec/config/level0.json` | the value of each key |
| `spec/config/level0.schema.json` | the type, the options, and now the drawing |

So the widget fields land where the type stands. One key stays one entry, which
is what v4's ruling asks for. The split between the two files stays as the
config branch left it.

`help` and `unit` land in the same place for the same reason. The brief names
them as fields the config branch gives, and that branch gives `type` and `enum`
with a `comment` per section.

## 2. The dead window costs something

v4 hands over four numbers, and the brief takes them whole:

- a burst runs 1000ms, and a press past that starts a new burst
- only the first press of a burst acts
- the fifth press sends the other value
- the button stands dead for 600ms after it fires

Two of those four disagree at the edge. A burst reaching its fifth press inside
600ms meets a dead button, so a fast clicker sends the first rung alone.

Three readings stood open:

| reading | what it costs |
|---|---|
| the dead window blocks counting | five presses inside a burst turn unreachable |
| the dead window blocks the first press alone | the 600ms number decides nothing |
| the dead window blocks any firing | a person spends 600ms to reach the far value |

The third reading is the one in the code. It leaves every number deciding
something. It matches what v3 asks of the gesture, where a move a person should
mean takes more than a flick. `test/level0/gesture.test.js` holds both edges,
so a later reader who disagrees moves one case and sees what breaks.

## 3. The extension carries no module

VS Code loads an extension with `require`, and this tree writes ES modules
everywhere. The webview loads a module, because a browser reads no `require` at
all.

So one folder holds two shapes:

| folder | `type` | who loads it |
|---|---|---|
| `src/extension` | none, so a script | the extension host |
| `src/extension/webview` | `module` | the browser, and a test |

Node reads a named import out of a script through its lexer, so a test written
as a module reads both halves. The alternative was a bundler, which costs the
first dependency this tree carries and buys one shape.

## 4. The folder is the unit

`src/extension` imports nothing outside itself, so a person installs the folder
and every path inside it resolves. That costs one small overlap. The extension
reads and writes a dotted key with its own six lines, where `lib/config.js` in
the plugin holds `nest` and a merge.

Folding the two together wants the extension to reach the plugin folder, which
wants a build. The overlap is six lines and the build is a dependency. So the
overlap stands until an engine gives the extension a build of its own.

## 5. Every placement is a class

A webview takes a content policy, and `style-src 'nonce-X'` refuses a style
attribute on an element. The first renderer placed each widget with
`style="grid-row: ..."`, which the policy drops silently. Every widget piled
into one cell.

Two roads out: `'unsafe-inline'` in the policy, or a class per placement. The
renderer writes the class into its one style block, so the policy stays tight
and a test reads the placement as a string.
