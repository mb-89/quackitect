---
kind: form-template
name: refs
statement: a list of REFERENCES to standing artifacts — one id per line, and every one must resolve
editor: list
resolves: artifact
line_pattern: ^- \[?\[?[A-Za-z0-9_./\\-]+\]?\]?$|^- none\b
line_help: one {type} per line — its path, its file name, its id, or a wiki link; all four resolve
placeholder: path from the project root, e.g. {folder}/{prefix}something.md
description: one {type} REFERENCE per line — every one must resolve to a standing node of that type, and `none` is a legal answer
---

# refs

The field points AT artifacts; it never contains them. One id per line.

That split is the whole point. The artifact is a standing node with its own
file, its own template and its own life — it outlives the iteration that
authored it and a later record may change it. A form that copied the prose
would fork the truth, and only one fork would ever get updated.

- One reference per line. EVERY REFERENCE MUST RESOLVE. A line pointing at no
  file is a defect the gate refuses, not a warning it prints.
- An empty list is a claim as well: one line saying `none`.

## Four ways to write one line, all accepted

A person writing a reference has the file in front of them. There are four
honest ways to name it, and refusing three teaches nothing.

- The path from the project root: `- project/spec/trace/neighbour/nbr-obsidian.md`
- The same path with backslashes, which is what Windows copies.
- Just the file name: `- nbr-obsidian.md`
- The bare id, or a wiki link: `- nbr-obsidian` or `- [[nbr-obsidian]]`

A path reduces to its LAST SEGMENT with `.md` dropped, because the file name is
the id everywhere in the trace. So a unique file name resolves whether or not
the folders above it were typed right.

What stays strict is the node itself. It must exist, carry the asked-for type,
and answer its own template.

The reviewing gate follows each reference and reviews the ARTIFACT. So a
reference is not a summary and never needs to be — whatever the reader
should know belongs in the node.

## The type is checked, not assumed

A field using this template may name the kind of node it accepts, with `of:`.

```
- name: value_props
  template: refs
  of: value-prop
```

Then four things are checked mechanically, and each one refuses:

- Every line is a reference.
- Every reference resolves to a node that exists.
- Every resolved node declares that type.
- Every resolved node ANSWERS its own template.

The last one is the one a reader would not think to ask for. A file can exist,
carry the right type, and still be a skeleton with its TODOs in place. The gate
would follow the reference and review a hole.

What "answers its template" means is read from the template itself: the id
prefix it declares, the frontmatter keys its mint skeleton writes, and the body
sections it lists. Nothing is declared twice.

A node declares its type as a LINK to the template that governs it —
`type: "[[value-prop]]"`, pointing at `machines/items/value-prop.md`. So the
reader is one hop from the rules, and the check is a string compare.

Without `of:`, any typed node resolves. Naming a type with no item template is
refused too, because the gate would have nothing to review against.

## The field says nothing this template already says

The placeholder, the line help and the description above are written HERE, once,
with `{type}` and `{prefix}` standing in for whatever the field accepts. The
engine expands them per field, from that field's own `of:`.

So a `refs` field whose type is `neighbour` shows `nbr-some-neighbour` in its
empty row, and the reader is one click from the neighbour template. Nothing was
copied and nothing can go stale.

A field writes a `description` only for what is ITS OWN — which neighbours,
whose value props, why this list exists here. The mechanics are never repeated.
