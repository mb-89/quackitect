# M5 - Spike findings (i0016_structural_models, systematic)

TL;DR: The kill-criterion is dead. The spike's results:

- a ~100-line throwaway extractor parsed a real engine layers+flow model in the pinned Mermaid subset
- the semantic hash proved bit-stable under cosmetic edits and moved under semantic ones
- the ambiguity lint fired on both planted violations
- a hand-rolled SVG derived a readable four-ring onion with labeled flows from the text truth

Two findings feed M6: BOM stripping and beyond-subset tolerance.

## Riskiest assumptions validated  -> i16-m5-assumptions
Spike home: `<data-home>/spikes/i16-m5/` (throwaway, outside the repo). Four artifacts, four proofs (agent-run, 2026-07-09):
- **Probe 1 - the subset parses zero-dep: PASS.** `extract.go` (~100 lines, three regexes: subgraph, node declaration, labeled edge) read `model-engine-layers.mmd` - a REAL draft of the engine's structure (4 layers, 14 elements, 10 payload-labeled flows): `elements=14 layers=4 flows=10, semantic-hash=ddf001a8fcbdfb6f`. Fallback if FAIL was the JSON Canvas hybrid - not needed.
- **Probe 2 - cosmetic edits ripple nothing: PASS.** `variant-cosmetic.mmd` (comment added, two element lines reordered inside a layer) hashed **identically**: `ddf001a8fcbdfb6f`. The canonical form keeps layer ORDER (semantic) and sorts members and flows (order cosmetic) - Eigner's split, mechanically real.
- **Probe 3 - semantic edits ripple, ambiguity lints: PASS.** `variant-semantic.mmd` (one added flow) moved the hash: `9743456631b7cffc`. `variant-lint.mmd` (edge to an undeclared element, empty payload) produced both findings: `flow references undeclared "go-ghost" (TikZ discipline: declare before use)` and `flow without a payload label`, exit 2.
- **Probe 4 - the derived render carries the reading value: PASS (owner rules at this gate).** `render.go` produced `onion.svg` from the same text truth: four labeled concentric rings, elements dotted on their rings, flows drawn with their payload names - the arrows have NAMES now, which the i14 onion's arrows never did. First cut per the visuals law.

## Design is buildable  -> i16-m5-buildable
- The production extractor is the spike's shape hardened: same line grammar, plus BOM stripping and file-level errors. Small.
- The renderer path for M6 is the EXISTING i14 cytoscape onion re-pointed at model nodes - the spike SVG proves the graph suffices; the approved renderer already exists.
- The sky-fall and absence checks are id-set comparisons against design markers the engine already scans. No new machinery class.

## Spike results recorded, design advanced  -> i16-m5-results
- FINDING (M6 class-guard): a UTF-8 BOM at file start reads as beyond-subset syntax - the extractor must strip it (observed live: PowerShell-written variants; files from other tools will carry it too).
- FINDING (M6 design point): beyond-subset syntax should be a LINT FINDING that still parses the rest (the spike continues past it) - a whole-file refusal would let one stray line hide the model.
- ADVANCED: the canonical-form rule is now concrete - rank order preserved, member and flow order sorted - and goes verbatim into the extractor's design region.
- The spike model itself is a DRAFT: the real engine structure (the dogfood, incl. the no-flow judgment on today's infra grouping) is authored at M6 with the owner.

## Milestone review  -> i16-m5-gate

**Verify.** Every claim above has a runnable referent in the spike folder. The two hashes and the lint transcript are recorded verbatim. The SVG exists and derives from the same file the extractor hashed.

**Validate.** The spike answers exactly the M4 kill-criterion: derived renders from text models reproduce the onion's reading value, and the semantic hash behaves. The canvas-slot reopening clause stays dormant.

**Red-team.** Sharpest residue: the spike onion's LAYOUT is crude (angle-spread dots, crossing lines) - but layout quality was never the criterion. The approved i14 renderer owns layout, and the spike proves the DATA suffices. Second: the spike model's structure is my draft, not the owner's ruling - deliberately so. Authoring the real structure is M6 dogfood WITH the owner. The M4 tripwire (authoring comfort in anger) stays armed and untested until then - correctly so, M7 is its test.

**Verdict: PASS** - hand-off to the adjudicator for the combined killer + gate.
