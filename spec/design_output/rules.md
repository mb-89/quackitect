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
