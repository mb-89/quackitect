---
template: item-term
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# term — one glossary or notation entry

Lives in `spec/glossary/`. One note per thing, prose welcome. The book renders
used terms only (the pull law); the auto-link pass links plain-text mentions.

## Fields
- `term` (short noun phrase): the display name. One term, one meaning — never reuse.
- `long` (phrase): the expanded form; first linked use per chapter expands to it.
- `class` (glossary | notation | meta): notation = symbols; meta = quarantined to guidance.
- `aliases` (list of phrases): every name the auto-link pass and Obsidian resolve.
- `unit` (SI unit string, notation only): symbols carry their unit.

## Body
The definition. Short sentences. Define, do not describe usage.

```
---
term: {{term}}
long: {{long-form}}
class: glossary
aliases: [{{alias}}]
---
{{definition}}
```
