---
kind: [[handover]]
status: held
urgency: now
---

# A schema holds the config

Two rules in `test/contract/tree.test.js` read `spec/config/level0.json` and
assert it carries what the code reads. A test is the wrong holder for that. A
JSON Schema says the same thing, and the editor draws it without a server.

The wider job behind it is the owner's rule: a number belongs in config, and
the code names a constant that reads it.

# The schema

## What to write

`spec/config/level0.schema.json`, draft 2020-12, describing every field of
`spec/config/level0.json`. Every property carries a `description`, because that
string is what the editor shows on hover and what a later config editor reads.

`spec/config/level0.json` gains `"$schema": "./level0.schema.json"` as its
first key. The editor validates it from that line alone, so this half needs no
extension and no server.

## What the schema must hold

| object | fields the code reads |
|---|---|
| `judge` | `enabled`, `model`, `maxSpans`, `warmupWrites`, `thenEveryNth` |
| `stop` | `enabled`, `mostInARow` |
| `log` | `level` |

Read the code for the truth of that table. `judgeOf` in `lib/judge.js` and
`toothOf` in `lib/stop.js` name what they read.

Mark every object `"additionalProperties": false`. A typed key that nothing
reads is the fault this schema exists to catch.

## What leaves the tests

Delete these two from `test/contract/tree.test.js`:

- the tooth settings carry every field the hook reads
- the judge settings carry every field the judge reads

Put one contract case in their place, in `test/contract/schema.test.js`: the
schema refuses a config missing a field, and passes the config this tree ships.
Validate with a schema library, or hand-roll the check the schema describes.

# The numbers leave code

## The rule

A number in code names a constant, and that constant reads from the config of
its level. A message prints the value it compares against, and spells no number
in words.

## Where they stand

| number | where | what to do |
|---|---|---|
| `WORDS = 5` | `lib/names.js` | move to `level0.json`, and let the caller hand it in |
| `mostInARow` default | `lib/stop.js` | read the config, and carry no default in code |
| `max := 5` | `ShortHeading.yml` | leave it: a rule file is config already |
| `max := 15` | `GuidanceCap.yml` | leave it, for the same reason |

`lib/names.js` reaches nothing outside itself, so it takes the cap as an
argument the way `lintText` takes a binary. The command line and the hooks
module each read the config once, and hand it down.

## What catches the next one

Biome carries `noMagicNumbers`. Turn it on in `spec/config/biome.json`, see
how large the debt is, and say the number in your handback. Where the debt is
small, pay it. Where it is large, name what you leave, and why.

Expect noise: an index, a zero, a one, a slice bound. Configure the rule to
skip those, and name the values you exempt.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. The schema refuses a config missing a field, under test.
3. The editor draws a squiggle on a bad `level0.json`. Say how you see it.
4. No number the config owns stands in code, and a grep in your handback shows
   what remains.
5. `noMagicNumbers` runs, and you pay or name each of its findings.

# What your handback says

- The size of the magic-number debt, and the values you exempt.
- Whether the editor draws the schema without an extension.
- Every field the code reads that the config lacks.

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
