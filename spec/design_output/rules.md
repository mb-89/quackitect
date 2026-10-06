---
kind: [[design_output]]
---

# Scope

`src/rules` holds every prose rule in Go: the scoping by path, the text model over a file, and the rules themselves. This note covers how a rule meets a file.

# A rule reads its paths

`sections` in `src/rules/scope.go` holds the scoping, one row a glob, in the
order a path meets them.

| what a row holds | what it does |
|---|---|
| `glob` | matches the path from the root, with a star crossing a folder |
| `based` | names the styles every rule of which reads the path, where the row names any |
| `turns` | turns one rule on or off by its style and name |

Each matching row speaks in order, and the last word on a rule wins. A row
naming an empty base turns every rule off, so a draft under a leading
underscore reads none.

# A marker quiets a rule

`quietOf` in `src/rules/exempt.go` reads the markers off the raw text, past
code blocks and code spans. Lint drops each finding a region covers at its
line and column.

| the marker | what it quiets |
|---|---|
| `<!-- vale <Style>.<Rule> = NO -->` | that rule, up to its `= YES` |
| `<!-- vale <Style> = NO -->` | every rule of the style, up to its `= YES` |
| `<!-- vale off -->` | every rule, up to `<!-- vale on -->` |

A region with no closing marker runs to the end of the file. The spelling
stays Vale's, so every standing marker holds as it is, and
`ExemptionCarriesAReason` reads the same marker.

# A script answers offsets

Each rule a style holds as `extends: script` runs as a Go function over the
raw text, in place of its Tengo script. `src/rules/script.go` holds the
contract.

| the part | what it does |
|---|---|
| `scriptMaker` | reads what the rule needs past the file once, at Load |
| `script` | takes the path and the raw text, and answers its matches |
| `scriptMatch` | holds byte offsets, the end past the last byte, and an optional message |

A message names `%s` where the match goes, and the rule's own message stands
where the match names none. Lint places a match at the line of its begin,
with a span counted in runes from one, holding both ends.

| the file | the styles its makers serve |
|---|---|
| `scripts_paragraph.go` | VoiceParagraph, reading `spec/schemas/paragraph.schema.yaml` |
| `scripts_voice.go` | VoiceVale, VoiceShape and VoiceScript |

# Load reads the rule files

`ruleFiles` in `src/rules/load.go` names every rule file under
`spec/config/styles`, and `TestTheRuleTableNamesEveryStyleFile` holds it to
the folder. Load reads each through its `Read`, and yaml.v3 parses it.

| the kind | what Load does with it |
|---|---|
| `script` | calls its maker once, off the check id |
| `existence`, `substitution`, `occurrence`, `sequence` | compiles it into a token rule |

The YAML stays each rule's data: message, level, link, scope, tokens, swap,
exceptions, action, max and token.

# The text model

The model ports Vale 3.20.0 under its MIT licence, and splits a file into
blocks by its extension.

| the file | its blocks |
|---|---|
| `.go`, `.js`, `.ts`, `.tsx` | each comment in place, its markers blanked, a run of line comments read as one |
| `.txt` | the whole text as prose |
| any other | markdown: each front matter string, then the markdown parser's HTML block by block |

A markdown block holds its text under a mask over inline code. It stands in
the source by its offset, else by the runs of its text read verbatim. A paragraph
splits into its paragraphs and sentences, and a list item, a heading or a cell
into its sentences alone. A rule reads a block whose scope holds every section
it names, and a sentence block only where it names the sentence.

A match stands at its source offset. Where neither offset nor run places it,
Lint searches it from the block's first run. The search passes the copies
before it and any copy pressed against inline markup.

# The token kinds

`src/rules/kinds.go` and `src/rules/sequence.go` port Vale's kinds over
regexp2, so a pattern looking behind its match compiles.

| the kind | what it answers |
|---|---|
| existence | each match of its tokens, past its exceptions |
| substitution | each swap's match with its offer filled from the match |
| occurrence | its first match where the count passes its max or falls short of its min |
| sequence | each run of tagged words, past a match opening inside an exception |

A sequence reads sentences alone, tagged by `github.com/jdkato/prose/v3`.

# A finding carries its fix

A finding holds `Action` where its rule names one, in Vale's shape: `Name`,
and `Params` with each offer. A substitution under `action: replace` fills
`Params` from its swap, and a finding of any other rule leaves `Action` out.
