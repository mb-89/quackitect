---
long_sentence_words: 28
wall_paragraph_lines: 8
comma_chain_items: 3
dash_chain_items: 3
pyramid_paragraphs: 5
---

# Voice lint — the rule parameters

DATA, not code (owner ruling 2026-07-28 — the rule lives in
guidance/method/engineering.md). Edit a threshold here and the next
se_lint call uses it — no recompile, no reload. The rules' LOGIC lives
in engine/lint.ts; only parameters belong here.

- `long_sentence_words` — a sentence past this many words is flagged.
- `wall_paragraph_lines` — this many consecutive unbroken prose lines
  are a wall.
- `comma_chain_items` — a sentence chaining more than this many
  comma-separated parts is an unrendered list.
  A part that is ENTIRELY a code span or a quoted string does not count
  toward the chain. Naming the shapes a canvas accepts is reference, not
  a buried list, and nobody wants `pill` on its own bullet.
- `dash_chain_items` — a sentence hinged on more than this many
  dash-separated parts is a run-on. One dash sets off an aside and is
  never flagged.
- `pyramid_paragraphs` — a document with this many paragraphs and no
  headings wants the pyramid shape.
