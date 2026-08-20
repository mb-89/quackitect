---
id: i18-the-blast-radius-compute-the-downstream-
status: seeded
opened: 2026-08-12T19:44:32.329Z
goal: "The blast radius: compute the downstream cone of a change, and split it so a large cone stays reviewable instead of becoming a wall."
vision: |-
  DONE LOOKS LIKE: change a requirement and the affected cone is computed, not guessed. Change a state high in a machine and everything below it is named. Change a decision or a claim and everything resting on it is named. And the cone arrives SORTED, not flat.

  WE HAVE THE POLICY AND NOT THE COMPUTATION. The contract's recheck block already says it: a claim that already stood comes back when something upstream moved, and the agent reads what is written and asks ONLY whether the named change moved it. That is the right instruction and nothing computes what it needs.

  THE SPLIT IS THE WHOLE VALUE, and v1 built it. Read product/engine-go/triage.go at ref main before designing anything. Its cone divides in two:

  NEEDS RE-RULING, when the gate's own subject moved. Three cases, all mechanical: its own statement changed, measured against a recorded statement hash; its own definition changed, where the full hash moved while statement and dependencies did not; or a direct dependency that is ITSELF a blessed gate had its recorded statement hash move.

  STILL-HOLDS CANDIDATE for everything else — upstream content only, a dependency's non-statement fields, or pure propagation where own inputs are unchanged and the cone was dragged along by a named root.

  THE SPLIT RULE IS DERIVED FROM WHAT THE WHY-DELTA ALREADY REPORTS, NEVER NEW ANALYSIS. That is what keeps it cheap and honest.

  AND IT NAMES ITS OWN LIMIT IN THE CODE: statement baselines exist only for blessed gates, so an unblessed content dependency's change reads as upstream content. The row still NAMES the changed dependency, and the section says CANDIDATES — the owner rules, the triage only groups.

  A FLAT CONE IS UNUSABLE. Marking two hundred nodes suspect and handing them over is not a feature. The sort is the feature.

  TWO MORE RULES FROM V1'S WAVE PATH, worth taking together. A bulk re-adjudication may touch SUSPECT gates only; an OPEN gate — one never adjudicated at any hash — is REFUSED and named, because its first adjudication must be its own walk. And the triage view itself is READ-ONLY and never gated, because it advances nothing.

  THIS ALSO SERVES THE CLAIM SYSTEM. Once claims are assumptions cited by id, the blast radius is what shows what falls when an assumption falls. i10 lays that wiring; this computes over it.

  FULL CONTEXT: project/spec/version-planning.md, section on the blast radius, and i18.

  FROM THE POOL, 2026-08-13. The owner's change-control design, which states this iteration's prerequisite outright.

  THE MIDDLE CASE HAS NO VERB (owner question, note-51b685bbd37b). When a note becomes a change it must land in design input, so the spec grows - and the question is how to append without devaluing the chain or re-looking at everything. Three costs exist and only two are built. Amending covers wording that changes no claim, keeping the signature while the checks still run. Reopening covers a claim that was WRONG, greying the whole downstream cone. A NEW DEMAND appended to the register has neither. Measured once via reopen: the standing claims re-earned as rechecks, cheap per state, but the walk visited every downstream state including ones the row cannot move. THE VERB WANTED mints the row, greys ONLY the states whose checks actually read it - the engine already computes those from the nodes, so the grey set can be exact rather than cone-shaped - and queues the rechecks as open to-dos rather than forcing an immediate walk.

  OPTIMISTIC CHANGE CONTROL, AND ITS PREREQUISITE (owner design, note-8090be245ec1). The amend class is content changing while intent does not - a resharpening, never a new demand. An amend is assumed okay the moment it lands, nothing greys, and work continues, while every amend ALSO lands in an amendment register. THE NEXT GATE THE WALK REACHES DRAINS THAT REGISTER FIRST, as its opening act, with one judgment per amendment. THE JUDGMENT IS NOT MECHANICAL: it walks the tree between the amended node and the gate and asks whether any step leaned on the pre-amend wording. A change control board, folded into the gate cadence. THE PREREQUISITE IS THIS ITERATION'S CORE: impact computed over the TRACE graph as a directed acyclic graph, cheap reachability from the changed node to the claims that read it, the way v1 did. Today the engine cones over the STATE machine, which is the coarse shape, and the trace-level impact set is what both the change-control judgment and the append verb need. Where a change lands high, everything below is honestly in the impact - the graph does not shrink that case, it makes the computation exact and cheap.

  THE IMPACT SET HAS A NAMED CONSUMER NOW (owner ruling 2026-08-13, at i27's gate-inputs). i6 WAITS ON THIS.

  WHAT i6 NEEDS FROM HERE: which trace nodes a given change actually touches, computed rather than declared. Not the cone over the STATE machine, which is the coarse shape this iteration already exists to replace - the impact set over the TRACE graph, node by node.

  WHAT i6 DOES WITH IT. The coverage checks today prove a link EXISTS and never that anybody re-read it, so an iteration can list thirty-six use cases, examine two, and go green. With the impact set the check becomes: every listed reference was either re-read against this delta, or is provably outside the set. A touched node listed unread REFUSES.

  WHY THAT RAISES THE BAR ON THIS ITERATION'S OWN OUTPUT. The impact set stops being a report somebody reads and becomes an INPUT another check consumes. A cone that is merely indicative is fine for a person deciding what to look at, and not fine for a refusal. It has to be exact in both directions - nothing touched left out, nothing untouched dragged in - or the check it feeds is either a nuisance or a lie.

  LIVE EXHIBIT, 2026-08-13. i27's M2 listed 36 use cases and read two. Six more were LIKELY touched and were named as unread in the evidence, BY HAND. That hand-written list is exactly what this computation replaces.

  CROSS-COUPLING IS THIS ITERATION'S QUESTION ASKED AT AUTHORING TIME (owner, 2026-07-30, re-affirmed 2026-08-13). note-009c8f273ba8 carries it.

  WHEN A CHANGE OR A NEW REQUIREMENT LANDS, analyse its coupling with everything that exists. Does this mechanism influence other mechanisms. How many places must be touched. Are there places whose BEHAVIOUR this influences non-obviously. Does the existing implementation have to change too.

  POSITIVE COUPLING COUNTS, and it is the half people forget. Ask for SYNERGIES: does this work improve an existing function if it is modified slightly, and what does it unlock.

  THREE LAYERS, AND THIS ITERATION OWNS THE FIRST.

  - STRUCTURAL: which nodes the change touches, over the trace graph. Computed exactly. THAT IS THIS ITERATION.
  - SEMANTIC: the couplings NO EDGE RECORDS. Needs the retrieval sibling in i15, because the graph cannot see what nobody wrote down.
  - SYNERGY: not computable either way. It is judgment - but judgment needs CANDIDATES to judge over, and the first two layers are what supply them.

  WHY THE CHECK CANNOT BE ANSWERED BY HAND, measured 2026-08-13. The note says check ALL existing requirements one by one, not by feel. There are 205. An agent asked to do exactly that listed 35, left 170 unexamined, and passed every mechanical check on the way.

  WHERE THE CHECK LIVES: the requirements gate, per the note and the owner's ruling. i6 owns making it demand a disposition per candidate. THE FORMAT DECIDES WHETHER IT WORKS - false positives are fine when the answer is one line, and fatal when each demands a paragraph.

  COMPUTE THE TRACE'S TRUTH, DO NOT CHECK IT (owner, 2026-08-13). v1 recognised a broken trace instantly, because brokenness was DERIVED rather than asserted by a check. If that is cheap enough at our size, we should go back to it.

  WHY THE OWNER RAISED IT, with the measurement that provoked it. Fourteen requirements stood with no function serving them. The battery was green throughout. They were found only when a walk reached derive-functions and its exit condition refused the submit.

  THE MECHANISM, and it is worse than one check firing rarely. Those fourteen carry minted_in: i1, and git says their files were first committed during i2's walk at M7 - long after i2's own coverage check had run at M3. SO A NODE MINTED AFTER M3 IS NEVER SEEN BY THAT ITERATION'S CHECK AT ALL. The next iteration would catch it, if one walked that state, which none did.

  A CHECK THAT FIRES ONCE PER ITERATION, AT ONE POINT IN IT, CANNOT SEE DRIFT THAT HAPPENS AFTER THAT POINT. That is not a tuning problem. It is the wrong shape.

  WHAT IS GUARDED TODAY AND WHAT IS NOT. The battery checks the REFINES chain both ways - every child connects to a parent, every parent is refined by a child - which is why the use-case side stayed clean. It never mentions SATISFIES, the requirement-to-function edge, and never checks the flow closure. Half the trace is continuous and half is episodic.

  THE DERIVED SHAPE, which is what the owner is asking for. Brokenness is not a check that runs; it is a PROPERTY of the corpus, computed whenever the corpus is read. An orphan is then visible the instant it exists, to anything that looks - the panel, the board, a pull - rather than at the next walk of one state.

  WHY IT PLAUSIBLY IS CHEAP HERE. The corpus is a few hundred nodes and already loads whole for the trace view. The edges are frontmatter lists. A full closure over that is milliseconds, and the vault already holds the rows warm across calls.

  WHAT TO WEIGH AGAINST IT. A property computed on every read is a property that can make every read slow, and the one-second rule is already broken on three surfaces. The honest version measures first: compute the closure over the live corpus, time it, and only then decide whether it rides every read, every write, or a cached derivation invalidated by the write.

  WHY IT IS THIS ITERATION'S. The impact set and the trace's derived truth are the same computation seen twice - one asks what a change touches, the other asks what is currently broken, and both are reachability over the same graph. Building them apart means building the graph walk twice.
inputs:
  - project/spec/version-planning.md
  - product/engine-go/triage.go at ref main
  - i10-the-big-sweep-one-pass-over-one-key-a-mo
---

# i18-the-blast-radius-compute-the-downstream-

## Goal

The blast radius: compute the downstream cone of a change, and split it so a large cone stays reviewable instead of becoming a wall.

## Rough vision

DONE LOOKS LIKE: change a requirement and the affected cone is computed, not guessed. Change a state high in a machine and everything below it is named. Change a decision or a claim and everything resting on it is named. And the cone arrives SORTED, not flat.

WE HAVE THE POLICY AND NOT THE COMPUTATION. The contract's recheck block already says it: a claim that already stood comes back when something upstream moved, and the agent reads what is written and asks ONLY whether the named change moved it. That is the right instruction and nothing computes what it needs.

THE SPLIT IS THE WHOLE VALUE, and v1 built it. Read product/engine-go/triage.go at ref main before designing anything. Its cone divides in two:

NEEDS RE-RULING, when the gate's own subject moved. Three cases, all mechanical: its own statement changed, measured against a recorded statement hash; its own definition changed, where the full hash moved while statement and dependencies did not; or a direct dependency that is ITSELF a blessed gate had its recorded statement hash move.

STILL-HOLDS CANDIDATE for everything else — upstream content only, a dependency's non-statement fields, or pure propagation where own inputs are unchanged and the cone was dragged along by a named root.

THE SPLIT RULE IS DERIVED FROM WHAT THE WHY-DELTA ALREADY REPORTS, NEVER NEW ANALYSIS. That is what keeps it cheap and honest.

AND IT NAMES ITS OWN LIMIT IN THE CODE: statement baselines exist only for blessed gates, so an unblessed content dependency's change reads as upstream content. The row still NAMES the changed dependency, and the section says CANDIDATES — the owner rules, the triage only groups.

A FLAT CONE IS UNUSABLE. Marking two hundred nodes suspect and handing them over is not a feature. The sort is the feature.

TWO MORE RULES FROM V1'S WAVE PATH, worth taking together. A bulk re-adjudication may touch SUSPECT gates only; an OPEN gate — one never adjudicated at any hash — is REFUSED and named, because its first adjudication must be its own walk. And the triage view itself is READ-ONLY and never gated, because it advances nothing.

THIS ALSO SERVES THE CLAIM SYSTEM. Once claims are assumptions cited by id, the blast radius is what shows what falls when an assumption falls. i10 lays that wiring; this computes over it.

FULL CONTEXT: project/spec/version-planning.md, section on the blast radius, and i18.

FROM THE POOL, 2026-08-13. The owner's change-control design, which states this iteration's prerequisite outright.

THE MIDDLE CASE HAS NO VERB (owner question, note-51b685bbd37b). When a note becomes a change it must land in design input, so the spec grows - and the question is how to append without devaluing the chain or re-looking at everything. Three costs exist and only two are built. Amending covers wording that changes no claim, keeping the signature while the checks still run. Reopening covers a claim that was WRONG, greying the whole downstream cone. A NEW DEMAND appended to the register has neither. Measured once via reopen: the standing claims re-earned as rechecks, cheap per state, but the walk visited every downstream state including ones the row cannot move. THE VERB WANTED mints the row, greys ONLY the states whose checks actually read it - the engine already computes those from the nodes, so the grey set can be exact rather than cone-shaped - and queues the rechecks as open to-dos rather than forcing an immediate walk.

OPTIMISTIC CHANGE CONTROL, AND ITS PREREQUISITE (owner design, note-8090be245ec1). The amend class is content changing while intent does not - a resharpening, never a new demand. An amend is assumed okay the moment it lands, nothing greys, and work continues, while every amend ALSO lands in an amendment register. THE NEXT GATE THE WALK REACHES DRAINS THAT REGISTER FIRST, as its opening act, with one judgment per amendment. THE JUDGMENT IS NOT MECHANICAL: it walks the tree between the amended node and the gate and asks whether any step leaned on the pre-amend wording. A change control board, folded into the gate cadence. THE PREREQUISITE IS THIS ITERATION'S CORE: impact computed over the TRACE graph as a directed acyclic graph, cheap reachability from the changed node to the claims that read it, the way v1 did. Today the engine cones over the STATE machine, which is the coarse shape, and the trace-level impact set is what both the change-control judgment and the append verb need. Where a change lands high, everything below is honestly in the impact - the graph does not shrink that case, it makes the computation exact and cheap.

THE IMPACT SET HAS A NAMED CONSUMER NOW (owner ruling 2026-08-13, at i27's gate-inputs). i6 WAITS ON THIS.

WHAT i6 NEEDS FROM HERE: which trace nodes a given change actually touches, computed rather than declared. Not the cone over the STATE machine, which is the coarse shape this iteration already exists to replace - the impact set over the TRACE graph, node by node.

WHAT i6 DOES WITH IT. The coverage checks today prove a link EXISTS and never that anybody re-read it, so an iteration can list thirty-six use cases, examine two, and go green. With the impact set the check becomes: every listed reference was either re-read against this delta, or is provably outside the set. A touched node listed unread REFUSES.

WHY THAT RAISES THE BAR ON THIS ITERATION'S OWN OUTPUT. The impact set stops being a report somebody reads and becomes an INPUT another check consumes. A cone that is merely indicative is fine for a person deciding what to look at, and not fine for a refusal. It has to be exact in both directions - nothing touched left out, nothing untouched dragged in - or the check it feeds is either a nuisance or a lie.

LIVE EXHIBIT, 2026-08-13. i27's M2 listed 36 use cases and read two. Six more were LIKELY touched and were named as unread in the evidence, BY HAND. That hand-written list is exactly what this computation replaces.

CROSS-COUPLING IS THIS ITERATION'S QUESTION ASKED AT AUTHORING TIME (owner, 2026-07-30, re-affirmed 2026-08-13). note-009c8f273ba8 carries it.

WHEN A CHANGE OR A NEW REQUIREMENT LANDS, analyse its coupling with everything that exists. Does this mechanism influence other mechanisms. How many places must be touched. Are there places whose BEHAVIOUR this influences non-obviously. Does the existing implementation have to change too.

POSITIVE COUPLING COUNTS, and it is the half people forget. Ask for SYNERGIES: does this work improve an existing function if it is modified slightly, and what does it unlock.

THREE LAYERS, AND THIS ITERATION OWNS THE FIRST.

- STRUCTURAL: which nodes the change touches, over the trace graph. Computed exactly. THAT IS THIS ITERATION.
- SEMANTIC: the couplings NO EDGE RECORDS. Needs the retrieval sibling in i15, because the graph cannot see what nobody wrote down.
- SYNERGY: not computable either way. It is judgment - but judgment needs CANDIDATES to judge over, and the first two layers are what supply them.

WHY THE CHECK CANNOT BE ANSWERED BY HAND, measured 2026-08-13. The note says check ALL existing requirements one by one, not by feel. There are 205. An agent asked to do exactly that listed 35, left 170 unexamined, and passed every mechanical check on the way.

WHERE THE CHECK LIVES: the requirements gate, per the note and the owner's ruling. i6 owns making it demand a disposition per candidate. THE FORMAT DECIDES WHETHER IT WORKS - false positives are fine when the answer is one line, and fatal when each demands a paragraph.

COMPUTE THE TRACE'S TRUTH, DO NOT CHECK IT (owner, 2026-08-13). v1 recognised a broken trace instantly, because brokenness was DERIVED rather than asserted by a check. If that is cheap enough at our size, we should go back to it.

WHY THE OWNER RAISED IT, with the measurement that provoked it. Fourteen requirements stood with no function serving them. The battery was green throughout. They were found only when a walk reached derive-functions and its exit condition refused the submit.

THE MECHANISM, and it is worse than one check firing rarely. Those fourteen carry minted_in: i1, and git says their files were first committed during i2's walk at M7 - long after i2's own coverage check had run at M3. SO A NODE MINTED AFTER M3 IS NEVER SEEN BY THAT ITERATION'S CHECK AT ALL. The next iteration would catch it, if one walked that state, which none did.

A CHECK THAT FIRES ONCE PER ITERATION, AT ONE POINT IN IT, CANNOT SEE DRIFT THAT HAPPENS AFTER THAT POINT. That is not a tuning problem. It is the wrong shape.

WHAT IS GUARDED TODAY AND WHAT IS NOT. The battery checks the REFINES chain both ways - every child connects to a parent, every parent is refined by a child - which is why the use-case side stayed clean. It never mentions SATISFIES, the requirement-to-function edge, and never checks the flow closure. Half the trace is continuous and half is episodic.

THE DERIVED SHAPE, which is what the owner is asking for. Brokenness is not a check that runs; it is a PROPERTY of the corpus, computed whenever the corpus is read. An orphan is then visible the instant it exists, to anything that looks - the panel, the board, a pull - rather than at the next walk of one state.

WHY IT PLAUSIBLY IS CHEAP HERE. The corpus is a few hundred nodes and already loads whole for the trace view. The edges are frontmatter lists. A full closure over that is milliseconds, and the vault already holds the rows warm across calls.

WHAT TO WEIGH AGAINST IT. A property computed on every read is a property that can make every read slow, and the one-second rule is already broken on three surfaces. The honest version measures first: compute the closure over the live corpus, time it, and only then decide whether it rides every read, every write, or a cached derivation invalidated by the write.

WHY IT IS THIS ITERATION'S. The impact set and the trace's derived truth are the same computation seen twice - one asks what a change touches, the other asks what is currently broken, and both are reachability over the same graph. Building them apart means building the graph walk twice.

## Inputs

- project/spec/version-planning.md
- product/engine-go/triage.go at ref main
- i10-the-big-sweep-one-pass-over-one-key-a-mo
