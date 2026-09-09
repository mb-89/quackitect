---
kind: [[funnel]]
about: one declaration, drawn as a sidebar and projected everywhere else
---

# The sidebar draws the tree

A VS Code extension at `src/extension`, showing a sidebar of collapsible
sections. One declaration says what every value is, where it draws, and what
mark it wears. Everything else comes out of that one file.

This note holds the design as the owner settles it. A branch takes a piece of
it, and no branch takes the whole.

# It starts silent

v3 and v4 both fire up the moment a person opens the folder. This one does
nothing until a button says so.

The extension loads, draws its sidebar, and starts no engine, no server and no
process. A person presses play, and that is when anything runs.

# One tree holds everything

v4's ruling, and it stands:

    Everything that changes how the system runs is one tree, with one declaration
    and one store. The panel is a subtree of it, chosen by a flag on a group.

So a parameter carries what it is and how it draws, in one entry:

    "hold": {
      "type": "enum",
      "default": "running",
      "options": ["running", "finishing", "stopped"],
      "help": "What the session does when it reaches the end of a turn.",
      "icon": "the raised hand and the robot",
      "at": "U+270B U+1F916",
      "group": "agent control",
      "row": 0,
      "column": 1,
      "gesture": 5
    }

A parameter naming no group is config alone. It shows in the bottom section
with every other value.

Marking a group is how a control comes to exist, so a new button is an edit to
this file, and no program changes.

Two notes on the fields:

- `at` earns its key because an emoji in source hides from a search.
- `for`, from v4's icon table, goes: `help` already says what a thing means.

There is no icon table and no second file for the widgets. v4 keeps a table
because one mark stands in three surfaces, and this tree has one.

# Two files hold the values

| file | holds | who writes it |
|---|---|---|
| `spec/config/level0.json` | the team's values | a person, in git |
| `.se/config.json` | what differs here and now | the sidebar, a slash command, the verb |

The sidebar edits the local file alone. A person typing into a row under the
tracked file writes an override, and the tracked file stays as the team holds
it.

## The view holds nothing

The sidebar reads that file as well as writing it, and holds no value of its
own. A click writes, and draws nothing. A watcher then fires, the sidebar
re-reads, and the widget lands in its new position.

So every writer takes one path:

| what changes the value | what the sidebar does |
|---|---|
| a click on a widget | writes the file, then redraws from the watcher |
| a slash command | redraws from the watcher |
| level zero clearing `ask` as a turn ends | redraws from the watcher |

A button agrees with the file always, because it carries nothing of its own.
v4 pays the other price and records it:

    Both directions are watched, which is a race that only a handshake covers.

One direction of truth costs a redraw per click, and buys the race away.

## The local file dies

A session is one VS Code window, from opening it to closing it.

| what happens | a new session? |
|---|---|
| a person closes the window and opens it again | yes |
| Developer, Reload Window | no |
| the engine restarts | no |

VS Code's main process outlives a window reload and dies on a quit, so its
process id draws that line. Hold the id beside the values, and clear the file
where it differs.

The reason: a hold stands for as long as a person means it, and a person who
closes the editor means to stop holding. Something meant to last belongs in the
tracked file, where the team reads it too.

# The grid

Each group is a section, drawn from the top. The config section comes last, and
a person opens it where they want it.

A section holds a grid five columns wide:

- a widget names `row`, `column`, `rowSpan` and `colSpan`
- a hole in the grid is legal
- moving a control changes no other entry

v4 flows its widgets in order with a span alone, and records the cost. The grid
is the renderer's contract, so a control wanting another layout has nowhere to
go.

Naming coordinates costs one check: no two widgets overlap, and none falls
outside five columns.

# The widgets

| type | writes | reads |
|---|---|---|
| `label` | nothing | nothing |
| `action` | fires a command once | nothing |
| `toggle` | a key, one value per position | its own position |
| `status` | a key, one value per position | something else entirely |
| `text` | a key, or hands the line to a command | itself |

## A light says it runs

v4 puts it plainly, and this is the line that separates a toggle from a status:

    A TOGGLE IS DOWN OR IT IS UP. There is nothing to report about it, so there is
    no light: a light says a thing is happening on its own, and this only ever
    says what the person last pressed.

So a status splits in two. What it `sets` and what it `watches` are separate
keys, because the engine button starts the engine and the light reports whether
the engine answers. Those facts disagree exactly when a person wants to know.

The light reads a heartbeat file the engine touches every five seconds:

| the light | what it finds |
|---|---|
| dark | the file stands missing, so nothing runs |
| pulsing | the file differs from the last look |
| red | the file stands still past its five seconds |

A file and a watcher, with no socket and no port. The engine writes it later,
and the field stands in the declaration now.

## A gesture picks a state

A click count picks which of three a control holds. It suits an enum, and a
boolean wants a plain toggle.

| control | at rest | one click | five clicks |
|---|---|---|---|
| hold | running | finish this work | stop now |
| ask | quiet | a short update | a full report |
| binding | bound to the queue | unbound | god mode |
| autonomy | finish your own token | start new tokens | ideation |

Two ways back to rest: press again, or let the thing finish. The report lands
and the control lets go by itself.

Take v4's timing whole:

- a burst runs 1000ms
- only the first press of a burst acts
- the fifth press sends the other command
- the button stands dead for 600ms after it fires

The reason is v3's:

    climbing goes one rung at a time, because handing over a whole ladder in one
    click is a move a person should have to mean. Releasing goes any distance at
    once, so a stray press always falls DOWN and never up, and that asymmetry is
    the safety rather than a confirmation dialog.

# The projection

The declaration is one file, and several programs want several others. So the
tree projects.

| target | who reads it | what it carries |
|---|---|---|
| `.claude/commands/*.md` | Claude Code | one command per settable parameter |
| `src/extension/package.json` | VS Code, at load | one entry per widget under `contributes` |

v4 holds what goes where as data, in `spec/config/projections.json`, so adding
a projection is an entry. It generates 34 slash commands that way already.

Level zero projects at `session.start`, because it runs there and holds
`$.fs.writeFile`. No engine needs to exist.

Two guards come with it:

1. `check` projects in memory, compares, and refuses a difference, naming the
   verb that mends it.
2. The write door refuses a write to a projected file. v4 calls a projection
   the one forbidden destination, because a person editing one loses the edit.

v4 records why this matters:

    v3 placed files as a step in the installer, so a projection could be refreshed
    only by running the installer again. That made a projection correct
    immediately after an install and drifting afterwards.

# What level zero holds

Three controls work with no engine at all, because the stop table already reads
`.se/config.json`:

| control | how it lands |
|---|---|
| the log | runs `./RUNME.sh log`, which opens lnav in the terminal |
| hold | one more mechanical rule in the stop table, `runs: owner-holds` |
| ask | a line the context block carries, and the turn's end drops it |

The ask asks at the end of a turn and holds nothing open. Stopping a turn part
way belongs to the tooth, which is a different machine.

# What waits for level one

Play and stop for the engine, the binding, the autonomy, `count` and `table`.
Each wants an engine to report something, and this tree carries none.

Declare their fields now and draw none of them, so the schema stands still when
the engine lands.

# How it is proven

Keep every step a pure function, and pass VS Code in through a door.

| layer | what proves it |
|---|---|
| reading the declaration | a fake disk |
| the projection | strings compared in memory |
| declaration to HTML | a pure function, and a test over its string |
| a click to a message | the webview script, alone |
| VS Code drawing it | a person, once, after the merge |

A cloud box builds every row but the last. v4's renderer is
`panelHtml(root, shown, icons, doing)`, answering a string, which is what makes
this cheap.

# What stands open

- `src/extension` takes the first npm dependency this tree carries. It lands in
  that folder, and the root stays bare.
- `DoorsOnly` refuses a `node:` import outside `src/doors`. The extension
  imports `vscode`, so `.vale.ini` names the folder or the extension reaches
  the editor through a door of its own.
- The mark for the engine, which the owner picks: play and stop per state.
- Whether the sidebar ever reads anything but a file, once an engine exists.
