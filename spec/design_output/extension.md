---
kind: [[design_output]]
describes: [[src/extension/extension.js]]
---

# The sidebar draws the tree

`src/extension` is a VS Code extension drawing one sidebar. The declaration
says what every value is and where it draws. The extension turns that into a
page. It carries no dependency, and `./RUNME.sh` links the folder in.

- `extension.js`: what the editor loads
- `editor.js`: the one module reaching vscode
- `sidebar.js`: the wiring under it
- `lib/widgets.js`: the declaration as widgets
- `lib/grid.js`: the grid check
- `lib/panel.js`: declaration to HTML
- `lib/values.js`: a key in the local file
- `lib/session.js`: the session boundary
- `lib/gesture.js`: a press count to a state, held in the host
- `lib/logbook.js`: the sidebar's lines in the door log
- `webview/clicks.js`: a click to a message

# It starts silent

The extension registers one view and starts nothing. No engine, no server and
no process runs until a button says so. `activate` proves it: a test drives it
with a fake editor, and asserts that the door stays quiet.

The editor starts it only in a folder carrying `spec/config/level0.schema.json`,
and the view shows only where `activate` sets `quackitect.here`. The view and
the bar holding it both carry the name `quackitect`, so the header says it once.

## An empty folder stays quiet

A folder carrying no tree gets no view, no mark and no write. The Biome
extension starts in every folder, and it offers to install itself globally where
it finds no binary. So `activate` sets two Biome keys in the user settings,
where a person has set neither:

- `biome.requireConfiguration` to `true`
- `biome.suggestInstallingGlobally` to `false`

A key a person holds in the user settings stays as they set it.

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
      "icon": "✋🤖",
      "group": "agent control",
      "row": 0, "column": 1, "rowSpan": 1, "colSpan": 1
    }

| field | says |
|---|---|
| `widget` | which of the five kinds draws |
| `group` | the section it draws in, and naming one draws it |
| `row`, `column`, `rowSpan`, `colSpan` | where it sits in the grid |
| `gesture` | the press count sending the far value |
| `icon` | the mark the button wears |
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

## A mark a person types

`icon` carries the emoji, as a person types them. One field says it, because two
fields for one mark are two things to keep in step. A mark written the old way,
as `U+270B`, draws the same character.

The four buttons, and the one file naming them,
`spec/config/level0.schema.json`:

| key | `icon` | what it does |
|---|---|---|
| `log.open` | 📜 | runs `./RUNME.sh log`, which opens the log viewer in a terminal |
| `stop.hold` | ✋🤖 | running, then finishing, and stops at five presses |
| `ask.wanted` | ❓🤖 | quiet, then short, and the full report at five presses |
| `engine.binding` | ❌🔗🤖 | the queue, then unbound, and god mode at five presses |

A mark stands still. The button says the state by the colour it wears, and by
the pulse it takes at the far end.

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
so the finding points at the entry. Two groups each hold their own grid, so one
cell in both is no fault.

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
| clicks an action | `{kind: "run", key, runs}` |
| clicks a toggle | `{kind: "press", key}` |
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

The host counts the presses, and the page counts none. Every write draws the
page again, and a new page carries a new script. So a count kept in the page
starts over at every press, and stands at one.

`pressed` takes the press time as an argument, so a burst replays in a test:

- a press within 800ms of the last one joins its burst, and a later one opens a new burst
- the first press of a burst climbs one rung
- presses two to four stand by
- a press away from rest falls back to rest, however far it stands
- the fifth press of a burst sends the far value
- the button stands dead for 600ms after the far value, so a sixth press stands by too

Climbing goes one rung at a time, because handing over a whole ladder in one
click is a move a person should mean. Releasing goes any distance at once, so a
stray press always falls DOWN. That asymmetry is the safety, and it stands in
place of a dialog asking whether a person means it.

## A press writes a line

Every press that writes, every run and every edit in the config tree writes a
`sidebar` line to the door log. For details, see
[[spec/design_output/log#which-door-says-what]].

- One press writes `stop.hold is finishing`, with the detail `one press`.
- Five presses write `stop.hold is stopped`, with the detail `5 presses`.
- The log button writes `log.open runs ./RUNME.sh log`.
- An edit in the config tree writes `stop.mostInARow is 5`, with the detail `the config tree`.

A window writes one file, named by its first line, and writes it whole on every
line. The row shape comes from `lib/log.js`, the module every writer reads. The
line honours `log.level`, the same as every other door.

## A button names its commands

A slash command and a button set the same key through the same file, so each
shows what the other sets. The hover of a toggle names a command for each of its
states down the widget path, as `/se-agent-control-hold-stopped`. The config
tree answers the same key down the config path. The projection writes both. For
details, see [[spec/design_output/projection#the-first-target]].

A test holds every command a hover names to a file in `.claude/commands`.

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

The log action runs `./RUNME.sh log`, which opens the log viewer in a terminal
beside the editor. An action opening another program hands a person that
program's keys. So the declaration carries them and the hover says them.
For details, see [[spec/design_output/viewer#the-keys]].

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

## The link stands

`src/scripts/editor.js` makes the link through the disk door, and the shell asks
it first:

- `linked` answers 0 where the link reaches this tree and the list names the id, and prints nothing.
- `link` removes a copy or a stale link, links `src/extension`, and writes the entry.

The link is a junction on Windows, which needs no administrator, and a symbolic
link elsewhere. A standing link answers `linked`, so a run where nothing
installs prints nothing. `link` refuses a destination outside
`~/.vscode/extensions`.

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

## Config stands at the foot

The config section stands at the foot of the window, the way the outline and
the timeline stand at the foot of the explorer. The page is a column the height
of the view, and config takes the room under the controls. Opened, it grows
upward from the foot.

Where the sections outgrow the window, the controls give room first and take a
scroll bar. Config gives room once the controls hold none to give, and then
scrolls too.

## The status bar says it

A state away from rest stands in the status bar at its far left, so a person
sees it with the panel shut. `lib/states.js` decides what stands:

- `engine.binding` at `god` reads `level zero refuses nothing`, on the error colour.
- `engine.binding` at `unbound` reads `unbound`, on the warning colour.
- `stop.hold` at `finishing` reads `finishing`, on the warning colour.
- `stop.hold` at `stopped` reads `stopped`, on the error colour.

A click on one puts its key back at rest, through the command `quackitect.rest`.
A state arriving while the window runs raises a warning toast once, and the
toast offers the same way back. A state standing when the window opens shows in
the bar and raises no toast.

## RUNME opens the panel

A bare RUNME writes `.se/show-panel` before it opens the editor. `activate`
reads it, shows the quackitect panel, and empties it. So the panel opens for a
person who starts from RUNME, and an ordinary start stays silent.

## The tree holds config alone

The bottom section draws the two config files and leaves `session` out of them.
That key holds the id a window writes to know itself again, and it answers
nobody who reads it.

## The button prints the log

The log button runs `./RUNME.sh log`, and the viewer takes the terminal it
opens. `--plain` prints the rows into that terminal instead, and so does a box
where Go builds no viewer.

Where no log stands yet, the plain verb says so in one line and answers zero.

## A terminal opens on Windows

A terminal opens on the shell the box prefers, which is PowerShell there, and
that shell reads no `./RUNME.sh`. So the door hands it `.\RUNME.ps1` instead,
which is the doorway a person there already takes.

# What stands open

- The extension holds its own reader of a key, because `lib/config.js` in the
  plugin is a module and VS Code loads a script. Fold the two together where
  the extension takes a build.
- The sidebar reads the two files and leaves the environment layer to
  `./RUNME.sh config`, which names the layer answering each key.
- A projection writing `src/extension/package.json` from the declaration waits,
  because no widget here contributes a command.
