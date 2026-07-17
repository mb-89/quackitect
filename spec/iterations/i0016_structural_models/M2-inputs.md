# M2 - Design input (i0016_structural_models, systematic)

TL;DR: Thirteen EARS requirements over three use cases define the model layer. Declare after the architecture decision. Check on every run. Render in the book. The set was positioned against:

- the SyA program
- the book corpus (Janschek, Eigner, Pahl/Beitz)
- the web-research prior art

One miss surfaced and was added: model-to-model consistency (req-model-consistency).

## Inputs captured  -> i16-m2-inputs
- What flows IN:
  - the architecture decision (M4) - the trigger for views-chosen
  - the owner's model files - authored in the chosen format, draft==truth
  - the code - the as-built structure the engine derives (design markers, imports, flows)
- What it PRODUCES:
  - model nodes in the spec with extracted semantic graphs in the ledger
  - conformance verdicts (convergence, divergence, absence) and smells on the board
  - rendered models in the book's design output chapter
- Its ENVIRONMENT:
  - the editor lane: Obsidian vault over spec/; Excalidraw as the leading visual candidate
  - the engine: zero-dep Go, hand-rolled parsing (house law)
  - the book: single-file HTML, static DOM
- Environment assumptions, each with probe status:
  - Excalidraw bindings carry edges (startBinding/endBinding.elementId) - PROBED in the i14 draft read-back 2026-07-09 (the draft was parsed by the agent live)
  - the Obsidian Excalidraw plugin stores uncompressed .excalidraw.md on setting - PROBE OWED at M5 (the spike opens the real plugin file)
  - Mermaid renders in Obsidian core and GitHub with no extra machinery - PROBED (i12/i14 book figures render)

## Use cases  -> i16-m2-inputs
- [uc-declare-models](uc-declare-models.md) - declare after the architecture decision, in the same files the owner edits.
- [uc-model-conformance](uc-model-conformance.md) - the engine checks code against the declared models on every run.
- [uc-model-in-book](uc-model-in-book.md) - a reader studies the models in the design output chapter.

## Stakeholder coverage  -> i16-m2-stakeholders
- project-owner -> declares the models at views-chosen; adjudicates the conformance gates.
- agent -> implements INSIDE the declared blocks; the models bound its freedom (the owner's core intent).
- assessor -> reads conformance verdicts and smells on the board instead of re-deriving structure.
- newcomer -> learns the system's shape from the book's rendered models.
- communicator -> the book chapter is the outward artifact; models are figures with one-line captions (voice law).
- user -> N/A recorded: the engine's end user meets models only through the book (covered by newcomer/communicator rows).
- acquirer -> N/A recorded: no acquisition concern in a dogfood iteration.

## Prior art checked  -> i16-m2-prior-art
The requirement set positioned against three source families:
- **SyA program** (Siemens, deep-read digest at Desktop/ai/sya_kb):
  - the architecting spine separates FUNCTION tree, ELEMENT tree, and ALLOCATION (DMM) - the catalog must carry them as distinct kinds, not one generic "tree" (feeds M3/M4 catalog content).
  - views are chosen per stakeholder concern via the Stakeholder/View matrix (Bass) under ISO 42010 - req-views-chosen is the engine-shaped version; the matrix method goes into the views-chosen guide.
  - "select a minimal appropriate set" and "views are for communication, not backup" - grounds the two-model default budget.
  - the SysML lesson ("SysML puts all burden on the user"): reduce possibilities to gain checkability. The lesson is adopted; SyA's MECHANISM (invent a UML-profile DSL) is rejected by the owner and by the admission tests themselves - a bespoke language flunks "good editor" and has no ecosystem or agent fluency. We constrain MAINSTREAM formats with a usage lint instead (ruled with the owner 2026-07-09).
- **Book corpus** (college/buecher/digest):
  - Janschek Sec 2.2.3: the Structured Analysis set ships LINT RULES - flows without source or sink are inconsistencies; child models balance their parent; state transitions come from declared control flows; "no device falls from the sky" (every element justified by an allocated function). MISS FOUND: our set checked model-to-code but not model-to-model consistency. ADDED: req-model-consistency + test-model-consistency.
  - Eigner Sect 4.3/4.5: six-view system model; "diagrams are views; the model is the linked element graph - delete a shape, the element survives" - direct validation of req-semantic-hash (hash the extracted graph, never the drawing bytes). Stachowiak's model criteria (mapping, reduction, pragmatism) ground the catalog's admission tests.
  - Pahl/Beitz: function structures flow material/energy/signal - the same flow trinity as SyA's discipline matrix; the no-flow smell vocabulary is standard, not invented here.
- **Web research** (2026-07-09 session): Reflexion Models (Murphy/Notkin) name the declared-vs-derived mechanism; ArchUnit family is the closest tool prior art (enforces, does not depict); excalidraw/JSON-Canvas format facts probed.
- Non-goals RECORDED: parameters view (Eigner's sixth concern) stays out - quackitect has no numeric budget layer yet (a future iteration; the Janschek budget chain note in the backlog covers it). Allocation/deployment kind parked for the mechatronics wave (M1 scope).

## Requirements verifiable / traced  -> derived checks
13 requirements, each refining a use case (req-traced) and each carrying a test (req-has-test); both rules compute live on the board.

## Milestone review  -> i16-m2-gate

**Verify.** Every requirement is EARS-shaped (lint: clean). Each refines one of the three use cases and carries a minted test with a selftest name. The inputs table lists probes with status. Two assumptions are probed. One probe is explicitly owed at M5. The stakeholder table covers every always-on class with a serving row or a recorded N/A.

**Validate.** The set covers the owner's commission:

- declare-before-build (req-views-chosen, req-models-gate-build)
- draft==truth (req-draft-is-truth, req-semantic-hash)
- follow-the-models (req-conformance, req-divergence-suspect)
- book rendering (req-models-in-book)

The corpus check ADDED one requirement rather than merely confirming - evidence the check had teeth.

**Red-team.** Sharpest opposing case: thirteen requirements for a modeling layer is heavy - could this be five? Answer: each maps to a corpus-named rule or to a distinct failure mode already OBSERVED. None is speculative. The observed failure modes:

- onion structure fight
- no-flow layer
- format churn
- stale drawings

Kill-criterion held from M1: the M5 spike on the real i14 draft. Watch-item: req-model-consistency is the only requirement without an observed failure behind it - if M6 shows it gold-plated, defer it with a recorded reason rather than build it thin.

**Round 4 - owner-directed deep re-check (2026-07-09, "make sure we didn't miss anything").** Full gap sweep against every source read this iteration:

- MISS FOUND AND ADDED: the same-day design discussion (tray top-up, groom) produced feature surface with no covering requirement. Added req-model-tray and req-model-groom as EARS Where-shaped conditionals - they bind only if M4 admits a canvas format, so they do not presuppose the winner. Tests minted (test-model-groom pins the two provable invariants: semantic graph preserved, idempotent).
- Leveled models (Janschek parent/child balancing): reference semantics covered by req-model-consistency; leveling rules are per-kind catalog content. No requirement owed. RECORDED.
- Interfaces: edges ARE the interfaces; label discipline covered by req-model-lint + the catalog's dictionary rules. RECORDED.
- Governance (SyA): conformance + SUSPECT is the governance mechanism. Covered.
- Parameters/budgets (Eigner sixth view, Janschek ch12): non-goal, recorded above.
- Model retirement/supersede: existing decision mechanics (mint supersede/veto) apply to model nodes unchanged. Covered.
- Extraction performance: bound by the global responsiveness guide + verdict cache; watch at M6, no per-feature requirement.
- Report tabs: owner-deferred at commission; unchanged.

**Verdict: PASS** (15 requirements after round 4) - the owner blessed the gate by explicit console instruction ("bless M2" on 2026-07-09). Recorded --by user.
