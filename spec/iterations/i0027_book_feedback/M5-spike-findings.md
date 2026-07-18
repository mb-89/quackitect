# M5 - Spike findings (i0027_book_feedback, systematic)

TL;DR: Both riskiest assumptions validated by direct probes of the live machinery. The axis-1 kill-criterion does NOT fire: adr-onion-extend stands. One bounded defect found and recorded for the build.

## Riskiest assumptions validated  -> i27-m5-riskiest-assumptions-validated

**Spike 1 - can the old bus-bar layout host the new onion spec?** VALIDATED, mostly already built:

- Enterable coreless cluster interiors with TOP input bars and BOTTOM output bars EXIST (the level-2 cluster box, go-onion-busbar): "The cluster's own INPUT bars sit on top, OUTPUT bars on the bottom."
- Identified lanes EXIST: a drilled cluster re-presents exactly the bars it tapped, and sibling edges become named "from <sibling>" bars.
- The owner's click semantics EXIST: single-click inspects, double-click enters; drills push history entries so BACK returns (the book script, req-interactive-figures.2).
- The probe: `quack render model-engine-layers` produced 34 pre-rendered views, 139 drill targets, 178 inspectable blocks, 330 bus pills from today's machinery.
- The DELTAS are geometry and data-source changes inside the same deterministic layout, not architecture: re-orient the BAND view's buses from left/right rails to top/bottom bars; apply the side-placement rule (feeds-core left, fed-by-core right); feed clusters from DSM grouping instead of file themes (the layout input struct already parametrizes grouping via relOf); add the boilerplate fold over the existing infrastructure pills.
- Nuance found: the STANDALONE review page's script lacks the history navigation the book script has; the build unifies them.

**Spike 2 - does a figure stay interactive at half-width inside a slide?** VALIDATED with one bounded defect:

- Handler binding is instance-scoped by data-attributes over every `.onion` host at load, deck copies included - interactivity attaches in copies.
- THE DEFECT: the drill target resolves via getElementById, while deck copies slide-prefix their ids. Drilling inside a slide copy would toggle the ORIGINAL chapter's figure, not the copy. Bounded, local fix: resolve the drill target WITHIN the host (a host-scoped query), recorded for the build.
- Half-width layout itself is unproblematic: the SVG scales in its container, and zoom or pan are host-scoped already.

## Design is buildable  -> i27-m5-design-is-buildable

The M4 architecture builds on machinery whose relevant behaviors were probed live above. The two data gaps the Pugh format needs (weight field, datum field) ride existing parse lanes. The function-node type follows the established node-type pattern. No candidate requires machinery that does not exist.

## Spike results recorded  -> i27-m5-spike-results-recorded

- The axis-1 tripwire does NOT fire; adr-onion-extend stands with evidence.
- adr-slide-figref stands; its build inherits the host-scoped drill-target fix.
- Design input recorded: the standalone page unifies onto the book script; the deck-copy drill fix lands with req-ifu-split-slide's build.

## Milestone review  -> i27-m5-gate

**Verify.** Both assumptions carry live-probe evidence: cited design regions, cited script behaviors, and a rendered artifact with counted mechanics. **Validate.** The spikes answered exactly the two kill-criteria M4 recorded; nothing else was probed, nothing was built. **Red-team.** The strongest counter: code-reading is not execution - the probes counted mechanisms in rendered output but no cluster interior was exercised end-to-end with the NEW top/bottom band geometry. Held honestly: the geometry re-orientation is the build's first step, and the M6 verification battery is the executable proof; the spike's job was the architecture question, and the architecture question is answered by machinery that demonstrably exists. **Verdict: PASS proposed.**
