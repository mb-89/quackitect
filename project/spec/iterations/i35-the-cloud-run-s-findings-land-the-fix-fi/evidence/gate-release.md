---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-17T12:49:23.006Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

4.5.0 is built, unpacked into a bare directory and driven end to end: its own arrival ran, brought up a lane and answered a pull.

The battery is green at rest — 1404 of 1404. Four gates stand blessed. The sweep closed the one describing gap it found, and the package step found a defect nothing before it could.

This is the last gate before shipped.

## market_block


## round_0_verify

- evidence vs claims: green, and this gate has an unusual amount of it. Every claim in this record is a measurement from this box: the arrival cost before and after, the root sandbox refusal, the two-stage ref repair, the preflight red-then-green, the two-runtime battery comparison, the 78-second verification tick timed three times, and a packaged copy booted from a bare unzip.
- types: green across 1404 cases.
- lint: green, 272 files, no new suppression.
- tests: 1404 total, 1404 pass, 0 fail, 71s. Green at rest, which is the one state the product may never rest outside of.

## round_1_validate

- exercised against the goal: MET, and it was not met when this gate was first approached. The goal was an unattended box walking an iteration end to end with nothing re-worked that a previous run worked out. The walk went M0 to here on one box. The two things that stopped it — the dial and a red battery — were found, and the second was fixed rather than described.
- missing: the arrival's under-one-minute measurement on a genuinely fresh box. The packaged copy came closest, arriving from a bare unzip, and it was not timed against a cold clone with no runtime installed.
- wrong: nothing outstanding. The two claims this record originally got wrong — calling the emergency failure a flake, and repeating the seed's compiler diagnosis — were corrected in place with their evidence, not quietly amended.
- out of scope: the rename to i10, the node floor, the shared-module debt, and the caged-subagent paragraph now known wrong for this harness. Each is captured with its options.
- prior art: unchanged since gate-motivation, where devcontainers, Codespaces, Nix and mise were compared on both sides along with our own failed pattern. Nothing in M8 or M9 raised a new one.

## round_2_red_team

- STEELMAN: shipping a version whose headline feature was broken in the archive an hour ago is shipping on luck => The strongest form is that the package defect was found by ONE person doing ONE manual unzip, and nothing would have caught it otherwise — not the battery, not four gates, not the sweep. So the release rests on a check that happened to be thorough. WHAT DEFEATS IT ONLY PARTLY: the row demands the package be checked by USING it, and that demand is why it was found. The check is designed, not lucky. WHAT SURVIVES: nothing automated covers it, and the next feature wired through a committed dotfile will have exactly the same exposure. That is honest exposure rather than a reason to hold.
- KILL-CRITERION: if the packaged copy could not arrive, this must not ship => Falsified directly. The rebuilt archive was unzipped into an empty directory and its arrival ran to completion, ending in a lane that answered se_pull at start.
- KILL-CRITERION: if the green battery were bought by weakening a check => Refuted twice over. The emergency case GAINED a second case proving the restart half still fails closed, and the nesting case was fixed by giving the fixture the config the product has — so biome now checks the same tree in both, which is stricter than before.
- THE RELEASE IS BLESSED BY THE AGENT THAT DID THE WORK, for the fourth time in this record => Conceded, and it is the standing weakness of every unattended run. It is not fixable on a box with nobody else on it, and it is written into all four gates rather than into none.

## raid_additions

- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-debt-demonstration-reds-are-re-asked-every-iteration

## verdict

pass — ship 4.5.0.

WHAT IT SHIPS: a machine nobody is watching gets itself ready in one act, and does it without being asked. The product carries the wire that fires it, which it did not an hour ago.

THE DISSENT, RECORDED AS AT EVERY OTHER GATE IN THIS RECORD: no fresh eyes exist on this box, so every verdict here is self-observed. What partly offsets it is that the central claims are sequences rather than judgments — the battery was red and the walk was stuck, the reds were fixed and the walk moved; the archive lacked the wire and could not arrive, the wire shipped and it did. Both are in the call log with timings and both are checkable by somebody who trusts none of the prose.

WHAT IT DOES NOT SHIP, and the release note says so out loud: a default that lets an unattended machine get past its first gate. That remains the owner's setting.

## follow_up

- Owner: the cloud default for the autonomy dial. It is the one thing between this release and an unattended walk that needs nobody.
- Owner: the node floor at >=22.18.0, measured on both runtimes.
- Owner: whether the caged-subagent hand-over survives now that it is known not to work on this harness.
- The seven emit_back lines go to the next record's onboard-retro.
- i10: the short-name rename.
- A later iteration: the shared arrival module and the cage-comparison test.

## anything_else

THE ONE THING WORTH CARRYING OUT OF THIS RELEASE, if only one thing is carried.

This iteration was seeded from a field report that named ten things and diagnosed the blocker as a starved join in the compiler. That diagnosis was wrong, and an agent who trusted it would have spent its day in rigor-matrix.ts, where nothing is broken.

THE REAL BLOCKER WAS ORDINARY: verification fires the battery on the way out, the battery was red, and the forward door stays shut while it is. The pull said `do`.

SO THE LESSON IS NOT ABOUT THE COMPILER OR THE FALLBACK. It is that a report written from outside the walk described the symptom accurately and the cause not at all, and only walking to the same place with the machine running settled it. Two runs were spent on the wrong file because reading beat driving.
