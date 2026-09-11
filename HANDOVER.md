---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

`spec/schemas` holds one schema per kind of note, and `lib/schema.js` reads
them. The write door weighs every markdown write against the schema its
`kind` names. `./RUNME.sh mint <kind> <path>` writes a note in the shape a
schema names, with the description of each chapter as an HTML comment. Two
things stand open, and the owner asks for both.

A note carrying no `kind` reaches no schema and passes, wherever it stands. So
a file under `spec/guidance` with no frontmatter meets no rule of the guidance
schema, and a rationale under `spec/funnel` passes as a funnel.

`mint` writes a template and hands the agent a file to edit. The owner asks for
the other way round: the agent hands the fields over, and the note comes out of
the schema.

# What waits

| the piece | where | proves it |
|---|---|---|
| `governs` in every schema | `spec/schemas/*.schema.yaml` | each schema names the folders it holds |
| the door refuses a stranger in a governed folder | `lib/schema.js`, and the write door | a kind-less file under `spec/guidance` refuses, and a funnel note there refuses |
| the sweep names one too | `schemaFaults` | `./RUNME.sh check` goes red on a stranger already in the tree |
| the `mint_note` tool | `hooks/level0.js`, beside `claim_stop` | the tool takes a kind, a path and the fields, and writes a note the checker passes |
| a placeholder for a field the agent leaves out | `lib/schema.js` | a note minted with one chapter carries the comment for the rest |
| the placeholder as a finding | `schemaFaults` | a note still carrying a placeholder comment stands at `warning` |
| the guidance line | `spec/guidance/guidance.md` | the note stays under its cap |

# A folder names its kind

Each schema takes a `governs` list, one glob a line:

    governs:
      - spec/guidance/**/*.md

The reader answers, for any path, which schema governs it, and a path no
schema governs stays as it stands today. In a governed folder the door holds
three things:

| the write | what happens |
|---|---|
| a note of the governed kind | the checker weighs it, as today |
| a note of another kind | refused, naming the kind the folder holds |
| a file with no `kind` | refused, naming the schema and `mint_note` as the road |

A draft under an underscore stays outside every rule, as it does today. The
handover schema governs `HANDOVER.md` at the root and `.se/HANDOVER.md`, so
its `governs` names two paths and no folder.

The folder names differ from the kinds in two places, `spec/rationales` for
`rationale` and `spec/design_input` for `design_input`. `governs` says the
folder outright, so no rule about names has to hold.

# The tool writes the note

`mint_note({ kind, path, fields })` reads the schema for the kind and writes
the note. `fields` carries the frontmatter values and the text under each
chapter, by header. The tool runs the checker over what it writes and answers
the findings. A note the schema refuses comes back with the finding, and no
file lands.

A field the agent leaves out takes the placeholder `mint` writes today, the
chapter's description as a comment. So the note lands whole in shape, and the
sweep names each placeholder still standing at `warning`, under
`Schema.Placeholder`. The agent fills it in with an Edit, which the door weighs
as today.

`./RUNME.sh mint` keeps its verb and takes the same fields on the command
line, so a person and a session read one shape.

# How to build it

Test the reader and the checker over the fake disk with a fixture schema
carrying `governs`. Test the door with a fake `$` handing in a kind-less write
under a governed folder, and assert the refusal names the schema. Test the
tool with a fake session and assert the note it writes passes the checker,
with one placeholder where a field is absent. Run `./RUNME.sh check` over the
tree, because the tree may carry a stranger today, and say in the handback
which files it names.

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
