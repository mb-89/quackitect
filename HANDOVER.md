---
kind: [[handover]]
status: held
urgency: now
---

# The code asks, reading nothing

Two rules in `test/contract/tree.test.js` read `spec/config/level0.json` and
assert it carries what the code reads. Two readers open that file directly:

- the hooks module, at `session.start`
- the command line, at module load

Each keeps what it finds for the life of its process. So a number stands in
three places at once: the file, a reader holding a stale copy, and a constant
somewhere reading nothing at all.

This branch gives the tree one resolver. Code asks it for a key and takes what
comes back. How the value gets there is none of the caller's business.

# The three layers

| layer | who writes it | when a reader reads it |
|---|---|---|
| `spec/config/level0.json` | the team, tracked in git | once, at start |
| the environment | whoever launches the box | once, at start |
| `.se/config.json` | a slash command, per box, git ignores it | on access, after a change check |

A later layer beats an earlier one. So the per-box file beats the environment,
and the environment beats the tracked file.

Two things follow, and both matter:

- **No default stands in code.** The tracked file is the defaults. A key the
  code reads and the file lacks is a fault, and the schema below catches it.
- **A key standing only in the per-box file still resolves.** The merge takes
  every key it meets, whichever layer names it.

# Why the local file differs

| file | why it reads that way |
|---|---|
| the tracked one | it moves when somebody commits, so once is enough |
| the per-box one | a slash command writes it mid-session |

The per-box file is the state, so the resolver reads it on every ask. It is a
small file, and a cache nobody has measured is a cache nobody needs.

Measure that, and say the number in your handback:

- The write door asks on every Write and Edit, so that is the ask to time.
- Where one ask costs enough to see, check `mtimeMs` and `size` before the
  read. `$.fs.stat` answers both.
- Build that check only where the measurement calls for it.

## A bad file changes nothing

A slash command writes that file, so a half-written or unreadable one reaches
the resolver eventually.

The resolver shrugs. It keeps the layers beneath, says so once in the log under
the door `level0`, and carries on.

One bad command that takes a session down leaves a person deleting a file they
cannot see, which is the worst way out of anything.

# Where the resolver lives

`.claude/skills/level0/lib/config.js`, free of `node:` imports, so the hooks
module and the command line both load it.

It takes its reads as arguments, the way `lintText` takes a binary. The hooks
module hands it `$.fs`; the command line hands it the disk door. The resolver
itself reaches nothing.

Each process holds its own resolved copy. The one truth is the files, and two
processes may see a change a moment apart. That is fine, and say so in the
design record so nobody calls it a bug later.

# The schema

`spec/config/level0.schema.json`, draft 2020-12, and `spec/config/level0.json`
gains `"$schema": "./level0.schema.json"` as its first key. The editor validates
it from that line alone, with no extension and no server.

## Write it for an editor

VS Code builds its settings editor from schema entries. Follow the same
conventions and a config pane later costs almost nothing:

| key | why it earns its place |
|---|---|
| `type` | the control a pane draws |
| `default` | what a pane shows where the file says nothing |
| `description` | the hover, and the line a pane prints |
| `enum` | a list becomes a dropdown |
| `markdownDescription` | a link inside the hover |

## What it must hold

| object | fields the code reads |
|---|---|
| `judge` | `enabled`, `model`, `maxSpans`, `warmupWrites`, `thenEveryNth` |
| `stop` | `enabled`, `mostInARow` |
| `log` | `level` |

Read the code for the truth of that table. `judgeOf` in `lib/judge.js` and
`toothOf` in `lib/stop.js` name what they read.

Mark every object `"additionalProperties": false`. That governs the tracked
file. The per-box file merges whatever it names, because it is a person's own
override and the schema is the team's agreement.

# The verb names the layer

`./RUNME.sh config` prints every key, its value, and the layer answering it:

    judge.enabled        true      spec/config/level0.json
    judge.model          sonnet    .se/config.json
    stop.mostInARow      3         spec/config/level0.json
    log.level            warn      SE_LOG_LEVEL

`git config --show-origin` is the shape to copy. Three layers with no way to
ask which one answers leave a person guessing in three places.

`./RUNME.sh config <key> <value>` writes the per-box file, making the directory
where it stands missing. A slash command calls that verb later, so build the
verb and leave the command alone.

## The verb coerces

A command line hands over text. `stop.mostInARow 5` writes the number `5`,
because `"5" > 3` is a comparison somebody reads a bug report about later.

The schema says the type, so the verb reads the schema and coerces to it.

Where the schema knows no such key, write the text as given. A key only the
local file names still resolves, and nothing knows its type.

## A variable names a key

One rule, both ways: `judge.maxSpans` reads `SE_JUDGE_MAX_SPANS`. Write the
mapping in `lib/config.js` and hold it with a test in both directions.

# The numbers leave the code

| number | where | what to do |
|---|---|---|
| `WORDS = 5` | `lib/names.js` | move to `level0.json`, and let the caller hand it in |
| `mostInARow` default | `lib/stop.js` | ask the resolver, and carry no default |
| `max := 5` | `ShortHeading.yml` | leave it: a rule file is config already |
| `max := 15` | `GuidanceCap.yml` | leave it, for the same reason |

Biome carries `noMagicNumbers`. Turn it on in `spec/config/biome.json`, see how
large the debt is, and say the number in your handback. Where the debt is small,
pay it. Where it is large, name what you leave, and why.

Expect noise: an index, a zero, a one, a slice bound. Configure the rule to skip
those, and name the values you exempt.

# What leaves the tests

Delete these two from `test/contract/tree.test.js`:

- the tooth settings carry every field the hook reads
- the judge settings carry every field the judge reads

The schema holds both. Put one contract case in their place: the schema refuses
a config missing a field, and passes the config this tree ships.

# What to prove first

1. `./RUNME.sh check` passes, and it runs `claude plugin validate` for you.
2. Each layer beats the one under it, under test against a fake disk.
3. A write to `.se/config.json` reaches the next ask.
4. An unreadable `.se/config.json` leaves every other layer standing.
5. The schema refuses a config missing a field.
6. `./RUNME.sh config` names the layer answering each value.
7. No number the config owns stands in code, and a grep in your handback shows
   what remains.

# What your handback says

- What one ask costs inside the write door, and whether a cache earns a place.
- The size of the magic-number debt, and the values you exempt.
- Whether the editor draws the schema with no extension.
- Every field the code reads and the config lacks.

# What this branch leaves alone

The config pane in the editor, and the slash commands themselves. The verb is
the surface both will call, so build the verb well and stop there.
