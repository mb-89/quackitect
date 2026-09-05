---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: the kind not walked
status: closed
author: main
began:
  - 0ddbc80d9d524da66306a1495a344f5cd7338a49
ended:
  - 74c37370480e2827306c70d04e9c0682937f234a
disposition: dropped
reason: shapes_test.go and the walk it hardens are gone from src/engine, so the ask attaches to nothing. The disappearance is already on record at wk-6868ca3074.
---

## detail

The shape walk in src/engine/shapes_test.go is a switch on f.Type.Kind() with cases String, Struct, Slice and Map and no default arm. An exported field of any other kind is invisible to the walk, the table and the count. Adding WatchedBy, a map of string to slice of string, to Token in a copy keeps TestEveryFieldTheNoteWritesIsRead and TestTheTableAnswersForEveryFieldTheWalkReaches green. Give the switch a default that fails naming the field and its kind. Where a kind is out of scope, name it in an exclusions list beside the table with its reason, as readKind is named in util/checks/engine-spawns.mjs. Check, red today: add an exported field of an unwalked kind to Token in a copy and require the walk to name it. Related: wk-24be1c06ae.

## done when

- The shapes_test.go switch gains a default arm failing with field name and kind.
- In a copy, an unwalked-kind field on Token fails the walk naming it, seen red.
- Exclusions listed with reasons, and go test ./src/engine passes.

