# M1 — Frame (i0012_spec_book, systematic)

## Vision & scope stated  → i12-m1-vision-scope

**Vision (Moore).**
For the stakeholders of a quackitect-driven project.
Who need to understand the system without reading the repo or asking an AI.
The spec book is one portable HTML file, compiled from the gated spec graph.
That serves each stakeholder a view in their own register, with the big ideas first.
Unlike hand-written docs, which will not be written. Unlike chat-over-repo, which assumes AI access.
The book is deterministic, hash-backed, and always as current as the ledger.

**Scope.** Full book (owner ruling at plan): all chapters, templates, glossary/SyA, guidance split, methodology map, deck, plus the evidence-authoring infra fixes on the side. One iteration; M6 may defer the book half if the plan proves too big.

**Stakeholder-specific communication (owner brief, M1).** This is a load-bearing frame element, not a style nicety:

- Target audience: professionals, usually college-educated, with some experience. Not always technical. Not assumed native speakers.
- Newcomers can read individual parts; the full picture is optional for them.
- Assume average intelligence, competence, and motivation — the content must still land.
- The register selects by stakeholder: non-tech chapters carry less detail.
- Big ideas first, details later. Always explain the what and the why first.
- Every chapter opens with a TL;DR.
- The default agent writing style is too dense; the voice rules apply to every book sentence, and get sharpened for the book where needed.

**AI-first drafting with visible provenance (owner brief, M1).**

- The AI writes every first draft of the book's prose. The user improves where needed.
- Every AI-written paragraph carries "ai written" icons: three when the AI drafted it.
- A user correction or rewrite may reduce the icon count. The count is a per-paragraph provenance record, rendered by the book.

**PR-FAQ pressure test (working backwards).** "Project X ships its manual today. Nobody wrote it. The spec compiled it: every claim traces to a gated check, every AI-drafted paragraph says so on its face, and the owner's edits are visible as reduced AI marks. The deck for the launch talk is the same file in present mode." — FAQ: What if the AI prose is too dense? The register is bounded per audience and the TL;DR is mandatory; the provenance marks invite the human rewrite exactly where it is needed.

## Problem agreed  → i12-m1-problem-agreed

- Hand-written docs will not happen. The owner states this plainly; the first quackitect-made tool ships to real users regardless.
- The current spec is node files plus a status report. Only walkers and adjudicators can read it.
- The audience is average professionals, including non-technical and non-native readers. The current register goes over their heads.
- The presentation deadline makes the delta urgent: the project must document and present itself.
- Worth solving: docs are the product's face for every stakeholder who was not in the loop.

## Success is measurable  → i12-m1-success-measurable

Ch1 criteria (each checked at M7):

1. Each preset audience answers its entry question from the book alone — one real read session per preset.
2. A professional of average competence, non-native, reads one chapter and can restate its big idea. The TL;DR is present in every chapter; register bounds are checked mechanically where possible (readability lint is an M2 candidate).
3. What-and-why precedes detail in every chapter; big ideas before specifics.
4. The AI drafted 100% of the book's first-draft prose; every AI paragraph carries its provenance icons; user edits show as reduced counts.
5. The deck carries the presentation; regeneration of the committed book is a no-op.

## Top risks logged (RAID)  → i12-m1-risks-logged

- **Risk — doc-infra rabbit hole**: sebot died building doc infrastructure. Mitigation: the scope guard (one emitter, one manifest type, two lints) is an M5 buildability criterion.
- **Risk — DITA-style metadata sprawl**: mitigation: derive over store; no per-node audience tags.
- **Risk — meta self-reference**: AI talks about itself; mitigation: meta-quarantine lint, chapters 1–6 speak only about the system.
- **Risk — register drift**: AI prose goes over the audience's head; mitigation: voice rules bind every sentence, TL;DR mandatory, provenance marks route human attention, readability check pushed toward `class: executed` at M2.
- **Risk — provenance honesty**: the AI side is structural — AI-emitted prose is stamped with its three icons by the pipeline, never self-reported. The human side is deliberately an honor system (owner ruling, M1): reducing icons is the owner's judgment and is not policed. Requirement due at M2.
- **Risk — deadline pressure**: full-book scope vs the ship/presentation dates; mitigation: M6 defer lane is pre-agreed.

## State of the art checked (M1 method; deep-research 2026-07-05, 105 agents, 23/25 claims verified 3-vote)

The scan positions the idea. Full cited report: `<data-home>/logs/research-ai-docu-sota-20260705.json`.

- **AI-first drafting is mainstream, and the human gate is universal.** 76% of documentation practitioners use AI for docs creation, 62% for drafting (State of Docs 2026, 1,131 respondents; vendor-run). Every surveyed success keeps a human review gate; the one gate-free example is framed as a failure. Our fill/adjudicate model IS the surveyed best practice.
- **Context engineering is the failure lever.** Hallucinated docs come from starved context. The emitter/prompt layer must inject spec-graph context and style exemplars systematically — our graph is exactly that context.
- **Direct prior art for the provenance icons exists** (arXiv 2604.25346, Apr 2026): per-paragraph margin icons, a faceted model. Its central lesson CHALLENGES our decrement design: degree of AI generation and degree of human review are INDEPENDENT axes — "a reviewed text is not necessarily human-authored". The rival frame (EditLens, arXiv 2510.03154) supports a discrete ternary ladder (human / AI-edited / AI-generated), which matches the owner's 3-icons-decrement. The two models disagree; **icon semantics is an M3 candidate axis**, not a settled M1 fact. We record provenance at write time (ground truth), never by detection.
- **Disclosure design is itself a risk** (CHI 2026): a bare textual "AI" label is the least effective format, and every visualization biases perceived AI contribution one way or the other. Design the icons knowing this; a reader probe belongs in M7.
- **Style enforcement has a proven stack**: Vale (offline, markup-aware, YAML rules) with GitLab's graduated severities — errors block, warnings surface, readability (Flesch-Kincaid, "8th grade or lower") stays advisory. ISO 24495-1:2023 is the citable plain-language norm; principles there, mechanics in lint. Zero-dep tension (external binary vs hand-rolled readability check) is an M3 candidate axis.
- **C2PA**: adopt the mental model (an action log with a per-action AI flag), never literal embedding — the standard has no text/HTML path.
- **Two angles came back empty after adversarial verification**: static-substrate-vs-AI-layer positioning (llms.txt et al.) and drift-detection prior art. Our substrate thesis and regeneration-is-a-noop design rest on our own reasoning — the M2 substrate-thesis subtask carries that weight knowingly. Unverified fetch-stage signals point the same way we bet: llms.txt adoption stalled, while AI-driven readership of static docs grew to 41% of readers.

## Milestone review  → i12-m1-gate

**Verify:** each subtask carries its referent — the owner's M1 brief (this session, recorded verbatim above), the spec-book design note, the two evidence-doc field findings. **Validate:** the frame covers the plan-approved scope and adds the owner's stakeholder-communication and provenance rulings; nothing out of scope entered. **Red-team:** strongest counter — "a generated book reads generated; the audience notices and trusts it less." Answered: the provenance icons make generation an honest, visible property instead of a hidden one, and the owner's reductions are the trust signal. Kill-criterion for the frame: if the M7 read sessions show the register still failing average professionals, the register bounds were wrong, not the audience. **Verdict: PASS — pending the adjudicator's bless.**
