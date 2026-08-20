---
form: find_prior_art
by: agent
signed_off: 2026-08-20T11:51:37.338Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

M4's candidate space opens. The block being enumerated against is the one the partition just isolated: four functions, two external interfaces, turning a declared difficulty into a named driver.

THAT SEAM IS WHY THIS SEARCH IS NARROWER THAN THE KICKOFF'S. The kickoff scanned LLM routing and scheduler practice for the design as a whole. This one asks what else is shaped like a four-function block that resolves a declared class to a worker and publishes it without dispatching.

A DEEPER SCAN WAS COMMISSIONED and had not reported when this form was filled. What is below comes from the kickoff's own primary sources, re-read rather than recalled; anything the scan adds folds in as further options.

## applies

yes — the block resolves a declared class to a worker, a shape older and better documented than LLM routing, so prior art returns designs rather than variations.

## options

- opt-score-the-work-at-dispatch-instead-of-declaring-it
- opt-run-cheap-and-escalate-on-a-failed-check
- opt-derive-the-rung-from-what-will-judge-the-output
- opt-a-rung-names-an-intensity-as-well-as-a-worker
- opt-a-declared-class-with-a-named-fallback-pool

## literature

THE CASCADING SURVEY IS THE ONE THAT NAMES OUR SEAM. arxiv.org/html/2603.04445v2 separates ROUTING — one decision mapping a query to one model — from CASCADING, which escalates after estimating quality on the answer that was actually produced. Our block is unambiguously the first, and the paper's framing is what makes the second enumerable as a rival rather than as a variation. FrugalGPT is the ancestor it traces the pattern to.

THE SCHEDULER LITERATURE IS OLDER AND HARSHER, and the kickoff already established it: Google's Autopilot measured hand-managed jobs at roughly twice the slack of machine-corrected ones, and a 2026 survey across more than twenty-three thousand production clusters found sixty-nine percent of requested CPU unused with the cause given as declarations nobody updates. THAT IS LITERATURE ABOUT OUR DESIGN'S FAILURE MODE, not about its mechanism.

ONE PIECE OF LITERATURE CHANGED A CANDIDATE RATHER THAN SUPPORTING ONE. Tran and Kiela, arxiv.org/abs/2604.02460, found single agents matching or beating multi-agent systems under equal token budgets and argued that reported gains are often confounded by unaccounted computation. It does not bear on how a driver is chosen; it bears on whether fanning out is worth it, and the record's bounded-fan-out ruling should cite it rather than the token multiplier it currently cites.

WHAT WAS NOT FOUND IN THE LITERATURE, said rather than left blank: nothing describes rating work A PRIORI by whether a checker could catch a wrong answer. The nearest published proposal, arxiv.org/html/2604.07494v1, routes software tasks to tiers on COMPUTED code-health metrics and its own author calls it an idea not yet proven.

## shipped

RUNNING SYSTEMS, AND THE SPLIT IS SHARP. Every shipped ROUTER computes at dispatch; every shipped AGENT FRAMEWORK declares statically as we do and derives the declaration from nothing.

COMPUTED AT DISPATCH: Cursor's router emits a continuous complexity score from a predictor trained on live traffic and labelled by whether the user proceeded or corrected. AWS Bedrock Intelligent Prompt Routing predicts per-request response quality against a tunable threshold. OpenRouter's auto router classifies into task types and ranks on a rolling spend index.

DECLARED AND NEVER DERIVED: Claude Code's subagent model is frontmatter defaulting to inherit. The OpenAI Agents SDK makes it a constructor argument and says plainly that mixing is the developer's call.

THE ONE SHIPPED THING THAT MATCHES OUR BLOCK'S SHAPE MOST CLOSELY is LiteLLM's tag routing: a declared tag on the work, a config mapping tags to deployments, and — the part we do not have — a default pool and an explicit fail-open switch, so no-match is a configured condition rather than an unplanned one.

AND ONE SHIPPED BEHAVIOUR IS EVIDENCE AGAINST OUR OWN PORTABILITY ASSUMPTION rather than for any option: a model alias already resolves to different models on different providers, so one byte-identical table does not produce one behaviour.

## dry_wells

- The name-and-do-not-spawn split. Nothing was found describing a component that computes a worker class and publishes it for something else to act on. The policy-decision-point pattern is the obvious neighbour and was not established as prior art for this by the sources in hand.
- Recommendation-only reconciliation of a declared class against what the work needed. Nothing shipped was found that reports the gap and never acts on it.
- Taking a maximum over a group and keeping the spread visible. No named practice was found for the second half, which is the half that makes the cost readable.
- Rating work a priori by whether a checker could catch a wrong answer. Searched at the kickoff and again here; the seam appears in training-pipeline domain splits and in post-hoc cascading, never as an a-priori rating.

## follow_up

- FIVE OPTIONS, AND THEY ARE DELIBERATELY NOT VARIATIONS OF ONE. Two move WHEN the decision happens (at dispatch, or after the work). One moves WHO decides (derive the rung from a declared judge rather than typing it). Two move WHAT THE MAPPING HOLDS (a worker-and-intensity pair; a default pool with a fail-open switch).

- THE THIRD IS THE ONE THAT COULD REPLACE THE PLAN. Deriving the rung from what will judge the output is the only option in the set that answers the standing drift risk, because a derived value is wrong only if a checkable declaration is wrong. It has been named as a candidate since the kickoff scan and it now has a node.

- THREE DRY WELLS ARE ABOUT OUR OWN DISTINCTIVE CHOICES, which is worth noticing rather than filing. Name-and-do-not-spawn, recommendation-only reconciliation, and keeping the spread visible all came back empty. Either they are genuinely novel or the search was too narrow, and a commissioned deeper scan is the thing that will tell us which.

## anything_else

