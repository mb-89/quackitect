<!-- design: method-ai-drafting  implements: req-ai-provenance.1 :: The drafting method: the AI writes every first draft of book prose FROM injected context (the manifest's referenced nodes, the glossary terms, the audience row, the voice) and stamps every prose unit with its involvement mark at write time; unmarked prose has no path into the book (the emitter refuses it); later touches adjust the mark on the surface-versus-core line. -->
# draft — how book prose gets written

The AI writes every first draft. The user improves it. No exceptions, no unmarked prose.

## Before drafting: load the context (starved context is the failure mode)

1. The manifest unit's referenced nodes, at their declared depth. The draft explains THEM, never free-associates.
2. The glossary terms the passage will touch. Use the canonical name. Link the first use.
3. The audience row for the chapter (the stakeholder matrix): register, depth, detail bound.
4. The voice (`product/brand/voice.md`). Every rule binds: sentences, lists, figures, AI involvement.

## Draft

- Lede first: two to four sentences with the big idea. The what and the why before any detail.
- Big ideas first, details later. A non-native professional of average competence must land it.
- Prefer a figure where it transports better. Author it as inline SVG or ASCII (machine-readable).
- Meta-quarantine: chapters one to six speak only about the system. Process talk goes to the agent guide.
- Queries pool centrally. A table view is a `.base` file in `spec/queries/`, referenced with `![[name.base]]`. Never author an inline base block in a manifest.
- Sources are notes. A claim that leans on an external source links its `ref-` note in `spec/references/`. A source without a note gets one first. A raw URL outside a reference note is refused by the lint.

## Render laws (owner law - the renderer enforces them; author accordingly)

- Table vs prose is DETERMINISTIC. A homogeneous set of typed nodes renders as a TABLE, decided by the renderer from node data - never by how the prose was authored. Never hand-author a node set into prose: put it in nodes and embed the `.base` view.
- Statement renders ONCE. The table row carries the brief; the expand shows only what the row does not show. Never restate a node's statement at the top of its body.
- Section numbers derive at render time from the book structure. Never author numbers into headings.
- Links, never copies. Where a passage shows another node, link it (name + brief into the details panel). Duplicated content is a defect, not emphasis.

## Mark (the involvement stamp - structural, at write time)

Every prose unit opens with its mark, on its own line, immediately above the paragraph:

    <!-- ai:3 -->

- `ai:3` - fully AI-generated (the normal first-draft state).
- `ai:2` - AI-shaped: a real partial rework of the core.
- `ai:1` - the user's text, slightly AI-touched.
- `ai:0` - purely the user's own words. Explicit, so that "unmarked" never means anything.
- A unit WITHOUT a mark is refused by the emitter. There is no unmarked path.

## Touching existing prose (the surface-versus-core line)

- Surface touch - typos, wording polish, added links, small annotations that leave the core intact: the mark stays.
- Core touch - meaning, structure, or claims change: raise the mark to the real AI share.
- Full re-draft: back to `ai:3`.
- In doubt, lean higher. The mark change rides in the same diff as the edit - the owner corrects it like content.
- Only the user reduces marks. The AI never lowers its own number.
<!-- enddesign -->
