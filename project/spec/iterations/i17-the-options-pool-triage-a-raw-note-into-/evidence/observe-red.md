---
form: observe-red
by: agent
signed_off: 2026-08-18T09:52:59.220Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

Both test files exist, both name imports that do not resolve, and neither can pass. The engine runs them itself at this submit; nothing here is my word for it.

ONE THING IS WORTH RECORDING BEFORE THE BUILD, because it is a real seam in the process rather than in the work. THE PRE-COMMIT HOOK BLOCKS A RED TEST. Test-first says write the check before the code; the hook runs the typechecker and refuses a commit whose tree does not compile. A test importing `engine/pool.ts` before that module exists is exactly such a tree. So the red observation cannot be committed — it lives in this form and in the engine's own run of it, and the first commit that carries these files will already be green. Recorded rather than worked around.

AND THE DEBT THE RETRO SWEPT THIS MORNING FIRED HERE, EXACTLY AS WRITTEN. raid-debt-demonstration-reds-are-re-asked-every-iteration says observe-red asks every non-test spec in the corpus, including the ones this delta never touched. It asked for seventeen. ONE of them is this record's. The other sixteen belong to iterations that are already closed, and answering them is what this state costs every time.

SO THE SIXTEEN ARE ANSWERED HONESTLY AND IN TWO GROUPS, and neither group is a tick to get past the check.

- SEVEN COVER STANDING BEHAVIOUR THIS DELTA DOES NOT TOUCH, and red is impossible for them by the state's own rule. Three of those seven were in fact exercised by this session rather than merely asserted: prose-inspect was RUN against a foreign root and went red naming the file and line, the arrival ran by itself and its ordering was measured, and the cited refs resolved because the arrival created the local branches.
- NINE ARE GENUINELY OWED TO SOMEBODY WHO IS NOT AN AGENT ON THIS MACHINE, and each is addressed to the standing register entry that already holds it. All eight to the ten-checks debt.

WHAT THIS COSTS, SAID PLAINLY: sixteen judgements to walk one milestone of one iteration, none of them about the work in hand. That is the debt's own impact line — a check nobody can run is marked owed every iteration and eventually stops being read — happening in front of us.

ONE OF THE SIXTEEN WOULD NOT TAKE EITHER ANSWER, and it is worth writing down. tsp-bound-surface cannot be observed at all — its own entry says the procedure needs two records open at once with satellites serving both, and that does not stand. It is addressed to raid-debt-the-bound-surface-demo-leans-on-two-open-records, which the check refused because that entry's status is `decided` rather than open. So it is marked red-impossible: this delta does not touch it, and its unobservability is already somebody's settled decision rather than an open item. THE CHECK IS RIGHT TO REFUSE A CLOSED REF and the answer it forced is the honest one, but a spec whose only home is a decided entry has nowhere else to point.

## red_observed

- [owed] tsp-one-door-into-the-pool — raid-asm-the-drain-is-the-only-door-into-the-pool
- [x] tsp-prose-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-unattended-start
- [x] tsp-autonomy-tiers
- [x] tsp-read-back-inspection
- [x] tsp-coupling-disposition
- [owed] tsp-desk-and-gates — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-tour-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-panel-walkthrough — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-two-machines — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-first-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-a-slow-signal-keeps-the-wait — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-record-inspection — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-derivation-analysis — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [x] tsp-bound-surface

## follow_up

- the inspection spec's vacuous pass is a real limitation of running an absence-check against an empty tree; verification is where it first has anything to read
- the pre-commit hook and test-first disagree, and the disagreement is structural rather than a mistake by either. It belongs in a retro, not in this record's scope
- raid-debt-demonstration-reds-are-re-asked-every-iteration fired here and cost sixteen judgements about closed iterations. It was swept and re-affirmed at this record's own retro this morning; this is the measurement that sweep did not have
- three of the seven standing specs marked red-impossible were actually EXERCISED by this session, which is worth more than the tick: prose-inspection ran red against a foreign root, the arrival's ordering was measured, and the cited refs resolved

## anything_else

