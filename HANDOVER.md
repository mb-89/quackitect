---
kind: [[handover]]
status: todo
urgency: soon
depends_on: [the-ticket-has-a-schema]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

The schema branch lands the ticket, the group and the process schemas, and
this branch fills them. Its chapters are The route, Processes are routes, and
The drawing is a projection.

| what stands today | where |
|---|---|
| the projections, one entry each | `spec/config/projections.json`, and `.claude/skills/level0/lib/projection.js` |
| the write door, which refuses a hand edit to a target | `.claude/skills/level0/hooks/level0.js` |
| the log, one row per event | `.se/log/session.jsonl`, through `lib/log.js` |
| the hold this branch reads | none yet, since the pull is a later branch |

# What waits

| the piece | where | proves it |
|---|---|---|
| the five routes | `spec/processes/{note,trivial,standard,complex,group}.yaml` | each passes the process schema |
| the copy at the mint | `mint ticket --process <name>` | the ticket carries the route and `process_hash` |
| the hash over the graph | `lib/schema.js` | a comment or a reordered key in the process file moves no hash |
| `work reroute <ticket>` | `src/scripts/work.js` | it recopies the leaves not yet reached, and refuses a `step` the new route lacks |
| `work note <name> <line>` | `src/scripts/work.js` | it writes a private note with `from`, and a `note` row in the log |
| the six slots and their checks | `lib/schema.js` and `lint` | an orphan output, an unfed input and a route with both refuse |
| the emitter | one module the projection and the editor share | a route and a record answer a graph, and the graph answers a Mermaid fence |
| the projected drawing | `spec/processes/<name>.md`, one row in `projections.json` | the door refuses a hand edit, and a stale drawing fails `check` |
| `work show <ticket>` | `src/scripts/work.js` | it prints the graph as text |

# The graph

The emitter answers a graph and no picture:

- a node per phase and per leaf
- a pass edge between neighbours, and a fail edge back with its label
- a dotted node for `when`, and a marked node for a person step
- for a ticket, the pointer, the skips and the returns off the record

The Mermaid fence follows v1's rules: nodes before edges, every edge with a
label, no coordinates. The fence carries classes and no colours, since the
extension's one style sheet holds the style. Spend nothing on graphical
design here, because that is desk work with the owner.

# The note answers

`work note` writes a `note` row to the log. A later branch teaches the answer
door to read it, so this branch writes the row and stops there.

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
   this brief. Head the retro `What surprises me`, and name every dead end
   you walk into.
4. Run `./RUNME.sh work done`, which sets the status and pushes.
5. Run `./RUNME.sh work release` instead where you stop early, so the branch
   goes back to `todo` for somebody else.
6. Run `./RUNME.sh work merge <name>` from main to take it in, then
   `work close`. A cloud box stops at step 4, because the harness holds
   main shut there and a cloud box opens no pull request.
