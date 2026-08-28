---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
type: "[[raid]]"
kind: debt
statement: Ten verification checks and two boundary timings cannot be answered by an agent on this machine, and they are listed here with what each one actually needs so the work-token system can route them.
owner: the owner
trigger: when the work-token system can carry a task to a person; or at the first verification after 2026-10-01, whichever comes first
status: open
looked: 2026-08-26
impact: A check nobody can run is marked owed every iteration and eventually stops being read, which is how four factual errors sat in the README while its own inspection was marked owed.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - raid-issue-the-corpus-wide-inspections-have-no-runner
  - i33 verification, tester rounds one to four
last_looked: 2026-08-23
look_verdict: rescheduled
---

TAKEN DELIBERATELY AT i33 (owner ruling 2026-08-17: "note all the others as
technical debt... once we have the work token system in place, I can see what
needs to be done by a human, and I will do it").

IT IS A DEBT AND NOT AN ISSUE. Nothing is broken. The work is real and it is
owed to somebody who is not an agent on this machine.

## Needs a person at this machine — about an hour each

- tsp-desk-and-gates. Drive the front desk once and watch what it offers.
- tsp-tour-run. Take the tour once and watch it.
- tsp-panel-walkthrough. Open the panel and read the layout.

THE REASON PREVIOUSLY GIVEN FOR THE LAST ONE WAS WRONG. i33 recorded that it
needs "a second host that does not exist". i33's own verification says a
second host DOES exist and a probe was signed that never opened it. The spec
is owed for the layout observation, not for a missing machine.

## Needs a second machine

- tsp-unattended-start. Its own text says it cannot be observed on the machine
  that wrote it.
- tsp-two-machines. Its own text says the procedure has not been run.
- tsp-carry-a-finding. Same.

A CLOUD RUN MAY ALREADY SATISFY THESE. The owner notes agents run elsewhere
today; whether those runs exercise these procedures has not been checked.

## Needs people who are not us

- tsp-first-run. Measures over real newcomers on bare computers.
- tsp-a-slow-signal-keeps-the-wait. Needs people watched side by side, because
  its pass line is about what a person PERCEIVES and no instrument reads that.

## Needs work rather than a person, and an agent could do it

- tsp-record-inspection. Twelve checklist items; TWO now have a runner, and
  the count moved the same day this entry was written. i33's tester ran the
  usernames sweep and took the runner argument as the verdict for the other
  eleven, while citing the entry that warns against exactly that. Several of
  the eleven are as mechanically checkable as the ones that ran, which is why
  this sits under work-an-agent-could-do rather than under needs-a-person.
  engine/bin/record-inspect.ts now answers item 11, every stored node
  reachable from something, and item 12, a test verdict recording the question
  it answered. Item 12 found a real defect on its first run: the verdict never
  recorded its question at all.
- tsp-derivation-analysis. Wants a dated written argument over every served
  view and every reachable capability. Nobody has ever written it. That is
  work, not an obstacle, and calling it unverifiable was too generous to us.

## Two boundary timings an agent cannot take

- if-engineer-to-mirror. Calling the running mirror over HTTP from a lane
  command deadlocks the server, so only a person can time this edge.
- if-vscode-to-mirror. The editor hosts the panel; an agent cannot drive it.

BOTH MATTER MORE THAN THEY LOOK. The second is the edge where a falsified
assumption already lived: a host handing in fewer values than the panel can
draw makes a control render as OFF, which a person cannot tell from a refused
click.

## Repayment

REPAID WHEN EVERY ITEM BELOW HAS AN OWNER WHO CAN ACTUALLY RUN IT, and the
spec it blocks stops being marked owed at verification. Not when the work is
finished — when it is ROUTABLE. The three groups repay differently and it is
worth writing that down now rather than discovering it later.

THE PERSON-AT-THIS-MACHINE GROUP repays with three sittings of about an hour:
drive the desk, take the tour, read the panel layout. It needs the work-token
system to carry a task to a person, which is what the trigger names. Nothing
else blocks it.

THE SECOND-MACHINE GROUP repays by CHECKING FIRST whether the cloud runs
already satisfy it. The owner notes agents run elsewhere today, and nobody has
asked whether those runs exercise these procedures. That check is cheap and it
comes before any new machine is stood up.

THE AGENT-COULD-DO-IT GROUP is not waiting on a person at all, and calling it
debt was generous to us. It repays with work: the remaining ten items of
tsp-record-inspection, and the argument tsp-derivation-analysis has never had
written. An iteration can take it whole.

THE TWO BOUNDARY TIMINGS repay with a person timing them once each, and both
numbers then belong in the interface nodes rather than in this entry.

WHAT REPAYMENT IS NOT: marking the specs green because somebody read the
procedure and believed it. That is what this entry exists to prevent, and its
own impact line records the cost — four factual errors sat in the entry
document while its inspection was marked owed.

## Why the trigger names a date

A TRIGGER THAT FIRES EVERY TIME SINGLES OUT NOTHING. The nearest precedent is
raid-debt-human-observed-demonstrations: swept 2026-08-15, re-accepted, and
heavier afterwards - four specs became eight. This one names the work-token
system OR a date, so it cannot quietly become furniture.

## Swept 2026-08-18, and this row had never carried a look date

RE-ACCEPTED, UNCHANGED. Nothing about it moved, and the trigger it names — the
work-token system, or the first verification after 2026-10-01 — has not fired.

WHAT DID MOVE IS THE SECOND-MACHINE GROUP'S OWN INSTRUCTION. This row says that
group repays by CHECKING FIRST whether the cloud runs already satisfy it, and
that the check is cheap and comes before any new machine is stood up. Two cloud
runs have happened since it was written and nobody has run that check. It is
still cheap, and it is still not done.

THE MISSING DATE IS ITSELF THE FINDING. Every other debt in the register
carries `looked`, this one did not, and the retro's debt sweep is what is meant
to put it there. A row with no look date cannot be told from a row nobody read.

## Sweep 2026-08-19, at i5's retro

RE-ACCEPTED consciously. Neither trigger has fired: the work-token system still cannot carry a task to a person, and the date is not reached. i5's retro found the pool EMPTY and the door into it shut on a fresh clone. The trigger this debt waits on is further away than it looked ([[raid-iss-the-one-door-into-the-pool-is-shut-on-a-fresh-clone]]).

## Swept 2026-08-19, at i9's onboard-retro: DUE, NOT WAITING

THE FIRST HALF OF THE TRIGGER HAS FIRED. This entry repays when the work is
ROUTABLE rather than finished, and the work-token pool now carries a task to a
person — `engine/pool.ts` line 255 into `engine/survey.ts` line 68.

SO IT IS DUE. That is a change of state from the last look, not a re-park.

ONE THING BLOCKS THE ROUTING ANYWAY. The token shape carries an id, a
statement, a ready-when and a source, and NO assignee. A token cannot say "this
one needs a person", which is exactly what these ten checks have to say.

AND THE CHEAP CHECK THIS ENTRY ASKS FOR FIRST HAS STILL NOT BEEN RUN: whether
the cloud runs already satisfy the second-machine group.

## Swept 2026-08-20, at the standalone retro after i37 shipped

RE-AFFIRMED AS STANDING, trigger unchanged. i37 did not touch what this entry
is about, so nothing here moved.

THE LOOK IS THE POINT. A debt nobody re-reads is a lie in the ledger, and this
line is the evidence that somebody read it on this date.

## Swept 2026-08-26, at i54's closing retro: RE-ACCEPTED

THE POOL IS NO LONGER EMPTY, and that changes nothing here. It holds well over a hundred parked items and this retro added eleven more.

WHAT IS STILL TRUE. None of them can carry a task to a person. A parked item states a condition and waits to be re-read; nobody is notified when its moment arrives. That is the half this entry is about, and it is unbuilt.

RE-ACCEPTED consciously, trigger unchanged.


SWEPT 2026-08-28, at i63's closing retro: RE-ACCEPTED, and the first half of
the trigger is now closer than it was.

The trigger fires when the work-token system can carry a task to a person, or
at the first verification after 2026-10-01, whichever comes first.

i63 SHIPPED THE WORK-TOKEN SYSTEM in this window, and SE-C-150 already refuses
an agent settling an item marked person-only. So the carrying mechanism exists.
What is not yet shown is a check actually routed to a person through it.

RESCHEDULED, with the trigger sharpened: it fires at the first person-only
token minted from one of these ten checks.
