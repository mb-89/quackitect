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
fenced blocks and code spans, and Lint drops each finding a region covers at
its line and column.

| the marker | what it quiets |
|---|---|
| `<!-- vale <Style>.<Rule> = NO -->` | that rule, up to its `= YES` |
| `<!-- vale <Style> = NO -->` | every rule of the style, up to its `= YES` |
| `<!-- vale off -->` | every rule, up to `<!-- vale on -->` |

A region with no closing marker runs to the end of the file. The spelling
stays Vale's, so every standing marker holds as it is, and
`ExemptionCarriesAReason` reads the same marker.
