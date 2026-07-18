# M1 - Frame (i0027_book_feedback, systematic)

TL;DR: The i26 field review found the book mechanically correct but not yet good documentation. The same review found the engine opaque when it refuses. This iteration works both: the book renders what readers asked for, and the engine names its own recovery.

## Vision & scope stated  -> i27-m1-vision-scope-stated
**Vision (Moore).** For the book's readers and the driving agent / who need documentation that answers them and an engine that explains itself / the i0027 pass / that lands every carried field finding and makes each refusal actionable / unlike the i26 state, where the IFU map was coverage theater and a stale MCP child cost half an hour of archaeology.
**Scope in.** The carried book findings: chapters 2 and 3, the design-input register, filters, details pane, search, V&V result links, timeline, risk matrix, onion and interfaces, rationale fill. The IFU user-story content pass. The engine set: refusal recovery, verify build pinning, supervisor swap on any build, honest why deltas, the boot command, the pager round-end line.
**Scope in, by owner ruling at the M1 gate.** The chapter-5 collapsible traces and the onion redesign with a model-by-model owner review are full requirements of this iteration. The joint sessions land at M3/M4 (candidates and diagram review) and M5 (render spikes).
**Scope out.** The external-reader validation stays open by owner ruling.

## Problem agreed  -> i27-m1-problem-agreed-the
- The IFU map covers use cases by listing IDs on a final slide. The owner called this coverage theater (i26 HANDOVER.md, 2026-07-16).
- The book review carries nine chapters of concrete findings that are not yet in the product (i26 HANDOVER.md).
- Closing i26 cost about thirty minutes of infrastructure archaeology. The engine never named a cause or a recovery (owner feedback notes, 2026-07-17).
- A mid-battery ratchet silently wasted 171 green verdicts (note, 2026-07-17).

## State of the art checked  -> i27-m1-state-of-the
- Self-explaining errors: Elm's compiler-errors-for-humans (https://elm-lang.org/news/compiler-errors-for-humans) and rustc diagnostics with confidence-graded machine-applicable suggestions (https://rustc-dev-guide.rust-lang.org/diagnostics.html, https://rust-lang.github.io/rfcs/1644-default-and-expanded-rustc-errors.html). This iteration ports the pattern to a ledger engine whose reader is a context-losing agent: the message carries the whole recovery.
- Living documentation with audience-filtered views (https://engineering.facile.it/blog/eng/on-living-documentation/) and live traceability matrices (https://www.reqview.com/doc/requirements-traceability-links/) exist as installed tools. No prior art ships them as one portable, hash-backed HTML file. The WHATWG one-page standard proves the single-file scale (https://html.spec.whatwg.org/).
- Mistake-friendly interaction design demands cheap, named recovery (https://usability.yale.edu/ux/best-practices/mistake-friendly-approach). It grounds the boot-sequence and round-end requirements.

## Success is measurable  -> i27-m1-success-is-measurable
1. Every carried book finding is realized in the rendered book or carries a recorded veto. Checkable per finding at M7.
2. No IFU deck satisfies coverage with a bare ID list. The coverage check proves it.
3. Every engine refusal and cache-miss message names its cause and one recovery command. The lint proves it.
4. A mid-battery binary swap cannot invalidate a battery silently. The selftest proves it.
5. A fresh session boots by following engine output alone, with no source reading.

## Top risks logged (RAID)  -> i27-m1-top-risks-logged
- **Risk - scope width**: nineteen requirements across book and engine is a wide iteration. Mitigation: the build plan orders book-content work first, engine work second; either half ships alone.
- **Risk - render churn**: register and filter rework touches most book views. Mitigation: doc-tests per view before the rework; the drift lint stays green.
- **Risk - blessed-history ripple**: the i0016 question's option C touches blessed history. Mitigation: the owner rules before M4; options A and B stay available.

## Milestone review  -> i27-m1-gate

**Verify.** Each subtask has its section above with a referent: the vision names its rival state, the deltas carry dates and sources, the scan carries links, the criteria name their proving check, the risks carry mitigations.

**Validate.** The frame matches the owner's stated intent from the i26 close: work the book feedback, pull in all engine work, skip the external reader.

**Red-team.** The opposing case: this is two iterations wearing one id, and the wide scope risks a half-done ship. Answered by the scope-width risk: the build orders book work first and either half ships alone. Kill-criterion: if M6 planning cannot order the halves independently, the iteration splits.

**Verdict: PASS proposed.** The owner rules at the gate.
