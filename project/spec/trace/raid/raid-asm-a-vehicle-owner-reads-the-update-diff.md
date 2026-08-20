---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-asm-a-vehicle-owner-reads-the-update-diff
type: "[[raid]]"
kind: assumption
statement: A vehicle's owner reads what an arriving update did before keeping it.
owner: the adjudicator
trigger: the first update taken by somebody who did not write the program
status: deferred
probed: 2026-08-19
probe: "scheduled, and the entry says so in its own words. Its probe is a WATCH rather than a run - one person taking a real update, observed on whether they open the diff before keeping it - and the update mechanism does not exist yet. The entry is explicit that nothing inside the product can see whether somebody read what they kept, so the cheaper instrumented proxy is a fallback rather than the probe. M6 carries it, and this state confirmed the defer rather than inventing a result."
defer_until: the update mechanism exists and one real update is taken by somebody who did not write the program. The probe on this node is a WATCH rather than a run, and nothing a program can assert stands in for whether a person read what they kept.
impact: the winning design's entire safety story for a wrong migration is that the result is left unstaged in front of a person, so an owner who keeps without reading has no signal at all
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - gate-architecture, the matrix review
  - el-update-runner
  - flow-applied-change
  - raid-dec-an-update-arrives-as-a-program
  - raid-tripwire-i16-a-structural-migration-cannot-be-written
---

## Why this is an assumption rather than a risk

NOBODY HERE DECIDES WHETHER A VEHICLE'S OWNER READS A DIFF. It is a claim about
somebody else's behaviour, it is not established, and it is not controlled.
That is the test [[meth-raid]] sets for an assumption.

IT IS GRADED `expected` TO FAIL, which is unusual and deliberate. The behaviour
being assumed is the one people are known to skip when a tool reports success.

## What rests on it

THE WHOLE SAFETY STORY OF THE WINNING DESIGN. [[el-update-runner]] says it in
its own words: what it does instead of preventing a bad migration is put the
result in front of somebody, and that is a weaker guarantee than a merge
conflict, honestly weaker.

[[flow-applied-change]] CARRIES THE SAME SENTENCE from the other end. A
migration that runs, succeeds and produces something wrong leaves a vehicle that
looks updated.

SO IF THIS ASSUMPTION IS FALSE, the design's answer to its sharpest failure mode
is an unread file.

## Why the losing candidate did not need it

A DECLARED PATCH SERIES ERRORS OUT. cand-everything-declared refuses rather than
producing a wrong result, which is why it scored 3 against the winner's 4 on
whether the overlay survives an update, and also why it does not depend on
anybody reading anything.

THE ONE CELL THAT DECIDED THE ITERATION IS THE SAME CELL THIS ASSUMPTION SITS
UNDER. The winner bought indifference to restructuring and paid with a silent
failure mode. That trade was made knowingly and is recorded at gate-candidates;
this entry names the human behaviour the trade now leans on.

## Probe

WATCH ONE REAL UPDATE BEING TAKEN, by somebody who did not write the program.
The check is whether they open the diff before they keep it. One person is
enough to falsify; establishing it wants three.

IT CANNOT RUN UNTIL THE UPDATE MECHANISM EXISTS, so this probe is scheduled for
M6 and the entry stands open until then.

A CHEAPER PROXY IS AVAILABLE SOONER AND IS WEAKER. Instrument the runner to
record whether the result was inspected before it was kept. That measures a
file being opened rather than a person reading it, and the difference is the
whole point of the row, so it is a fallback rather than the probe.

WHAT WOULD SETTLE IT WITHOUT ANY PERSON: nothing. The claim is about behaviour,
and no check inside the product can see whether somebody read what they kept.

## What would establish it, and what would falsify it

ESTABLISHING IT NEEDS A PERSON TAKING A REAL UPDATE, with somebody watching
whether they read before they keep. That cannot run until the update mechanism
exists, so this entry stands open through M6.

FALSIFYING IT IS CHEAPER. One owner keeping an update without opening the diff
is enough, and the first real update is the occasion.

## What the design could do instead of assuming

THIS IS NOT A DESIGN PROPOSAL AND IT IS NOT THIS STATE'S TO MAKE. It is recorded
because a mitigation exists in the prior art and no candidate carried one:
Debian's source format refuses the build when the tree holds changes no patch
accounts for. gate-candidates already flagged that as a decision taken without
alternatives.

M6 OWNS WHETHER TO BUILD A FLOOR UNDER THIS. The gate records the assumption so
that choice is made rather than inherited.
