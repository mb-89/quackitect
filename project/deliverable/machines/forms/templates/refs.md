---
kind: form-template
name: refs
statement: a list of REFERENCES to standing artifacts — one id per line, and every one must resolve
editor: list
resolves: artifact
line_pattern: "^- \\[?\\[?[a-z][a-z0-9]*-[a-z0-9-]+\\]?\\]?$|^- none\\b"
line_help: one artifact id per line, as a dash and the id — a wiki link is fine
placeholder: "vp-some-value-prop"
---

# refs

The field points AT artifacts; it never contains them. One id per line.

That split is the whole point. The artifact is a standing node with its own
file, its own template and its own life — it outlives the iteration that
authored it and a later record may change it. A form that copied the prose
would fork the truth, and only one fork would ever get updated.

- One id per line, written `- vp-something`. A wiki link resolves too.
- EVERY REFERENCE MUST RESOLVE. An id pointing at no file is a defect the
  gate refuses, not a warning it prints.
- An empty list is a claim as well: one line saying `none`.

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
