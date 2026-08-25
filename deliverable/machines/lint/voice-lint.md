---
long_sentence_words: 28
wall_paragraph_lines: 8
comma_chain_items: 3
comma_chain_min_item_words: 2
dash_chain_items: 3
pyramid_paragraphs: 5
blocking:
  - wall
---

# Voice lint — the rule parameters

DATA, not code (owner ruling 2026-07-28 — the rule lives in
guidance/method/engineering.md). Edit a threshold here and the next
se_lint call uses it — no recompile, no reload. The rules' LOGIC lives
in deliverable/engine/lint.ts; only parameters belong here.

- `long_sentence_words` — a sentence past this many words is flagged.
- `wall_paragraph_lines` — this many consecutive unbroken prose lines
  are a wall.
- `comma_chain_items` — a sentence chaining more than this many
  comma-separated parts is an unrendered list.
  A part that is ENTIRELY a code span or a quoted string does not count
  toward the chain. Naming the shapes a canvas accepts is reference, not
  a buried list, and nobody wants `pill` on its own bullet.
- `comma_chain_min_item_words` — a part must carry at least this many
  words to count toward the chain. An enumeration of bare NAMES is
  reference; an enumeration of THOUGHTS is the buried list this rule
  exists to catch.
- `dash_chain_items` — a sentence hinged on more than this many
  dash-separated parts is a run-on. One dash sets off an aside and is
  never flagged.
- `sentence_run_items` — a prose paragraph of more than this many SHORT
  sentences is a list nobody rendered.
- `run_sentence_words` — what counts as short, for that rule. Ordinary
  prose runs long and varied; a buried list runs short and parallel.
- `item_sentences` — a list item carrying more than this many sentences
  grew past one thought and wants splitting.
- `pyramid_paragraphs` — a document with this many paragraphs and no
  headings wants the pyramid shape.
- `blocking` — which rules REFUSE a form submit. Everything else is
  reported beside the form and lets the submit through.

## WHICH RULES BITE IS DATA, and this is where you set it

The voice lint runs at every form submit. What it does with a finding is
this list's decision, not the engine's.

A rule NAMED here refuses the submit, and the refusal quotes the line.
A rule not named here is reported and does not stop anybody.

`wall` IS THE DEFAULT AND THE ONLY ONE, because it is already law
everywhere else: SE-C-125 refuses a wall of prose at the lane, and a
renderer cannot invent the paragraphs an author did not write. Adding it
here makes one rule behave the same way in both places.

WHY THE OTHERS ARE NOT ON IT BY DEFAULT. A gate that can only say yes
teaches people to skim, and so does one that says no about a comma. Start
with the rule that is already binding, watch what the reports say, and add
the next one deliberately.

The names are the rules' own: `wall`, `long-sentence`, `comma-chain`,
`dash-chain`, `sentence-run`, `item-grew`, `pyramid`, `external-link`.

## Why the last three exist

The chain rules count separators INSIDE one sentence. So the way past them
is a full stop, and the same buried list gets written as "Open it. Read it.
Fill both cells."

That evasion ran three times in one afternoon, each time after
the author had been told. List items were not linted at all, so a bullet
carrying three sentences met no rule either.

A rule an author walks around by changing punctuation is an advisory. An
advisory is not a rule.
