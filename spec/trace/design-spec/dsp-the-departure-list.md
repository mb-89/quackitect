---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: dsp-the-departure-list
type: "[[design-spec]]"
statement: The record of every module allowed past a door and why, carried by one markdown file a person edits, where a line without a reason cannot exist.
realizes:
  - el-departure-list
files:
  - deliverable/machines/doors.md
---

## Responsibility

It records which modules are allowed past which door, and why each one is.

THE REASON IS THE ENTRY, NOT METADATA ON IT. That is the single thing a six-system prior-art scan found nobody else doing, and it is what this file exists for.

### What it deliberately does not do

It holds no predicate and no rule. It names paths and reasons, and the rule module reads it.

It grants nothing by itself. A path here is allowed past a door only because the rule module reads this file, which means deleting the file removes every departure rather than removing every rule.

## Interface

One section per door, and inside each a marker comment followed by bullets.

```
## keeping-a-record-on-disk

<!-- departures below this line -->
- deliverable/engine/run.ts — every write is an append to a log it owns, jailed under .se/jobs by three module-local helpers
```

The shape is PATH, then a dash, then the reason.

### Any dash separates them

`deliverable/engine/widgets.ts:134` records why: demanding an em dash meant a person typing a hyphen got zero exemptions and no error to explain it. Inherited unchanged.

### It lives where a person can find it

Beside the other machine files a person edits, not inside the engine as a constant. A hatch nobody can find is the same as no hatch.

## Behavior and constraints

### A line with no reason cannot exist

This is the correction to the worked example. `deliverable/engine/widgets.ts:108` says a bullet with no reason is IGNORED, so a reasonless line sits in the file doing nothing and the module it names goes on being reported with no explanation.

`req-an-exemption-without-a-reason-is-refused-at-write-time` makes it a refusal at the write instead. The reader then knows every line carries a reason, because no other kind of line can get in.

### Absence means governed

`req-absence-from-the-exemption-list-means-not-exempt` binds this. A reader who does not find a module here must be able to conclude it was not allowed, rather than that nobody looked.

That is why the file is exhaustive per door rather than a sample.

### A missing file means no departures

Never a crash. The rule module has to answer even where nobody has written this file yet.

### It has no off-switch

`req-no-setting-disables-every-rule-at-once` binds the file as hard as the code. There is no section, marker or line that turns a door off — only per-module departures, each with its reason.

Rust ships `--cap-lints allow`, Bazel ships `--check_visibility=false` and dependency-cruiser ships `severity: "ignore"`. This file ships none of them, and adding one would undo everything above.

## Rationale

### Why a markdown file rather than a config format

The widget precedent is a markdown file and it works. A person edits it, a reviewer reads it, and the reason sits in prose where prose belongs.

A structured format would make the reason a field, and a field is metadata on an entry rather than the entry itself.

### What the list will actually hold on day one

`exp-does-one-rule-fit-all-four-conversations` measured it. The disk door's day-one list would name 81 of 178 governed modules, which is 45.5 percent against a falsification bar of more than half.

THE MARGIN IS EIGHT MODULES. A list that names most of what it governs has stopped governing, and this design sits eight modules from that line.

### What a long list actually means

`exp-can-a-reader-act-on-the-departures-the-tree-holds` found the one precedent this tree has. The widget list held 21 entries, the predicate was sharpened on 2026-08-23 from what the registry NAMES to what the panel REACHES, and the list fell to one.

SHARPENING THE PREDICATE COLLAPSED THE LIST BY TWENTY ENTRIES. So a list growing long is first evidence about the rule, and only then about the authors.
