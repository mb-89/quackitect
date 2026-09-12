---
kind: [[handover]]
status: todo
urgency: now
---

# Where it stands

The canary says out loud that level zero holds a session, and today it says
it into the log alone. `heardCanary` in `hooks/level0.js` writes one `info`
line where the sentence comes back whole and one `warn` line where it comes
back wrong or absent. Nothing refuses. So a session that never says the line
runs to the end unheld, and the owner reads the failure afterwards or never.

The owner asks for the tooth. A session owes the canary at the end of its
first answer, and the cage holds every tool call until that debt clears.

The shape already stands in this tree twice. `spec/design_output/level0#one-warning-then-a-refusal`
holds the owner's prompt the same way: one warning, then a refusal, until an
answer lands. The answer gate re-prompts through `$.prompt.submit`. This
branch reaches for both and adds no third mechanism.

# What waits

| the piece | where | proves it |
|---|---|---|
| the canary debt opens at session start | `hooks/level0.js` | a fake session carries the debt before the first answer |
| a first answer carrying the line clears it | `hooks/level0.js` | the debt reads clear, and the log writes one `info` line |
| a first answer missing the line opens the refusal | `hooks/level0.js` | the debt stands, and the log writes one `warn` line |
| the next tool call warns, and every one after refuses | `hooks/level0.js` | a fake run warns once and refuses twice |
| the refusal re-prompts for the line | `hooks/level0.js` | the fake prompt road carries one submit |
| a wrong count refuses the same as none | `lib/guidance.js` | `canaryIn` answers `other`, and the door treats it as unpaid |
| god mode passes the refusal | `hooks/level0.js` | the binding at `god` lets the call through, and a `god` line names it |
| the canary chapter says the tooth | `spec/design_output/level0.md` | `./RUNME.sh check` answers 0 |

# What the door does

The debt opens at `session.start` and closes on the first `turn.complete`
that carries an answer holding the sentence with this session's own counts.
`canaryIn` answers `same`, `other` or `none` already, and only `same` pays.

While the debt stands past the first answer, `tool.call` behaves the way the
owner's prompt door behaves:

- the first call warns, and the session reads the warning after the result
- every call after it stands refused
- each writes a `gate` line, `warned` then `refused`, naming the canary

The refusal names the line the session owes and the counts it holds, so the
agent reads what to say and says it.

# What it leaves alone

The probe after a compaction reads the canary through the same helper. Leave
that road paying no debt: a compaction opens no new one, because the session
said the line once already.

Change no other door. The write door, the trunk guard and the stop hook stay
as they stand.

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
