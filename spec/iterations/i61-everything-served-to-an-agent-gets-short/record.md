---
id: i61-everything-served-to-an-agent-gets-short
status: shipped
closed: 2026-08-24T19:32:18.898Z
started: 2026-08-24T14:46:17.279Z
opened: 2026-08-24T14:32:42.659Z
goal: "Everything served to an agent gets shorter: 63 tool descriptions, the refusal payloads, and the 9,229-word prompt layer that rides every turn."
vision: |-
  THE OWNER'S RULING, 2026-08-24, reading another agent's pull result: the guidance for the file verbs should be two sentences, the refusal is a wall of text, and all of it is far too long. Their conclusion is that this slows the agent down, which is what makes it a speed round rather than a tidying one.

  THE RULE THEY STATED. Only actionable information goes into what an agent is served. No philosophising, no governance discussion, no provenance discussion. Everything else becomes a reference to further reading.

  MEASURED 2026-08-24, and these are counted rather than estimated.

  - The prompt layer runs to 9,229 words and rides EVERY TURN. It is the largest fixed cost in the system and nobody had counted it before.
  - The refusal reference runs to 5,504 words over 684 lines, and pages eleven times when an agent is made to read it.
  - 63 tool descriptions carry 2,461 words between them. The longest is 151 words and eight exceed 100.

  WHAT DONE LOOKS LIKE. A tool description is about two sentences. A refusal carries the clause, what was expected, what arrived and an executable remedy, with the explanation behind a link. The prompt layer is a fraction of its present size and still teaches everything a walker must hold.

  WHAT MUST NOT BE TOUCHED FOR SIZE. The 21 state-note guidance blocks average 55 words and only two exceed 150. They are not the problem and shortening them would cost teaching for no gain.

  WHY THIS HAND. The work is mechanical, bounded and highly parallel. Every item is text, so a reviewer can judge it by reading rather than by running anything.

  THE ONE SEAM WITH ANOTHER ROUND. The tool file is also where a sibling round may register a new verb. Descriptions and registrations are different regions of that file, so whichever lands second re-reads it and applies onto what the first left, rather than working from a copy taken earlier.

  A SIBLING ROUND ALREADY OWNS THE CORPUS-WIDE PROSE SWEEP, counted at 3,572 flagged lines across 897 files. That sweep is not this. This round is only what is served to a walker on every call.
inputs:
  - retro 2026-08-24
  - wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath
depends_on: []
---

# i61-everything-served-to-an-agent-gets-short

## Goal

Everything served to an agent gets shorter: 63 tool descriptions, the refusal payloads, and the 9,229-word prompt layer that rides every turn.

## Rough vision

THE OWNER'S RULING, 2026-08-24, reading another agent's pull result: the guidance for the file verbs should be two sentences, the refusal is a wall of text, and all of it is far too long. Their conclusion is that this slows the agent down, which is what makes it a speed round rather than a tidying one.

THE RULE THEY STATED. Only actionable information goes into what an agent is served. No philosophising, no governance discussion, no provenance discussion. Everything else becomes a reference to further reading.

MEASURED 2026-08-24, and these are counted rather than estimated.

- The prompt layer runs to 9,229 words and rides EVERY TURN. It is the largest fixed cost in the system and nobody had counted it before.
- The refusal reference runs to 5,504 words over 684 lines, and pages eleven times when an agent is made to read it.
- 63 tool descriptions carry 2,461 words between them. The longest is 151 words and eight exceed 100.

WHAT DONE LOOKS LIKE. A tool description is about two sentences. A refusal carries the clause, what was expected, what arrived and an executable remedy, with the explanation behind a link. The prompt layer is a fraction of its present size and still teaches everything a walker must hold.

WHAT MUST NOT BE TOUCHED FOR SIZE. The 21 state-note guidance blocks average 55 words and only two exceed 150. They are not the problem and shortening them would cost teaching for no gain.

WHY THIS HAND. The work is mechanical, bounded and highly parallel. Every item is text, so a reviewer can judge it by reading rather than by running anything.

THE ONE SEAM WITH ANOTHER ROUND. The tool file is also where a sibling round may register a new verb. Descriptions and registrations are different regions of that file, so whichever lands second re-reads it and applies onto what the first left, rather than working from a copy taken earlier.

A SIBLING ROUND ALREADY OWNS THE CORPUS-WIDE PROSE SWEEP, counted at 3,572 flagged lines across 897 files. That sweep is not this. This round is only what is served to a walker on every call.

## Inputs

- retro 2026-08-24
- wt-a-document-handed-to-an-agent-for-reading-arrives-whole-rath


## Retrospective Correction

Window: `2026-08-21T13:55:57.328Z` through the i61 release on 2026-08-24.

Field feedback: no additional field input was reported.

The initial retrospective drained the inbox. It did not complete the required log review or milestone table.

### Log Review

- Calls: 2,933 in the reconstructed window.
- Demand log: empty.
- Top lane activity: `se_update` 612, `se_file_read` 387, `se_pull` 298, `se_file_search` 237.
- Highest i61 state costs: verification 367 calls, observe-red 107, fix-findings 102, specify-build 101, session-guidance 80.
- Test summary: 1,806 passed, 0 failed. `deliverable/tests/refs.test.ts` had the highest summed file cost at 229,762ms.
- Battery duration remains a work token. The full condition scan found 84 tokens, each with a future re-entry condition. None applies to the closed i61 scope.

### Milestone Improvements

| step | what went well | what cost | mechanizable |
| --- | --- | --- | --- |
| M0: onboarding and kickoff | The retro carried session guidance and blockers-only behavior into i61 before implementation began. | 105 calls across start, roster, onboard retro, and kickoff. | Return required entry forms in the same pull; stored in `wt-return-a-required-state-form-in-the-same-entry-response-that`. |
| M1: motivation and framing | The vision, risk log, and scope artifacts made the implementation target explicit. | 89 calls across motivation spawning, vision drafting, and risk logging. | Empty worker rosters now pass without inventing a worker. |
| M2: requirements | Stories, use cases, requirements, functions, and assumptions were all captured before implementation. | 111 calls, concentrated in `write-requirements` at 43. | No new improvement beyond existing evidence-form work tokens. |
| M3: design and implementation | The generated-child collision repair, fixture staging repair, and guidance ordering repair were implemented and reviewed. | 525 calls across implementation, authored tests, build specification, red observation, and trace design. | Preserve the qualified child lookup; no additional mechanism identified. |
| M4: verification and repair | A fresh review passed and the governed confirmation finished 179 files green. | 469 calls across verification and finding repair; the machine judgments also exceeded the expected duration. | Investigate duration and stale-worker accounting through `wt-measure-governed-test-duration-by-file-and-remove-the-schedu`. |
| M5: validation and release | Validation, source-only packaging, and release gates were signed. | 26 calls after verification, including three source-only release forms. | Keep source-only packaging as an explicit `none` path. |

### Required Follow-Through

- Backlog migration: 84 tokens inspected. Every token has a future `ready when` condition. None is ready in this closed iteration.
- Debt sweep: 19 debt entries were found. Their individual dated dispositions are still required.
- Memory drain: still required.
- Contract audit: still required.
