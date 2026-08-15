---
form: identify-assumptions
by: agent
signed_off: 2026-08-15T10:38:34.278Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

The sweep ran per source against the five requirements written at M3.

Three sources turned something up and three did not, and each nil answer carries its reason rather than a shrug.

The three new entries share a shape worth naming. Each asks whether a number this record relies on measures what it appears to measure. That is not a coincidence: the record's whole subject is measurement, so its assumptions are about instruments.

## assumptions

- raid-asm-slow-surface-is-not-self-contention
- raid-asm-node-tap-carries-durations
- raid-asm-waiting-makes-a-person-look-less
- raid-asm-battery-timings-measure-work
- raid-asm-wall-clock-is-a-baseline
- raid-asm-method-write-reaches-every-tree

## sweep

- environment: ONE FOUND, raid-asm-slow-surface-is-not-self-contention. Every slow surface reading in this record was taken while the same single-threaded engine served an active walk, so the recorded duration may be queueing rather than render cost. It is the battery contention question one level up, and one quiet measurement settles it.
- toolchain: ONE FOUND, raid-asm-node-tap-carries-durations. The cheap fix for the timings row reads durations out of Node's TAP stream, and that field belongs to Node rather than to this project. package.json pins a floor of 22.6 and no ceiling, so the field can move under us and would do so silently.
- host: NONE, and the reason is that the host behaviour this record leans on is exercised on every call rather than assumed. The host moves an oversized answer to disk and hands back its head; that was observed repeatedly in this walk, including on this record's own kickoff at 259015 bytes. Observed is not assumed.
- platform: NONE NEW. The timings work touches how a test process is spawned, which is platform-sensitive, and the standing entry raid-lane-works-on-posix already carries exactly that claim. Opening a second entry for the same condition would split one concern across two nodes.
- neighbours: NONE NEW. The only neighbour this record leans on is git, through the fake proposed for the battery's tallest test file, and that is already carried as raid-risk-git-fake-drifts-from-git with its mitigation named. It is a risk rather than an assumption because the drift has not happened yet.
- people: ONE FOUND, raid-asm-waiting-makes-a-person-look-less. The record's story ends on the claim that a person who waits opens fewer artifacts, and nothing counts artifacts opened per adjudication. It carries the record's whole justification and had never been stated.

## follow_up

- Six assumptions now stand for this record. Three are probed or probable today and three are scheduled.
- raid-asm-slow-surface-is-not-self-contention is the cheapest and the most consequential. If the surfaces are fast on a quiet engine, this record's aim moves from rendering to scheduling.
- raid-asm-node-tap-carries-durations owes a check rather than a probe: whatever mechanism lands must fail loudly when a scoped run records no timings, because the failure is otherwise silent.
- raid-asm-waiting-makes-a-person-look-less is unprobed and stays that way in this record. Its probe is a counter nobody has built, and building it is not this record's work.

## anything_else

ON THE TWO NIL ANSWERS THAT WERE NOT LAZY.

The host row and the neighbours row both say none, and both would have been easy to fill with something plausible.

The host's behaviour with oversized answers is the obvious candidate. It is not an assumption, because it was observed a dozen times in this walk, including on this record's own forms. Writing it as an assumption would have recorded ignorance the walk did not have.

The neighbour candidate is git, and it is already carried as a RISK rather than an assumption. The tell is tense: an assumption is something being relied on now, and a risk is something that has not happened. The git fake does not exist yet, so nothing leans on it.

CHECKING THE KIND BEFORE THE TITLE is the method's own instruction, and both of those nils came from applying it rather than from having nothing to say.

ON WHY THE PLATFORM ROW POINTS RATHER THAN ADDS.

raid-lane-works-on-posix already claims the lane behaves the same off Windows. The timings work spawns a test process, which is exactly the kind of thing that differs, and that is the SAME condition rather than a new one. Splitting one condition across two entries gives the register two things to probe and one answer.
