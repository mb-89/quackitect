---
kind: [[design_output]]
---

# Scope

`spec/vocabulary` holds the words a paragraph writes, and
`.claude/skills/level0/lib/vocabulary.js` reads them into the one rule the
projection writes. This note covers the three lists, the rule, the refusal and
the retro's part.

# The vocabulary is three lists

A word whitelist holds where a writer can learn it, so the list follows the
shape ASD-STE100 gives it. That shape is a fixed core of plain words, technical
terms the writer defines, and nothing else.

| list | holds | who writes it |
|---|---|---|
| `core.yml` | the words the standard approves, the openste seed, and the 20000 most common English words | a script, and nobody by hand |
| `terms.yml` | this tree's own words, each with the note that defines it | a person, or a session together with the note |
| `swaps.yml` | a refused word and the core word to write in its place | a person, and the retro |

A term with no defining note is jargon, and the shape rule over `terms.yml`
refuses the entry. So a session adds no word because it wants one. It writes a
core word, or it writes the note first and adds the term with the link.

# The rule matches a stem

The projection inlines the words and the swaps into `Vocabulary.yml`, and the
rule reads a paragraph one word at a time.

| the word | stands |
|---|---|
| a listed word | yes |
| a plural, a past form or an `-ing` form of one | yes |
| `un`, `re`, `mis`, `out`, `over`, `non`, `pre` or `sub` on one | yes |
| a code span, a link, a path, a digit or a one-letter token | outside the layer |
| a capital past the first word of a sentence | a name, outside the layer |
| a prefix of two letters on a hyphen | outside the layer |

# A refusal names the road

1. The door refuses a paragraph and names every word outside the lists.
2. Where a swap names the word, the refusal hands the writer the core word.
3. Where none does, the refusal names `terms.yml` and the note it wants.

# The slug reads one source

A term names a note and a chapter in it, and the slug turns that heading into
the anchor the term carries. `spec/config/slug.yaml` holds the cases the slug
answers, and each tool chain drives its own function off them. The moves run in
this order:

- `'` drops, and so does the mark a code span opens with
- the rest lowers
- every other run turns into one dash
- a dash at each end goes

The one this tree writes in JavaScript stands in
`.claude/skills/level0/lib/slug.js`, and the cases in
`test/contract/vocabulary.test.js` drive it. A tool chain importing none of that
carries a copy of the function, with its reason beside it, and drives the same
cases. So a drift turns a suite red where it stands.

# A swap wins

A swap wins over every list, so a word the tree refuses for good stands in
`swaps.yml` with its replacement. The writer meets that replacement until the
prose takes it.

# The retro moves a term

The retro reads the terms new since the last one, keeps each, or moves it to
the swaps with the word to write instead. So the lists settle: a term the tree
keeps holds its note, and a term it drops turns into a swap nobody writes past.

# A list write re-projects

The lists are sources of the paragraph rules, so a write to one marks the rule
stale, and the next tool call projects it again. The write after that reads the
new rule.
