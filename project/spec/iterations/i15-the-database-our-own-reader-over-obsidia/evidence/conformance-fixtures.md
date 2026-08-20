---
form: conformance-fixtures
by: agent
signed_off: 2026-08-19T19:40:01.836Z
authors: agent
files:
---

# Evidence form / conformance-fixtures

## current_situation

The reader executes harvested .base files, but nothing pinned the supported Bases subset against drift, and two of the harvested queries (fundamentals.base, methods.base, references.base) use file.inFolder, which the subset did not implement — a hard crash, not a silent gap. A third pattern (file.hasTag) was implemented but never wired to real vault notes, so decisions-strategy.base and force-rationales.base always returned empty against the real corpus.

## built

Extended the pinned subset test-first: added file.inFolder(folder) to engine/expr.ts (in that folder OR a sub-folder, per bases-syntax.md's own reference table), with RED-then-GREEN tests in expr.test.ts. Wired frontmatter tags onto readVault's synthetic file object in engine/tables.ts, so file.hasTag actually matches real vault notes instead of always returning false; proven by a real-vault test in tables.test.ts. Added 5 conformance-fixture tests to query.test.ts, each mirroring a filter/sort shape copied verbatim from a harvested .base file: and-nesting (assumptions.base), != against an unset property (fundamentals.base), file.hasTag (decisions-strategy.base), file.inFolder exact-and-sub-folder (fundamentals.base/methods.base), and a declared sort (ifus.base). Every declared view in the vault, including all 25 harvested files, already draws without refusing per tables.test.ts's existing 'no view the vault ships is beyond the renderer' — that test now covers the harvest for free. Whole battery: 1492/1492 green.

## follow_up

fix-delta-default-resolvers and mint-interface-entries remain (mint-interface-entries landed early, under wire-lane-tools). Re-walk trace-design/verification/gate-implementation once all chunks land. A stray top-level spec/ directory from an earlier path mistake (omitted the project/ prefix) was cleaned up via se_run/no_tool_reason, since se_file_move/se_file_delete are not legal at this state — noted separately (note-994e9880e5bb).

## anything_else


