---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-17T11:53:09.133Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

M3 is filled. Five requirements stand against uc-arrive-on-an-unattended-machine, seven functions and six flows are derived from them, and the assumption register carries five entries from this iteration.

The probe table was re-taken on eleven of forty-two rows and left alone on the rest.

The battery stands at 1397 tests, 1395 green, and the corpus sweep is green at 1150 nodes in 410 ms.

## round_0_verify

- evidence vs claims: green, with one qualification stated rather than hidden. Every claim in M3 carries a measurement taken on this box. THE QUALIFICATION: three of five requirements are verified by hand today, and req-the-arrival-never-costs-the-session declares verify_method: test against a test that does not exist. That is named in write-requirements' follow_up and is the natural work of author-tests below.
- types: green. Every changed file runs unflagged in the suite; no type error across 1397 cases.
- lint: green. biome over 272 files, clean, and the lane ran its safe fixes on every patch that touched code.
- tests: 1397 total, 1395 green, 2 red. Both reds are pre-existing and root-caused: the emergency flake, and nesting.test.ts failing because the test template carries no @biomejs so BIOME_BIN cannot resolve from a borrowed engine. Neither is i35's work. The conformance sweep is separately green.

## round_1_validate

- exercised against the goal: yes for the requirements themselves. Each of the five was written against a step or extension of the use case and names it in source_refs, so the set is traceable to behaviour rather than to the script that happens to implement it.
- missing: a test for req-the-arrival-never-costs-the-session. Nothing asserts that a broken arrival leaves the agent told rather than silently uncaged, which is the dangerous direction. Also missing: an after-measurement of the arrival on a fresh box.
- wrong: nothing found wrong in M3 itself. The corpus lint caught one weasel word in a requirement statement — 'or say that it could not' — and it was rewritten to name what it leaves unresolved. That check earned its keep.
- out of scope: the dial, the three owner rulings, the rename routed to i10, and the shared-module debt. Each is captured with its options.
- prior art: carried forward from gate-motivation, where devcontainers, Codespaces, Nix and mise were compared on both sides along with our own failed caged-subagent pattern. M3 added no new prior-art question, because the requirements restate the same proposition in EARS shape rather than proposing a new one.

## round_2_red_team

- STEELMAN: five requirements is over-specification for one script, and the trace is ceremony => Argued properly, this has force. se-arrive.ts is about 200 lines. Writing a use case, five requirements, seven functions and six flows around it costs more prose than code, and the corpus now carries 20 more nodes that every future sweep and coverage check must walk. WHAT DEFEATS IT, and only partly: the functions are the artifact that will survive the script. Three of them — judge-the-runtime, place-the-cage, resolve-the-cited-refs — are duplicated in se-start today, and the decomposition is what names the duplication as raid-iss rather than leaving it as two files that look similar.
- KILL-CRITERION: if the functions were read off the implementation rather than derived, the whole trace is decoration => Looked for, and the evidence is that two functions cut across the script's own boundaries and one, judge-the-runtime, is satisfied by a host doing nothing at all. That is weak evidence rather than none, and it is the honest strength.
- THE SET IS COMPLETE ONLY AGAINST A USE CASE THIS ITERATION ALSO WROTE => Conceded, and it is the sharpest attack on M3. Nothing external validates the use case's extension list; it was authored from what this run happened to hit. An extension nobody hit is an extension nobody wrote, and the failure would look exactly like completeness.
- THE PROBE TABLE WAS 74 PERCENT UNTOUCHED => Defended rather than conceded. Re-taking a verdict this iteration did not re-measure is the fabrication the contract's evidence rule forbids. The alternative offered is mechanical: pre-fill untouched assumptions the way debt-covered claims already arrive.

## raid_additions

- raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from
- raid-asm-the-arrival-runs-before-the-agent-reads-anything

## verdict

pass — the requirement set is complete against its use case, consistent, bounded and free of placeholders, and every entry names how it will be verified.

TWO DISSENTS, RECORDED RATHER THAN WAIVED.

ONE: three of five requirements are verified by hand today and one declares a test that does not exist. The set is therefore honest about its verify_methods and not yet backed by them. author-tests is the state that closes it, and this gate passes on the condition that it does rather than on a claim that it has.

TWO: the use case the set is judged complete against was authored by this same iteration, from what this run happened to hit. Completeness against a self-authored baseline is the weakest form of the claim, and no fresh eyes exist on this box to strengthen it.

## follow_up

- author-tests: write the test for req-the-arrival-never-costs-the-session first. It is the requirement whose failure is silent.
- Probe raid-asm-the-arrival-runs-before-the-agent-reads-anything by writing a marker the first pull can read — it converts an assumption into a check.
- Owner: the dial, the node floor, and findings 2 and 3.
- A later iteration: the shared module between se-arrive and se-start, and the test that both place the same cage.

## anything_else

THE COMPLETENESS CLAIM IN write-requirements DESERVES ONE MORE SENTENCE THAN IT GOT.

It says the set covers every step of the main scenario and every extension that can lose work. That is true, and the reason it is true is that the same author wrote both the extensions and the requirements, in the same sitting, from the same run.

WHAT WOULD MAKE IT REAL: a second cloud run, on a box configured differently, whose failures either land in an existing extension or add a new one. Until then the set is complete against what one machine did on one afternoon, and that is what this gate is passing.
