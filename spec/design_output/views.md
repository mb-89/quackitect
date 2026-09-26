---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

The views of the model: what a base file declares, and what the one renderer
draws off it. The window gets the renderer first, and the sidebar draws the
same files after it. For the order, see
[[spec/design_input/the-migration-runs-in-slices#the-phases]].

The keys a base file carries today stand in
[[spec/design_output/tree-view#a-base-file-says-it]]. This note adds the keys
the model needs.

# A view reads names

A base file under `spec/views` is a view, and the renderer draws it as a tab.
The file names what it reads, and the renderer computes nothing.

| the key | what it says | the work view |
|---|---|---|
| `reads` | the name whose value is the rows, a list of maps | `work/rows` |
| `badge` | the name the tab header draws beside the title | `work/open-tasks` |
| `actions` | the keys and buttons, each with what it calls | below |
| `follow` | new rows land at the end, and End follows them | the log alone |

`work/open-tasks` is the name the sidebar badge reads too. So the header and
the badge draw one number, and the bracket count in the renderer leaves the
code.

A column key names a key of the rows. The row type stands in the catalog, so a
column the rows lack is a fault at start.

# A view declares actions

Each entry under `actions` takes one trigger and one effect:

| the trigger | what it is |
|---|---|
| `key` | a key while the view holds the cursor |
| `button` | a button the renderer draws in the header, and the sidebar draws in its row |
| `arg` | what the key collects after it, such as `digit` |

| the effect | what the renderer does |
|---|---|
| `calls: <action>` | calls the action with the selected row's address, or the marked rows, and the `arg` |
| `edits: cell` | opens the cell edit, and Enter calls the action `writes` names |
| `edits: form` | opens a form built from the action's input type, and shows the command line it runs |
| `jumps: <filter line>` | moves the cursor to the newest row the line passes |
| `cycles: <preset>` | steps the view through the presets the file names, and round again |

The work view declares these:

    reads: work/rows
    badge: work/open-tasks
    actions:
      - { key: p,     arg: digit, calls: work/place }
      - { key: u,     calls: tickets/flip-urgent }
      - { key: enter, edits: cell, writes: tickets/set-field }
      - { button: pull, calls: work/pull }

An action answers a result, or a handle for a longer one. The renderer draws a
handle's state on the last line, off `ops/<id>`, until it ends. A refusal comes
back as the action's failure, with its reason, and the last line draws it. For
the handle, see
[[spec/design_input/the-index-holds-the-model#operations-carry-a-handle]].

# The log is a view

`spec/views/log.base` declares the log, in the same keys:

    reads: log/rows
    follow: true
    actions:
      - { key: E,     jumps: "level: error" }
      - { key: alt+l, cycles: floor }

`log/rows` is a fold over `session/`, so the log reads the events the index
holds, and no renderer tails a file. The `floor` presets carry the level
filters `alt+l` steps through today.

# The registry tabs

The registry draws in these tabs, each a base file over a name the index
provides:

| the tab | reads | what a row holds |
|---|---|---|
| `index` | `index/names` | a name, its value, its provider, and whether a provider answers it or it stands at its default |
| `cli` | `index/actions` | an action, its doc and its input type. Enter opens its form |
| `help` | `index/docs` | a name, an action or a key, and the doc `q.Doc` gives it |

The declared views stand first, in the order the config key `window.tabs`
names, and the registry tabs stand after them.

# The renderer draws declarations

| the rule | what holds |
|---|---|
| one renderer | the window and the sidebar each draw every base file, and neither names a view in its code |
| the check at start | each `reads`, `badge`, `calls` and `writes` names a name or an action in the catalog, or the index refuses to start |
| no meaning | a view decides how a row looks, and a provider decides what it says |
| a new view | a new base file and no change to a renderer |

The build holds the second rule over the renderers' imports. For the rule, see
[[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]].
