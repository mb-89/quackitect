---
kind: [[rationale]]
explains: [[spec/guidance/code]]
---

# Why

Code and its comments drift apart, and only one of the two runs. A reader who
trusts a stale comment is worse off than one who reads the code.

## 1. No comment

A comment explaining what a line does repeats the line. A comment explaining why
it is there carries information the code cannot, and that information outlives
the line it sits beside.

So the why moves somewhere a reader looks for a decision, and the code keeps a
pointer to it. The pointer breaks loudly when the section goes, and a stale comment
keeps quiet.

## 3. Design output

A rationale explains a rule. A design output explains a thing this tree builds:
what it does, what it refuses, and why its shape is what it is.

Both take the same form. A section per subject, and a link from whatever the
section explains. The link resolves as a path first and then as a note name, so
`[[spec/design_output/level0#the-write-door]]` reaches one heading.
