---
template: item-reference
artifact: note
applies_rigor: [lean, systematic]
applies_type: [default]
---
# reference — one external source, wrapped

Lives in `spec/references/` — the ONLY legal home for an external link (the lint
refuses URLs anywhere else). The body links the note; the fundamentals chapter
derives the list, normative apart from informative. Id prefix `ref-`.

## Fields
- `title` (citation string): the source's name as cited.
- `url` (https URL): the external link. Nowhere else.
- `kind` (normative | informative): normative BINDS this project; informative is background.
- `version` (edition/year string): the pin. An unpinned normative reference floats — avoid.
- `accessed` (YYYY-MM-DD): when the link was last verified.
- `aliases` (list of phrases): names the auto-link pass resolves (e.g. "25010").

## Body
Prose on the source: what it is, why this project leans on it, which parts matter.

```
---
title: {{title}}
url: {{url}}
kind: informative
version: {{version}}
accessed: {{date}}
aliases: [{{alias}}]
---
{{annotation}}
```
