---
id: raid-strip-types-flag-holds
type: "[[raid]]"
kind: assumption
statement: Node keeps --experimental-strip-types working as it does today, despite calling it experimental.
owner: the driving agent
trigger: on any Node major upgrade, and on any release note touching type stripping
status: closed
breaks_how_badly: fatal
how_likely: conceivable
probe: holds, and the premise is obsolete. Node's own docs give type stripping Stability 2 (Stable) as of v25.2.0 and v24.12.0, on by default since v23.6.0, with --no-strip-types as the opt-out. It is no lon
probed: 2026-08-07
impact: Nothing in the lane starts. Not one tool, not the mirror, not the tests — every engine entry point is TypeScript run directly on that flag.
breaks_how_badly: fatal
how_likely: conceivable
source_refs:
  - engine/bin/se-mcp.ts
  - engine/bin/preflight.ts
---

Every entry point is invoked as `node --experimental-strip-types`. The word
EXPERIMENTAL is Node's own, and it is a promise that can be withdrawn in a
minor release.

NOT ESTABLISHED: nobody has read Node's stability commitment for the flag, or
checked whether it is on a path to becoming the default.

NOT CONTROLLED: the runtime belongs to somebody else. Choosing to depend on it
was a DECISION; that it keeps working is the assumption resting on top.

## Probe

Read the Node documentation for `--experimental-strip-types` at the version in
use and check its stability index — experimental, stable, or legacy. Then read
the next major's release notes for any change to it.

The index is the check, not whether it currently runs. It currently runs by
definition, and that says nothing about next year.

A move to stable closes this. A deprecation notice turns it into an issue with
a known deadline, which is a far better place to be than finding out during an
upgrade.
