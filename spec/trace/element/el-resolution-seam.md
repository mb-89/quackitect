---
unreachable_refs:
  - cand-core-satellite
minted_in: i27
id: el-resolution-seam
type: "[[element]]"
statement: The one place a path is resolved and judged, which no verb may go around.
kind: new
realization: make
group: the-walk
implements:
  - fn-run-a-governed-walk.resolve-a-path
satisfies:
  - req-a-surface-resolves-to-what-it-shows
  - req-version-control-resolves-like-every-call
  - req-a-read-comes-from-where-it-is-meant
  - req-a-write-lands-where-it-is-meant
  - req-a-wrong-act-never-passes-silently
  - req-trace-source-never-mixes
  - req-a-resolution-is-proven-by-read-back
source_refs:
  - cand-core-satellite
  - opt-one-resolution-seam-not-a-rule-per-tool
  - opt-refuse-an-ambiguous-path-by-default
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
---

One seam, inside the core and inside every satellite, doing the same three
things everywhere.

## Resolve

Work out which store the path names, from the process's own root and the
call's own arguments.

## Refuse

Compare the resolved path against the record it belongs to and refuse anything
falling outside, rather than letting the platform serve it.

That is the hole [[cand-os-rooted]] admits it leaves open, and this element
closes it.

## Say

Carry the resolved store on the answer, so a wrong resolution is visible at
the call rather than at a merge.

## Routing is not resolution

This distinction is the element's most important rule.

- A path that RESOLVES outside its record is refused. That is a
  misresolution.
- A call naming trunk names a different OWNER and is routed to the core. That
  is a routing decision.

## How a write is proved

A WRITE IS PROVED BY READING BACK from the store the caller named, never by
the call's own verdict.

## What it leans on

That the seam cannot be walked around. It is the class every candidate on the
chart leaned on.

The i8 field report of 2026-08-12 records that bypass being used against a
guard covering five verbs and not the shell. A satellite's shell is a child of
the satellite and inherits its working directory, which closes that instance
and not the class.

## Boundary

Every lane verb calls it and none may bypass it.
