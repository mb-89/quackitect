---
kind: [[handover]]
status: done
urgency: soon
---

# Where it stands

A route is data, and its drawing derives from it. The six slots of a step earn
two mechanical checks. `./RUNME.sh check` is green, and every piece the brief
names stands.

| the piece | where | what proves it |
|---|---|---|
| the six routes | `spec/processes/*.yaml` | a contract case reads each one through the process schema |
| the copy at the mint | `mint ticket --process <name>` | a contract case mints a whole ticket off every process |
| the hash over the route | `processHash` in `lib/schema.js` | a comment and a reordered key move no hash, and a changed step moves it |
| `work reroute <ticket>` | `src/scripts/work.js` | it recopies the leaves ahead, keeps the leaves the ticket holds, and refuses a step the new route lacks |
| `work note <name> <line>` | `src/scripts/work.js` | it writes a private ticket with `from` off the hold, and a `note` row to the log |
| the slots and their checks | `slotFaults` in `lib/schema.js`, through `lint` | an orphan output, an unfed input, and a route carrying both |
| the emitter | `src/scripts/graph.js` | a case per node kind and per edge kind, off a route and off a record |
| the editor's reader | `src/extension/lib/drawing.js` | it hands the file to the emitter, and holds no graph of its own |

# What the emitter answers

The graph carries nodes before edges, a label on every edge, and no coordinate
and no colour:

| in the graph | from |
|---|---|
| a node per phase and per leaf | `steps` |
| a `pass` edge between siblings | the order |
| a `holds` edge from a phase to each of its steps | the tree |
| a `fail` edge back, with its label | `on_fail` |
| a dotted node | `when` |
| a marked node | `by: person` |
| the pointer, the skips and the returns | `step` and `record` |

Two readers reach it. `./RUNME.sh graph <path>` prints the graph as JSON for
anybody. `graphAt(door, path)` in the extension reads a process file or a
ticket through the editor's door. It asks the same emitter, through the door's
new `imports`. Neither holds a copy, so nothing drifts. The webview draws
nothing yet, which is the desk work the design input leaves to the owner.

# What the slot checks refuse

| check | what it refuses | what answers it |
|---|---|---|
| an output nothing reads | an evidence field no later step, no `to` and no engine form reads | a later `input`, a `to` on the leaf or a phase above it, or the forms `command` and `verdict` |
| an input nothing supplies | an `input` naming neither `ask`, `diff`, an earlier step, nor an earlier evidence field | a name standing before the step that reads it |

The check runs on a process file and on a ticket alike, because `checkNote` and
`checkData` both call it.

# What the tree gains

| file | what changes | why |
|---|---|---|
| `spec/processes/retro.yaml` | `notes` reads `field`, and `improve` reads `score` | two evidence fields stand orphaned, and the steps that use them say so now |
| `spec/schemas/ticket.schema.yaml` | the default route's `do` carries `to: retro` | a ticket minted with no process writes evidence nobody reads |
| `spec/schemas/ticket.schema.yaml` | `input` carries `x-fields: evidence` | `input: verdict` names an evidence field, which the design input's own example means |
| `lib/schema.js` | `refersFaults` reads `x-fields` | the fourth modifier, so a name resolves to a field where no step carries it |

# What surprises me

1. The checker reads a process file shallow. `process.schema.yaml` points at
   `ticket#/frontmatter/properties/steps`. The nested `steps` inside that
   points at `#/frontmatter/properties/steps`. That pointer resolves against
   the process schema, and it finds nothing. So every step under a phase goes
   unchecked on a process file. The same route on a ticket meets every rule.
   The slot checks walk the route itself, so they reach both files. The
   keyword checks still stop at the top level of a process file.
2. `input: verdict` in the design input's worked example names an evidence
   field, and `x-earlier` knows steps alone. It finds the later top-level
   `verdict` step and refuses the route. Here is a dead end I walk into: I
   first read this as a fault in `standard.yaml`, and I nearly rewrite the
   route. The design input settles it in prose, under "earlier evidence by
   path". So the keyword learns `x-fields` instead.
3. The hash reads the route and the ask, and no graph. The design input says
   the hash reads the graph. The emitter stands beside the verbs. The hash
   stands in the plugin's lib, which reaches nothing under `src`. The route is
   what the graph derives from. So a hash over the route holds the property
   the design input wants, and the plugin stays isolated.
4. The commit door refuses the harness's own attribution trailers. The
   characters rule turns away `<` and `$`. So every commit on this branch
   carries a subject and nothing else.
5. `CodeComment` reads the opposite of what its message suggests. After the
   first line of code, every comment line carries a link, or the line is a
   finding. Prose belongs in the header's five lines or in a design note, and
   a mid-file comment is one link.
6. Here is a dead end that costs a pass. The first slot check names every
   finding at line 1, because `slotFaults` takes no line map. The reader keeps
   one already, and the two callers hand it in now.

# What waits

| what | where it belongs |
|---|---|
| the webview drawing the graph | the editor, as desk work with the owner |
| a local `$ref` resolving against its own schema | `refOf` in `lib/schema.js`, so a process file meets the keyword checks deep |
| the hold the note verb reads | the pull, which is a later branch, so `from` reads `anyone` on a box holding nothing |
| the tickets folder beside the rationales in `.vale.ini` | the branch that lands the first ticket the tree keeps |

## How this branch runs

1. Run `./RUNME.sh work sync` FIRST. It takes `main` into this branch, so an
   old branch works against what the tree holds now. Resolve any conflict
   before you start, because a conflict found later costs the work already
   done.
2. Commit and push each time you finish a thing. A cloud box dies and takes
   its working tree with it.
3. Write your result and your retro into `HANDOVER.md`, at the root, replacing
   this brief. Head the retro `What surprises me`, and name every dead end you
   walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Run `./RUNME.sh work merge <name>` from `main` to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds `main`
   shut there and a cloud box opens no pull request.
