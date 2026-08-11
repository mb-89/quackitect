---
id: uc-shape-the-view
type: "[[use-case]]"
statement: Sort, group, filter and reshape the table, and keep the whole shape on the view's own file.
actor: stk-engineer-driving-agents
trigger: the rows are all there and the question needs them in a different order
precondition: a view stands open
guarantee: the shape is written to the view file verbatim, and the next render reads it back identically
refines:
  - sty-work-the-register-as-a-table
priority: should
---

## Main scenario

1. The engineer sorts, groups or filters through the view's controls.
2. Each control write lands in the view's file, in the format other tools of the family read.
3. The render reads the file back and draws the new shape; the file is the query, verbatim.
4. A formula column evaluates per the expression reference, row by row.

## Extensions

- 1a. The asked shape is outside the vocabulary — an unknown layout, operator or view type. The engine refuses by name and lists what it accepts.
- 2a. The file was edited by hand into something that does not parse. The engine refuses the render in place and leaves the file alone.
- 4a. The formula is outside the expression language. It refuses with the offending position, never by hiding rows.
