---
kind: [[design_input]]
---

# Scope

A person takes a ticket, works it and hands it back from the editor alone.
That closes level one. For details, see
[[spec/design_input/the-agent-pulls-tickets#three-rules-hold-level-one]].

Four groups build it. A cloud box builds three, and a desk builds the editor
host. The open questions stand in [[spec/funnel/a-person-works-the-ticket]].

# Three layers share one contract

| layer | built at | holds |
|---|---|---|
| the engine answers | cloud | a verb per answer, each writing JSON: the graph, a route edit, the fill, yours and next |
| the drawing | cloud | one web page drawing a route. The graph and the theme go in, and jump, edit, take and hand-back come out |
| the editor host | desk | an inset beside `src/extension/editor-lens.js`, or a side panel where the inset fails. It folds the frontmatter, fills on save, draws the work group and runs the verbs the way the lens runs them |

The drawing talks to its host through messages alone. A fake host drives it in
a test, so the cloud box proves the page with no editor.

# The owner rules

| the question | the ruling |
|---|---|
| the bundler | `esbuild`, one binary writing one script. Install runs it, and git ignores the script |
| the drawing's libraries | `@xyflow/react` draws, and `@dagrejs/dagre` lays the graph out |
| a browser test in the check | the check runs it, and the browser joins the dependencies |
| the group on terms | it opens now, beside the engine and the drawing |
| the dictionary | it is the source, and points at nothing inside the tree |

A webview reaches no dev server, so a bundler's live reload buys nothing here.

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
the main line of VS Code, so it carries these costs:

| the cost | what it asks |
|---|---|
| a published extension takes no proposed API | this tree links its extension from the folder, so nothing reaches a marketplace |
| the editor refuses the call without a flag | the extension names `editorInsets` under `enabledApiProposals`, and the launch passes `--enable-proposed-api quackitect.quackitect` |
| a proposed API changes between releases | a release can break the drawing, and the body holds on |

React Flow ships as modules, and a webview loads a script alone, so the
`esbuild` step bundles the drawing into a script. The install and the link
`./RUNME.sh` already run take the step, and a person runs nothing past that.

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
holds, through `ticket route`. A route the drawing moves drifts from its
process, and `process_hash` names that drift.

# The work group

The group holds these buttons and no switch:

| the button | what a press does |
|---|---|
| the work editor | opens the work tab, which draws every ticket and takes a cell edit |
| pull for me | runs the pull for the person, and opens the ticket it hands out in the markdown editor |
| new ticket | opens a new ticket in the markdown editor, with a process to pick |

The pull for a person already runs, through the buttons over a ticket's first
line. For details, see [[spec/design_output/extension#a-button-runs-the-pull]].
The button takes the ticket `ticket yours --next` names, in place of a ticket
the person names. The count `ticket yours --count` answers rides the work
editor's button.

# A ticket picks a process

A press of new ticket asks for a name, and opens a file under `spec/tickets`
carrying `kind` and an empty `process`. The completion offers every process
under `spec/processes`. A person picks one, writes the ask, and saves.

The save runs `ticket fill`, and the file fills:

| the save writes | from |
|---|---|
| `steps` and `process_hash` | the process the person picks |
| `state`, at `draft` | the mint |
| a chapter per step, and the comments saying what goes where | the process and the ticket schema |

The save calls the code the mint calls, so one road writes a route. A save over
a ticket whose route stands already copies nothing. A changed process goes to
`./RUNME.sh ticket update`, which a person runs.

# Install resolves a browser

Install finds a browser of the Chromium family in this order, and the test
launches the first it finds by its path:

1. `PLAYWRIGHT_CHROMIUM`, where it names a file
2. the browsers under `PLAYWRIGHT_BROWSERS_PATH`
3. `chromium`, `chromium-browser`, `google-chrome` or `chrome` on the path
4. `npx playwright install chromium`, where the three above find nothing

`./RUNME.sh doctor` names the browser it resolves.

# The engine answers the editor

Group `the-ticket-answers-the-editor` builds this at a cloud box, and it waits
on nothing.

| child | what it adds |
|---|---|
| each node names its place | each graph node carries its chapter and its line, from `src/scripts/graph.js` |
| `ticket route` | edits the steps ahead of the pointer, and leaves the record alone |
| `ticket fill <path> --stdout` | answers the filled ticket the mint writes, through `mintNote` in `.claude/skills/level0/lib/schema-mint.js` |
| `ticket yours --count` and `--next` | the count waiting on a person, and the ticket the queue hands them |
| the config schema | `engine.state` and `engine.beat` leave `spec/config/level0.schema.json`, and the work group declares its buttons |
| the language server | completes `process`, folds the frontmatter, and raises no missing `steps` while `process` stands empty |
| `ticket update` keeps a route | a route a person edits stays, or the verb names the drift |

# The drawing draws a route

Group `the-drawing-draws-a-route` builds this at a cloud box, and it starts
beside the engine group. The child for edits and clicks names the engine's
node-place child under `depends_on`, because a jump needs the chapter and the
line.

| child | what it adds |
|---|---|
| the bundle | the `esbuild` step in install, the dependencies, the ignore line, and the browser install resolves |
| the page | draws a route read-only, speaks the protocol, and a fake host drives it in a browser test the check runs |
| edits and clicks | an edit or a click leaves the page as a message |

# The editor holds the drawing

Group `the-editor-holds-the-drawing` builds this at a desk. Its first child
runs alone, and the rest wait on the two groups above.

| child | what it adds |
|---|---|
| the inset probe | whether the owner's VS Code runs `createWebviewTextEditorInset` under `--enable-proposed-api quackitect.quackitect` or `argv.json` |
| the host | the inset or the side panel, the fold, and a redraw on change |
| messages to verbs | each message runs its verb as a child process |
| fill on save | a save over a ticket with an empty route runs `ticket fill` |
| the work group | the sidebar draws the work editor, pull for me and new ticket |
| the walk-through | the owner creates, takes, works and hands back a ticket from the editor alone |

# Terms mean themselves

Group `terms-mean-themselves` builds this at a cloud box, and it waits on
nothing.

The dictionary is the source of what a term means, so a term points at no
note in this tree. A note points at a term, and the dictionary points at
nothing inside the tree. A term can cite a source outside the tree, such as a
standard or a paper, by its address.

| child | what it adds |
|---|---|
| the field | a term carries `means`: one line in core words and other terms, with no link |
| the refusal | the shape rule and the entry schema refuse `defines` and a link into the tree, and `lib/vocabulary.js` words the refusal |
| the outside source | a term carries `source` where it cites an address outside the tree |
| every term | each term in `spec/vocabulary/terms.yml` carries its line |
| the hover | the language server shows `means` over a term |
