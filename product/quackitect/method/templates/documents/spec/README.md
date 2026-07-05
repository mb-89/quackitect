<!-- design: method-spec-template  implements: req-spec-template-set :: The spec template set: nine chapter manifests whose units open with a stable heading and carry a permanent fill comment (Contents/Motivation/Form/Sources + a machine-readable gating tag), a pre-seeded provenance mark, and a slot placeholder; the canned base queries ship beside them; start stubs instantiates the set into a bare workspace. -->
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
- Methods are notes (`spec/methods/`), routed by `applies_chapters` slugs.
  Chapters render "methods that apply here" — nothing hard-codes a method.
- Item shapes live in `../../items/` — one template per kind, fields declared
  with name, semantics, and value range.

## The queries

`queries/` ships the canned base views the chapters embed: the stakeholder
matrix, the needs register, the requirements register, the decision views, the
verification matrix. Standard Obsidian Bases syntax — the pinned subset — so the
authoring preview works live in Obsidian and the engine renders the same result.
<!-- enddesign -->
