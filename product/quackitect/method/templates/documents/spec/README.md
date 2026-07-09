<!-- design: method-spec-template  implements: req-spec-template-set, req-example-content :: The spec template set: nine chapter manifests whose units open with a stable heading and carry a permanent fill comment (Contents/Motivation/Form/Sources + a machine-readable gating tag), a pre-seeded provenance mark, and a slot placeholder; the canned base queries ship beside them; start stubs instantiates the set into a bare workspace. Where a reader-facing view would otherwise render empty, the set ships a clearly-marked ex- example seed (statement opens EXAMPLE, body says delete me) the author replaces or deletes. -->
# the spec template — nine chapters that drive a specification

One manifest per chapter, content in notes, every projection deterministic.
The authored source is truth. Any assembled form is ephemeral.

## Fill order

- ch1 motivation first. Then ch3 design input. Then ch4 design output. Then ch5.
- ch0 and ch2 grow alongside — mostly derived, thin authored ledes.
- ch6 grows continuously. The ledger feeds it.
- ch7 collects rationales as they arise. ch8 is near-static.

## Scale to fit

- Derived units are always on. They cost nothing to author.
- The authored core is `[mandatory]` at every rigor.
- Skipping a mandatory unit is legal ONLY with a recorded reason. One line in the
  ch6 tailoring row. TBD recorded, never silent.
- `[judgment]` units: the drafting agent decides, the record shows it, the
  docs-complete review questions it.
- `[type: ...]` units apply to the named project types.
- The gating tag in each fill comment is the single source. This table derives
  from the tags, never beside them.

## Conventions

- Every authored unit opens with its `## heading`. The heading slug is the STABLE
  anchor rationale notes key to. Rename a heading and the lint flags its orphans.
- The fill comment is PERMANENT. The draft replaces only the slot. The comment
  stays in the source as authoring guidance and never renders.
- `{{slot}}` marks undrafted prose. The lint refuses a leftover slot in spec content.
- `<!-- ai:3 -->` ships pre-seeded. The draft is AI-written by default. Only user
  edits reduce the count.
- No unexplained abbreviations. Chapter titles spell everything out.
- Every enumeration is a markdown list. Items referencing files carry links.
- External links live ONLY in reference notes (`spec/references/`). The lint
  refuses them anywhere else.
- A fill comment's `Sources:` line links its reference notes:
  `<claim> @[[ref-...]]`. The notes live in `spec/references/`; the
  method-source set ships in `references/` beside the skeletons and
  instantiates with the stubs.
- Methods are notes (`spec/methods/`), routed by `applies_chapters` slugs.
  Chapters render "methods that apply here" — nothing hard-codes a method.
- Item shapes live in `../../items/` — one template per kind, fields declared
  with name, semantics, and value range.

## The queries

`queries/` ships the canned base views the chapters embed: the stakeholder
matrix, the needs register, the requirements register, the decision views, the
verification matrix, the assumption, RAID, ASR, and rationale views. Standard
Obsidian Bases syntax — the pinned subset — so the authoring preview works live
in Obsidian and the engine renders the same result.

Queries pool centrally. Every query lives as a `.base` file in `spec/queries/`,
and a manifest references it with the Obsidian embed `![[name.base]]` — or one
view of it with `![[name.base#View Name]]`. An inline ` ```base ` block in a
manifest is a smell — pool it and reference it.

Two pinned extensions carry the pull law into the queries:

- `referenced` — true only for items the rendered chapters link. Obsidian does
  not know the property, so a preview shows the superset; the book is the truth.
- `render: full` — the view renders sections with full note bodies instead of a
  table. Obsidian ignores the key and previews the same rows as a plain table.

The fundamentals and references lists (ch2, ch8) ride on both. Notation and the
glossary stay emitter-derived — their term anchors and first-use expansion live
in the emitter.
<!-- enddesign -->

<!-- design: method-methods-view  implements: req-methods-view :: Methods route themselves: a method note names its chapters in applies_chapters, and each chapter embeds its own view of the pooled methods.base - demand-driven, no chapter hard-codes a method. -->
Methods route by `applies_chapters`: each chapter embeds its view of
`queries/methods.base`; a method note names the chapters it serves.
<!-- enddesign -->

<!-- design: des-seed-examples  implements: req-seed-examples :: One ex- prefixed example note ships per otherwise-empty derived view (stakeholders, trace, usecases, raid, rules, guides, methods), and the dogfood spec seeds the reference flow end to end: fund-ai-involvement linked from ch8, ref-dora-genai linked from ch8 and the fundamental, meth-ears routed to design-input, a quality requirement with a scenario figure rendered at depth 2 in ch3. -->
Example notes (`ex-*.md`) ship beside the skeletons so no derived view opens
empty; delete each example when the first real item of its kind lands.
<!-- enddesign -->
