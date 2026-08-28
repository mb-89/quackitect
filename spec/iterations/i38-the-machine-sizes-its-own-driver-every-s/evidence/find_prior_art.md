---
form: find_prior_art
amended: 2026-08-20T14:10:08.386Z by agent — three false figures and one fact this record had already corrected elsewhere and left standing here
by: agent
signed_off: 2026-08-20T12:22:53.447Z
reopened: "2026-08-20T12:21:02.589Z — the deep search it commissioned returned after it was signed, and named prior art it does not carry: XACML NotApplicable as a returned no-match value, compile-time totality checking over the mapping, and four shipped recommend-only reconcilers. The form claims a completed search over the sizing cluster and the search was still running."
authors: agent
files: null
---

# Evidence form / find_prior_art

## current_situation

M4's candidate space opens. The block being enumerated against is the one the partition just isolated: four functions, two external interfaces, turning a declared difficulty into a named driver.

THAT SEAM IS WHY THIS SEARCH IS NARROWER THAN THE KICKOFF'S. The kickoff scanned LLM routing and scheduler practice for the design as a whole. This one asks what else is shaped like a four-function block that resolves a declared class to a worker and publishes it without dispatching.

THE COMMISSIONED SCAN REPORTED AFTER THIS FORM WAS SIGNED, and the form was reopened for it. The literature and shipped sections are the first pass unchanged, re-read from the kickoff's own primary sources. What the scan added lands in the options, the dry wells and the follow-up — and it did not confirm the first pass. It filled two of the FOUR dry wells the first pass declared, which is the finding. CORRECTED at gate-candidates: this form's dry_wells section holds four bullets, two marked FILLED and two still dry, and saying three inflated the surviving well into a lone survivor.

## applies

yes — the block resolves a declared class to a worker, a shape older and better documented than LLM routing, so prior art returns designs rather than variations.

## options

- opt-score-the-work-at-dispatch-instead-of-declaring-it
- opt-run-cheap-and-escalate-on-a-failed-check
- opt-derive-the-rung-from-what-will-judge-the-output
- opt-a-rung-names-an-intensity-as-well-as-a-worker
- opt-a-declared-class-with-a-named-fallback-pool
- opt-the-no-match-is-a-returned-value-not-an-absence
- opt-the-mapping-is-checked-for-totality-when-the-machine-compiles
- opt-a-separate-reader-recommends-and-never-acts

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

- Taking a maximum over a group and keeping the spread visible. STILL DRY AFTER THE DEEPER SCAN, and now precisely so. The first half is standard and named: Kubernetes computes a pod's effective request as the higher of the sum over its app containers and the maximum over its init containers, and the waste that follows is documented and accepted rather than mitigated. CORRECTED at gate-candidates: this sentence said a maximum over its containers. The record caught that at the re-signing and the correction never reached this form, which is worse than the original error because it was known. Nothing was found for the second half — reporting the spread the maximum hid — under any name, in any scheduler, in any router. That is either our contribution or our blind spot and the scan cannot say which.
- Rating work a priori by whether a checker could catch a wrong answer. Searched at the kickoff, again in the first pass, and again by the deeper scan. The seam appears in training-pipeline domain splits and in post-hoc cascading, never as an a-priori rating.
- FILLED, AND THE FIRST PASS WAS WRONG: recommendation-only reconciliation. Four shipped systems do exactly this — Kubernetes VPA in updateMode Off, Goldilocks, Robusta KRR, and Slurm's seff. Three of the four cannot act even in principle, because the recommender holds no write path into the thing it advises. Recorded as opt-a-separate-reader-recommends-and-never-acts.
- FILLED, AND OLDER THAN EXPECTED: the name-and-do-not-spawn split. XACML's policy decision point has returned a decision for an enforcement point to act on since 2003, and its four-value vocabulary includes NotApplicable — a standardised value for no policy matched, distinct from an evaluation failure. Our unmatched case publishes an absence where a twenty-year-old standard publishes a value. Recorded as opt-the-no-match-is-a-returned-value-not-an-absence.

## follow_up

- EIGHT OPTIONS NOW, AND THEY ARE DELIBERATELY NOT VARIATIONS OF ONE. Two move WHEN the decision happens. One moves WHO decides. Two move WHAT THE MAPPING HOLDS. Two, from the deeper scan, move WHAT HAPPENS AT THE EDGE — the unmatched case, from an absence to a value and from a run-time event to a compile-time refusal. One moves WHERE THE DECIDER LIVES, out of the walk entirely.

- THE THIRD IS STILL THE ONE THAT COULD REPLACE THE PLAN. Deriving the rung from what will judge the output is the only option in the set that answers the standing drift risk, because a derived value is wrong only if a checkable declaration is wrong.

- THE DEEPER SCAN'S REAL RESULT IS ABOUT THIS FORM, NOT ABOUT THE DESIGN. Two of four dry wells were filled, and both by prior art that is older and better documented than anything the first pass cited. A dry well written from the sources in hand is a statement about the sources in hand, and this form said so at the time — "either they are genuinely novel or the search was too narrow". It was the second, twice.

- THE ONE THAT SURVIVED IS THEREFORE WORTH MORE THAN IT WAS. Keeping the spread visible after a maximum came back empty from a scan that filled two of the other three. The fourth, rating work a priori by whether a checker could catch a wrong answer, came back empty as well and this paragraph used to write it out of existence. The nearest named practice accepts the waste and documents it. That is the closest thing this record has to an original contribution, and it is a half-sentence in a requirement nobody has argued about.

- ONE FINDING WENT STRAIGHT INTO ANOTHER FINDER RATHER THAN HERE. Nix's requiredSystemFeatures is the closest structural match found anywhere — a declared property set on the work, resolved against workers — and its distinguishing property is that the worker may refuse. That is a reversal, not a mapping, so it is credited inside opt-the-driver-reads-the-difficulty-and-decides-whether-to-take-it where find_by_transforming had already reached it independently. Two finders arriving at one design from opposite directions is the strongest signal on the chart.

## anything_else

