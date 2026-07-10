# M1 - Frame (i0016_structural_models, systematic)

TL;DR: Structural models become a declared architecting artifact between the architecture decision and the implementation. The owner sketches them in files that stay the checked truth. The engine extracts them, lints ambiguity, and checks the code against them. Drift flips SUSPECT. The book renders them.

## Vision & scope stated  -> i16-m1-vision
**Vision (Moore).** For the owner of a spec-driven project / who needs the implementation to follow a deliberately chosen structure instead of the agent's defaults / structural models in quackitect are a declared, conformance-checked spec layer / that turns architectural intent into a fence the agent builds inside, with drift surfacing as SUSPECT on the board / unlike rule-test libraries (ArchUnit family: no visual model, no ledger) and CASE/SysML tools (heavy editors, drawings that rot).

**PR-FAQ pressure test.** Headline: "The spec now refuses drift from the declared architecture." Hardest FAQ: "Is this not BDUF?" Answer: models are chosen per iteration at views-chosen (default two), each names the question it answers, and every one is mechanically checked - a model that cannot gate is refused admission. The ratchet is rough-to-detailed, not big-design-up-front.

**Scope IN:**
- model-kind catalog with admission tests and selection heuristics
- views-chosen decision step after the architecture milestone
- model nodes in the spec, draft==truth (the authored file IS the checked file)
- extractors per admitted format, semantic-graph hashing, ambiguity lint
- conformance check (convergence, divergence, absence) + decomposition smells
- skeleton stubs per kind
- models rendered in the book's design output chapter
- dogfood: the engine's own structure declared and checked

**Scope OUT:**
- report tabs for models (owner: probable, decision deferred to the walk)
- allocation/deployment kind (parked for the mechatronics wave)
- vendoring any external renderer (PlantUML jar, render servers)
- the full methodology map (backlog)

## Problem agreed  -> i16-m1-problem
- i14 onion (2026-07-08/09): six render passes because the structure was recovered from code afterward; owner ruling: "the rendering is right, the structure is not" ([onion-structure note, archived with referent](../../../spec)).
- Method gap (owner, 2026-07-08): structural decomposition should be an explicit architecting step, not reverse-engineered (NOTE-20260708-193126, archived).
- Decomposition smell (owner, 2026-07-08): the derived onion exposed a no-flow layer - a bad decomposition the process never caught (NOTE-20260708-195212, archived).
- Modeling discussion (owner, 2026-07-09): models chosen AFTER architecture, BEFORE implementation; the implementation follows them; draft==truth is binding.
- The delta is real: today NOTHING between the M4 decision and the M6 build states the intended structure; the only structure artifact (design-layers.md) was authored ad hoc AFTER the code existed.

## State of the art checked  -> i16-m1-sota
- **Reflexion Models** (Murphy/Notkin, 1995): declared model vs extracted model, diffed into convergences/divergences/absences. Exactly our mechanism - the approach is validated research, thirty years old.
- **ArchUnit / go-arch-lint / dependency-cruiser**: architecture rules as executable tests. Closest living relatives of the conformance checker. They enforce but do not depict: no visual model, no drawing input, no ledger integration, no reader-facing rendering.
- **Architecture-as-code (Structurizr DSL, C4)**: one text model, many views. Strong on DRY views, but a dedicated model language (not draft==truth in a friendly editor) and no code-conformance loop by default.
- **SysML/CASE tools (Cameo, Papyrus)**: full modeling power; fails our admission tests - heavy editors, XMI is un-diffable and agent-opaque.
- **View catalogs (4+1, C4, arc42, SysML pillars)**: the source for the kind catalog; all reduce to structure / behavior / flow / allocation / context.
- **Positioning**: no prior art combines draft==truth files in a friendly editor, zero-dep extraction, semantic-graph hashing into a gate ledger, decomposition smells, and book rendering. The combination is the contribution; every ingredient separately is proven.

## Success is measurable  -> i16-m1-success
1. The model-kind catalog exists with at least five kinds, each naming its question, admission tests, and heuristic (selftest:model-kinds).
2. A views-chosen decision covers every declared model; a model with no covering decision fails lint (selftest:views-chosen).
3. The extractor reads the owner's REAL i14 onion draft and reproduces its semantic graph (M5 killer spike).
4. A cosmetic model edit leaves dependent verdicts standing; a semantic edit flips SUSPECT (selftest:semantic-hash, selftest:divergence-suspect).
5. The engine's own structure is declared as models and conformance passes - the no-flow smell is resolved or recorded (dogfood).
6. The book's design output chapter renders every declared model (selftest:models-in-book).

## Top risks logged (RAID)  -> i16-m1-risks
- **Risk - model rot** (raid-model-rot): a conformance gap lets divergence pass silently. Mitigation: the SUSPECT flip is a baked requirement with its own test.
- **Risk - extractor fragility** (raid-extractor-fragility): the excalidraw format evolves under us. Mitigation: constrained drawing contract + format admission tests.
- **Risk - modeling overhead** (raid-modeling-overhead): BDUF ceremony on small iterations. Mitigation: two-model default budget, per-kind opt-in at views-chosen.
- **Risk - false DONE** (raid-false-done): the semantic hash misses a real change. Mitigation: hash the FULL extracted graph; class-guard tests per extractor.

## Milestone review  -> i16-m1-gate

**Verify.** Each subtask has its section above with dated referents: the vision carries Moore + PR-FAQ, the problem carries four dated owner rulings, the sota scan ran live searches (reflexion models, ArchUnit family, view catalogs, format research), success criteria map 1:1 to baked selftests, and four RAID nodes are minted in the iteration.

**Validate.** The frame matches the owner's commission verbatim: models after architecture and before implementation, implementation follows them, book rendering in, report tabs explicitly deferred. Nothing out of the commission's scope was added beyond the dogfood case, which the onion-structure note demands.

**Red-team.** The opposing case (BDUF, dual maintenance, wrong-model risk, rot) was argued in the owner discussion 2026-07-09 and each point is either adopted as a rule (only checkable kinds admitted; per-iteration choice; models gate or are refused) or carried as a RAID node. Kill-criterion for the iteration: if the M5 spike cannot extract the real i14 draft with a zero-dep parser, the visual draft==truth path dies and the format decision reopens.

**Verdict: PASS** - problem real, scope bounded, success measurable. Hand-off to the adjudicator for the killer + gate bless.
