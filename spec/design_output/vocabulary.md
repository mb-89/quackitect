---
kind: [[design_output]]
---

# Scope

`spec/vocabulary` holds the words a paragraph writes, and
`.claude/skills/level0/lib/vocabulary.js` reads them into the one rule the
projection writes. This note covers the lists, the rule, the refusal and
the retro's part.

# The vocabulary is three lists

A word whitelist holds where a writer can learn it, so the list follows the
shape ASD-STE100 gives it. That shape is a fixed core of plain words, technical
terms the writer defines, and nothing else.

| list | holds | who writes it |
|---|---|---|
| `core.yml` | the words the standard approves, the openste seed, and the 20000 most common English words | a script, and nobody by hand |
| `terms.yml` | this tree's own words, each with one line that says what it means | a person, or a session that needs the word |
| `swaps.yml` | a refused word and the core word to write in its place | a person, and the retro |

The dictionary is the source of what a term means. A term carries `means`, one
line in core words and other terms, and the check `looseMeanings` holds every
word of it to the lists. A term citing a standard, a paper or a tool outside the
tree names its address under `source`.

A note points at a term, and a term points at no note in the tree. The shape
rule over `terms.yml` refuses `defines` and a link in a term, and a term with no
`means`. So a session adds no word because it wants one. It writes a core word,
or it adds the term with the line that says what it means.

# The rule matches a stem

The projection inlines the words and the swaps into `Vocabulary.yml`, and the
rule reads a paragraph one word at a time. `spec/config/stems.yaml` holds the
endings and the prefixes a listed word takes, under the key `endings` of the
vocabulary layer. The rule, the check over a `means` line and the hover each
read that one table, and its cases drive a test in each tool chain.

| the word | stands |
|---|---|
| a listed word | yes |
| an ending the table names on one | yes |
| a prefix the table names on one | yes |
| a code span, a link, a path, a digit or a one-letter token | outside the layer |
| a capital past the first word of a sentence | a name, outside the layer |
| a prefix of two letters on a hyphen | outside the layer |

# A refusal names the road

1. The door refuses a paragraph and names every word outside the lists.
2. Where a swap names the word, the refusal hands the writer the core word.
3. Where none does, the refusal names `terms.yml` and the line a term wants.

# The slug reads one source

A pointer names a note and a chapter in it, and the slug turns that heading
into the anchor the pointer carries. `spec/config/slug.yaml` holds the cases the slug
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
keeps holds its line, and a term it drops turns into a swap nobody writes past.

# A list write re-projects

The lists are sources of the paragraph rules, so a write to one marks the rule
stale, and the next tool call projects it again. The write after that reads the
new rule.
