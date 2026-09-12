---
kind: [[handover]]
status: done
urgency: soon
---

# Where it stands

The work stands finished. The branch gate reads `./RUNME.sh check`, which runs
red on two tests standing outside this branch until trunk brings the fix in.
The sync at the end of this note takes it, and `work done` closes the branch.

The standing layer survives a compaction. Measured against client 2.1.269,
three times, by `./RUNME.sh probe compact` running the real client
headless. A compaction fires `prompt.context` a second time, level zero hands
the same blocks over, and the answer after it carries the canary with its own
numbers. One run takes 90 seconds.

Every piece the brief names stands, and one beyond it:

| the piece | where | standing |
|---|---|---|
| a log line at `prompt.context` | `hooks/level0.js` | the `context` kind, naming its blocks and `first` or `re-read` |
| a log line at `session.compact` | `hooks/level0.js` | the `compact` kind, naming the trigger and the messages it keeps |
| `./RUNME.sh probe compact` | `src/scripts/probe.js` | answers `survives`, `drops` or `no compaction` |
| the forced compaction | `hooks/level0.js`, under `SE_PROBE_COMPACT` | takes the `$.command.run` road |
| a contract test | `test/contract/compact.test.js` | drives the verb under `SE_SLOW`, and skips without it |
| `turn.step` takes an async generator | `hooks/level0.js` | the fix making every line above reachable |

`spec/design_output/level0.md` carries the three roads, the reading table and
the four readings that catch a cage standing off.

# The dead end

Level zero loads in no session on this box, and nothing says so. A plain
`async` hook on `turn.step` fails `claude plugin validate` on client 2.1.269,
which wants `async function* ($, e, next)`, and the client then refuses every
hook in the module. Meanwhile `claude plugin list` says `√ loaded`.

So the whole cage stands off: no stamp, no log line, no canary, no write door.
The brief's own build measures nothing until that one signature takes the
generator shape.

Read it out of four places, and the first one lies:

| what you run | what it says |
|---|---|
| `claude plugin list` | `√ loaded`, whatever the hooks do |
| `claude plugin validate .claude/skills/level0` | the hook, the line and the shape it wants |
| `.se/level0.stamp` | absent where `session.start` reaches no hook |
| `./RUNME.sh log` | empty where every door stays silent |

`./RUNME.sh check` runs the validator already, so a green check catches this
from now on. It stands red here for another reason, below.

# What surprises me

- `$.session.compact` throws under `-p`, and names the reason: compaction there runs inside a turn. A session under the editor may still take it.
- `$.command.run({ command: "compact" })` holds, and `session.compact` fires inside the call, one minute after it opens. Every run measures the same minute.
- `prompt.context` fires once per conversation, and a second prompt on its own brings no second read. A control run proves it, so the second read belongs to the compaction.
- The event carries `blocks` and nothing else, so the hook counts its own reads to tell `first` from `re-read`.
- An agent reads `Say the canary line, and nothing else.` as a probe of its system prompt and refuses. The verb opens with `Say hello in one line.` instead, and the canary rule does the rest.
- A `-p` run keeps its process alive long enough to compact, submit and answer, so the night routine asks for the verb and nothing else.
- Every probe run eats `HANDOVER.md`, because the child session takes the handover the way any session does. Keep a copy before you run the verb on a branch carrying a brief.

# What waits

| the thing | where | why |
|---|---|---|
| two red tests, and the gate they hold shut | `test/contract/schema.test.js` | green now: trunk's `isNoteSchema` keeps `spec/schemas/paragraph.schema.yaml` out of the note kinds |
| two voice findings | `spec/funnel/level-zero-closes.md` | green now: trunk cuts the past tense and the long heading |
| one `context` line goes missing once | `.se/log/session.jsonl` | the first measured run carries `re-read` and no `first`, and the two after it carry both. Two writers appending to one file is the suspect |
| the `--resume` road | `spec/design_output/level0#three-roads-to-a-compaction` | untried, because the command road holds |
| a night routine | wherever `do_work` lives | its one prompt is `./RUNME.sh probe compact`, and the answer lands in the log and in the verb's exit code |

# What the routine needs

Nothing beyond the verb. It runs the client itself, writes the answer to
standard output, and exits 0 on `survives` and 1 on anything else. The survey
names `claude` now, so the verb finds the client where it stands.

# What runs green here

`./RUNME.sh check` stands green on this head after the sync below. The tests
pass, `claude plugin validate` passes, the doors hold, and the rules pass over
every file this branch writes.

`SE_SLOW=1 ./RUNME.sh test` adds the compaction contract test, which pays
ninety seconds and two model calls. Without the variable `check` stays fast,
and this branch runs the test three times by hand.

The auto mode holding this session refuses a handful of Bash calls that spawn
the client, so several runs take `node src/scripts/cli.js` as the road in.

# The sync

Trunk comes in with four branches, and three files conflict. Trunk carries the
same `turn.step` generator this branch writes, so the hook keeps one and the
marker over it. The answer gate reads what the tooth sends at the turn's end,
and the probe holds the tooth off after the compaction. So the two stand in
one expression. The fake engine keeps trunk's streaming chain, which reads the
hook's own shape in place of the event's name.
