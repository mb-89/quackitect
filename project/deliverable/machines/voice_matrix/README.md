# The voice matrix

Which writing rules bind which kind of text, and how hard. This folder is
the single source: `se_lint` reads it live, so changing a cell changes the
lint with no recompile.

## The shape

ONE FILE PER ROW. A row is a rule set. The columns are FLAT FRONTMATTER
KEYS on that file, so a Bases view edits the whole grid like a spreadsheet
and the edits land back in the files.

This is not the rigor matrix's shape, and the difference is the weight of a
cell. A rigor cell carries tailored guidance, an evidence form, and a
reason when a step is struck. A voice cell carries one word. A file per
voice cell would be seventy files each holding a word.

## The columns — content kinds, shortest to longest

- `brief` — one line, 90 characters, a decision-graph entry
- `refusal` — clause, expected, got, remedy
- `note` — a captured stray
- `answer` — a reply to a person, recorded with se_answer
- `guidance` — state guidance, tool descriptions, form fields
- `record` — an expedition or iteration record and its report
- `document` — the book, method cards, guidance chapters

## The cell — how hard, and when

`<how hard>@<when>`, or `none` where the rule does not apply.

HOW HARD reuses MoSCoW, the same ladder notes and requirements use. One
importance vocabulary, not three.

- `must` — the write is refused
- `should` — reported, and the writer decides
- `could` — reported only in a sweep

WHEN says where the check runs, and it exists because cost scales with
length — which is the column axis.

- `write` — on every file write, and single-digit milliseconds
- `review` — in a sweep, where a slower check can earn its keep

So `must@write` refuses immediately. `should@review` reports at a sweep.
A dictionary check is cheap on a brief and a review job on a document, and
that is why WHEN could not be a property of the row.

## Footnotes

A cell that needs more than one word carries it in the row's body, under a
heading naming the column. The frontmatter stays scalar so Obsidian can
edit it; the prose lives where prose belongs.

## The tiers, and why they decide WHEN

- Tier one needs no language processing. Sub-millisecond, so `write`. It
  covers the dictionary lookup and every structural check we already have.
- Tier two needs a part-of-speech tagger: active voice, tense, one part of
  speech per word. Real work per sentence, so `review`.

## The comment channel

A `comment` key in a row's frontmatter is the owner's OPEN REVIEW CHANNEL,
as in the rigor matrix. An agent may work a comment in. An agent may not
delete the field until the owner says the round is done.
