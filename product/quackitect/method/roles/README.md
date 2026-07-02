# roles — the pluggable implementation seam

<!-- design: method-role-seam  implements: req-role-seam :: A role is a strategy behind a stable FILE-BASED interface. Default binding for every role is INLINE (the driving agent performs it, today's behaviour). Bindings resolve at seed: iteration.roles ▸ type.roles ▸ default(inline). The engine never runs a role — it only gates the output (tests-red, designs-realized, tests-pass). -->
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

## doc-tests — the testdesigner for non-code deliverables
<!-- design: method-doc-tests  implements: req-doc-tests :: For a non-code deliverable the testdesigner pushes each acceptance criterion toward class:executed wherever it is MECHANIZABLE (a check with a fixed expected result + mechanical evaluation + a gating pass/fail — the FIT/doctest/Vale pattern); the irreducible residue stays class:review. Same executed/review spectrum the engine already walks. -->
A "test" for a document is a criterion that is **(1)** stated with a fixed expected result, **(2)**
evaluated mechanically, and **(3)** gates on a binary pass/fail. Push each acceptance criterion that
far (→ `class: executed`); leave the irreducible residue as a human `class: review`. The RED→GREEN
discipline applies to the executed ones; the review residue is human-blessed.
<!-- enddesign -->
