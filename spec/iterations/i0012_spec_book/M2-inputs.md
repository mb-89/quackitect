# M2 — Design input (i0012_spec_book, systematic)

## Audience model settled  → i12-m2-audience-model

**The reader baseline (owner ruling, M1).** Every audience below is assumed at average intelligence, competence, and motivation. English is not assumed native. The content must land anyway. Big ideas first; what and why before detail; a TL;DR opens every chapter.

**The model: who reads, in which situation, with what question.**

| # | Reader | Situation | Their question | Register | Entry (preset) | Depth |
|---|--------|-----------|----------------|----------|----------------|-------|
| 1 | Decision maker (non-tech) | Ten minutes to judge or fund it | What is this and why does it matter? Is it sound? | Simplest. No internals. No jargon. | onepager / exec summary (ch1 + ch4 killer statements) | 1 |
| 2 | End user of the shipped tool | Wants to get a task done | How do I do X? | Simple, task-first | user guide (7.1), ch0–1 | 1–2 |
| 3 | Newcomer | First contact, learning | What is this about? Where do I start? | Simple, guided; full picture optional | newcomer (ch0–2) | 1–2 |
| 4 | Engineer / architect | Evaluating, extending, onboarding | How is it built? Why these decisions? What lost? | Technical, precise | architect (ch2–4) | 2–3 |
| 5 | Auditor / quality role | Compliance or V&V review | Prove every claim traces and was verified | Evidence-first, exhaustive | auditor/trace (ch5–6, full evidence) | 4 |
| 6 | Owner / operator | Driving or presenting the project | Where are we? What is decided? What is suspect? | Technical, ledger vocabulary | project view (ch6) + board | 2–4 |
| 7 | Agent (AI) | Retrieval, operation | What is normative? What is verified? How do I operate? | Machine register: layers named, trust metadata | agent guide (7.4) + embedded graph | full |
| 8 | Talk audience | Live presentation | Why should I care? | Spoken register: big ideas only | deck preset; notes carry the depth | 1 (+reveals) |
| 9 | Operator / admin of the shipped system | Installs, configures, runs, troubleshoots | How do I deploy it? What does this error mean? | Task-first, exact | operations section of 7.1 + install/deploy docs | 1–2 |
| 10 | Integrator (neighboring-system developer) | Builds against the interfaces | What does the contract promise - CLI, config, formats? | Reference, terse | technical reference (7.3) + ch2 context | 2–3 |

**Rules the matrix implies:**

- Readers 1–3 never meet internals. Their chapters carry less detail by design, not by omission — the detail exists one depth-step or one chapter-link away.
- Readers 4–6 get the full graph, progressively. Nothing is dumbed down for them; the depth ladder does the work.
- Reader 7 is a first-class audience, not an afterthought: 41% of static-doc readership is already AI-driven (State of Docs 2026). The same HTML serves it through semantic markup and data attributes.
- The stakeholder/view matrix on the book's entry page (ch0) IS this table, rendered: one preset button per reader row.
- A newcomer (reader 3) reading a single chapter out of context is a SUPPORTED case: every chapter's TL;DR plus the glossary must carry enough context to stand alone.

**Stakeholder classes sorted into project types (owner ruling, this walk).** The classes live as one note per class in the method layer; each project type links the classes that apply (markdown links, Obsidian-compatible). The project's overall type is never a stored flag: it derives as the union of its iterations' types, so a doc-only iteration cannot flip the whole project. Realized at M6 (req-type-stakeholders); the sorting decided now:

- **default** (always applies, every project):
  - acquirer / decision maker
  - user
  - newcomer
  - communicator / talk audience
  - assessor / auditor
  - project owner / operator of the walk
  - agent (AI)
- **software** (adds):
  - developer / maintainer
  - operator / sysadmin of the shipped system
  - integrator / neighboring-system developer
  - tester
- **manufactured_good** (adds):
  - production engineer
  - supplier
  - installer / commissioner
  - service / maintenance technician
  - transport / logistics
  - regulator / certifier
  - end-of-life / recycling
- **cyber_physical**: links the software AND manufactured_good class sets - the union, three links, no duplication.

Anchors: [IEC/IEEE 82079-1](https://www.iso.org/standard/71620.html) (information for use separated per target audience, unskilled to professional), [ISO/IEC/IEEE 15288](https://www.iso.org/standard/81702.html) (stakeholders attach to life-cycle stages - production, installation, support, retirement activate the manufactured classes), the SyA class rubric (at least one reader per class), arc42 (neighboring-system developers). One recorded footnote: if per-type guide/checklist CASCADING is ever built, the directory nesting question returns; for class links it has no impact.

**What this settles for the requirements:** every view/preset requirement traces to a reader row; the reader matrix above is the software-type rendering for THIS project; stakeholder-coverage (the next check) is judged row by row against the type-derived class set - a class with no serving row fails it.

## Inputs captured  → i12-m2-inputs-captured

**Context (system in focus: the book emitter and its artifact).**

- What flows IN (the emitter's inputs): the gated spec graph (nodes, tasks, ledger states), the attest ledger (verdicts, actors), the glossary, the evidence-doc templates, manifests (chapter/preset/deck), the brand assets, the provenance marks on drafted prose.
- What it PRODUCES (the deliverables, all in scope): one self-contained HTML book; the emitted repo-root AGENTS.md (same source as the agent-guide chapter); the deck (same file, present mode). LLM digestibility is a REQUIREMENT on the book itself (req-llm-digestible, owner ruling 2026-07-05); a separate llms index is emitted only where extraction alone proves insufficient.
- Its ENVIRONMENT: browsers (find-in-page, print), CommonMark renderers and Obsidian (manifests stay valid markdown), AI extractors (html-to-text), the zero-dep engine, the workspace data home (day-to-day emit target; committed only at ship).

**Stakeholders and use cases**: the audience model above IS the stakeholder capture; the four trace use cases ([uc-book-read](uc-book-read.md), [uc-book-present](uc-book-present.md), [uc-book-agent](uc-book-agent.md), [uc-evidence-authoring](uc-evidence-authoring.md)) carry the situations. Not repeated here (DRY).

**Environment assumptions a requirement builds on, each with its probe status:**

- Single self-contained HTML at our scale stays responsive — PROBED daily on the real channel: the report is the in-house existence proof; the design note bounds us ~3 orders below the known limits.
- `<details>`/`hidden=until-found` auto-expands on find-in-page in Chromium — design-thread checked; REAL PROBE OWED at the M5 spike (it decides the disclosure mechanism).
- The `---` unit separator is the de-facto markdown-slides convention (Marp, Obsidian, reveal-family) — design-thread verified against the tools' own docs; syntax adopted, no tool dependency.
- Plain markdown links resolve in Obsidian and on GitHub — the manifests' link form; verified in the design thread, and this repo's own notes exercise it.
- AI extractors consume DOM-rendered semantic HTML and miss JS-created content — research-verified (SotA run; 41% of static-doc readership is AI-driven); grounds req-book-dom-static.
- Readability metrics are safe only as ADVISORY signals — research-verified (GitLab's production tiering); binds the M2 readability requirement's severity.
- A style linter can run fully offline (Vale) — research-verified; if adopted it enters through the tool seam, never as an engine dependency.

## Stakeholder coverage  → i12-m2-stakeholder-coverage

Quackitect's derived type set is `software` (union over all its iterations' types). The derived classes and their serving rows:

- default: acquirer → row 1 · user → row 2 · newcomer → row 3 · communicator/talk → rows 1 and 8 · assessor/auditor → row 5 · project owner → row 6 · agent → row 7.
- software: developer/maintainer → row 4 · operator/sysadmin of the shipped system → row 9 · integrator → row 10 · tester → row 5 (fold recorded: the V&V chapter is the tester's view).
- manufactured_good classes: not derived for this project - no row owed, no N/A needed. They activate only for a project whose iterations carry that type.

Every derived class has a serving row; every row has an entry preset in the matrix. No role is left without a view. Coverage holds.

## Substrate thesis re-examined  → i12-m2-substrate-thesis

**The thesis (owner, load-bearing):** LLM costs may rise; never assume the reader has AI. AI writes UPSTREAM into the graph; everything downstream of the graph is deterministic. Consumption never needs a model.

**Re-examination, 2026-07-05.** The adversarial research pass returned NO verified evidence for or against the industry direction - both the llms.txt/RAG positioning angle and the drift-detection angle came back empty. The thesis therefore stands on our own reasoning, and we say so. Directional, unverified signals from the fetch stage all point our way:

- llms.txt adoption stalled - no major provider consumes it; server logs show crawlers do not request it.
- AI-driven readership of static docs reached 41% - agents already consume plain HTML.
- AGENTS.md thrives as STATIC curation under a foundation - the agent world standardizes on curated files, not live pipelines.

**The asymmetry that decides it:** if AI stays cheap, the book is ideal agent substrate (semantic DOM, trust metadata, embedded graph). If AI gets expensive, the book still serves every human reader. The bet wins in both worlds; a stored-and-gated substrate also feeds any future consumption interface.

**Consequences recorded:**

- Emitters stay deterministic; AI prose is authored once, gated, and becomes static content with visible provenance.
- Layers are self-describing in the standards vocabulary (normative / informative / evidence) with a reader's contract at the top - they survive RAG chunking and human skimming alike.
- The agent guide and the repo AGENTS.md emit from one source; agents are served by curation, never by a required model.
- LLM digestibility is required of the book itself (req-llm-digestible); a companion index is a fallback realization, adopted only on evidence that extraction falls short.
- Machine consumability is validated empirically at M7 (the book-legibility probe) - AI used where it adds value, per the thesis itself.

**Verdict:** the thesis HOLDS, carried knowingly without external prior art (recorded above). Revisit trigger: a major provider shipping a docs-consumption standard with real adoption reopens this at a retro.

## Requirements verifiable / traced  → i12-m2-req-has-test · i12-m2-req-traced

**The template system (owner rulings, this walk).**

- Home: ONE `method/templates/` folder for all templates.
- Metadata names the rigors and types where a template applies - as the LOWER bound. The agent uses a fitting template beyond its metadata by judgment and mentions it for the retro.
- The determinizer parallel: what we do often earns a template.
- Templates bind like the voice: any artifact kind where applicable - prose, evidence docs, code.
- Enforcement: the docs-complete review (M8) questions strayed documents; straying is allowed with a recorded reason. The flow is bidirectional - template improvements reach documents, document improvements teach templates.
- Structural: [req-template-system](req-template-system.md) (+ mechanical test) and [req-template-flow](req-template-flow.md) (+ review-class test, the judgment residue). The eight milestone evidence templates ([req-evidence-templates](req-evidence-templates.md)) become the first population; only the M3 and M4 card shapes are field-tested - the AI drafts the other six and the owner corrects them at first use, per the AI-first ruling.

## Prior art checked (M2 method; the requirement set against best practice, 2026-07-05)

The concrete set was positioned against the standard checklists for an HTML documentation deliverable. Three misses found and ADDED:

- [req-book-a11y](req-book-a11y.md) - WCAG 2 AA operability, the industry baseline our set lacked ([WCAG 2](https://www.w3.org/WAI/standards-guidelines/wcag/), [WebAIM](https://webaim.org/standards/wcag/checklist)).
- [req-book-identity](req-book-identity.md) - the artifact stamps its source state (merkle root, iteration, engine version), per reproducibility practice.
- [req-book-figures](req-book-figures.md) - inline, machine-readable figures; carries the owner's general ruling (diagrams over prose, generously, everywhere - now in the voice).

Non-goals RECORDED, not added: translation/i18n (plain English is the chosen answer for non-native readers; the market-language duty of IEC/IEEE 82079-1 activates only with the manufactured_good type - noted for the type files); reader feedback (owner: a real COMMENT system, benched deliberately - captured as a note with its ready-when). This check becomes a structural M2 item in the rigor templates from this walk on.

## Requirements verifiable / traced  → i12-m2-req-has-test · i12-m2-req-traced

Derived, compute live: 27 requirements, each with a test node; every requirement refines a use case under [need-docu](need-docu.md) or the standing need-review. Both rules green on this board.

## Milestone review  → i12-m2-gate

**Verify:** every subtask delivered against its referent - the ten-row audience model (owner-shaped, SyA/arc42-checked), the context with a probe-status ledger per environment assumption, coverage judged row-by-row against the type-derived class set, the substrate thesis re-examined with the research absence recorded. Both derived checks compute green over 21 requirements.

**Validate:** every M1 ruling is now structural, none is folklore - AI-first drafting (req-ai-drafting), TL;DR/lede unified (req-chapter-tldr), register advisory (req-register-advisory), provenance icons with the stated failure direction (req-provenance-icons), type-linked stakeholders with union derivation (req-type-stakeholders), LLM digestibility as outcome with the index demoted to fallback (req-llm-digestible). The late additions were caught BY this gate's review and by the owner reading the evidence - the requirement set matched the frame only after them.

**Red-team:** weakest point probed - the requirement set grew mid-milestone (16 → 27); is it still coherent? Checked: all five additions trace to recorded owner rulings from this walk, none is speculative scope. Second probe - the substrate thesis has no external validation; answered: recorded honestly in the thesis section with a named revisit trigger, and the M7 legibility probe tests the machine-consumption half empirically. Scope guard intact: no new engine surface was promised beyond the capped set (emitter, manifest type, two lints) plus the owner-ruled type/class notes, which are method-layer data, not engine.

**Verdict: PASS - pending the adjudicator's bless.**

---

# M2 extension — mechanization + connections design input (2026-07-06)

## Inputs captured (extension)  → i12-m2-inputs-captured

**Owner directive:** fold the full mechanization survey into i12. Template chapters become machinery wherever text is project-independent; relations become first-class connections; housekeeping goes to determinizers. No new needs - everything traces to [need-docu](need-docu.md) through [uc-spec-template](uc-spec-template.md), [uc-book-read](uc-book-read.md), and the new [uc-connections](uc-connections.md).

**The captured input, by source (full texts in the notes archive, 2026-07-06):**

- Owner rulings: the connection system (one system for semantic relations); storage option A (two lanes per kind); ch8 guides as notes, one subchapter per type; example notes per derived kind; the ch3 mechanization set (functions deferred); the extension scope itself, with the scope complaint pre-acknowledged as a retro lead.
- Red-team, trust lens: hash-neutral loading is the hard requirement; migration self-audits or bakes its own bugs into the golden; the id-charset lint ships first; the edge-mode key is the migration's commit point; connection prose must hash; one pre-existing nondeterminism found (candidate verdict scans map order).
- Red-team, standards lens: the item-kind set is standards-complete at this scale; SysML2-aligned kind vocabulary; budget gains margin; mode/state and function deferred; concern, view/viewpoint, ConOps, change-request, and actor consciously rejected.
- Red-team, template lens: four shipped defects (fig lines render as prose, block-tree draws the book's chapters, the methods view does not exist, the need kind is half-born); mint covers 5 of 13 kinds against its own principle.

**Requirement growth:** 27 → 59, all EARS-shaped, each with a test; both derived rules compute green on this board.

**Scope items flagged to the adjudicator at this gate:**

- Trace-graph whitelist revert (owner ruling 2026-07-05, still unimplemented): the item types must stay OFF the report graph's node whitelist. One-line report.go correction - proposed as a rider on i12-bs21-ch4.
- The wider trust gap (.base files and content notes outside the identity root): BACKLOGGED to the next engine iteration with its ready-when; req-conn-root covers connection content only.

## Milestone review (extension)  → i12-m2-gate

**Verify:** all 32 additions trace to recorded rulings or red-team findings; none is speculative; the derived rules compute green over the grown set. **Validate:** the owner's one-system intent survives with two evidence-forced carve-outs (implements stays code-declared; task wiring at the owner's discretion) - honesty over slogan. **Red-team:** the iteration doubled mid-flight; answered: the owner weighed a split i13 and ruled to extend, the complaint is recorded as a retro lead, and every addition rode the same M2 discipline as the original set. **Verdict: PASS - pending the adjudicator's bless.**
