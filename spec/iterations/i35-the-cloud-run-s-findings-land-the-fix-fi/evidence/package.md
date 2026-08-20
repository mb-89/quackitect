---
form: package
by: agent
signed_off: 2026-08-17T12:46:38.209Z
authors: agent
files: null
---

# Evidence form / package

## current_situation

The version is 4.5.0 — a minor, matching the pinned column. RELEASES.md carries its entry in the plain voice, including what the release does NOT change.

The archive is built, unpacked into a bare directory, and USED: its own arrival ran, brought up a lane, and answered a pull.

Building it found a defect that only using it could find.

## package

- dist/quackitect-4.5.0.zip

## works

yes — unpacked into an empty directory and driven end to end, and it needed one fix to get there.

WHAT WAS DONE, not asserted: the archive was unzipped into a fresh temp directory, `se-arrive.ts` was run against it, and it fetched, checked the runtime against its own pin, installed its dependencies, placed the cage, brought a lane up on a port nothing else held, and wrote its client. `se_pull` through that client answered `read` at `start` — a real boot, in a copy carrying none of this repository's history or session state.

THE DEFECT USING IT FOUND. The first archive carried both arrival scripts and NOT the root `.claude/settings.json` that fires them. `.claude` is excluded by name wherever it appears, which is right for `project/.claude` — generated, gitignored — and wrong for the repository root, where the file is committed and is the only thing a fresh clone reads at session start. So the packaged product shipped its headline feature with nothing to call it. Fixed in `package.ts`, rebuilt, and re-checked in the unpacked copy before this was answered yes.

## emit_back

- guidance/method/cloud-runner.md: its caged-subagent hand-over does not work on a harness where a subagent inherits the session's MCP registry. The card states it as a settled pattern that worked on 2026-08-15; it is now known false for at least one host.
- M7_50_verification.md: its own 2026-08-15 owner ruling — a claim covered by an open debt entry arrives PRE-FILLED rather than blank — is written into the row and implemented nowhere. Verification's checklist arrived blank this run with 15 items, 13 of them other records'.
- M7_60_fix-findings.md: the row promises an escape to a human when `verification_attempts` exhausts, and nothing in the engine ever writes a counter. The guard is permanently 0 < 3.
- The observe-red row: it asks every non-test spec in the corpus for a red observation, including the ones the open delta never touched. Same shape as the verification ruling above, one milestone earlier, with no rule.
- The pull's `do` instruction: 'the stopped step says what it wants' names nothing when nothing has been said. Five times this run the cure was an se_aim, and se_why often held the full answer the pull withheld.
- engine/search.ts: a `ref:` that git cannot resolve throws a raw git error rather than a typed rejection with a remedy — the one place the lane's own law does not hold.
- The package script: exclude-by-name lists need a root exception wherever a committed dotfile is load-bearing. This one shipped a feature with its wire cut.

## follow_up

- The seven emit_back lines are the shared method's, not this record's. They land or are explicitly dropped at the next record's onboard-retro, which is the catching end of the emit.
- The packaged copy was driven at the default dial and stopped where every unattended walk stops. That is the same finding this whole iteration carries, observed one last time in a clean room.

## anything_else

THE PACKAGE STEP EARNED ITS PLACE THIS RUN, and it is worth saying why plainly.

Everything before it was green. The battery passed at 1404 of 1404, three gates were blessed, the sweep found and closed its one gap, and the archive built without an error.

AND THE PRODUCT WAS BROKEN. The arrival — this iteration's entire subject, the thing every other state had just certified — could not fire in a packaged copy, because the file that calls it was filtered out by a name-match written long before it existed.

NOTHING BUT USING IT WOULD HAVE FOUND THAT. Not the battery, which tests this repository. Not the gates, which read this repository. Not the sweep, which describes this repository. The check that caught it is the one the row states in four words: it is checked by using it.
