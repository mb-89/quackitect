---
form: the-call-record-grows-three-fields
by: agent
signed_off: 2026-08-20T20:11:35.857Z
authors: agent
files:
---

# Evidence form / the-call-record-grows-three-fields

## current_situation

The reds are observed. `tests/call-attribution.test.ts` had nine cases and four were failing: the three coordinates were declared as optional types and nothing required, validated or sourced them.

THIS CHUNK MAKES THEM REAL. All nine cases are green and the four files the change touched are green with them.

## built

`CallRecord` CARRIES FIVE NEW FIELDS AND ONE NEW TYPE. `part`, `relayed_by`, `answered_by`, `state` and `claimed`, plus `CallPart` — a closed union of owner, walker, guide, reviewer and surface.

EVERY COORDINATE OR NONE, ENFORCED AT THE APPEND. `assertCoordinates` refuses a record missing `answered_by`, `state` or `part`. A record missing one reads as complete and answers nothing, which is worse than an absent record because nothing looks wrong.

THE VOCABULARY IS CHECKED AT RUN TIME AND NOT ONLY AT COMPILE TIME. A union that holds for our own code and for nothing arriving through a lane call is not closed. The test casts a bad value on purpose to prove it.

`relayed_by` CANNOT EQUAL `part`. It names who FILED work somebody else authored, so a record where the two agree is a contradiction rather than a redundancy.

THE MARK IS WRITTEN BY THE LOG, NOT BY THE CALLER. `claimed` is always `["answered_by", "part"]` — the state is an observation the server makes, and the other two are claims. A caller cannot omit the mark by forgetting it.

AN OWED REASON THAT IS ABSENT IS MARKED, NOT REFUSED. Where `named_driver` is set and `weaker_reason` is not, the record takes `weaker_reason: null` and `unreasoned: true`. Refusing would be a different requirement.

### Where the three values come from

`session.currentState()` IS NEW AND IT IS THE ONE OBSERVATION. The server knows where the walk stands, so it writes it and nothing downstream infers it.

`whichHand()` IN `engine/tools.ts` STAMPS THE OTHER TWO from what the caller declared, and `UNREPORTED` is a declared absence rather than a missing field — the same reasoning as the sizing block's no-match value: an absence on the wire is indistinguishable from a crash and from never having run.

THE DEFAULT PART IS THE WALKER AND THAT IS A POSITION. The hand holding the session IS the walker by definition; a GUIDE is a hand asked for one step, and it says so. A default of `guide` would let the strong hand's work hide in the weak hand's count, which is the failure this coordinate exists to make visible.

### Eleven other call sites, and none of them guessed

FOUR IN THE MIRROR carry `part: "owner"` for a person's press. THREE carry `part: "surface"` — two mirror self-measurements and the test verdict, which is the server acting on its own behalf. THREE IN THE DISPATCHER go through `whichHand`. Every one of them names `UNREPORTED` where it cannot know, rather than leaving a field out.

### Five test files were updated and one differently from the rest

FOUR HAD FIXTURES THAT PREDATE THE CONTRACT and now carry the three coordinates. That is a contract change, not a silencing: each still asserts what it was written to assert.

`tests/actor-stamp.test.ts` NEEDED SOMETHING ELSE. Its last case is about a record from BEFORE a field existed, and `append` refuses one now — correctly, because the requirement binds what the engine WRITES. History is what it READS. The case now writes its historical lines straight to the file, which is the only way such a record can exist.

## follow_up

THE PART IS STILL A DEFAULT RATHER THAN A DECLARATION, and the next chunk is where that changes. `whichHand` reads `as` off the call's arguments if a caller sets one, and nothing in the lane's tool schemas offers it yet. Until it does, every agent call says `walker` — marked as claimed, and true for a walker.

THE RELAY PATH IS BUILT AND UNREACHABLE for the same reason. `relayed_by` is validated and refused where it contradicts `part`, and no caller can set it.

`UNREPORTED` APPEARS ON EVERY AGENT CALL'S `answered_by` TODAY. The transport hands the engine a client name and no model, and this chunk did not change that. What it changed is that the field says so out loud instead of being absent.

## anything_else

