---
kind: [[funnel]]
about: the editor a person works a ticket in, the engine that answers a pull and holds no beat, and what else closes level one
---

# Scope

Level one holds three rules. For details, see
[[spec/design_input/the-agent-pulls-tickets#three-rules-hold-level-one]].

| the rule | where it stands |
|---|---|
| the agent pulls | stands, through `./RUNME.sh ticket pull` |
| the engine decides | stands, through the pull's checks and the record |
| a person works the same files | open, and this note holds it |

A person reads the tickets in the work tab and takes one through the buttons
over its first line. Nothing yet draws the route a ticket stands on, and
nothing mints a ticket from the editor. This note weighs the shape that closes
the third rule, and the owner settles it. It leaves the build to a desk,
because a cloud box proves no editor.

# The engine answers a pull

The design input gives the engine a beat, a clock that hands a box a free
group on every tick. No code runs that clock. The pull and the mint each run
as one process, read the files, write the files, and exit. No key under
`engine` reaches any code past its tests, which a search for `engine.state`
and `engine.beat` under `src` shows.

The shape on offer drops the beat. The engine is the verbs, and it acts where
somebody asks:

| who asks | what answers |
|---|---|
| an agent, through the pull | the pull verb |
| a person, through a button or the verb | the same pull verb |
| the editor, drawing a ticket | the emitter, through `./RUNME.sh graph` |
| a routine on a cloud box | the pull, on the routine's own schedule |

A road that needs a server starts it first, the way a read tool starts the
server on its first call. For details, see
[[spec/design_output/level0#the-first-call-pays]]. So the index and the bridge
stay the processes that live on, and the engine lives as long as one answer.

The hook button under agent control stays the one switch. The engine switch
goes, and `engine.state` and `engine.beat` leave the schema.

| what the beat carries in the design input | where it lands |
|---|---|
| hands a free group to a box | the routine's schedule, which the platform holds |
| replaces the count of what waits on you | the editor reads the count where it draws, off the index |
| names a stale group | the listing reads a tip's age where a person asks |

The cost is a count that moves when something reads it, and stands still while
nothing does.

# One file holds both halves

A person opens a ticket in the markdown editor and meets one page:

| part of the page | what draws it | what a person does there |
|---|---|---|
| the frontmatter | folded, with a drawing over it | reads the route, the step it stands on, and the returns |
| the body | the markdown editor itself | writes the ask, the evidence and the discussion |

The body stays the editor's own text. So the completion of the language
server, the findings Vale draws, and the ticket buttons all hold there. The
drawing reads the graph the emitter answers, which
`src/extension/lib/drawing.js` already hands the editor.

VS Code draws a webview between the lines of a text editor through an inset,
`createWebviewTextEditorInset`. That call stands among the proposed APIs on
the main line of VS Code, so it carries three costs:

| the cost | what it asks |
|---|---|
| a published extension takes no proposed API | this tree links its extension from the folder, so nothing reaches a marketplace |
| the editor refuses the call without a flag | the extension names `editorInsets` under `enabledApiProposals`, and the launch passes `--enable-proposed-api quackitect.quackitect` |
| a proposed API changes between releases | a release can break the drawing, and the body holds on |

The drawing carries the stack v4 picks:

| piece | what it does |
|---|---|
| `@xyflow/react`, which is React Flow | draws the nodes and the edges |
| `@dagrejs/dagre` | lays the graph out, because the file carries no coordinates |
| Vite | answers one script the webview loads |

React Flow ships as modules, and a webview loads a script alone, so one step
bundles the drawing into a script. That is the extension's first build. The
install and the link `./RUNME.sh` already run take the step, and a person runs
nothing past that. The step writes the script, and git ignores it.

A side panel reading the same script is the road back. Where a release breaks
the inset, the same drawing opens beside the text, and nothing past its host
changes.

# The drawing takes an edit

The owner wants the drawing to take an edit, and a desk trial decides how far.
Each thing the drawing shows comes from a field, and the field says who writes
it:

| the drawing shows | the field | who writes it | an edit in the drawing |
|---|---|---|---|
| the leaves and the phases | `steps` | a person, and the verbs | adds, drops or moves a step the ticket has yet to reach |
| a pass edge | the order of `steps` | a person, and the verbs | reorders the steps ahead |
| a fail edge | `on_fail` | a person, and the verbs | draws the step a hand-back that fails returns to |
| a person's node, a dotted node | `by`, `when` | a person, and the verbs | picks the hand, or the condition |
| a form behind a leaf | the leaf's chapter in the body | the hand at that leaf | fills the evidence |
| the pointer, the skips, the returns | `step`, `record` | the pull alone | none, and a press on the pointer runs the take or the hand-back |

On a process file the drawing edits every row but the last, since a process
holds no pointer and no record.

The write door refuses an agent's hand edit to `steps`, and a person stands
outside that door. So the drawing edits under the rights a person already
holds. A route the drawing moves drifts from its process, and `process_hash`
names that drift.

The trial answers one question: whether a person edits a ticket's route at
all, or edits the process and runs `./RUNME.sh ticket update`.

# The work group

The group holds three buttons and no switch:

| the button | what a press does |
|---|---|
| the work editor | opens the work tab, which draws every ticket and takes a cell edit |
| pull for me | runs the pull for the person, and opens the ticket it hands out in the markdown editor |
| new ticket | opens a new ticket in the markdown editor, with a process to pick |

The pull for a person already runs, through the buttons over a ticket's first
line. For details, see [[spec/design_output/extension#a-button-runs-the-pull]].
The button takes the next ticket the queue hands a person, in place of a ticket
the person names.

The count of tickets waiting on a person rides the work editor's button, and
the index answers it where the sidebar draws.

# A ticket picks a process

A press of new ticket asks for a name, and opens a file under `spec/tickets`
carrying `kind` and an empty `process`. The completion offers every process
under `spec/processes`. A person picks one, writes the ask, and saves.

The save runs the mint's copy, and the file fills:

| the save writes | from |
|---|---|
| `steps` and `process_hash` | the process the person picks |
| `state`, at `draft` | the mint |
| a chapter per step, and the comments saying what goes where | the process and the ticket schema |

`./RUNME.sh mint ticket <path> --process=<name>` does this today from a
terminal. The save calls the same code, so one road writes a route. The write
door owns the three fields the verbs write. A person's editor stands outside
that door, so the save writes them through the verb.

A save over a ticket whose route stands already copies nothing. A changed
process goes to `./RUNME.sh ticket update`, which a person runs.

# A report takes a template

A report is work output, and it stands apart from any process. The tree holds
two kinds today:

| the kind | where it stands | its shape |
|---|---|---|
| a markdown report | the review's answer, the retro's report chapter | the note or the answer that carries it |
| an HTML page beside a note | `spec/funnel` and `spec/design_input` | its own style sheet, written by hand each time |

Each HTML page carries fonts, colours and a layout of its own. A reader meets
a new look on every page, and a hand spends its turn on the look.

The shape on offer is a template per kind of report, under `spec`. The report
carries the content, and the template carries the look. Two roads write the
page:

| road | what it costs |
|---|---|
| a projection writes the HTML from a markdown report and its template | one source, and the page follows it, at the price of what markdown draws |
| a hand writes the HTML inside the template's frame | every drawing HTML takes, at the price of a second copy beside the note |

# What closes level one

| the piece | where it stands |
|---|---|
| the pull, the checks, the record, the hold per hand | stands |
| the work tab, its filter, its sort and its cell edit | stands |
| the take and the hand-back over a ticket's first line | stands |
| the completion over a ticket's frontmatter | stands, in `src/lsp/complete.go` |
| the drawing over the frontmatter | this note |
| the work group and its three buttons | this note |
| a new ticket that fills on save | this note |
| the engine keys leaving the schema | this note |
| a template per kind of report | this note |
| the open tickets under `spec/tickets` | a search for `state: open` there names them |

Level one closes where a person takes a ticket, works it and hands it back
from the editor alone, with no terminal and no switch.

# What stands open

| the question | what hangs on it |
|---|---|
| whether the launch flag reaches a VS Code already running | `./RUNME.sh` passes it on a fresh launch, and a running window keeps the flags it starts with, where the editor's own `argv.json` holds the flag instead |
| whether the inset takes the height of a drawing that grows | a long route either scrolls inside the inset or asks for a height on every draw |
| how far the drawing edits a ticket's route | the desk trial, and the library of blocks the design input sets as desk work |
| which kinds of report take a template first | the review, the retro and the page beside a note each read differently |
| whether a projection or a hand writes the HTML | a single source against every drawing HTML takes |
| whether pull for me opens the ticket or its chapter at the step | the chapter puts the cursor where the evidence goes |
| what calls for an engine that lives on | work that moves with nobody asking, and today the routine's schedule carries all of it |
| what the design input says once the beat goes | it names the beat, the switch and the four controls, and a ruling here rewrites it |
