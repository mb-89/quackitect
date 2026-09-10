---
kind: [[handover]]
status: held
urgency: soon
depends_on: the-config-holds-numbers
---

# The projector stands

`spec/config/projections.json` says where each projection lands.
`.claude/skills/level0/lib/projection.js` holds the mechanism, and
[[spec/design_output/projection]] carries the whole design.

The first target is `.claude/commands`, holding fifteen slash commands, one per
settable value in `spec/config/level0.json`.

# What the proofs say

| what the brief asks | where it stands |
|---|---|
| `check` passes, and validates the plugin | 289 tests, and `√ Validation passed` |
| every settable value carries a command | `.claude/commands`, fifteen files |
| no file stands for a value nobody declares | `staleIn` answers `extra`, and `project` drops it |
| `check` refuses a hand edit, under test | `test/level0/projection.test.js`, over a fake disk |
| the write door refuses a generated file | `test/level0/hooks.test.js`, both `Write` and `Edit` |
| a command sets the value, end to end | measured below, twice |
| a second entry projects with no code change | `test/level0/projection.test.js` |

# The command road works here

Measured on 2026-09-10 against client 2.1.267, in a copy of this tree:

    $ claude -p "/se-log-level-warn"
    $ cat .se/config.json
    { "log": { "level": "warn" } }

    $ claude -p "/se-judge-model sonnet"
    $ cat .se/config.json
    { "log": { "level": "warn" }, "judge": { "model": "sonnet" } }

So the second road holds. A command file carries `!` and the run, names the
verb in `allowed-tools`, and the client runs it before the turn opens. A file
taking an argument carries `$ARGUMENTS`, and the client fills it in ahead of the
run.

The keyword road stays unbuilt, and nothing in this branch reads a prompt.

# What projecting costs

Twenty runs of each, over one projection and fifteen targets:

| the run | cost |
|---|---|
| every target already reads as projected | 0.29 ms median, 0.20 ms low |
| all fifteen take a write | 0.59 ms median, 0.45 ms low |

The number comes from the projector over the disk door. **The hooks module
loads nowhere on this box**, so no `session.start` line stands to read. Client
2.1.267 counts one plugin, which belongs to the client, and registers no hook
from it. [[spec/design_output/level0#the-trust-gate-reaches-skills]] predicts
this, and it now carries the count and the client.

Whoever runs a box that loads the module reads the true figure off the log line,
door `project`, which carries `ms`.

# The fields taken from v4

| field | here |
|---|---|
| `name`, `target`, `wrap` | taken as they stand |
| `sources`, `sources_from` | left, because `from` names one declaration |
| `section` | left, because a chapter of a note projects nowhere yet |
| `preamble` | left, because no target here opens with borrowed text |
| `local` | left, because git tracks every target here |
| `shape`, `schema` | new, because a key needs its type before it is a command |

A target here holds many files, where every v4 target is one file. One value
becomes one command, so the declaration sets how many files land.

# Where a value holds out

## The word cap refuses one

`stop.mostInARow` reads as `se-stop-most-in-a-row` in kebab case, and that name
holds six words where this tree allows five. So the leaf keeps the case the key
holds, and the file reads `se-stop-mostInARow.md`. Every other name comes out
under the cap by luck alone, so a longer key coming later meets the same wall.

## A two word section breaks

`answerFirst.enabled` reads back from `SE_ANSWER_FIRST_ENABLED` as
`answer.firstEnabled`, so the contract test on the variable mapping refuses it.
The config design says a key holds one section and one leaf, and `answerFirst`
holds a section of two words. This branch renames it to `answer.enabled`, which
matches `stop.enabled` and `judge.enabled` and the name the log door already
uses.

## A comment carries no command

`flatten` skips every `comment` key, so the prose beside a value takes no file.
That falls out of the config resolver, and it costs nothing here.

# The surprise

**The branch this one depends on stands done and outside `main`.**

`work take` reads `depends_on` and holds a branch only while its dependency
stands at `todo` or `held`. A `done` dependency counts as satisfied, and it
waits on a person to merge it. So this box takes a branch whose dependency it
cannot read, and `./RUNME.sh config` stands nowhere in the tree the brief
describes.

This branch merges `origin/work/the-config-holds-numbers` into itself and goes
on. `./RUNME.sh work sync` takes trunk alone, and no verb takes a dependency, so
the merge happens by hand. It costs four resolutions:

| what collides | how it resolves |
|---|---|
| `$.fs.readFile` and `$.fs.write` | main renames the file surface, so the resolver follows |
| `answerFirst` reaching the old config | it asks the resolver, the way the tooth does |
| `findings` importing `WORDS` | the caller hands the word cap in |
| `answerFirst` breaking the round trip | it becomes `answer` |

**A person merging this branch takes both pieces of work in one go.** Read
`./RUNME.sh work read the-config-holds-numbers` for the handback under this
one, because `HANDOVER.md` carries one file and this one replaces it.

## What the next branch pays

`the-sidebar-draws-it` waits on this one and reads the same declaration. It
meets this merged history, so it takes no second merge.

Two things stop this. A `work depend` verb takes a done dependency in. A merge
to trunk soon after a branch says done leaves nothing to take.

# The dead ends

## A nested client loads none

Measuring the session start asks for a client running under this one. Two runs
answer with no `.se/level0.stamp` and no log line, in a copy of the tree and in
the tree itself. The debug log names the count, and the trust gate section
already carries the reason.

Reading `/root/.claude/debug` answers what `claude --debug` swallows, which is
worth knowing on the next branch that measures a hook.

## The generated files meet Vale

`.claude/commands` sits inside the glob the rules read, so every projected file
meets `PastTense`, `LongSentence` and the rest. The first draft breaks four of
them. The projector now wraps its lines at the width a person holds, and the
body says what is.

This is the good kind of dead end. A generated file that ducks the rules reads
as a second voice in the tree.

## The output meets them harder

Fourteen findings over the first draft of [[spec/design_output/projection]],
most of them `Antithesis` and `ShortHeading`. Writing a design output costs
about as long as writing the code it describes.

# What this branch leaves alone

Every widget field in the declaration: `group`, `row`, `column`, `icon`. Nothing
here reads one, and nothing projects one.

# What comes next

1. A person merges this branch, which carries the config resolver with it.
2. A person runs `./RUNME.sh work close the-config-holds-numbers` after that.
3. The sidebar branch reads `spec/config/level0.json` and adds the widget
   fields.
4. A box that loads the hooks module reads the real `session.start` cost off the
   log and writes it into the design output.
