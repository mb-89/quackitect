# M2 - Inputs (i0027_book_feedback)

Evidence accretes here as M2 is filled.

## Inputs captured  -> i27-m2-inputs-captured-context

Three input streams fed the requirement set:

1. **The i26 field review** ([HANDOVER.md](../i0026_ifu_system/HANDOVER.md)): nine chapters of book findings - chapters 2 and 3, register and filters, details pane, search, V&V links, timeline, risk matrix, onion and interfaces, rationales - plus the IFU "coverage theater" critique.
2. **The seven triaged notes** (2026-07-12 and 2026-07-17): the i0016 phantom-selftest question, the misleading why-delta, boot friction, the mid-battery ratchet, system-fighting, self-explaining refusals, and the pager detection race. All pulled into this iteration at triage.
3. **The owner elicitation sessions** (2026-07-17/18), each recorded in its requirement's body: the onion layout drawing ([onion-io-layout.excalidraw.md](onion-io-layout.excalidraw.md)) and cluster rules, function nodes and the register, the generic filter mechanism, the IFU arc and split slides, the RAID bubble matrix, the unified timeline, type colors, interfaces as connection notes, the three-altitude model chain, collapsible traces, and the model-kind walk.

Affected use cases: uc-book-read, uc-book-tables, uc-book-navigate, uc-book-content, uc-model-in-book, uc-review-board, uc-author-ifu, uc-find-ifu, uc-connections, uc-usability, uc-lawful-walk, uc-battery-trust, uc-mcp-drive, uc-explain-suspect, uc-attested-session, uc-single-handoff.

The requirement set stands at 35 requirements in this iteration, each traced to a use case and carrying a test node.

## Prior art checked  -> i27-m2-prior-art-checked

The whole requirement set was positioned by an adversarially-verified deep research run (106 agents, 13 surviving findings; the full cited report and raw journal live in the data home under `research/`). The used sources are minted as reference notes: [ref-82079](../../references/ref-82079.md), [ref-arc42](../../references/ref-arc42.md), [ref-structurizr](../../references/ref-structurizr.md), [ref-arcadia](../../references/ref-arcadia.md), [ref-holten-bundling](../../references/ref-holten-bundling.md), [ref-jama-traceability](../../references/ref-jama-traceability.md).

### Validated by prior art

- **IFU decks**: IEC/IEEE 82079-1:2019 is the horizontal standard for instructions for use; it covers application software and sanctions interactive electronic delivery. Its three information types (conceptual, instructional, reference) map onto the deck arc.
- **Enterable clusters + browser-back**: Structurizr's C4 double-click drill-down is direct prior art.
- **Three-altitude chain**: arc42's level-0 context into nested whiteboxes parallels it; our whole-product middle altitude is a genuine extension of arc42's software-scoped view.
- **Functions as nodes**: ARCADIA/Capella maintains functions as first-class allocated elements between needs and architecture.
- **The SUSPECT ripple and typed edge rules**: mainstream RM practice (Jama Connect, IBM DOORS) uses the same mechanisms, down to the word "suspect".
- **Bundled fan-outs**: Holten's hierarchical edge bundling is the canonical antecedent, citing the same cable-loom metaphor as our Simulink analogy.

### Recorded misses (owner rules at the gate)

1. **82079-1's seven quality principles** (completeness, minimalism, correctness, conciseness, consistency, comprehensibility, accessibility) and its managed preparation process: the IFU requirements nowhere enumerate them. Minimalism partially validates the six-step bound; accessibility and completeness are the clearest gaps.
2. **arc42's "relevance over completeness"**: our onion clusters derive mechanically from DSM coupling with no editorial curation rule on top.
3. **Holten's continuous bundling strength** versus our all-or-nothing cluster toggle: recorded as an alternative, not adopted; the discrete toggle is a deliberate simplicity choice.
4. **ARCADIA's operational-analysis altitude** (missions without the system): recorded, not adopted; IFU user journeys partly carry that content.
5. **No RM tool renders an item-level node-link trace graph** (Jama's views are tabular): our graph is a differentiator with no tool precedent proving it scales; the collapsible clusters are the mitigation.

### Unverified sub-questions

Three angles produced no claims surviving adversarial verification: the continuous RAID scatter vs the 5x5 grid (the earlier inline scan at elicitation carries informal support), faceted filter-pill conventions, and drill-down timeline prior art. Recorded as open; they do not block the set.

## Stakeholder coverage  -> i27-m2-stakeholder-coverage-no

The default type's always-on roles, checked against the set:

- **user / newcomer**: the IFU pass, chapter 2/3 restructure, search, details pane - the iteration's center.
- **assessor**: V&V result links, the no-test policy, the RAID matrix, the timeline drill-down with evidence links.
- **communicator**: the split-slide decks, type colors, the model-kinds catalog.
- **project-owner**: the register, filters, the model chain, the hand-off fixes shipped mid-iteration.
- **agent**: the engine self-explanation set (refusal recovery, verify build-pin, supervisor swap, why-delta, boot, pager round-end).
- **acquirer**: the book remains the one portable artifact; no new need surfaced.

No role is left without a stake in the set. The developer-maintainer role's stake (engine code quality) is deliberately deferred to the self-iteration mode design (noted for a later iteration).

## IFU user-story format - prior art  -> req-ifu-user-stories, req-ifu-split-slide

The owner's IFU format was checked against established practice. It maps cleanly onto three well-known patterns.

### The narrative arc = Before-After-Bridge / demo storytelling

The arc problem -> starting state -> steps -> result is textbook demo storytelling. A demo is a setup, a conflict, and a resolution: establish the situation and goal, introduce the friction, then show the product removing it. The Before-After-Bridge (BAB) frame names the same shape: the "before" is the problem, the "after" is the result, the "bridge" is the steps.

- Before-After-Bridge: https://www.storyprompt.com/blog/before-after-bridge
- Demo storytelling (setup / conflict / resolution): https://medium.com/@daccord7/demo-storytelling-why-most-product-demos-fail-and-how-to-fix-them-cddea9cb6f5d
- 7-sentence product demo framework: https://gtmnow.com/product-demo/

### The slide layout = Assertion-Evidence (Michael Alley)

The left-text, right-visual slide is the assertion-evidence pattern. Each slide carries one sentence-assertion as its headline, supported by visual evidence, never a bullet list. Research finds these slides easier to understand and better remembered. This is exactly the owner's "left half text, right half rendering", formalized.

- Assertion-Evidence approach: https://www.assertion-evidence.com/
- Penn State AE slide structure: http://www.writing.engr.psu.edu/AE_checklist.pdf
- Assertions not topics: https://sixminutes.dlugan.com/assertion-evidence-design-presentation-slides/

### The per-slide framing = Job Story fits an IFU better than classic Connextra

Three user-story formats were compared. Classic Connextra ("As a role, I want X, so that Y") states who/what/why simply. Job Stories ("When <situation>, I want <motivation>, so I can <outcome>") drop the role and focus on the triggering situation, from Jobs-to-be-Done. Given-When-Then suits complex logic and ties to tests. An IFU is triggered by a situation - the problem slide - and is role-light, so the Job Story framing fits its problem slide better than Connextra. The arc slides already carry the "why", so the text can be prose rather than a rigid template.

- User story format variations: https://www.peopleandmedia.com/user-story-format-example/
- Three-part template (Connextra): https://www.mountaingoatsoftware.com/blog/why-the-three-part-user-story-template-works-so-well
- Agile Alliance user story template: https://agilealliance.org/glossary/user-story-template/

### Verdict

The owner's format is not ad-hoc. It combines three validated patterns: a Before-After-Bridge arc, assertion-evidence slides, and a Job-Story problem framing. No change to the format is indicated by the prior art. The one novel element is embedding a live, interactive book rendering as the assertion's evidence, which the deck markdown's existing column and figure mechanisms partly support already.

## Milestone review  -> i27-m2-gate

**Verify.** Every subtask carries its evidence section above. The two derived checks compute green: all 35 requirements trace to use cases and carry tests. The elicitation rulings live in the requirement bodies, each dated. The research is banked in the data home with its journal.

**Validate.** The set covers the frame: every chapter finding from the i26 field review maps to a requirement, the IFU content pass replaces coverage theater, and the engine self-explanation set answers the system-fighting notes. Nothing in the frame is unrepresented.

**Red-team (steelman the opposite).**

1. *"This is two iterations wearing one id."* The strongest counter, already carried as the M1 kill-criterion: if M6 planning cannot order the book half and the engine half independently, the iteration splits. Held, not dismissed.
2. *"The IFU pass repeats coverage theater one level up."* The set guarantees every use case is covered by a story, but nothing guarantees the stories are GOOD. 82079-1's seven quality principles are exactly the missing yardstick. Escalated to the owner as decision A below.
3. *"Mechanical DSM clusters will exhibit boring blocks."* arc42's relevance-over-completeness rule has no counterpart in the onion spec. Escalated as decision B below.
4. *"The node-link trace graph has no RM-tool precedent at scale."* True (Jama renders tables); the collapsible clusters are the designed mitigation, and the M5 spike proves or reopens it. Recorded.
5. Three research angles survived no verification (RAID scatter, filter pills, timeline). They are UX conventions, not correctness claims; the M7 validation re-checks them against the built views. Recorded.

**Verdict of round 1: PASS proposed, conditional on the owner ruling decisions A and B.**

## Milestone review, round 2  -> i27-m2-gate

Round 1's two escalations were ruled (A1: the 82079 quality review per deck; B: complete models, owner-stamped boilerplate folded only from the render, plus the standing M4 boilerplate question). Five requirements entered after round 1 (ifu-quality, onion-boilerplate, pugh-render, deck-nav-usability, plus the earlier risk-matrix rework), so the review ran again over the additions.

**Verify.** 40 requirements, 40 tests, every requirement traced; the derived checks compute green and lint is EARS-clean. Each addition carries its ruling and its source in the node body; the research sources are minted references.

**Validate.** The additions serve the frame: the quality review makes the IFU pass answer "good", not only "covered"; the Pugh render and boilerplate control serve the book's readability goal; deck navigation serves usability. No addition steps outside the iteration's motivation.

**Red-team, round 2.**

1. *The global requirement cap is nearly spent*: 191 of 200 total requirement files. If M6's build mints more than nine (the function-node migration or spike findings could), the cap trips mid-build. Named to the owner at the gate; the answer is consolidation or a deliberate cap ruling, not a silent raise.
2. *Forty tests to author is the real M6 weight.* Most are doc-tests over renders; the red ritual (author, observe red, build green) applies to each. The build plan must batch them or the walk drowns. Carried into the M6 planning input.
3. *The engine half rebuilds the parser* (function nodes) and every rebuild invalidates the full verdict cache on this machine. Sequencing risk, carried to M6 planning.
4. Round 1's held counters stand: the scope-width kill-criterion, and raid-trace-graph-scale now records the node-link scaling risk with the M5 spike as its proof obligation.

**Verdict: PASS.** The set is complete against the frame, every input stream is represented, the misses have recorded homes (a raid, a parked note, two adopted rulings). The gate is ready for the owner's bless with the three M6 warnings named above.
