---
id: retro-2026-08-25-milestones
statement: "The milestone walk for the three iterations that closed in this window, with per-step cost and what would remove it."
---

# Milestone table — the window opening 2026-08-24T14:23:57Z

Three iterations closed in this window: i60, i61 and i62.

THE COSTS BELOW ARE i60's, because only i60 was walked on this machine. i61
and i62 ran on a cloud container and their calls are not in this log. Their
figures come from i61's own decision log and i62's field report, and they are
marked where they appear.

i60 SPENT 1,533 CALLS. The split by kind of step:

| kind of step | calls | share |
| --- | --- | --- |
| the six gates | 698 | 46% |
| building and proving | 277 | 18% |
| design input | 155 | 10% |
| asking for helpers | 105 | 7% |
| everything else | 298 | 19% |

## One row per step, in walk order

| step | what it produced | what it cost | mechanizable |
| --- | --- | --- | --- |
| start | entry into the record | 5 | — |
| spawn-the-hands | one blank helper field, because the ceiling was zero | 28 | yes: skip the ask when the ceiling is zero |
| onboard-retro | the previous window drained | 7 | — |
| gate-kickoff | the aims list every later gate reads | 10 | yes: compare that list against the record's own purpose |
| spawn-for-motivation | one blank field | 3 | yes, same as above |
| draft-vision | the vision text | 3 | — |
| log-risks | the register entries for this round | 19 | — |
| frame-delta | what this round changes | 7 | — |
| scope-non-goals | the named exclusions | 1 | — |
| gate-motivation | the first judgment | 30 | — |
| spawn-for-inputs | one blank field | 3 | yes, same as above |
| write-stories | the user stories | 8 | — |
| generalize-use-cases | the use cases | 49 | — |
| spawn-for-requirements | one blank field | 8 | yes, same as above |
| write-requirements | the demands | 21 | — |
| derive-functions | the functions | 9 | — |
| identify-assumptions | the assumptions | 9 | — |
| probe-assumptions | their probes | 13 | — |
| gate-requirements | the second judgment | 42 | — |
| spawn-for-candidates | one blank field | 19 | yes, same as above |
| spawn-for-architecture | one blank field | 1 | yes, same as above |
| decompose-structure | the structure | 2 | — |
| spawn-for-prototype | one blank field | 2 | yes, same as above |
| spawn-for-implementation | one blank field | 10 | yes, same as above |
| author-tests | the checks | 34 | — |
| specify-build | the build chunks | 23 | — |
| observe-red | the red observation | 58 | yes: it re-asks every specification, including ones this round never touched |
| build-steps and its nine children | the code | 162 | — |
| trace-design | the design links | 14 | — |
| verification | the battery verdict | 127 | — |
| fix-findings | the repairs | 84 | yes: verification cannot repair what it depends on, so a red bounces between the two |
| gate-implementation | the third judgment | 365 | yes — see below |
| spawn-for-validation | one blank field | 26 | yes, same as above |
| sweep-consistency | the consistency pass | 50 | — |
| gate-validation | the fourth judgment | 246 | yes — see below |
| spawn-for-release | one blank field | 5 | yes, same as above |
| package | the package form | 25 | — |
| gate-release | the last judgment | 5 | — |

## The three findings the table makes visible

### The gates cost half the round, and it is transport rather than judgment

698 of 1,533 calls. `gate-implementation` alone took 365, which is a quarter of
the whole iteration, and `gate-validation` took 246.

i62 measured the same shape independently: 335 of 985 calls across four gates.

WHAT IS EXPENSIVE IS NOT THE JUDGING. It is the evidence moving in and out —
paging a form that spilled, re-submitting after a refusal, re-reading a
document the machine had already handed over. In this window 208 of 549 reads
existed only to page a spilled answer back.

So the reply-size measurement removes most of this without touching a single
judgment.

### Ten steps exist to ask for a helper, and the answer was zero every time

`spawn-the-hands` and the nine `spawn-for-*` steps cost 105 calls between them
and produced one blank field each. The walker ceiling was zero throughout.

A step whose only output is a blank field should not be a step when the ceiling
already says no helper is coming.

### The design input is cheap and it is not the problem

155 calls bought the stories, use cases, demands, functions, assumptions and
their probes. That is a tenth of the round for the half that decides what gets
built.

i62's report reaches the same conclusion from its own numbers and says so
plainly: the design states are not obsolete, every one of them fed the build.

## What this table cannot say

Per-step totals include re-entries. A step walked twice appears once with both
visits summed, so an individual figure is approximate while the ratios hold.

The gate figures include the narration riders attached to those calls. Across
the whole window narration was 348 of 2,124 records, sixteen per cent.
