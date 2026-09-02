---
id: wk-474dbfc60f
seq: 1000068
type: work
title: schemas and processes
status: backlogged
assignee: main
scope: multi-step
traced: true
minted_by: cowork
---

## detail

Two authored files per kind, nothing generated, each naming the documentation of its language in a top comment. src/schemas/<kind>.schema.yaml, JSON Schema 2020-12, holds fields, a hand-written enum, and every rule that reads one note as it stands. src/processes/<name>.process.yaml holds steps, hand-overs and every rule about a move, in CEL with oldSelf as Kubernetes does. A validator on imp_in_work to imp_submitted refuses a submission with a finding unanswered, and one check goes both ways between schema enums and process steps. The LSP picks the schema by the frontmatter kind, not by path, narrows values to those reachable from the current step, and never offers status. Owner decided the shape and put Level 1 being usable first, so this waits on that.
