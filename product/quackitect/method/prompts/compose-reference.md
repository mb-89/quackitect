# compose-reference — exact shapes for composing an iteration

The cheatsheet so you never re-derive formats by reading example files. Load this at
`engage start` step 5 (plan & bake). All facts here are load-bearing.

## Trace edge model (semantic direction)
- use-case  `refines: [need-…]`
- requirement  `refines: [uc-…]`  (optional `depends_on: [req-…]`)
- design — **inline in code, never a .md** — `// design: <id>  implements: <req-id>` … `// enddesign`
  (engine scans product/ `.go`/`.py`/`.md`; the marked region's hash folds into the design node)
- test  `verifies: [req-…]`
- ADR  `addresses: [req-…]`

Derived coverage rules (used as `verify: coverage:<rule>` on executed subtasks):
`req-traced`, `req-has-test`, `req-has-design`, `adr-traced`, `designs-realized`, `tests-pass`, `tests-red`.
`tests-red` = every executed test carries a `red-observed` attestation (via `quack observe-red <test>`) at its current hash — test-first RED before the build.

## Trace node frontmatter — in `spec/iterations/<iter>/`
```
---
id: uc-x
type: usecase | requirement | test | adr | need
refines:  [need-y]        # usecase; (requirement uses refines: [uc-…])
verifies: [req-…]         # test only
addresses:[req-…]         # adr only
adjudicated_by: human     # adr only
statement: one line — this IS the spec
class: review
verify: selftest:<name>   # test only, optional
killer: true|false
---
## Rationale (not load-bearing)
```
Trace nodes are **content** — never blessed, never DONE/OPEN; they only ripple SUSPECT downstream.

## Gate/subtask frontmatter — in `spec/iterations/<iter>/tasks/` — NO `type:` field
```
---
id: <itag>-m<n>-<name>
statement: one line
milestone: M<n>
class: review | executed
parent: <itag>-m<n>-<parent>     # only nested build steps
killer: true|false
verify: coverage:<rule>          # only executed/derived subtasks
depends_on: [<ids>]
---
```
- Milestone gate: id `<itag>-m<n>-gate`, `class: review`, `killer: true`, `depends_on` = all its subtasks.
- **Milestone-monotonic:** each milestone's FIRST subtask `depends_on` the prior milestone gate.
- **Intra-milestone order = in-set depends_on chain** (a later subtask depends on the earlier one; build → its last step; quality/verification subtasks → build).
- **ids are iteration-unique** (namespace by `<itag>`, e.g. `i6-m2-gate`). A reused id silently shadows; `quack lint` fails on duplicates.

## Rigor → milestones
- **systematic** = M1–M8. **lean** = L1–L5 → seed as **M1–M5** (L1→M1 … L5→M5). **vibe** = no gates.
- lean's derived coverage per milestone (see `rigor/lean/checklist.md`):
  M2 `{req-traced, req-has-test}` · M3 `{adr-traced}` · M4 `{designs-realized, tests-pass}`.

<!-- design: method-ears-block  implements: req-ears-method :: The compose reference carries the five EARS pattern shapes and the authoring instruction, integrated with the i7 tests-red and roles content; new requirement statements at systematic rigor are authored EARS-shaped at compose time and checked forward-only by quack lint against the committed baseline. -->
## EARS — requirement statements (systematic rigor)
Author every NEW `type: requirement` statement in one of the **five EARS shapes**, with **shall**:
- **Ubiquitous** — `The <system> shall <response>.`
- **Event-driven** — `When <trigger>, the <system> shall <response>.`
- **State-driven** — `While <state>, the <system> shall <response>.`
- **Unwanted behaviour** — `If <condition>, then the <system> shall <response>.`
- **Optional feature** — `Where <feature>, the <system> shall <response>.`

No **weasel words** (should, may, appropriate, quickly, user-friendly, robust, flexible, …) — state
the checkable claim. `quack lint` enforces this **forward-only**: only statements not in the committed
baseline (`.quack/ears-baseline.json`) are checked — blessed history is never retrofitted or re-blessed.
A genuinely non-EARS requirement carries `ears: exempt - <reason>` in its frontmatter (the reason is
required; lint counts exemptions). This applies to requirement statements only — tests keep verifying
(`verifies:`, tests-red discipline) and roles keep binding exactly as above.
<!-- enddesign -->

## No plan-lock bless (step 5d)
**Do NOT `quack bless --all` at plan time.** It marks every milestone gate DONE, makes `next` a no-op,
and shows a falsely-green board (an un-built M5 reads green). After composing, gates start **OPEN**.
Executed/derived checks compute live and stay RED (`designs-realized`, `tests-pass`) until the build.
Walk with `next`; **bless each milestone gate one at a time as you genuinely complete it**, via its
handover pager (`quack progress --pager <gate>`). `quack lint` "requirement has no design" holes are
**expected** pre-build; don't chase them.

## Where needs live
Cross-cutting / dogfood needs: `spec/trace/` (`need-engage`, `need-note`, `need-review`, `need-workspace-drive`).
Iteration-specific needs: the iteration dir. **Fold new work under existing needs — do not sprawl new ones.**

## Roles (the implementation seam) — `method/roles/README.md`
The implementation milestone's testdesigner / implementer / tester are **pluggable** (file-based Strategy).
Default binding is **inline** (the driving agent) — omit and behaviour is unchanged. To swap, add a
`roles:` block to `iteration.md` (resolves `iteration.roles` ▸ `type.roles` ▸ `default`):
```
roles:
  testdesigner: default   # | subagent:<name> | tool:spec-kit | tool:openspec
  implementer:  default
  tester:       default
```
The engine never runs a role; it only gates the output (`tests-red`, `designs-realized`, `tests-pass`).
