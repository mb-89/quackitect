---
id: wk-dbfb8efd7a
seq: 84
type: work
title: any is not every
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "Obsolete as a token, the class is written in doc/guidance/specifying.md and the instance on wk-8573243384 is fixed in its redraft."
aborted_from: backlogged
minted_by: reviewer6
---

## detail

A command that names every member of a set and does not walk it, because the tool's exit code is about any and not every. rg -q PATTERN a.md b.md c.md exits zero when one of the three matches. Found on wk-8573243384, whose fourth criterion greps the three projected guidance files in one rg. Run every command criterion against a case that ought to fail before agreeing it. Where a tool ORs, write the loop yourself, `for f in a.md b.md c.md; do rg -q PATTERN "$f" || exit 1; done`, and say in the criterion that it fails on the first miss. Related: wk-10d3cf13cd, wk-8573243384.
