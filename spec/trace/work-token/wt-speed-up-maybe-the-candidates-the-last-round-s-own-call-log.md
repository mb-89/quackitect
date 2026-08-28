---
id: wt-speed-up-maybe-the-candidates-the-last-round-s-own-call-log
type: "[[work-token]]"
statement: |-
  Speed-up, maybe: the candidates the last round's own call log paid for.

  - `raid-iss-the-running-lane-is-not-the-code-the-walk-is-editing` — The lane process loads the engine once at start and never reloads it.
    - unsure because: it reads as a correctness defect, not a speed one.
    - but: it invalidates every measurement taken inside a walk, which is the whole first milestone. Evidence: "`deliverable/package.json` says version `6.0.0`. Every record the call log wrote today says `\"se_version\":\"5.0.0\"`... Across 16,157 records in this window, the count carrying that stamp is ZERO."

  - `wt-a-way-exists-to-make-one-engine-call-take-a-long-time-delibe` — A way exists to make one engine call take a long time deliberately, for use by checks.
    - unsure because: it is a test affordance rather than a speed-up.
    - but: two latency rows are blocked on it. Evidence: "Two planned rows need it and neither can proceed."

  - `raid-iss-the-surface-row-has-no-harness-that-could-fail-it` — A requirement demanding that a surface answers no worse while the engine is busy has no check that could ever fail it.
    - unsure because: same affordance, stated as coverage.
    - but: it means the surface-under-load bound is unmeasurable today.

  - `raid-asm-one-second-resolution-is-enough-to-time-a-lane-call` — The one-second convention that bounds every modelled interface is fine enough to time a lane call.
    - unsure because: it is a measurement-unit question, not a repair.
    - but: the hop budget in `wt-one-hop-...` is a twentieth of a second, so the convention has to be re-decided. Evidence: carries `0 ms`, `1 ms`, `580 ms`, `1712 ms`, `2275 ms`, `290 calls`, `6.6 percent`.

  - `raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` — The agent-to-entrypoint bound of one second is measured against every lane call, including the verbs whose whole job is to spawn a process and wait for it.
    - unsure because: it may be a definition fix rather than a speed fix.
    - but: it is why the breach counts are unusable. Evidence: carries `2421 ms`, `1903 ms`, `3903 ms`, `111765 ms`, `1456 tests`.

  - `raid-ar-work-past-its-bound-says-it-is-working` — The signal cannot see the operations that breach.
    - unsure because: it is about the honesty signal, not the duration.
    - but: it carries the breach count. Evidence: "the harness-to-entrypoint bound was breached 93 times in one day, worst 20.5 seconds, typical 2 to 4."

  - `raid-un-a-slowness-signal-never-shortens-the-wait` — The design spec deliberately leaves what the signal says undecided, and the measure has never been executed.
    - unsure because: the decision is the owner's and it is about wording.
    - but: it is the smoothness half of the owner's framing.

  - `raid-risk-an-honest-slow-interface-becomes-noise-nobody-reads` — Requiring every slow interface to say so could produce a stream of progress messages the person stops reading.
    - unsure because: it is a design risk against the smoothness work, not work itself.
    - but: it is the standing counter-argument. Evidence: carries `324 times`, `1.1 seconds`.

  - `raid-risk-an-accurate-progress-signal-can-drive-abandonment` — The most accurate progress bar produced the highest abandonment.
    - unsure because: the primary source was not seen.
    - but: it argues directly against a ruling already made. Evidence: "the slow-to-fast bar... produced the highest abandonment rate at 21.8 percent. PRIMARY NOT SEEN."

  - `wt-show-which-boot-preparation-check-is-active-when-the-desk-pr` — Show which boot preparation check is active when the desk preparation takes longer than a normal pull.
    - unsure because: it is a display item.
    - but: boot is the slowest measured stretch and this makes it diagnosable.

  - `wt-retire-the-http-page-server-and-leave-the-editor-sidebar-as-` — Retire the HTTP page server and leave the editor sidebar as the only place a person looks.
    - unsure because: it is a UI consolidation, owned by i23.
    - but: `ready_when: ready when somebody starts the next piece of engine work — the owner named it the first thing after this retro`.

  - `wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth` [PRE-ROUTED] — The editor panel is the single place that counts, and any other renderer is incidental.
    - unsure because: it reads as a UI ruling.
    - but: it is pre-routed to this iteration and it cuts 21 emitters. Evidence: "Twenty-one stray emitters get sorted on that one question."

  - `wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a-` [PRE-ROUTED] — A check currently reads 126 where 63 stand, and a companion view reads 34 where 68 are listed.
    - unsure because: it is a correctness defect, not a latency one.
    - but: it is pre-routed here, and the doubled read is a likely cost. Evidence: "Each figure is off by a clean multiple, so one fault is likelier than two limits drifting apart."

  - `wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-` [PRE-ROUTED] — A score cell with no evidence behind it may say so in words, and the ranking maths then treats that cell as absent rather than as a value.
    - unsure because: it is scoring correctness, not speed.
    - but: pre-routed here by the retro's own drain.

  - `raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker` — The consistency sweep was rewired to run after the demonstrations rather than beside them.
    - unsure because: recorded as a method concession.
    - but: it is lost parallelism, taken to route around an engine defect. Evidence: "the method lost a parallel branch to get past an engine defect."

  - `raid-walk-all-fans-manual` — Covering a fan took one manual pass per branch, because the route found the nearest path rather than every path the gate collects.
    - unsure because: marked mitigated.
    - but: it is per-branch manual work on a fan, which the orchestrator will multiply.

  - `wt-a-disposable-machine-cannot-carry-anything-into-its-own-open` — A disposable machine cannot carry anything into its own opening look-back.
    - unsure because: it reads as a cloud correctness item.
    - but: the owner asked for a skippable-position mechanism, which is step-size machinery. Evidence: "WHAT THE OWNER ASKED FOR is a mechanism, not another paragraph of advice."

  - `wt-checks-do-seed-a-record-and-each-builds-its-own-throwaway-ro` — WHAT IS MISSING IS A SACRIFICIAL RECORD sitting where the product itself looks.
    - unsure because: it is test-fixture design.
    - but: "Today nobody exercises the machinery without walking a genuine round, so faults surface in real work rather than in a fixture" — which is exactly what makes a walk slow.

  - `wt-two-connected-changes-about-throwaway-programs-first-the-mac` — The machine should test at start-up which outside interpreters this computer actually carries; the look-back should turn repeated throwaway programs into proper tools.
    - unsure because: half of it is a retro process change.
    - but: this iteration will write many measuring scripts.

  - `wt-a-boundary-between-two-parts-can-be-designed-specified-and-n` — A boundary between two parts can be designed, specified and never built, and both checks pass over the hole.
    - unsure because: it is a plan-completeness check, not speed.
    - but: it carries the biggest waste figure in the corpus. Evidence: "THIS IS EXACTLY WHAT COST ONE ROUND 43% OF ITS CALLS: seven chunks were planned, none of them connected the new store to the walk, and the whole thing shipped inert."

  - `raid-the-read-proof-locks-weaker-models-out-of-the-system` — Weaker models cannot produce the boot reading proof at all.
    - unsure because: it is a capability gap.
    - but: routing cheap states to cheap hands is a speed and cost lever, and this shuts the door on it.

  - `raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all` — Routing a cheaper driver to a cheaper state is worth nothing while a weaker model cannot boot.
    - unsure because: a dependency, not work.
    - but: it names what has to move first for the cheap-hand lever to pay.

  - `wt-a-person-who-confirms-having-finished-a-document-does-not-th` — A person who confirms having finished a document does not thereby satisfy the demand for it.
    - unsure because: it is about driving without an agent.
    - but: "a person is halted at the first document on any route" is the smoothest possible failure of smoothness.

  - `wt-evidence-produced-during-the-first-two-milestones-is-never-w` — No state in the first two milestones declares the version-control verb, so everything sits unsaved until a much later checkpoint.
    - unsure because: it reads as durability, not speed.
    - but: on ephemeral hardware it costs a whole re-walk. Evidence: "an interrupted session loses every form it signed."
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Speed-up, maybe: the candidates the last round's own call log paid for.

- `raid-iss-the-running-lane-is-not-the-code-the-walk-is-editing` — The lane process loads the engine once at start and never reloads it.
  - unsure because: it reads as a correctness defect, not a speed one.
  - but: it invalidates every measurement taken inside a walk, which is the whole first milestone. Evidence: "`deliverable/package.json` says version `6.0.0`. Every record the call log wrote today says `\"se_version\":\"5.0.0\"`... Across 16,157 records in this window, the count carrying that stamp is ZERO."

- `wt-a-way-exists-to-make-one-engine-call-take-a-long-time-delibe` — A way exists to make one engine call take a long time deliberately, for use by checks.
  - unsure because: it is a test affordance rather than a speed-up.
  - but: two latency rows are blocked on it. Evidence: "Two planned rows need it and neither can proceed."

- `raid-iss-the-surface-row-has-no-harness-that-could-fail-it` — A requirement demanding that a surface answers no worse while the engine is busy has no check that could ever fail it.
  - unsure because: same affordance, stated as coverage.
  - but: it means the surface-under-load bound is unmeasurable today.

- `raid-asm-one-second-resolution-is-enough-to-time-a-lane-call` — The one-second convention that bounds every modelled interface is fine enough to time a lane call.
  - unsure because: it is a measurement-unit question, not a repair.
  - but: the hop budget in `wt-one-hop-...` is a twentieth of a second, so the convention has to be re-decided. Evidence: carries `0 ms`, `1 ms`, `580 ms`, `1712 ms`, `2275 ms`, `290 calls`, `6.6 percent`.

- `raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work` — The agent-to-entrypoint bound of one second is measured against every lane call, including the verbs whose whole job is to spawn a process and wait for it.
  - unsure because: it may be a definition fix rather than a speed fix.
  - but: it is why the breach counts are unusable. Evidence: carries `2421 ms`, `1903 ms`, `3903 ms`, `111765 ms`, `1456 tests`.

- `raid-ar-work-past-its-bound-says-it-is-working` — The signal cannot see the operations that breach.
  - unsure because: it is about the honesty signal, not the duration.
  - but: it carries the breach count. Evidence: "the harness-to-entrypoint bound was breached 93 times in one day, worst 20.5 seconds, typical 2 to 4."

- `raid-un-a-slowness-signal-never-shortens-the-wait` — The design spec deliberately leaves what the signal says undecided, and the measure has never been executed.
  - unsure because: the decision is the owner's and it is about wording.
  - but: it is the smoothness half of the owner's framing.

- `raid-risk-an-honest-slow-interface-becomes-noise-nobody-reads` — Requiring every slow interface to say so could produce a stream of progress messages the person stops reading.
  - unsure because: it is a design risk against the smoothness work, not work itself.
  - but: it is the standing counter-argument. Evidence: carries `324 times`, `1.1 seconds`.

- `raid-risk-an-accurate-progress-signal-can-drive-abandonment` — The most accurate progress bar produced the highest abandonment.
  - unsure because: the primary source was not seen.
  - but: it argues directly against a ruling already made. Evidence: "the slow-to-fast bar... produced the highest abandonment rate at 21.8 percent. PRIMARY NOT SEEN."

- `wt-show-which-boot-preparation-check-is-active-when-the-desk-pr` — Show which boot preparation check is active when the desk preparation takes longer than a normal pull.
  - unsure because: it is a display item.
  - but: boot is the slowest measured stretch and this makes it diagnosable.

- `wt-retire-the-http-page-server-and-leave-the-editor-sidebar-as-` — Retire the HTTP page server and leave the editor sidebar as the only place a person looks.
  - unsure because: it is a UI consolidation, owned by i23.
  - but: `ready_when: ready when somebody starts the next piece of engine work — the owner named it the first thing after this retro`.

- `wt-the-editor-panel-is-the-single-place-that-counts-and-any-oth` [PRE-ROUTED] — The editor panel is the single place that counts, and any other renderer is incidental.
  - unsure because: it reads as a UI ruling.
  - but: it is pre-routed to this iteration and it cuts 21 emitters. Evidence: "Twenty-one stray emitters get sorted on that one question."

- `wt-the-matrix-rows-served-to-a-reader-match-the-rows-on-disk-a-` [PRE-ROUTED] — A check currently reads 126 where 63 stand, and a companion view reads 34 where 68 are listed.
  - unsure because: it is a correctness defect, not a latency one.
  - but: it is pre-routed here, and the doubled read is a likely cost. Evidence: "Each figure is off by a clean multiple, so one fault is likelier than two limits drifting apart."

- `wt-a-score-cell-with-no-evidence-behind-it-may-say-so-in-words-` [PRE-ROUTED] — A score cell with no evidence behind it may say so in words, and the ranking maths then treats that cell as absent rather than as a value.
  - unsure because: it is scoring correctness, not speed.
  - but: pre-routed here by the retro's own drain.

- `raid-debt-a-parallel-fan-is-serialised-to-get-past-the-walker` — The consistency sweep was rewired to run after the demonstrations rather than beside them.
  - unsure because: recorded as a method concession.
  - but: it is lost parallelism, taken to route around an engine defect. Evidence: "the method lost a parallel branch to get past an engine defect."

- `raid-walk-all-fans-manual` — Covering a fan took one manual pass per branch, because the route found the nearest path rather than every path the gate collects.
  - unsure because: marked mitigated.
  - but: it is per-branch manual work on a fan, which the orchestrator will multiply.

- `wt-a-disposable-machine-cannot-carry-anything-into-its-own-open` — A disposable machine cannot carry anything into its own opening look-back.
  - unsure because: it reads as a cloud correctness item.
  - but: the owner asked for a skippable-position mechanism, which is step-size machinery. Evidence: "WHAT THE OWNER ASKED FOR is a mechanism, not another paragraph of advice."

- `wt-checks-do-seed-a-record-and-each-builds-its-own-throwaway-ro` — WHAT IS MISSING IS A SACRIFICIAL RECORD sitting where the product itself looks.
  - unsure because: it is test-fixture design.
  - but: "Today nobody exercises the machinery without walking a genuine round, so faults surface in real work rather than in a fixture" — which is exactly what makes a walk slow.

- `wt-two-connected-changes-about-throwaway-programs-first-the-mac` — The machine should test at start-up which outside interpreters this computer actually carries; the look-back should turn repeated throwaway programs into proper tools.
  - unsure because: half of it is a retro process change.
  - but: this iteration will write many measuring scripts.

- `wt-a-boundary-between-two-parts-can-be-designed-specified-and-n` — A boundary between two parts can be designed, specified and never built, and both checks pass over the hole.
  - unsure because: it is a plan-completeness check, not speed.
  - but: it carries the biggest waste figure in the corpus. Evidence: "THIS IS EXACTLY WHAT COST ONE ROUND 43% OF ITS CALLS: seven chunks were planned, none of them connected the new store to the walk, and the whole thing shipped inert."

- `raid-the-read-proof-locks-weaker-models-out-of-the-system` — Weaker models cannot produce the boot reading proof at all.
  - unsure because: it is a capability gap.
  - but: routing cheap states to cheap hands is a speed and cost lever, and this shuts the door on it.

- `raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all` — Routing a cheaper driver to a cheaper state is worth nothing while a weaker model cannot boot.
  - unsure because: a dependency, not work.
  - but: it names what has to move first for the cheap-hand lever to pay.

- `wt-a-person-who-confirms-having-finished-a-document-does-not-th` — A person who confirms having finished a document does not thereby satisfy the demand for it.
  - unsure because: it is about driving without an agent.
  - but: "a person is halted at the first document on any route" is the smoothest possible failure of smoothness.

- `wt-evidence-produced-during-the-first-two-milestones-is-never-w` — No state in the first two milestones declares the version-control verb, so everything sits unsaved until a much later checkpoint.
  - unsure because: it reads as durability, not speed.
  - but: on ephemeral hardware it costs a whole re-walk. Evidence: "an interrupted session loses every form it signed."

## When it comes back

ready when the speed-up round scopes its build
