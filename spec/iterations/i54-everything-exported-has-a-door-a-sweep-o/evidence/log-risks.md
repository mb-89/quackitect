---
form: log-risks
by: agent
signed_off: 2026-08-26T11:12:33.894Z
authors: agent
files: null
---

# Evidence form / log-risks

## current_situation

THE REGISTER OPENS WITH FOUR ENTRIES, and all four came out of work done in this milestone rather than from a survey of worries.

THREE CAME FROM THE FALSIFIER PASS over the 64 disk writes in the seven heaviest engine modules. One came from the prior-art research, which read six systems at their own documentation.

ONE ENTRY ALREADY STOOD AND IS NOW ANSWERED. `raid-asm-a-door-in-front-of-the-engine-s-own-disk-access-pays-for-itself` was minted with the seed and unprobed. It was probed here on 2026-08-26 and holds, narrowly, at 42 sites to 22.

## raid_opened

- spec/trace/raid/raid-iss-the-containment-check-is-written-five-times-outside-the-jail-that-owns-it.md
- spec/trace/raid/raid-asm-the-seven-heaviest-modules-speak-for-the-other-fifty-three.md
- spec/trace/raid/raid-risk-an-exemption-registry-with-no-expiry-silts-up.md
- spec/trace/raid/raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets.md

## follow_up

1. THE CONTAINMENT ISSUE IS THE ONLY ENTRY THAT CAN BE CLOSED WITHOUT A DESIGN DECISION. Export the predicate from `paths.ts` and delete the five copies. It is a smaller change than any door and it settles a live disagreement between two guards on two recursive deletes.

2. THE SAMPLING ASSUMPTION MUST BE PROBED BEFORE THE DOOR'S SCOPE IS SET, not after. Its probe is ten of the remaining 43 engine-core files, read the same way. Setting scope from an unprobed sample is the mistake this iteration already caught once.

3. THE EXPIRY RISK AND THE RATCHET RISK BOTH LAND ON ONE DESIGN STATE. Both ask the same state a question: what happens to an exemption over time, and what happens to 79 modules on the day the rule switches on. They should be answered together, because merging the frozen set into the exemption registry answers both badly at once.

4. NO ENTRY WAS OPENED FOR THE INTERNET DOOR OR THE WARM MODEL, and that is deliberate rather than an omission. 52 network sites and six private caches have been counted and none has been read. An entry written now would be a worry with no probe behind it, and the raid method says a worry belongs in the body of a risk rather than in a register of its own.

## anything_else

TWO OF THE FOUR ENTRIES CITE PRIMARY DOCUMENTATION FROM OTHER PROJECTS, and it is worth saying why that is evidence rather than decoration.

THE EXPIRY RISK IS GRADED `expected` RATHER THAN `plausible` ON THAT EVIDENCE. Rust put the mechanism in the compiler and ESLint turned it on by default. Neither team ships a default-on warning speculatively. Two independent toolchains solving the same problem is what a common failure looks like from outside, and it is a stronger basis for the grade than anybody's judgment of how likely it feels.

THE RATCHET RISK IS THE SAME SHAPE. ArchUnit's `FreezingArchRule` exists because getting a large codebase onto a new rule in one step does not work. That is a solved problem elsewhere, and the entry names the solution rather than only the worry.

ONE CORRECTION MADE WHILE WALKING THIS MILESTONE, recorded so it is not mistaken for the original state. The probe result was first written into the `probed` field of the disk assumption, which the raid template reserves for an ISO date. It has been moved to `probe`, which holds the result, and `probed` now reads `2026-08-26`.

THE FULL PRIOR-ART COMPARISON IS AT `spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/evidence/prior-art-one-door.md`. It covers dependency-cruiser, ArchUnit, ESLint, Rust lint levels, Go internal packages and Bazel visibility, and it names the four things the owner asked about that were not compared, with the reason.
