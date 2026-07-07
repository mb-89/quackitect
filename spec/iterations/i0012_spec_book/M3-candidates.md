# M3 — Candidate architectures (i0012_spec_book, systematic)

TL;DR: eight open axes, two to three candidates each, one preferred per axis. The riskiest new scope is figure rendering; it goes to the M5 spike. Every settled-by-requirement axis is recorded as such, not re-opened.

## Alternatives elaborated  → i12-m3-alternatives

One card per axis: context line, options with pro and con, preferred with why.

### Axis 1 — Emitter pipeline
Context: how the graph becomes the book.
- **A — one pass, graph to HTML** (report.go pattern). Pro: one code path, in-house precedent. Con: no reusable intermediate; SSG optionality lost; prose units live only in HTML.
- **B — two stages, graph to markdown intermediates, then assemble to HTML.** Pro: intermediates stay CommonMark (Obsidian/GitHub render them); SSG fallback stays open; the drafting step edits markdown, not HTML. Con: two representations to keep honest (the assemble step must be lossless).
- **Preferred: B.** The design note chose it for optionality; the AI-drafting flow needs a markdown surface to write into; reversibility is recorded (fallback to N flat files is trivial by construction).

### Axis 2 — Manifest resolution
Context: when node refs become content.
- **A — emit-time transclusion**: the emitter resolves every ref at declared depth into the DOM. Pro: satisfies req-book-dom-static by construction; extraction-safe. Con: bigger file (bounded, three orders below limits).
- **B — data + view-time assembly**: JS builds sections from embedded data. Pro: smaller DOM. Con: violates req-book-dom-static; invisible to extractors.
- **Preferred: A** (owner-agreed). B is structurally excluded by a blessed requirement; recorded as the losing alternative with that exact reason. Owner clarification recorded: client-side JavaScript DOES the reader-facing filtering (views, depth, presets) and MAY do search - over content that is fully present in the HTML. Script narrows what you see; it never creates what there is.

### Axis 3 — Glossary and lint coupling
Context: one term source; lint consumes the classification, the book renders the entries.
- **A — one glossary file, one section per term.** Pro: single file, simple parse. Con: heavy merge surface; no per-term linking; against the owner's one-note-per-thing taste.
- **B — one note per term** in the method layer, frontmatter carries the domain/meta classification per vehicle. Pro: Obsidian-linkable (the stakeholder-class pattern repeated); per-term history; lint reads frontmatter, book renders bodies. Con: many small files.
- **Preferred: B** (owner-agreed), with the LaTeX glossaries discipline adopted whole (owner-agreed after research):
  - Definition and usage separate; a USAGE is a marked reference (a link to the term note), never trusted plain text - the `\gls` idea.
  - The glossary chapter is GENERATED: used terms only, back-references to where each term appears.
  - First linked use in a chapter renders long form with the short form; later uses render short - mechanical at emit time.
  - Lints for free: a link to a missing term note is an error (ref-integrity family); a scanned unlinked occurrence of a defined term is an ADVISORY finding.
  - Only the definitions themselves are authored - AI-first drafted, owner-corrected, like all prose.

### Axis 4 — Deck rendering
Context: the same content presents as slides.
- **A — same HTML, present mode**: paged fullscreen CSS, arrow keys, print handout. Pro: one artifact (rule of cool, recorded at design); zero extra pipeline. Con: not a .pptx.
- **B — separate deck export per manifest.** Pro: native slide file. Con: second artifact to keep honest; the Marp-compat dividend already covers corporate handoffs for free (deck manifests are valid-enough Marp).
- **Preferred: A**, with B's need served by the recorded Marp interop, not by us.

### Axis 5 — Provenance icon semantics (OWNER-RULED at this gate)
Context: two research models disagreed on the data shape; the owner settled it differently than both.
- **The ruling: the mark is a metric of AI INVOLVEMENT and nothing else.** 3 marks = fully generated; 1 mark = slightly touched. It is never a statement about trust, quality, or review.
- **Why the research's review axis DIES here:** the author fully owns all published content, whatever the AI share. "The AI wrote it, I did not review" is an unacceptable state in this method - so there is no "unreviewed" condition to render. The faceted paper solves a problem this process refuses to have. (Ledger SUSPECT marking stays what it always was - a statement about changed inputs, per req-book-honesty - and is not a per-paragraph trust badge.)
- **General philosophy recorded (owner, sebot-era principle): quality with AI must RATCHET UP.** "Ten percent worse but faster and brainless" is the road to slop and is rejected on principle. Baked into the voice.
- **Bidirectional count (owner-refined rule):** the AI JUDGES its own touch at write time, on the surface-versus-core line the system already uses for hashes (reformat never reopens a design; content always does):
  - Surface touch - typos, wording polish, added links or references, small annotations that leave the core intact: the mark stays.
  - Core touch - meaning, structure, or claims change: the mark rises to the actual AI share (a real partial rework earns 2; a fundamental re-draft earns 3).
  - In doubt, lean higher (the blessed harmless direction).
  - The judgment is reviewable: the mark change rides in the same diff as the edit, so the owner corrects it like any content.
- **Rendering (owner preference, for M4/M6):** small icons set vertically in the text margin - the border column, not inline badges. (Matches the margin-icon form of the faceted paper; a bare textual label stays excluded as the proven-worst format.)

### Axis 6 — Provenance mark storage
Context: where the 3-2-1 value lives.
- **A — inline markers in the markdown body** (the design-marker pattern reused). Pro: in-house precedent; hash-visible (an edit flips SUSPECT - desired); survives transclusion; visible in Obsidian. Con: syntax noise in the source.
- **B — sidecar metadata file.** Pro: clean source. Con: drifts silently; invisible where the prose is edited; against truth-in-spec instincts.
- **Preferred: A.**

### Axis 7 — Register lint mechanism (OWNER-RULED at this gate)
Context: advisory readability/plain-language signals (req-register-advisory).
- **A — hand-rolled checks in the engine.** Pro: zero-dep. Con: WE maintain a prose linter forever - the owner rejects the maintenance burden.
- **B — Vale, auto-pulled by default.** Vale is one static MIT-licensed Go binary per OS. The engine pulls it once for the running OS (the global-binary bootstrap pattern), caches it in the data home, runs it as a subprocess. Pro: industry-grade rules (Microsoft/Google packages, readability metrics), zero maintenance of ours, never linked into the engine. Con: a soft runtime dependency; first-use needs the network once.
- **Preferred: B (owner-ruled).** Degradation is graceful and LOUD: when the pull fails or the binary is absent, the engine prints a warning - "prose linter missing; prose quality is likely to suffer" - and the advisory lane simply stays empty. Trivial structural checks that are not prose linting (a chapter lede exists, a marker parses) stay in-engine as normal selftests. Declared in dependencies.md at build.

### Axis 8 — Figure rendering (the riskiest new scope)
Context: req-book-figures demands inline, machine-readable figures; view-time Mermaid would violate dom-static (script creating content).
- **A — engine-emitted inline SVG with real text** for the derived diagrams (context, building blocks, timeline; the trace graph exists as in-house prior art). Pro: deterministic, extraction-safe, zero-dep. Con: real new engine surface - scope-guard pressure.
- **B — embedded text source (Mermaid/ASCII) rendered by vendored JS at view time.** Pro: cheap authoring. Con: the VISUAL is script-created - dom-static violated for sighted readers' content; the report does this, but the report is not the book.
- **C — author-time rendered SVG committed as assets.** Pro: no engine surface. Con: hand-maintained artifacts drift; against AI-first authoring.
- **Preferred: A, scope-capped**: a SMALL fixed set of derived diagram kinds, spiked at M5 before commitment; ASCII/`<pre>` blocks remain the honest fallback for anything beyond the set.

**Settled axes NOT re-opened** (decided by blessed requirements or recorded rules): single-file, one manifest node type with modes, `---` unit separator, markdown-link refs, depth derived from anatomy, static substrate, write-time provenance recording.

## Criteria weighted  → i12-m3-criteria-weighted

Derived from the requirements, vital few, weight 1-5:

- Trust and honesty (honesty, identity, drift, provenance): **5**
- Zero-dep and self-contained (single-file, engine principle): **5**
- LLM digestibility and extraction fidelity (dom-static, llm-digestible): **5**
- Authoring cost under the deadline (ship + presentation): **4**
- Scope guard (one emitter, one manifest type, two lints): **4**
- Audience register fit (tldr, register, a11y): **3**
- Reversibility of the choice: **2**

Every preferred pick above wins on the 5-weights first; the two picks that trade against the deadline (figure SVG, per-term glossary notes) are scope-capped rather than dropped.

## Feasibility rough-checked  → i12-m3-feasibility

- Emitter two-stage: report.go proves the HTML shell; markdown assembly is string work in Go. FEASIBLE.
- Emit-time transclusion at depth: pure graph walk over loaded nodes. FEASIBLE.
- Per-term glossary notes: the parser and strict-guard already handle typed note files. FEASIBLE.
- Same-file deck: CSS paged media + keyboard handler within the dom-static rule (toggling visibility, never creating content). FEASIBLE; print handout is the browser's print path.
- Ledger-rendered evaluation: latestBless/StatusMap already computed at render. FEASIBLE.
- Inline provenance markers: the design-marker scanner is the template. FEASIBLE.
- Hand-rolled register floor: the EARS lint is the in-house precedent. FEASIBLE.
- Engine-emitted SVG: UNPROVEN at our hand - exactly one M5 spike question (can a fixed small diagram set render legibly, deterministically, with real text?). The until-found disclosure probe rides the same spike.

## Milestone review  → i12-m3-gate

**Verify:** every open axis carries at least two elaborated candidates with pro and con; every settled axis names the requirement or ruling that settled it; the criteria derive from blessed requirements and the picks trace to them. **Validate:** the preferred set honors the frame - static substrate, AI-first drafting surface (markdown intermediates), the owner's provenance ladder preserved inside the synthesis, scope guard enforced by capping, not by dropping. **Red-team:** strongest counter - axis 8 adds real engine surface under a deadline; answered: spike-gated at M5, ASCII fallback recorded, and the AI-drawn inline SVG release valve carries one-off figures with zero engine surface. Second counter - axis 7 introduces the first soft runtime dependency; answered: never linked, pulled once, loud graceful degradation, and the alternative is maintaining a prose linter forever. Third counter - the AI judging its own involvement marks could drift self-servingly; answered: the criterion is the recorded surface-versus-core line, doubt leans higher by rule, and every mark change is reviewable in the same diff as the edit it claims to describe. **Verdict: PASS - pending the adjudicator's bless.**

---

# M3 extension — the connection axes (2026-07-06)

## Alternatives elaborated (extension)  → i12-m3-alternatives

### Axis 9 — Connection storage
Context: where reified relations live. Four candidates, ratings in the notes ([cand-conn-frontmatter](cand-conn-frontmatter.md), [cand-conn-fileper](cand-conn-fileper.md), [cand-conn-central-jsonl](cand-conn-central-jsonl.md), [cand-conn-two-lane](cand-conn-two-lane.md)).
- **A — frontmatter status quo.** Pro: zero migration, Obsidian-native. Con: no prose, no symmetric home, the two-system smell.
- **B — one note per edge.** Pro: everything addressable. Con: measured 1.5x-2.6x file explosion; the status feel dies.
- **C — central jsonl with details pointers.** Pro: one machine index. Con: the human-facing kinds lose Obsidian preview or duplicate display frontmatter.
- **D — two lanes per kind (owner option A). Preferred.** Machine edges as jsonl lines, human edges as real notes, one edge one lane, the adjacency determinizer merges.

### Axis 10 — The implements lane
Context: implements edges are declared in code design markers ([cand-impl-derive](cand-impl-derive.md), [cand-impl-code](cand-impl-code.md)).
- **A — derive connection notes from code.** Con: every failure mode is silent-drift-shaped (stale generated files, orphan connections bricking the strict guard).
- **B — stay code-declared, merge at read time. Preferred.** Code regions already hash; DRY holds by deriving the view.

Task wiring (depends_on, parent) is the recorded open sub-question: joining is jsonl-cheap; the recommendation (stay frontmatter this iteration) goes to the adjudicator at M4.

## Criteria weighted (extension)  → i12-m3-criteria-weighted
The M3 weights carry unchanged; workspace bloat and Obsidian-preview fidelity score under authoring cost (4) and audience register fit (3). The candidate ratings encode them per option.

## Feasibility rough-checked (extension)  → i12-m3-feasibility
- Two-lane loader: frontmatter parsing and JSONL reading both exist in-house (ledger events). FEASIBLE.
- Hash-neutral adjacency: parents/fullHash mechanics are pure functions over reconstructed adjacency - the red-team anchored the exact code paths (engine.go). FEASIBLE, spike-grade proof rides the red-observed test.
- Determinizers: mint/promote/adjacency are file operations plus the existing graph. FEASIBLE.
- Virtual edge properties: the evaluator already injects computed context (referenced). FEASIBLE.

## Milestone review (extension)  → i12-m3-gate
**Verify:** both new axes carry elaborated candidates with recorded ratings; the preferred picks name their killing reasons. **Validate:** the picks honor the owner's one-system intent within the trust constraints. **Red-team:** the strongest rival (central jsonl) is genuinely stronger on uniformity - answered: its uniformity survives in the merging determinizer while its preview cost does not. **Verdict: PASS - pending the adjudicator's bless.**
