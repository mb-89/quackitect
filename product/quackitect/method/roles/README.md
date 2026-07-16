# roles — the pluggable implementation seam

<!-- design: method-role-seam  implements: req-pluggable-capabilities.1 :: A role is a strategy behind a stable FILE-BASED interface. Default binding for every role is INLINE; the driving agent performs it, today's behaviour. Bindings resolve at seed: iteration.roles, then type.roles, then default(inline). The engine never runs a role. It only gates the output: tests-red, designs-realized, tests-pass. -->
A role is a strategy behind a stable, **file-based** interface. Swap it per project type or per
iteration; the default for every role is **inline** (the driving agent does it — today's behaviour).

**kinds:** `prompt` (default) | `subagent` | `tool` | `subtool`

**interface (files on disk — the harness-agnostic, DRY contract):**

| role | in | out |
|---|---|---|
| **testdesigner** | requirement nodes | test nodes (`verifies:<req>`) + their runners |
| **implementer** | requirements + RED tests + design context | code carrying `# design: <id> implements: <req>` markers |
| **tester** | tests + build | pass/fail evidence (`observe-red` pre-build; usually inline) |

**resolution at seed:** `iteration.roles` ▸ `type.roles` ▸ `default (inline)`.

A `tool`/`subtool` binding (e.g. spec-kit, OpenSpec) receives the files and MUST emit `design:`
markers — write that convention into the tool's own constitution/instructions (spec-kit
`.specify/memory/constitution.md`). Kiro is NOT a valid binding (IDE-bound, not separable).

## default bindings (inline)
`testdesigner: inline` · `implementer: inline` · `tester: inline`. With no `roles:` block on the
iteration, all three resolve to the driving agent — behaviour is exactly as before this seam existed.

<!-- enddesign -->

## delegated agents — the role charter
<!-- design: method-role-charter :: A delegated subagent is a ROLE FILLING ONE STEP of the walk, bound by the same discipline as the driving agent; the brief points HERE instead of restating it. -->
A subagent is not an independent thinker with a task — it is a ROLE (implementer, tester,
testdesigner, author) filling ONE step of a walk that is already planned. The method binds it
exactly as it binds the driving agent:

- **Know your step.** The brief names the check/step you fill and the statements you bind.
  That step is your whole purpose; the method around it is already decided.
- **Execute — do not philosophize.** Contract rule 6 applies: no questioning the process,
  no ruminating, no re-deriving the plan. A genuine doubt becomes a `quack note`, and you
  keep working.
- **Only the step in your hand.** Rule 2 applies: do not refactor beside your step, do not
  "improve" what the step did not name, do not audit other agents' work.
- **Verify targeted; the battery is the hand-back.** Per the implementation fragment: run
  only the selftest(s) your change touches while building; the FULL battery exactly once,
  at your slot's end.
- **Capture strays, never chase them.** Rule 4: a bug or idea beside your step goes to
  `quack note`, one line, and you move on.
- **Byte-safe lanes only** (the editing-lane rules in the implementation fragment).
- **The ledger is not yours** unless the brief explicitly delegates a specific act.

A BRIEF therefore stays SHORT: the step, the statements, the files, the seams — plus a
pointer here. Restating the discipline per brief is duplication; omitting it is how a
subagent forgets the method's point.
<!-- enddesign -->

## doc-tests — the testdesigner for non-code deliverables
<!-- design: method-doc-tests  implements: req-impl-fragment-tdd.3 :: For a non-code deliverable the testdesigner pushes each acceptance criterion toward class:executed wherever it is MECHANIZABLE. That means a check with a fixed expected result, mechanical evaluation, and a gating pass/fail, the FIT/doctest/Vale pattern. The irreducible residue stays class:review. It is the same executed/review spectrum the engine already walks. -->
A "test" for a document is a criterion that is **(1)** stated with a fixed expected result, **(2)**
evaluated mechanically, and **(3)** gates on a binary pass/fail. Push each acceptance criterion that
far (→ `class: executed`); leave the irreducible residue as a user `class: review`. The RED→GREEN
discipline applies to the executed ones; the review residue is user-blessed.
<!-- enddesign -->
