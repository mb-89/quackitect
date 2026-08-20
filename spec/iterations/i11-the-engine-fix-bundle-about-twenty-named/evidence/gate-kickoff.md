---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-16T11:01:13.199Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

i11 is bound and started. It was seeded 2026-08-12 as enabler 3 of 4, carrying about twenty named engine defects, and it absorbed i34's speed-up set an hour ago on the owner's word.

THE DRIVING NUMBER: 2,850 calls logged on 2026-08-16, of which BUILDING — patch, write, delete — was 7%. The owner's field report: "we need to develop some pace here."

THE BUNDLE IS OLDER THAN THE SYSTEM IT DESCRIBES. i34 has since rewritten the resolution seam, both containers, the claim system and the archive. Deciding which of its items still stand is this gate's first job, and the owner ruled it belongs here.

## retro_drained

- the standalone retro: Ran immediately before this iteration opened. 21 notes drained — 3 done, 3 obsolete, 15 to the backlog with ready-when conditions.
- this iteration's onboard-retro: SKIPPED, and stamped as a skip. The inbox stood at zero, so a second retro would have produced an empty report and cost a full state to say so.
- the rule that made it a skip: Written by the owner at that same retro and landed in machines/states/retro.md and the M0_10_onboard-retro row. The engine served it back at the state, which is the proof it took.
- the field-feedback question: Asked once, at the standalone retro, and answered. Not asked twice in one sitting.

## goal

The engine-fix bundle: about twenty named defects plus i34's speed-up set — the pull stops overflowing, tests stop being polled, a deletion names what it orphans, and an amend patches instead of resending.

## pulled_in

- The original twenty-odd named defects, from the 2026-08-12 seed and the 2026-08-13 note-pool addition.
- THE PULL PAGINATES AND TRIMS — owner ruling, twice, already in the seed. Measured again today: 81 of 206 pulls broke the one-second rule and several answers exceeded 60KB, most of it null field-args and template prose the reading already credited.
- TESTS ARE ASKED FOR, NEVER POLLED — from i34's retro. 494 se_test calls produced 66 verdicts; about 428 asked only whether a job had finished. Long tasks start, work continues, and their updates piggyback on answers already being sent.
- THE FULL BATTERY IS REFUSED OUTSIDE verification — from i34's retro. M7_50_verification already says the engine owns it and its verdict records itself; the lane does not enforce the row it already carries.
- AN AMEND PATCHES — from i34's retro. Correcting three lines of a 207-row register meant resending all 207 rows, twice, in one day.
- BEFORE A NODE GOES, NAME WHAT POINTS AT IT — one slice pulled forward from i18. It is the single fix for i34's dominant defect, which appeared four times in one iteration.
- A FINDING ROUTES INTO A BUCKET — owner ruling 2026-08-16. Both ends already exist and neither was used in i34.
- DROP `reentry: "restart"` FROM THE CONTAINERS — from i34's retro, where it caused an already-walked leg to be walked again.
- se_why NAMES THE ROOT IN ONE ANSWER — third sighting, note-de843867720b.
- TWO BUTTONS ON THE MIRROR, freeze and bless — owner ruling 2026-08-16, note-3f15f19e2165. The stop hook overrode a rule-9 stop five times in one session.
- THE EMPTY-INBOX SKIP'S MECHANICAL HALF — note-e28a7b6df2ab. The rule is landed; the router still has no condition it can route PAST rather than block on.
- THE FILE TOOLS' ARGUMENT NAMES — seven refusals in one day on query versus glob versus dir versus path.

## left_out

- i18's HARDER HALF: computing the full downstream cone and splitting it so a large one stays reviewable. It is a capability with an open design question, and folding a design question into a defect bundle is what makes bundles slow. Stays in i18, which the owner has scheduled after this.
- SPECULATIVE PREFETCH of the walk's next state and owed reads. Real, current prior art with 2-5x reported gains, and deliberately not now: speculation hides work rather than removing it, and the payload is the thing to remove first. Revisit once the pull is lean.
- ONE-SECOND INTERFACES ACROSS EVERY SURFACE — i33. The pull's own latency is in scope here because the payload fix causes it; the broad sweep across every surface is not.
- THE VOICE LINT and the consistency sweep's vocabulary grain — i25's subject, carried in i34's emit_back and explicitly dropped here.
- THE PACKAGE STATE'S MISSING VERSION-BUMP CHECK — real, and a matrix-row change rather than an engine defect. Noted, not pulled.

## change_size

minor — many defects, no new capability, and no function that fits no existing cluster

THE ESCALATE TELL IS ABSENT, which is the test the method actually names: a new function that fits no existing cluster means the architecture is moving. Nothing here needs one. The bucket routing serves judge-a-claim and route-the-work; the skippable condition serves serve-a-step; the payload trim serves serve-a-step. All existing.

THE COMPARISON THAT SETTLES IT: i34 was a minor and it deleted an entire subsystem — the resolution seam, the claim ledger, the worktrees and 67 branches. This bundle is smaller in reach and larger in count.

NO STRIKES. Every cell of the minor column applies. The one that would have been tempting to strike is the consistency sweep, on the grounds that a defect bundle teaches nothing new — and i34 disproved that: its sweep found six documents still teaching the superseded way, four of them engine-served strings handed to every agent at the state.

WHAT WOULD RAISE IT TO MAJOR: if the bucket routing turns out to need a new disposition kind across the trace schema rather than reusing the `[owed]` checklist state that already exists. That is checked at decompose-structure, not assumed here.

## round_0_verify

- evidence vs claims: The bundle's own list was distrusted rather than taken, and the check found what it was meant to find. i11 names a stale security row as "worth doing first"; req-mirror-stays-on-the-machine has ALREADY been rewritten — its Detail now opens "MET, as of a later fix", corrected during i8's ATAM walk. TWO HALVES SURVIVE ANYWAY: its source_refs still cite the pre-fix `server.listen(o.port)` with no host argument, and the STRUCTURAL fault i11 named — verification status does not belong in a requirement body — was reintroduced by the very sentence that fixed it.
- types: Green at rest. i34 shipped with preflight green, exit 0.
- lint: Green at rest. biome over 245 files, no fixes applied.
- tests: Green at rest. 1299 of 1299, run test-msvnad5q-23. No battery was run for this gate and none was owed — the tree has not changed since.

## round_1_validate

- exercised against the goal: The goal is pace, and the scope is chosen by measurement rather than by taste. Every pulled-in item carries a number or a ruling: 428 wasted polls, 81 slow pulls of 206, 207 rows resent twice, four orphanings in one iteration, five hook overrides.
- missing: The full audit of the twenty original defects. ONE was checked properly and it was already half-fixed, which is evidence the rest need the same treatment rather than a reason to trust them. That audit belongs to frame-delta and scope-non-goals, which is where the machine puts it.
- wrong: Nothing yet — nothing is built. The kickoff's own risk is sizing a bundle whose contents are stale, and that is named rather than assumed away.
- out of scope: i18's cone-splitting, speculative prefetch, the broad one-second sweep, and the voice lint. Each named above with where it went.
- prior art: NASA NPR 7123.1 for the bucket — a review completes on the agreed DISPOSITION of every finding, not on every finding being fixed. That is the owner's bucket idea in the canonical standard, and it says our gates demand more than the standard does. BAZEL AND SHAKE for the ripple — both implement early cutoff and hash content rather than timestamps. This one DISCONFIRMED a suspicion: our ripple already does both, so the greying tree is not the waste and was removed from scope because of it.

## round_2_red_team

- STEELMAN: a twenty-item bundle is the wrong vehicle and this should be three small iterations => The strongest case: bundles hide their own scope, and this one just grew by ten items in an hour. A bundle that cannot be finished in one pass becomes a standing excuse. What defeats it is that these items share ONE surface — the lane's answer shape — and splitting them means three iterations each paying the same full gate ceremony, which is the exact overhead the owner is objecting to.
- KILL-CRITERION: the twenty original defects are mostly already fixed, so the bundle is half-empty => This would make the vehicle wrong. IT IS NOT HYPOTHETICAL — the one item checked at this gate was already half-fixed by i8. If frame-delta finds most of the twenty gone, the honest move is to shrink the record to the speed-up set and say so, not to pad it.
- The scope was chosen by the agent that will build it => True, and it is the weakest part of this gate. Every number here was gathered by the same agent whose waste it measures. The owner's field report is the only outside evidence in this form, and it agreed independently that the pace is wrong.
- Fixing the polling makes the agent run MORE tests, not fewer => A real hazard. If se_test blocks and answers instantly, the cost that currently discourages a run disappears. The battery refusal outside verification is what stops that, and the two must ship together or the first makes the second worse.
- The bucket lets real defects be waved through as owed => The sharpest risk in the bundle. NASA's answer is that a disposition is AGREED, not asserted, and ours must be the same: an owed item points at an OPEN raid entry with an owner, and req-close-refuses-loose-ends already blocks the close while any stands. Without both halves this becomes a way to ship broken work quietly.

## raid_additions

- none

## verdict

pass — the scope is measured rather than guessed, the size follows the method's own escalate test, and the one thing that could invalidate it is named with the state that will check it

WHY A CLEAN PASS HERE, WHERE i34'S THREE GATES ALL CARRIED OVERRIDES. Nothing is built yet, so nothing is being waved through. The two candidates for an override were both handled rather than accepted: the stale-list risk is routed to frame-delta instead of assumed away, and the design question that could raise the size is routed to decompose-structure instead of pre-judged.

THE SIZE IS THE BLESS, and it is the owner's. minor is proposed on the method's own test — no new function outside an existing cluster — and against i34, which was a minor and deleted a whole subsystem.

WHAT THE ADJUDICATOR SHOULD PUSH ON: whether a bundle that grew by ten items in an hour is still one iteration. The case for keeping it whole is that every item touches the lane's answer shape; the case against is that bundles hide their scope. That argument is in round 2 rather than settled here.

## follow_up

FRAME-DELTA CARRIES THE AUDIT. Each of the twenty original defects is checked against the system as i34 left it, and any already fixed is struck with its evidence — not silently dropped. The security row is the worked example: half fixed by i8, two halves surviving, and the fix reintroduced the structural fault the item named.

DECOMPOSE-STRUCTURE CARRIES THE ONE SIZE QUESTION: whether the bucket needs a new disposition kind in the trace schema, or reuses the `[owed]` checklist state that already exists. Only the first would argue for major.

TWO ITEMS MUST SHIP TOGETHER OR NOT AT ALL: se_test blocking, and the full battery refused outside verification. The first alone removes the cost that currently discourages a run.

THE BACKLOG NOW HOLDS 71 ENTRIES with ready-when conditions, and several name this bundle's areas — the reopen cluster, the claim-guard family and note-de843867720b's root-naming fix. They are swept at frame-delta, per the rule that a noted ruling must never be built around.

## anything_else

