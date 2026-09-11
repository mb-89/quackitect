---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The standing layer reaches the session at `prompt.context`, which the engine
declares fires once per conversation and again on a re-read, a compaction or a
`/clear`. The design in `spec/design_output/level0.md` rests on that
declaration. The client's own docs say a compaction summarises hook context,
so the two disagree, and nothing in this tree measures it.

The log writes a `level0` line at `session.start` and one for the canary at
the first `turn.complete`. `prompt.context` writes nothing, so a compaction
that drops the block leaves no trace, and one that keeps it leaves none
either. The `$` surface offers `$.session.compact({ instructions })` and
`$.command.run({ command })`, both callable from `turn.complete` or later, and
the engine names a `session.compact` event a hook can read.

# What waits

| the piece | where | proves it |
|---|---|---|
| a log line at `prompt.context` | `hooks/level0.js` | the line names the blocks it hands over and the reason, first or re-read |
| a log line at `session.compact` | `hooks/level0.js` | the line says a compaction happens, and what it keeps |
| `./RUNME.sh probe compact` | `src/scripts/cli.js`, and a lib beside it | the verb answers `survives` or `drops`, with the two log lines it reads |
| the forced compaction | `hooks/level0.js`, under `SE_PROBE_COMPACT` | a session under the variable compacts after its first turn |
| a contract test | `test/contract/compact.test.js` | the verb runs against the real client and answers one of the two words |
| the result, in the handback | `HANDOVER.md` | the first measured answer, and the road that measures it |

# What the probe does

The verb starts the client headless with `SE_PROBE_COMPACT=1`, asks for the
canary line, forces a compaction, asks for the canary line again, and reads
the log. Three roads can force the compaction, and the branch measures which
one holds:

| road | what the hook does |
|---|---|
| `$.session.compact` | at the first `turn.complete`, compacts, then submits the second prompt through `$.prompt.submit` |
| `$.command.run` | the same, running `compact` as the command |
| two headless runs | the verb runs the client twice with `--resume`, and the hook compacts at the end of the first |

The answer reads out of the log:

| the log carries | the verb answers |
|---|---|
| two `prompt.context` lines, and the second canary matches | `survives` |
| one `prompt.context` line, or a second canary with other numbers | `drops` |
| no `session.compact` line | `no compaction`, and the road stands unproven |

Write the road that holds into the design note, and the ones that fail into
the handback with what each one answers.

# Without the verb

The two log lines pay on their own. Once they stand, any session that compacts
in the ordinary course shows a second `prompt.context` line in `./RUNME.sh
log`, and the answer after it carries the canary or not. So a person reads
tomorrow's compaction out of the log, with no probe.

# At night

A routine runs the verb on a cloud box, the way `do_work` runs `work take`.
Its one prompt is `./RUNME.sh probe compact`, and the answer lands in the
log and in the session's own transcript. Say in the handback what the routine
needs beyond the verb, and whether a `-p` run keeps its process alive long
enough for the hook to compact and submit.

# How to build it

Test the log lines with a fake `$` and a fake log, and assert the fields. Test
the verb's reading as a pure function over log rows, with fixtures for each of
the three answers. Keep the forced compaction behind the variable, so no
ordinary session ever compacts on the hook's word. Run the contract test once
on this box and write the answer into the handback.

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
