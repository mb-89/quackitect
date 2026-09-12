---
kind: [[handover]]
status: todo
urgency: whenever
depends_on: [the-agent-pulls-a-ticket]
---

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

The pull hands a leaf out already. This branch hands the guidance with it.
Its chapter is Guidance rides the step.

| what stands today | where |
|---|---|
| the standing layer, which hands every session the same notes | `.claude/skills/level0/lib/guidance.js` |
| the guidance notes, with actionables per chapter | `spec/guidance/` |
| the judge's sampling over the write door | `spec/config/level0.json`, `judge.warmupWrites` and `judge.thenEveryNth` |
| the hold per hand | the pull branch |

# What waits

| the piece | where | proves it |
|---|---|---|
| the reads of a leaf | `work.js` | a leaf's reads and its phases' add up |
| the `work` answer | `work.js` | it carries the notes' actionables inline, and the checklist |
| `work guidance [note]` | `work.js` | named, it answers one note; unnamed, the current step's and the always-on ones |
| the log line | `lib/log.js` | one row per note handed over |
| the arrival | the hold file | the notes this hand holds for this step, by name and hash |
| the re-hand | `work.js` | a `refused` answer, a compaction, and a moved hash hand the notes again |
| the standing layer shrinks | `lib/guidance.js` | a note a step names leaves the layer |
| the judge on every hand-back | the plugin wrapper | no sampling reaches the pull's fifth check |

# The rules to hold

- Level one carries no reading probe. The proof of application is the hand-back.
- A refresher on every pull costs tokens and buys nothing the hold does not know.
- If the judge's findings on hand-backs run at three in four, the hash-keyed probe returns. Count them in the retro.

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
