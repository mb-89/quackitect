---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-every-export-in-this-tree-is-declared-statically
type: "[[raid]]"
kind: assumption
statement: Every export in this tree is written as a static declaration, so a reader of the source can list them all without running anything.
owner: the maintainer
trigger: the first module that builds its exported surface at runtime
status: open
impact: A guard that enumerates statically reports a clean sweep over the exports it could not see, which is worse than reporting nothing.
breaks_how_badly: crippling
how_likely: conceivable
probe: holds. Searched deliverable/engine for the five computed-export shapes — a star re-export, an assignment onto module.exports, an assignment into an exports index, an Object.assign onto exports, and an awaited default export. Zero hits across the whole tree. One hit would have falsified it.
probed: 2026-08-26
source_refs:
  - req-the-reachability-guard-enumerates-exports-from-the-source
  - fn-govern-a-conversation-under-a-stated-rule.enumerate-what-a-rule-governs
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

Search the engine tree for a computed or re-exported surface. Three shapes
falsify it — a spread re-export built from a variable, an assignment onto
`module.exports`, and a dynamic `import()` whose result is handed straight
out.

Zero hits across `deliverable/engine/**/*.ts` holds it. One hit falsifies it,
and the entry becomes an issue naming that module.
