---
id: req-lane-fixes-what-machines-fix
type: "[[requirement]]"
statement: When a write lands on a file the toolchain covers, the engine shall return the formatted and safe-fixed content with the changes named, and shall leave an uncovered file exactly as written.
kind: functional
verify_method: test
breaks_if_removed: The agent hand-formats or re-applies fixes over the fixer's work, and every write costs a second corrective call.
breaks_how_badly: corrosive
refines:
  - uc-take-a-step
source_refs:
  - reverse-engineered from tests/lintfix.test.ts
priority: should
---

## Detail

- The returned hash is the FIXED content, so the caller never writes from a stale copy.
- What the safe fixes cannot reach rides the result as findings, at the commit hook's own bar.
- The fixer's work is announced in the result, never silent.
