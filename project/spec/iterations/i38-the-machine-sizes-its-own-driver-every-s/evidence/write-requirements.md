---
form: write-requirements
by: agent
signed_off: 2026-08-20T11:08:53.880Z
reopened: "2026-08-20T11:08:32.280Z — probe-assumptions falsified the one-value-per-row premise: draft-vision spans three rungs across its columns and not monotonically, so req-every-matrix-row-declares-its-complexity demands the wrong thing"
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

M2 is blessed. Two passes stand with numbered steps and lettered extensions, and this state turns them into demands.

TWO HUNDRED AND SEVENTY-NINE REQUIREMENTS STOOD BEFORE THIS STATE, counted by program rather than read off a listing — this iteration has paid three times for the difference.

EIGHT ARE MINTED HERE. Six functional, two constraints, none a quality requirement, and the sweep below says why that is the honest shape rather than an omission.

## register

- req-every-matrix-row-declares-its-complexity
- req-the-complexity-value-is-read-live-and-never-pinned
- req-a-milestone-takes-the-maximum-complexity-over-its-rows
- req-one-model-list-is-read-live-from-the-repository
- req-an-unmatched-rung-names-itself-and-publishes-no-driver
- req-the-machine-names-a-driver-and-starts-nothing
- req-every-call-records-the-model-that-answered-it
- req-every-call-records-the-state-it-was-made-in

## set_criteria

- complete: EVERY STEP AND EVERY EXTENSION OF BOTH USE CASES IS COVERED, checked step by step rather than asserted. uc-let-the-machine-name-the-driver: step 2 → req-every-matrix-row-declares-its-complexity and req-the-complexity-value-is-read-live-and-never-pinned; step 3 and ext 3a → req-a-milestone-takes-the-maximum-complexity-over-its-rows; step 4 → req-one-model-list-is-read-live-from-the-repository; ext 4a → req-an-unmatched-rung-names-itself-and-publishes-no-driver; step 5 → req-the-machine-names-a-driver-and-starts-nothing. uc-attribute-a-finished-walk: step 2 and ext 2a → req-every-call-records-the-state-it-was-made-in; step 3 and exts 3a/3b → req-every-call-records-the-model-that-answered-it. WHAT IS DELIBERATELY UNCOVERED AND SAID RATHER THAN HIDDEN: ext 4b (an alias resolving differently per host) has an open assumption and no requirement, because what the list HOLDS is not settled; ext 6a (the receiver that reads and cannot act) has no requirement because the fix is outside the box; and ext 4a of the attribution case (a rating never contradicted) is the reconciliation, an explicit non-goal.
- consistent: NO PAIR OF THE EIGHT CAN BOTH BE SATISFIED AND CONFLICT, and the one place they press on each other is named. req-the-machine-names-a-driver-and-starts-nothing forbids the lane starting a process; req-an-unmatched-rung-names-itself-and-publishes-no-driver forbids falling back to what is running. Together they mean a milestone with no list entry publishes nothing and starts nothing, so the walk continues on whatever it already had — which is the correct outcome and is NOT the forbidden fallback, because nothing was named. That distinction is worth stating because it reads like a contradiction and is not. AGAINST THE STANDING SET: req-the-complexity-value-is-read-live-and-never-pinned is a constraint on a mechanism nothing else touches, and none of the eight changes what an existing requirement demands.
- affordable: SEVEN OF THE EIGHT ARE SMALL AND ONE GREW WHEN A PROBE LANDED. req-every-matrix-row-declares-its-complexity now demands a value PER COLUMN rather than per row, which multiplies the authoring work by up to four and is the honest cost of the thing being true. THE EXPENSIVE ONE IS STILL req-every-call-records-the-state-it-was-made-in — not because the field is hard but because the value must be stamped where every verb is served, and the retro has carried its absence as a documented impossibility since 2026-08-17. AND ONE IS AFFORDABLE ONLY IN THE NARROW SENSE: req-every-call-records-the-model-that-answered-it is cheap to build and its VALUE waits on the model coming from somewhere other than the agent.
- superseded_note: THE EARLIER READING OF affordable SAID SEVEN OF EIGHT ARE SMALL AND ONE IS NOT. Six are a field, a lookup, a refusal or an assertion — each is hours. THE EXPENSIVE ONE IS req-every-call-records-the-state-it-was-made-in, not because the field is hard but because the value must be stamped where the call is served for every verb, and the retro has carried its absence as a documented impossibility since 2026-08-17. AND ONE IS AFFORDABLE ONLY IN THE NARROW SENSE: req-every-call-records-the-model-that-answered-it is cheap to build and its VALUE waits on the model coming from somewhere other than the agent, which is an open assumption rather than work this iteration can price.
- bounded: EVERY ONE NAMES WHAT WOULD FALSIFY IT and none is open-ended. Four are testable outright — the loader refuses an unrated row, the digest and shape are unchanged by a complexity key, the maximum governs, the unmatched rung publishes nothing. Two are inspections of a boundary rather than of behaviour. Two are fields on a record. NONE says improve, reduce or ensure-that-generally.
- comprehensible: EACH STATEMENT NAMES ITS SUBJECT, ITS SHALL AND ITS CONDITION, and each carries a breaks_if_removed that a reader can disagree with. THE ONE THAT NEEDED CARE is req-every-call-records-the-model-that-answered-it, which had to say both what the value IS (what served) and what the record must admit (that today it is self-reported). A requirement that quietly assumed the value was trustworthy would have read more cleanly and meant less.
- no_tbd: NOTHING IS DEFERRED INSIDE A REQUIREMENT. What is unsettled is unsettled OUTSIDE them and named: what the list holds, whether a rung is a model or a (model, effort) pair, who maintains the list, and how a receiver acts. Each stands as a register entry or an explicit non-goal, and not one of the eight contains a placeholder.
- behaviour_modelled: THE BEHAVIOUR IS IN THE USE CASES AND THE REQUIREMENTS POINT AT ITS STEPS, which is what the source_refs carry. Both passes have numbered main scenarios with lettered extensions branching from real steps, and every requirement cites the step or extension it comes from rather than the case as a whole. WHAT IS NOT MODELLED, said plainly: the maintenance behaviour — somebody bringing the list current — has no pass, because its actor has no node.
- quality_groups_swept: SWEPT, AND THE ANSWER IS THAT THIS DELTA IS ALMOST ENTIRELY FUNCTIONAL. Six of the eight are functional and two are constraints; none is a quality requirement. WALKED THE GROUPS: performance-efficiency — the lookup is a file read at a milestone boundary, and the standing one-second interface bound already governs it, with the reopen cascades measured at this iteration's gates as the live breach. reliability — an unmatched rung fails loud by req-an-unmatched-rung-names-itself-and-publishes-no-driver. maintainability — the list is hand-edited in the repository, which is the whole reason the drift risk stands. security and safety — nothing here reaches a credential, a network or a person's machine. compatibility — this is where the sweep BITES: one list read on three registered hosts, two of which are a different vendor, and it is carried as an open assumption rather than as a quality requirement because what the list holds is not yet decided. interaction-capability — the published name reaches a receiver that can read it and cannot act, which is a hole in the neighbour rather than a quality this delta can require.

## follow_up

- req-the-complexity-value-is-read-live-and-never-pinned IS THE CHEAPEST HIGH-VALUE THING IN THE SET. One test assertion stands between a later hand and a cascade across three open pinned records. It should be built first and it is not the most interesting requirement here, which is exactly why it would otherwise be built last.

- req-an-unmatched-rung-names-itself-and-publishes-no-driver WANTS TO BE A TYPED CLAUSE rather than a behaviour, with the rung named, the list's contents shown and the edit that fixes it. The design states should treat it that way.

- TWO EXTENSIONS ARE DELIBERATELY UNCOVERED and both are in the set_criteria above rather than buried: what the list holds when an alias resolves differently per host, and how a receiver acts on a published name. Neither can be required until it is decided.

- THE MAINTENANCE BEHAVIOUR HAS NO PASS AND THEREFORE NO REQUIREMENT. The whole fixed-list design rests on somebody keeping the list current, and the role that would do it has no node. That is the register entry rather than a requirement, and it is the one place this milestone knowingly leaves a demand unwritten.

- RE-SIGNED AFTER probe-assumptions FALSIFIED A PREMISE THIS FORM RESTED ON. req-every-matrix-row-declares-its-complexity said one value per row. draft-vision spans three rungs across its columns and not monotonically — C1 at major where the agent accepts a standing artifact, C4 at product where it frames one from nothing — so one value per row cannot express what the matrix already says. The requirement now demands a value per column in which the row applies.

- THAT IS THE PROBE DOING ITS JOB AT THE STATE THAT OWNS IT, one state after the assumption was written, and before fifty-three ratings were authored against the wrong schema. Had it not run, every patch walk would have been over-driven forever with nothing to signal it, which is the standing drift risk arriving through a door this iteration would have built itself.

## anything_else

