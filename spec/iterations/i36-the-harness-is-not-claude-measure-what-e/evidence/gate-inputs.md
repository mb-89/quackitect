---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-19T09:50:44.732Z
reopened: 2026-08-19T09:50:19.008Z — Quality stories and invented quality use cases were removed; six ISO quality requirements now carry that behavior.
authors: agent
files: null
---

# Evidence form / gate-inputs

## current_situation

The user and quality layers are now separate.

I36 has three genuine journey stories and three journey use cases.

`vp-qualities` has only `sty-what-a-quality-is`.

Nine ISO/IEC 25010 quality use cases sit below that story.

Six measured i36 requirements carry project-specific quality behavior.

## picture_judged

The picture is coherent.

User journeys cover unattended cloud work, failed-call improvement and deep research.

Quality demands do not pretend to be journeys.

They refine ISO compatibility, reliability, performance efficiency and security use cases as measured requirements.

The roles, boundary and excluded-use list still match both layers.

## unspecified_capability

No in-scope capability remains unspecified.

Journey layer:

- unattended cloud arrival: `uc-arrive-on-an-unattended-machine`
- failed-call improvement: `uc-route-failed-calls-into-improvement`
- provider-neutral deep research: `uc-research-and-record-an-answer`

Quality layer:

- harness identity and compatible projections: `req-supported-harness-serves-one-lane-contract`
- cage boundary: `req-native-project-tools-stay-outside-the-cage`
- interruption diagnosis: `req-interrupted-call-names-the-stopping-layer`
- bounded spill recovery: `req-oversized-results-remain-recoverable-through-the-lane`
- boot metadata recovery: `req-boot-needs-no-manual-test-metadata-repair`
- stop behavior: `req-stop-hook-yields-only-at-a-machine-stop`

Each quality row refines an ISO quality use case.

## passes_concrete

The three journey decks are concrete enough to script later.

Each has one actor, ordered events and an observable result.

The six quality requirements are concrete enough to verify later.

Each carries a source, stimulus, artifact, environment, response and measured response.

Executable evidence remains correctly owed to later milestones.

## round_0_verify

- evidence vs claims: pass; journey evidence points to three standing stories and three use cases, while quality evidence points to six standing requirements.
- types: pass; exactly one story refines `vp-qualities`, exactly nine ISO quality use cases refine that story, and each i36 quality row refines an ISO quality use case.
- lint: pass at artifact shape; removed quality story and invented use-case identifiers have zero surviving trace references.
- tests: formulated journeys and quality scenarios only; executable tests are later. Runtime experiments remain explicit debt.

## round_1_validate

- exercised against the goal: pass; every harness concern appears either as a genuine journey or a measured ISO quality requirement.
- missing: no user-picture or quality-demand hole remains in scope.
- wrong: quality behavior was previously modelled as freely authored stories and use cases; those nodes are deleted.
- out of scope: UI mirror and expedition archive work remain elsewhere.
- prior art: ISO/IEC 25010 fixes the quality taxonomy; fresh MCP and harness sources inform the requirement measures.

## goals_served

- Measure what every supported host actually provides.: `sty-run-deep-research-across-harnesses`, `uc-research-and-record-an-answer` and `req-supported-harness-serves-one-lane-contract` cover the journey and compatibility measure.
- Close the five measured harness breaks in the prepared brief.: the six quality requirements cover cage, stop, payload, boot metadata, interruption and host-profile demands.
- Make the lane report which harness it is talking to.: `req-supported-harness-serves-one-lane-contract` carries the compatibility measure.
- Make future boots quicker by removing the test-metadata recovery step from the manual boot path.: `req-boot-needs-no-manual-test-metadata-repair` carries the reliability measure.
- Make oversized pull results recoverable through the lane instead of host files.: `req-oversized-results-remain-recoverable-through-the-lane` carries the performance-efficiency measure.

## bound_breaches

- if-agent-harness-to-entrypoint: breached during this session; the compatibility, reliability, performance-efficiency and security requirements name the required responses and measures. Implementation repayment remains `raid-debt-harness-fallback-and-bounds-need-implementation-proof`.

## round_2_red_team

- Strong opposing case: removing quality stories erases concrete examples => answer: genuine user journeys remain as stories; quality details remain as six measured scenarios.
- Strong opposing case: requirements were authored before normal M3 work => answer: the owner required immediate hierarchy repair; M3 must review them and may refine wording, but their taxonomy is correct.
- Kill criterion: any story besides `sty-what-a-quality-is` refines `vp-qualities` => answer: not found; count is exactly one.
- Kill criterion: any project-invented use case sits directly under the quality story => answer: not found; its nine children are the ISO quality-area use cases.

## raid_additions

- none

## verdict

pass with overrides — The user picture and quality hierarchy are correct. The override is procedural: six quality requirements were authored during M2 repair and must be reviewed by normal M3 requirement work. Runtime implementation remains debt.

## follow_up

Stop at the blessed `gate-inputs`.

The next session begins M3 by reviewing the six early-authored quality requirements.

It must preserve the fixed ISO quality hierarchy.

## anything_else

Later guidance improvement is captured in `note-4fb68ee6f05d`.
