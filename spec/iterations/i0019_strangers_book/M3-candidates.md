# M3 - Candidate architectures (i0019_strangers_book)

## Alternatives elaborated  -> i19-m3-alternatives  (KILLER - owner adjudicates)

**Fork A - the deck-anchor mechanism (req-deck-links):**

- **A1 - URL-fragment reflection.** Opening a deck writes `#deck-<slug>` via history.replaceState; loading with that fragment opens the deck; per-slide depth reuses the EXISTING stable slide ids (`…-s2`). Precedented (reveal.js `#/<id>`, Quarto hash slugs), zero new machinery, file://-safe, and it RIDES the rail the M2 probe found: the guides table already keeps view state in the URL hash.
- **A2 - a router-owned deck route.** A small JS router owns view state (`#/deck/<slug>/<n>` paths), centralizing navigation beyond decks. More expressive, but it would CONTEND with the existing hash rail (two owners of location.hash = the classic conflict), adds SPA-shaped complexity to a document, and its extra power (per-slide paths) is reachable within A1 anyway.

**Fork B - the terms-lint term source (req-terms-before-use):**

- **B1 - the glossary IS the term list.** One source of truth; the check follows the glossary's growth; zero curation drift. Weakness: inherits the glossary's current thinness (M1 RAID) - the lint is only as good as the glossary it reads.
- **B2 - a dedicated curated term list** (Vale-vocabulary style). Curated independently of the glossary, so it could cover terms the glossary lacks - but that is exactly a SHADOW LIST: two places for one fact, drifting apart (the DRY law), and the verified prior art shows Vale-style lists solve spelling, not ordering. The honest fix for B1's weakness is growing the glossary, which the stranger needs anyway.

**Fork C - where the white-label voice fix lives (req-vehicle-white-label):**

- **C1 - renderer substitution.** The book emitter takes title, wordmark, and colophon identity from the brand layer / workspace name; one code path, mechanical, testable.
- **C2 - brand-neutral method prose.** The method text says "the engine" where it now says quackitect-as-self, so the SAME prose is honest in every vehicle; no render-time rewriting of prose (which would be fragile and dishonest to hashes).
- **C3 (hybrid, the likely winner) - C1 for the identity SURFACES (title/wordmark/colophon), C2 for the prose VOICE.** Each mechanism where it is natural; no runtime text substitution beyond the identity slots.

## Criteria weighted  -> i19-m3-criteria
Derived from the requirements, weight in parentheses (5 = vital):
- **Single-file, file://-safe, no external requests (5)** - the book's standing law; kills anything server-shaped.
- **Shareable plain links (5)** - uc-deck-deep-link's whole point.
- **One owner per mechanism - no contention with existing rails (4)** - the hash rail exists; two owners corrupt both.
- **Machine-digestible document, minimal JS complexity (4)** - the book is read by machines (req-deck-semantics); a router is SPA furniture in a document.
- **DRY - one source of truth per fact (4)** - the term list, the identity, the anchors.
- **Hash-honesty (3)** - no mechanism may rewrite prose at render time in ways the ledger cannot see.

## Feasibility rough-checked  -> i19-m3-feasibility
- A1: the slide ids and the hash rail EXIST (M2 probes); reflection is a handful of JS lines beside the existing hash handling. LOW risk.
- B1: the glossary renders from one place; the lint reads the same source the renderer does. LOW risk; effectiveness gated on glossary growth (carried RAID).
- C3: the title/wordmark already resolve through resolveBrand for ASSETS - extending to the emitter's title/colophon strings is the same seam; the prose sweep is bounded (the M6 white-label test enumerates the leaks). MEDIUM effort, LOW risk.
- A2/B2: feasible but each violates a 4-or-5-weight criterion (contention; shadow list) - carried as recorded rejections, not tripwires.

## Milestone review  -> i19-m3-gate  (KILLER - owner adjudicates)
**Verify:** every open fork carries >=2 genuinely elaborated alternatives with the rejected side's strengths stated (A2's expressiveness, B2's independence). **Validate:** the criteria trace to requirements and standing laws (single-file, DRY, hash-honesty), not taste. **Red-team:** is fork C real or already decided? Real - C1-only was a live option (render-time prose substitution) and is REJECTED here for hash-honesty; recording that rejection is what keeps M4 honest. **Verdict: PASS from the agent side - hand-off for the owner's M3 bless; the Pugh convergence and the winner's ADR land at M4.**
