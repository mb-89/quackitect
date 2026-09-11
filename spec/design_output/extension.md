---
kind: [[design_output]]
describes: [[src/extension/extension.js]]
---

# The sidebar draws the tree

`src/extension` is a VS Code extension drawing one sidebar. The declaration
says what every value is and where it draws. The extension turns that into a
page. It carries no dependency, and `./RUNME.sh` links the folder in.

| piece | file |
|---|---|
| what the editor loads | `extension.js` |
| the one module reaching vscode | `editor.js` |
| the wiring under it | `sidebar.js` |
| the declaration as widgets | `lib/widgets.js` |
| the grid check | `lib/grid.js` |
| declaration to HTML | `lib/panel.js` |
| a key in the local file | `lib/values.js` |
| the session boundary | `lib/session.js` |
| a click to a message | `webview/clicks.js` |
| a click count to a state | `webview/gesture.js` |

# It starts silent

The extension registers one view and starts nothing. No engine, no server and
no process runs until a button says so. `activate` proves it: a test drives it
with a fake editor, and asserts that the door stays quiet.

A person opening the view is what draws the page. The view then reads three
files, draws once, and asks the editor to watch them.

# One declaration draws it

`spec/config/level0.json` holds the values. `spec/config/level0.schema.json`
says what each key is. The draw fields land beside the type, because that file
already carries the type and the options:

    "hold": {
      "type": "string",
      "enum": ["running", "finishing", "stopped"],
      "help": "What the session does when it reaches the end of a turn.",
      "widget": "toggle",
      "gesture": 5,
      "icon": "the raised hand and the robot",
      "at": "U+270B U+1F916",
      "group": "agent control",
      "row": 0, "column": 1, "rowSpan": 1, "colSpan": 1
    }

| field | says |
|---|---|
| `widget` | which of the five kinds draws |
| `group` | the section it draws in, and naming one draws it |
| `row`, `column`, `rowSpan`, `colSpan` | where it sits in the grid |
| `gesture` | the press count sending the far value |
| `icon` | the mark, in words a search finds |
| `at` | the same mark as codepoints |
| `help` | the sentence a hover carries |
| `unit` | the word standing beside an editor |
| `runs` | what an action runs |
| `keys` | the keys the program an action opens needs |
| `sets`, `watches` | the two keys a status splits into |

A key naming no group is config alone. It draws in the bottom section with
every other value. So a new button is an edit to the schema and no code change.

## The brief says the declaration

The brief for this branch puts these fields in `spec/config/level0.json`. This
tree splits that file in two already. The tracked file holds the values a
person edits, and the schema beside it says the type of each key. A widget
field goes where the type stands, so one key stays one entry.

# The five widgets

| type | writes | reads |
|---|---|---|
| `action` | fires a command once | nothing |
| `toggle` | a key, one value per position | its own position |
| `status` | a key, one value per position | a different key |
| `count` | nothing | a number an engine replaces on a beat |
| `table` | nothing | rows an engine answers, in the columns a key names |

A toggle says what a person last presses. A status says what a thing does on
its own, so it splits in two. What it `sets` and what it `watches` are separate
keys. This branch draws its light dark, because nothing writes a heartbeat yet.

`count` and `table` wait with the engine, and nothing here draws one.

# What waits for level one

Three controls stand in the schema and draw nowhere. Each names its widget, its
options and its mark, and each leaves the group open:

| control | at rest | one click | five clicks |
|---|---|---|---|
| the engine | at rest | running | — |
| binding | bound to the queue | unbound | god mode |
| autonomy | finish your own token | start new tokens | ideation |

Marking a group draws one, so an engine landing later takes an edit to the
schema. The mark for the engine waits on the owner: play and stop, one per
state.

# The view holds nothing

A click writes the file and draws nothing. The watcher fires, the sidebar reads
the file again, and the widget lands in its new position.

| what changes the value | what the sidebar does |
|---|---|
| a click on a widget | writes the file, then draws from the watcher |
| a slash command | draws from the watcher |
| level zero clearing `ask` at a turn end | draws from the watcher |

One direction of truth costs a redraw per click. It buys away the race that
two-way watching carries.

## A click writes the file

The sidebar writes `.se/config.json` and that file alone. A row under the
tracked file shows the team's value. Typing there writes an override, so the
tracked file stays as the team holds it.

`withValue` reads the file, sets one key, and writes the whole text back. The
shape it writes is the shape the tracked file holds. The value takes the type
the schema says, so `"5"` from a select lands as the number `5`. That keeps
`"5" > 3` a bug nobody files. A key the schema leaves alone lands as the text a
person types.

## The local file dies

A session is one window. The main process of the editor outlives a window
reload and dies on a quit, so `process.ppid` draws that line:

| what happens | a new session? |
|---|---|
| a person quits and opens it again | yes |
| Developer, Reload Window | no |
| the engine restarts | no |

The id stands beside the values as `session.pid`. A view opening under an id
that differs writes a file holding the new id alone. So a hold lasts as long as
the window a person sets it in.

A cloud box proves the rule and a person proves the id. `opened` answers what
one id clears, and the reload row above waits for the first person to open the
folder.

# Declaration to HTML

`panelHtml(model)` answers one string, and touches nothing else. The model
carries the groups, the tree, the script URI, the source and the nonce. So
every case in `test/level0/panel.test.js` reads a string with no editor.

| the model says | the page draws |
|---|---|
| `groups` | one collapsible section each, open |
| `tree` | the bottom section, collapsed and last |
| `script`, `source`, `nonce` | the one script tag and the policy over it |

## The editor picks the colours

Every colour is a `var(--vscode-*)`, and a test asserts it. The test reads every
colour the page names, and refuses one standing outside the editor's own
values. The light and dark classes come from the host, so a person changing
theme moves the page with no redraw.

## A mark and its codepoints

The declaration names a mark twice: `icon` in words, and `at` as codepoints.
`markOf` turns `U+270B U+1F916` into the two characters. An emoji in a source
file hides from a search, and the words beside it answer one.

## The page carries a nonce

The page runs one script and the policy names it:

    default-src 'none'; style-src 'nonce-X'; script-src 'nonce-X' <source>;

The script is a module importing one more. So `script-src` names the webview's
own source as well as the nonce. The style stands in the page under the same
nonce. Every placement in the grid is a class the renderer writes, so the page
carries a style attribute nowhere and the policy holds.

# The grid check

A section holds a grid five columns wide. A widget names `row`, `column`,
`rowSpan` and `colSpan`, a hole is legal, and moving one widget leaves every
other entry alone.

Naming coordinates costs one check, and `faultsIn` runs it:

| what it refuses | what it says |
|---|---|
| two widgets covering one cell | `ask.wanted covers the cell stop.hold covers` |
| a widget past the fifth column | `reaches column 6, and the grid is 5 wide` |

`./RUNME.sh lint` runs the check. `lineOf` names the line the entry opens on,
so the Problems panel takes it through the matcher `.vscode/tasks.json` already
carries. Two groups each hold their own grid, so one cell in both is no fault.

# The bottom section

Collapsed at the start and last in the order. Expanded, it shows a search box
and a tree:

- the top level names the config files, one node each
- below that, the sections and the keys under them
- two columns: the key, and an editor matching the type
- the unit stands beside the editor where a value has one
- hovering a row shows the `help`

## The filter reads an expression

`matches` reads the filter as a regular expression. It runs over the key, the
value and the help. A node shows where it matches, or where a row under it
matches. A filter standing as no expression falls back to a plain search, so a
person typing `mod(el` sees rows.

# A click becomes a message

The browser side holds one delegated listener per kind of event, and each one
posts a message:

| what a person does | the message |
|---|---|
| clicks an action | `{kind: "run", runs}` |
| clicks a toggle | `{kind: "set", key, value}` |
| changes an editor in the tree | `{kind: "set", key, value}` |
| types in the filter | none, and the rows hide |
| opens a section | none, and the page holds it |

The page holds what a person looks at, and holds no value. The filter text and
the open sections live in `setState`, so a redraw takes them back.

## A gesture picks a state

A click count picks which of three a control holds:

| control | at rest | one click | five clicks |
|---|---|---|---|
| hold | running | finish this work | stop now |
| ask | quiet | a short update | a full report |

`pressed` takes the press time as an argument, so a burst replays in a test:

- a burst runs 1000ms from its first press, and a press past that opens a new one
- the first press of a burst climbs one rung
- a press away from rest falls back to rest, however far it stands
- the fifth press of a burst sends the far value
- the button stands dead for 600ms after it fires

The dead window is what a person spends to reach the far value. Five presses
inside 600ms send the first rung alone. A burst reaching its fifth press after
that window sends `stopped`.

Climbing goes one rung at a time, because handing over a whole ladder in one
click is a move a person should mean. Releasing goes any distance at once, so a
stray press always falls DOWN. That asymmetry is the safety, and it stands in
place of a dialog asking whether a person means it.

# The editor is a door

`editor.js` holds every call into `vscode`. Every other file in the folder
answers a test with no editor running. `sidebarOf` takes the door as an
argument, and a fake door drives the whole path.

| the door gives | what it reaches |
|---|---|
| `read`, `write` | `vscode.workspace.fs`, under the workspace folder |
| `watch` | `createFileSystemWatcher`, over the three files |
| `runs` | a terminal, and the line an action names |
| `registerView` | the webview view a person opens |
| `nonce` | the random source, once per draw |
| `pid` | the id of the main process |

The extension imports nothing from `node:`. So the `DoorsOnly` rule reads the
folder and finds nothing to refuse: the rule names `node:` imports, and
`vscode` stands outside its list.

## The watcher draws it again

The door watches the schema, the tracked file and the local file. A change to
any of the three draws the page again. That is how a slash command moves a
widget: the verb writes the local file, and the watcher does the rest.

## The log opens a terminal

The log action runs `./RUNME.sh log`, which opens lnav in a terminal beside the
editor. An action opening another program hands a person that program's keys.
So the declaration carries them and the hover says them:

| key | what it does |
|---|---|
| `p` | open this line whole, with every field it hides |
| `G` | jump to the newest line |
| `/word` | find, and `n` for the next one |
| `:filter-in <regex>` | keep the lines matching, and `:filter-out` drops them |
| `q` | leave |

The rule generalises. Where an action starts another program, its hover names
the keys that program needs, and the declaration carries them beside the
`help`.

# What level zero holds

Three controls work with no engine, because the stop table and the standing
block already read `.se/config.json`:

| control | how it lands |
|---|---|
| the log | the terminal above, and nothing else |
| hold | one mechanical rule in the stop table |
| ask | one block the context carries, and the turn's end drops it |

`lib/controls.js` in the plugin holds both halves, so the sidebar and the tooth
meet in the file and nowhere else.

## The hold is one rule

`stop.hold` writes one of three values, and the table reads the last:

| value | what the tooth does |
|---|---|
| `running` | leaves the vote as it stands |
| `finishing` | leaves the vote, and the block asks for nothing new |
| `stopped` | ends the turn, over the rule carrying standing work |

The rule stands at priority 85, over `work-still-stands` at 80. So a hold beats
a list with something on it. `holds` answers the check `owner-holds`. A
contract test reads every mechanical name the table carries, and asserts the
hook answers it.

## The ask is a line

`ask.wanted` writes `quiet`, `short` or `full`. A value past `quiet` puts one
block in front of the agent, and the turn's end writes the key back to `quiet`.
So the ask asks once, and the sidebar draws the answer as the widget falling
back to rest.

# What a cloud box proves

Every layer but the drawing runs with no editor:

| layer | how |
|---|---|
| reading the declaration | a schema in memory |
| the grid check | a declaration that overlaps, and one that holds |
| declaration to HTML | the string the renderer answers |
| a click to a message | the webview script over a fake page |
| the watcher to a redraw | a fake door, then the renderer again |
| the local file dying | two ids, and what the second one clears |

# The editor finds it

`./RUNME.sh` links the folder and names it in the editor's own list, so a clone
draws the sidebar with nothing typed. Two steps in the install loop, and both
are wants: a box carrying no editor answers them and prints nothing.

| step | what it does | where it stops |
|---|---|---|
| `editor-link` | links `src/extension` and writes the entry | no `~/.vscode/extensions` folder |
| `editor-extensions` | installs the two ids the settings point at | no `code` on the PATH |

The link points at the tree, so an edit draws on the next window and no second
install stands between them. `servers.js` holds the two ids, so the shell names
none of its own.

## A file another program owns

A linked folder draws nothing on its own. The editor loads what
`~/.vscode/extensions/extensions.json` names, and that file holds every
extension a person has. So `src/scripts/editor.js` writes it, and v3 and v4
both paid for the rules it holds:

| what the writer meets | what it does |
|---|---|
| an element with no id | drops it, and carries it nowhere |
| entries under a `value` wrapper | reads them out of it |
| a key the editor owns | carries it verbatim |
| one entry in the list | writes an array holding it |
| a file that reads as no JSON | leaves it as it stands |

Carrying an element nothing identifies makes the damage permanent, because
every later run writes it back. Writing an object where the list holds one
entry breaks a box owning no other extension.

## A box names its home

Windows leaves `HOME` unset and names the folder `USERPROFILE`, and the same
script runs there under the shell Git ships. So the writer reads either name
and answers the empty string where a box carries none.

## A lost id stands refused

The entry going in is not the proof. A writer checking its own id alone passes
while every other extension goes, which is a person watching the lot uninstall
itself at once. So the writer counts the ids it read, refuses a write that
drops one, and leaves `extensions.json.before-quackitect` beside the file.

# What a button draws

## A mark alone says it

A button draws its mark and no word. A word under it repeats the value the mark
already carries, and four of those make a panel read as a paragraph.

| what a widget wears | when |
|---|---|
| the mark | always |
| the `away` colour | the value stands off its rest |
| a red pulse | the value stands at the far end |

The far end is the third option, which a gesture reaches. `stop.hold` takes two
presses to `stopped`, and `ask.wanted` and `engine.binding` take five.

## The gear picks the sections

A gear stands at the top and names every section the panel holds. A person
ticks the ones they want, and the choice rides in the view state, so it stands
through a redraw.

Config starts unticked. A person reaching for a key ticks it open, and the
panel stays four buttons wide for everybody else.

## The tree holds config alone

The bottom section draws the two config files and leaves `session` out of them.
That key holds the id a window writes to know itself again, and it answers
nobody who reads it.

## The button prints the log

The log button runs `./RUNME.sh log --plain`, so the rows land in the terminal
it opens. The bare verb hands the file to lnav instead, which takes the whole
terminal for its own screen. A button answers with rows where they stand.

Where no log stands yet, the verb says so in one line and answers zero.

## A terminal opens on Windows

A terminal opens on the shell the box prefers, which is PowerShell there, and
that shell reads no `./RUNME.sh`. So the door hands it `.\RUNME.cmd` instead,
which is the same doorway a person clicks.

# What stands open

- The extension holds its own reader of a key, because `lib/config.js` in the
  plugin is a module and VS Code loads a script. Fold the two together where
  the extension takes a build.
- The sidebar reads the two files and leaves the environment layer to
  `./RUNME.sh config`, which names the layer answering each key.
- A projection writing `src/extension/package.json` from the declaration waits,
  because no widget here contributes a command.
