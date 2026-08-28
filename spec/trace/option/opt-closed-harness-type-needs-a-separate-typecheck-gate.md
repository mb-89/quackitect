---
minted_in: i36
id: opt-closed-harness-type-needs-a-separate-typecheck-gate
type: "[[option]]"
statement: A closed harness type only makes a missing case illegal if something runs the type checker separately from execution; on this runtime, a missing switch case falls through silently at run time.
cluster: cluster-the-arrival
found_by: probe
source: 'Probed 2026-08-19: scratchpad/probe-harness-type-exhaustiveness.ts, a discriminated union with one case ("cursor") deliberately left unhandled, run with `node <file>.ts` (no flag). Exit 0, stdout "fell through" — the missing case did not error. deliverable/package.json carries no tsc or typecheck script, confirmed by search.'
---

## Mechanism

The engine runs every script as `node <file>.ts` with no flag, which is
Node's native type-STRIPPING mode: types are erased before execution and
never checked. A `switch` over a closed union that omits a case compiles
to ordinary JavaScript that falls through, exactly as it would with a bare
string.

WHAT THE PROBE SHOWS. `opt-closed-harness-type-with-explicit-unknown`'s
"illegal unrepresentable" property is real only where a SEPARATE type-check
step runs — `tsc --noEmit`, an editor, or a CI gate — never from execution
alone on this runtime.

WHAT TO DO WITH IT. Adopting the closed-type option is still worth doing
for the editor-time and review-time safety it gives an author, but its
claim of catching a missing case can only be made together with a named
typecheck gate. Claiming the runtime alone enforces it would be false.
