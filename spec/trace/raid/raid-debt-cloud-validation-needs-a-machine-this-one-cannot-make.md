---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
type: "[[raid]]"
kind: debt
statement: This iteration ships its bootstrap without validating it on a genuinely fresh machine, because the machine walking it cannot produce one.
owner: the owner
trigger: the first cloud run after this iteration ships
status: mitigated
looked: 2026-08-20
impact: The acceptance criterion is that a fresh machine, a seed id and one command produce a walking agent. Everything else can be verified here; the freshness cannot. So the criterion is proven in parts and not end to end, and a step that only fails on a clean host stays undetected until somebody uses one.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
---

## Repayment

THE OWNER RUNS THE BOOTSTRAP ON A CLOUD MACHINE, from nothing but a clone, a
seed id and the one command. The debt is repaid when that run produces a
walking agent with no step typed by hand and no document read as prose.

WHAT COUNTS AS REPAID, so it is not argued about later:

- The entrypoint runs to completion, or exits non-zero with one sentence
  naming what failed.
- The agent reaches its first pull without a person editing anything.
- Nothing in the run required reading a handover.

WHAT DOES NOT COUNT. A run on this machine, a run on a machine that already
has the toolchain, or a run where somebody fixed a step by hand and carried on.
Each of those tests something, and none of them tests freshness.

## Why it is taken rather than avoided

The owner ruled on 2026-08-15 that this becomes a debt and that nothing in the
walk stops for it. The alternative was holding the whole iteration behind a
machine that does not exist yet, which trades a real delay for a check that can
be run later at no loss.

TRIGGER AND REPAYMENT ARE DIFFERENT SENTENCES. The trigger is the first cloud
run. The repayment is that the run works from the seed alone.

## The trigger fired, and the repayment did not — 2026-08-17

THE TRIGGER WAS THE FIRST CLOUD RUN AFTER i28 SHIPPED. It happened on
2026-08-16, from 15:25 to 20:00 UTC, and i15 was walked on a cloud box.

THE DEBT IS NOT REPAID. The run was Arrival A — a cloud session handed the
agent a branch and nobody ran the entrypoint at all. Every step named in the
repayment was typed by hand.

MEASURED AGAINST THIS ROW'S OWN CRITERIA:

- The entrypoint did not run to completion, because it did not run.
- The agent did not reach its first pull without a person editing anything.
  Node 24 was installed by hand, dependencies installed by hand, the cage
  copied by hand, the refs fetched by hand, and a browser wrapper written by
  hand.
- This row already excluded exactly what happened: a run where somebody fixed
  a step by hand and carried on does not count.

SO IT IS RESCHEDULED, WITH ITS TRIGGER RE-AFFIRMED. The next cloud run is
still the trigger.

WHAT CHANGED IS THAT THE UNKNOWN IS GONE. This row predicted that a step which
only fails on a clean host stays undetected until somebody uses one. Seven such
steps are now named, in scratchpad/fieldreport.md: the node pin, the
missing dependencies, the missing cage and lane, an untrusted workspace, no
browser where the screenshot tool looks, a clone carrying one branch, and a
backgrounding syntax the host refuses.

THE WORK THAT MAKES IT REPAYABLE IS i35. Its blocks 4 and 6 hold the container
fixes and the guidance corrections. Until those land, another cloud run repeats
the same seven discoveries.

## The trigger fired a second time, and the repayment moved but did not land — 2026-08-18

THE SECOND CLOUD RUN WAS THE i17 ARRIVAL. It was Arrival A again — a cloud
session handed the agent a branch and nobody typed the entrypoint — but this
time the arrival RAN BY ITSELF. The root `.claude/settings.json` SessionStart
hook fired `se-arrive`, which is exactly what i35 built, and five of its six
steps came back green before the agent read a line: refs fetched, runtime
checked against the pin, dependencies installed, cage placed, client written.

NONE OF THE SEVEN CLOUD-ONLY DISCOVERIES RECURRED. The node pin, the missing
dependencies, the missing cage and lane, the one-branch clone — every one of
them was handled by the arrival with nothing typed by hand. That is the i35
work landing, measured.

THE DEBT IS STILL NOT REPAID, and by its own criteria.

- `lane: FAILED — the lane did not answer on 7333 within 60s`. The entrypoint
  named what failed in one sentence, which this row asks for, and then the
  session carried on regardless.
- THE AGENT DID NOT REACH ITS FIRST PULL WITHOUT EDITING ANYTHING. Three engine
  files were edited with native tools before the lane would answer at all.
- Nothing required reading a handover, which is the one criterion met outright.

WHAT ACTUALLY STOPPED IT WAS NOT CLOUDNESS. Both blockers were ordinary engine
defects that a laptop would have hit too, and that is the finding worth keeping:

- `se-mcp.ts` still did `Number()` on the autonomy argument after the
  2026-08-18 ruling moved the rungs to words and moved `se-arrive` with it. The
  lane died on `NaN` before its first call.
- `prose-inspect.ts`, an exit script of `boot/prepare_idle`, returned 64 false
  findings because the host sets `git config user.name` to the agent's own
  name and matched it as a plain substring.

SO THE CLOUD-SPECIFIC RISK THIS ROW PREDICTED IS DOWN, AND A DIFFERENT ONE IS
NAMED IN ITS PLACE: an environment-sensitive CHECK, not an environment-
sensitive step. `prose-inspect` reads the environment at runtime, so it is
green on the machine that wrote it and red on every machine that is not it.

RESCHEDULED, TRIGGER RE-AFFIRMED. The next cloud run is still the trigger, and
the bar is unchanged: no step typed by hand.

## Sweep 2026-08-19, at i5's retro

RE-AFFIRMED as accepted, and the trigger has now fired repeatedly. i5 ran wholly on a cloud box. What it measured is worse than the entry assumed: the box loses its whole session record when it is reclaimed ([[raid-iss-an-ephemeral-box-loses-the-whole-record-of-a-session]]), so a cloud run cannot yet even hand its successor the account of what it found.

## Swept 2026-08-19, at i9's onboard-retro: RE-ACCEPTED

STILL OWED AND KNOWINGLY CARRIED. Nothing in the tree records a cloud run after
2026-08-18 meeting this entry's own bar.

WHAT MAKES IT ACCEPTABLE IS UNCHANGED: the owner ruled on 2026-08-15 that
nothing in the walk stops for it.

ITS RESIDUAL RISK HAS SHRUNK TWICE AND BEEN RENAMED. Cloud-only steps are
handled by the arrival script now. What is live is an environment-sensitive
CHECK rather than a missing step.

TRIGGER RE-AFFIRMED: the next cloud run.

## REPAID 2026-08-20, at the standalone retro after i37 shipped

THE TRIGGER FIRED A FOURTH TIME AND THE REPAYMENT LANDED. i37 was walked and
shipped end to end on a cloud box, from 2026-08-19 15:28 to 2026-08-20 13:40.

MEASURED AGAINST THIS ROW'S OWN CRITERIA, each with what proves it:

- THE ARRIVAL RAN TO COMPLETION. `.claude/settings.json` carries a modified
  time of 2026-08-19 15:28, the same minute the lane started. The arrival hook
  wrote it. Nobody placed the cage by hand.
- THE AGENT REACHED ITS FIRST PULL WITH NOTHING EDITED. `.se/engine.log` records
  the lane starting at 15:28:54. The call log's first agent record is a bare
  `se_pull` at 15:29:04 — ten seconds later. Between those two timestamps there
  is no write of any kind in the log.
- NOTHING REQUIRED READING A HANDOVER. Boot derived the previous session from
  the call log, which is the mechanism that replaced the handover file.

NONE OF THE THREE PREVIOUS FAILURES RECURRED. Not the seven cloud-only
discoveries of 2026-08-17, not the `NaN` autonomy argument, and not the
environment-sensitive prose check. The i35 work and the 2026-08-18 fixes hold.

STATUS MOVED FROM accepted TO mitigated RATHER THAN closed. What is proven is
one arrival shape on one provider. A different host, or an arrival that is
handed no branch at all, is still unproven, and this row is where that gets
re-asked.

THE TRIGGER IS NARROWED, not dropped: a cloud run on a host this project has
not run on before.

