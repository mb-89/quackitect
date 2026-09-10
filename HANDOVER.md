---
kind: [[handover]]
status: held
urgency: whenever
depends_on: the-projection-writes-it
---

# The sidebar draws the tree

`spec/funnel/the-sidebar-draws-the-tree.md` holds the whole design, settled with
the owner. Read it first and read it whole. This brief says what to build of it
and how to prove each piece.

Half of this branch a cloud box proves. The other half wants a person opening
VS Code. Say plainly in your handback which half stands where.

# What lands

A VS Code extension at `src/extension`, drawing a sidebar of collapsible
sections from `spec/config/level0.json`.

| piece | where |
|---|---|
| the extension | `src/extension`, its own `package.json` and build |
| the declaration's widget fields | `spec/config/level0.json` |
| the renderer | a pure function, declaration to HTML |
| the webview script | clicks to messages |
| the watcher | the file to a redraw |
| three controls | the log, the hold, the ask |

# The four shaping rules

Take these from the design note, and let nothing talk you out of them:

1. **It starts silent.** The extension draws its sidebar and starts no engine,
   no server, no process. v3 and v4 both fire on folder open, and the owner
   wants that gone.
2. **The view holds nothing.** A click writes the file and draws nothing. The
   watcher fires, the sidebar re-reads and redraws. A slash command takes the
   same path, so a widget agrees with the file always.
3. **The sidebar writes the local file alone.** A row under the tracked file
   shows the team's value, and typing there writes an override.
4. **It takes VS Code's own style.** Every colour a `var(--vscode-*)`, and the
   light and dark classes the host sets. Nobody should tell it apart from the
   editor around it.

# The declaration grows

The config branch gives each value a `type`, a `default`, a `help` and a
`unit`. This branch adds what draws it:

    "hold": {
      "type": "enum",
      "default": "running",
      "options": ["running", "finishing", "stopped"],
      "help": "What the session does at the end of a turn.",
      "icon": "the raised hand and the robot",
      "at": "U+270B U+1F916",
      "group": "agent control",
      "row": 0, "column": 1, "rowSpan": 1, "colSpan": 1,
      "gesture": 5
    }

A value naming no group is config alone and draws in the bottom section. So
marking a group is how a control comes to exist, and a new button is an edit to
this file.

The grid runs five columns wide. One check comes with the coordinates: no two
widgets overlap, and none falls outside five. Put that check where `lint` runs
it, so a bad layout reaches the Problems panel.

# The widgets this branch draws

| type | writes | reads |
|---|---|---|
| `action` | fires a command once | nothing |
| `toggle` | a key, one value per position | its own position |
| `status` | a key, one value per position | a **different** key |

A status splits in two on purpose. What it `sets` and what it `watches` are
separate keys.

A light says a thing runs on its own. A toggle says what a person last
pressed.

Draw no `status` yet. Declare its fields and leave the light dark, because
nothing writes a heartbeat until an engine exists.

## A gesture picks a state

A click count picks which of three a control holds:

| control | at rest | one click | five clicks |
|---|---|---|---|
| hold | running | finish this work | stop now |
| ask | quiet | a short update | a full report |

v4's timing, and take it whole:

- a burst runs 1000ms, and a press past that starts a new burst
- only the first press of a burst acts
- the fifth press sends the other value
- the button stands dead for 600ms after it fires

The reason, from v3:

    climbing goes one rung at a time, because handing over a whole ladder in
    one click is a move a person should have to mean. Releasing goes any
    distance at once, so a stray press always falls DOWN and never up, and that
    asymmetry is the safety rather than a confirmation dialog.

# The three controls

| control | what it does | what it needs |
|---|---|---|
| the log | runs `./RUNME.sh log`, opening lnav in the terminal | nothing new |
| hold | writes `stop.hold` | one mechanical rule in the stop table |
| ask | writes `ask` | a line the context block carries |

## The log tooltip teaches lnav

An action opening another program hands a person that program's keys. Nobody
reads a log viewer's manual first, and a person trapped in a full-screen tool
opens it once.

So the log button's hover carries five lines, and these five stand tested
against this tree's own log:

| key | what it does |
|---|---|
| `p` | open this line whole, with every field it hides |
| `G` | jump to the newest line |
| `/word` | find, and `n` for the next one |
| `:filter-in <regex>` | keep only the lines that match, and `:filter-out` drops them |
| `q` | leave |

`q` earns its place over anything cleverer, for the reason above. The rule
generalises: where an action starts another program, its hover names the keys
that program needs, and the declaration carries them beside the `help`.

The hold becomes a row in `spec/config/stop/level0.yml`, mechanical, `runs:
owner-holds`, on the stop side above `work-waiting`. The tooth reads the config
on its next ask, so the two halves meet in the file and nowhere else.

The ask lands in the standing block. Level zero reads the key and adds a line
asking what the session is doing, then drops the key as the turn ends.

# What waits for level one

Declare these fields and draw none of them. An engine has to exist first, and
this tree carries none. Declaring them now keeps the schema still when it
arrives.

| control | at rest | one click | five clicks |
|---|---|---|---|
| the engine | at rest | running | — |
| binding | bound to the queue | unbound | god mode |
| autonomy | finish your own token | start new tokens | ideation |

Two widget types wait with them: `count`, a number the engine replaces on a
beat, and `table`, rows the engine answers with the columns a declaration
names. Neither has anything to read yet.

Write this table into the design record you leave behind, so the next reader
finds it without reading a brief that has already merged.

# The local file dies

A session is one VS Code window, from its opening to its end:

| what happens | a new session? |
|---|---|
| a person quits and opens it again | yes |
| Developer, Reload Window | no |
| the engine restarts | no |

VS Code's main process outlives a window reload and dies on a quit. Hold its
process id beside the values in `.se/config.json`, and clear the file where the
id differs.

Prove that boundary and report it. Where the id turns out to move on a reload,
say so and name what else draws the line.

# The bottom section

Collapsed at the start, last in the order. Expanded, it shows a search box and
a tree:

- the top level names the config files, one node each
- below that, the tree of keys
- two columns: the key, and an editor matching the type
- the unit stands beside the editor where a value has one
- hovering a row shows the `help`
- the filter takes a regular expression, and a node shows where it matches or
  where a descendant matches

# What the cloud proves

Keep every step a pure function and pass VS Code in through a door. Then all of
this runs with no editor:

| layer | how |
|---|---|
| reading the declaration | a fake disk |
| the grid check | a declaration that overlaps, and one that does not |
| declaration to HTML | assert the string the renderer answers |
| a click to a message | drive the webview script alone |
| the watcher to a redraw | a fake watcher, then read the renderer again |

v4's renderer is `panelHtml(root, shown, icons, doing)`, answering a string.
Follow that shape, and a test over it stays cheap.

# What a person proves, once

Open the folder, and check the four things a string cannot show:

1. Nothing starts until a button says so.
2. The sidebar reads as part of VS Code, in both themes.
3. A click writes the file, and the widget follows the file.
4. A slash command moves the widget.

Write those four as a list in your handback, unticked. A person ticks them
after the merge.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Every layer above answers under test, with no editor running.
3. The grid check refuses an overlap and reaches the Problems panel.
4. The hold rule stands in the stop table, and the tooth reads it.
5. `npm` reaches only `src/extension`, and the tree's root stays bare.

# What your handback says

- What the extension weighs: dependencies, and what a person installs.
- How `DoorsOnly` reads a folder importing `vscode`, and your answer to it.
- Whether the process id draws the session line the way this brief claims.
- The four things waiting on a person, as a list they can tick.
- The mark the engine button wears, which the owner has yet to pick: play and
  stop, one per state.

## How this branch runs

Level zero deletes this file when it reads it, so the copy in your context
is the only one left. These steps write it back.

1. Run `./RUNME.sh work sync` FIRST. It takes main into this branch, so
   an old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Say what surprises you and every dead end you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Leave the merge into main to a person. A cloud box opens no pull
   request, and trunk only ever comes towards you.
