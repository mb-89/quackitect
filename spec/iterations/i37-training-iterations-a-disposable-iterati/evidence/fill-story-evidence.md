---
form: fill-story-evidence
by: agent
signed_off: 2026-08-20T13:03:35.472Z
authors: agent
files:
---

# Evidence form / fill-story-evidence

## current_situation

fill-story-evidence, opening M8.

THE DEMO DRAWING IS AUTHORED at machines/demos.md — one step per must story, the step id being the story id, as this state's guidance requires before leaving. run-demos runs it next.

THE MUST STORIES ARE THE EXCEPTION HERE and the law skips them: their evidence is the demonstration report, which run-demos mints. The gate catches them if it does not.

THE CONCEALMENT LANDED BETWEEN THE GATE AND THIS STATE, which changes what the second demo can show. gate-implementation passed it as an override with the requirement unmet; the owner asked what was actually missing, going to look took one grep, and the block turned out to be mine rather than the work token's.

## follow_up

- run-demos performs both. THE FIRST BENCHMARK RUN EVER happens there — nothing in this iteration has been demonstrated end to end, and the inspection spec cannot be walked without one.
- `sty-walk-a-past-tree-without-reaching-its-future` IS NOW DEMONSTRABLE. Every door it names is closed: a commit past the rewind point does not resolve, a read of a concealed report refuses, and search, glob and list omit it. Before the concealment landed, three of those four doors were open.
- `sty-know-whether-a-machine-change-helped` IS DEMONSTRABLE ONLY IN HALF, and the drawing says so. One run proves a paired number is REACHABLE. Judging a machine change needs two runs on two machine versions, and there has been none.
- gate-implementation's FIRST OVERRIDE IS DISCHARGED. req-the-benchmark-history-is-unreadable-while-a-run-is-bound is met, its spec's cases are green, and raid-iss-the-reading-verb-consults-no-exclusion-list-at-all is mitigated. gate-validation should record that the override no longer stands.
- THE SECOND OVERRIDE STILL STANDS. No lane verb consults `resolvesInBoundTree`, so the git ceiling is structural and unwired. The concealment work makes it cheaper — `isBound` now has four consumers and the choke points are known.

## anything_else

THE BLOCK I CARRIED FOR THREE STATES WAS MINE, AND THE SHAPE OF THE MISTAKE IS WORTH MORE THAN THE FIX.

gate-prototype deferred the concealment on `four exclusion lists, one empty, three disagreeing`. That was true. At build-steps I RE-TESTED it rather than inheriting it, found that `search.ts` never reaches the containment seam, and concluded the block was real for a better reason.

THAT SECOND CONCLUSION WAS THE SAME MISTAKE ONE LEVEL DOWN. I checked whether the lists could be unified and found they could not. I never checked what the rule actually needed, which is one predicate asked where each verb returns its answer — `search.ts:112` for matches, three more in `files.ts`. Every one is a single line.

I EVEN WROTE THE REASON DOWN AND DID NOT READ IT. `dsp-benchmark-guard` says, in my own words: written against CALL SITES and never against a list. The design already knew the lists were beside the point.

WHAT BROKE IT OPEN was the owner asking whether anything was needed. Going to look at the choke points took one grep, and the answer was no.

SO THE LESSON IS NOT `re-test an inherited block`. I did that. It is that re-testing the block as STATED confirms the statement, and the useful question is what the WORK needs — which is a different question and has to be asked separately.
