---
kind: [[handover]]
status: held
urgency: now
---

# The schema reads a note

Build the reader and the checker for `spec/schemas`, and name every note that
departs from its schema. Refuse nothing on this branch.

Read the six files in `spec/schemas` first. They stand as proposals. Change one
where this tree says its shape is wrong, and say which and why in the handback.

# What lands

| the piece | where |
|---|---|
| the underscore skip | every linter, and the write door |
| the reader and the checker | `.claude/skills/level0/lib/schema.js` |
| the findings, at warning severity | `src/scripts/cli.js`, beside `tree.js` |
| the `mint` verb | `./RUNME.sh mint <kind> <path>` |

# Take the underscore first

Make every linter, the write door and the language server pass over a file
whose name opens with an underscore. Park a draft as `_note.md`, and the tree
stays green while a kind settles.

Land this before anything else. It is the escape every later step leans on.

# The checker answers findings

A finding carries the shape this tree already prints:

    { file, rule, line, column, message, severity }

`pathInScript` and the ten rules in `lib/tree.js` answer that shape today, and
`line()` in `lib/refuse.js` prints it. Follow both.

Name the rule for what it holds, so a reader sees the schema and the section:

    spec/guidance/voice.md:7:1: Schema.Actionables: A note holds 15 items.

The reader takes the schema text and answers a shape. The checker takes that
shape and a note, and answers findings. Hand both the disk through the door, so
a test drives them over a fake tree.

# Warning, and error later

Every finding lands at `severity: warning` on this branch. So `./RUNME.sh lint`
names each departure and the Problems panel draws it, while `check` stays
green.

The next branch flips them to error and puts the checker at the write door.
Leave that alone here.

# Mint writes a valid note

`./RUNME.sh mint <kind> <path>` reads the schema for that kind and writes a
note the checker passes:

| what mint writes | from |
|---|---|
| the frontmatter fields the schema requires | `frontmatter.required` |
| one heading per section the schema names | `body.sections[].header` |
| the description under each, as an HTML comment | `description` |

Hold a judge away from those comments, and count none of them toward a bound.
Read v4's ruling at `spec/rationale/a-section-is-measured-in-words`: the
template's own comments stay outside the size.

# What to watch

| the thing | what to do |
|---|---|
| A cloud box holds one session | The hooks module loads once at the start, so prove this through `./RUNME.sh lint` and the tests |
| A shape rule meets a fragment | An `Edit` hands a whole-document rule the edited lines alone, so the write door waits for the next branch |
| The guidance notes load by path | Level zero reads `spec/guidance/*.md`, so an underscore there takes the rules away from the agent |
| Vale reads `exceptions` | `VoiceVale/PastTense` carries eleven words the tagger misreads |

# What to prove

1. `./RUNME.sh check` passes, and it answers green with the findings standing.
2. A `_note.md` breaking a rule answers nothing from any linter.
3. Each schema keyword takes a test that feeds a bad note and reads the refusal.
4. `./RUNME.sh lint` names every departure in the standard line shape.
5. `./RUNME.sh mint` writes one note per kind, and the checker passes each one.

# What the handback says

- How many notes depart, one row per kind, so the next branch reads its size.
- Which schema keywords a program cannot check, and what each one costs.
- Which of the six schemas you change, and what the tree says that moves you.
- What `lint` costs in milliseconds with the checker running.

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
