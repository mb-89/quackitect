# M6 — Build plan (i0003_engine_vehicle_go)

Evidence for `i3-m6-build-planned`. The port is decomposed into small, resumable subtasks, **chained** so the build proceeds in dependency order and survives interruption. Each is one sitting of work that ends green.

## Build sequence (each depends on the previous)

| # | subtask | realizes | done when |
|---|---|---|---|
| 1 | `i3-m6-go-scaffold` | req-go-engine | `go build` yields one static binary; cross-compile flags set |
| 2 | `i3-m6-go-parser` | req-zero-dep-parse | frontmatter + config.toml parsed by hand, no third-party dep |
| 3 | `i3-m6-go-engine-core` | req-behavior-parity | load_all, norm, stmt_hash, full_hash, suspect/bless, gate_state match Python (spike-proven primitive) |
| 4 | `i3-m6-go-coverage-ids` | req-behavior-parity, req-unique-ids | coverage rules + derived gates + mint_id + duplicate-id guard |
| 5 | `i3-m6-go-cli-help` | req-cli-help | every subcommand answers -h/--help/-? with no side effects; `-`-ids rejected → `HELP_OK` |
| 6 | `i3-m6-go-report` | req-behavior-parity | html/template shell, server-baked layout, byte-identical integrity root |
| 7 | `i3-m6-go-trace-filter` | req-trace-filter | one filter box (iteration expr + text/regex, AND/OR), on-focus help, breadthfirst relayout |
| 8 | `i3-m6-overlay-resolver` | req-engine-vehicle-split, req-overlay-resolver | one vehicle→engine resolver; surface/guides/report/gather route through it; engine read-only → `SPLIT_OK` |
| 9 | `i3-m6-deps-prompt` | req-dep-prompt | `method/prompts/dependencies.md` with winget paths |
| 10 | `i3-m6-parity-perf` | req-behavior-parity, req-responsiveness | golden parity suite over real spec + report; perf harness → `PARITY_OK`, `PERF_OK`, built binary |

## How it closes M6

- The chain ends by writing the evidence markers and the binary, which flips the executed `test-*` nodes green → `i3-m6-verification-green` (coverage:tests-pass) passes.
- Porting the code carries the `# design:` markers onto the Go source, so every requirement gains a realized design → `i3-m6-detailed-design-complete` (coverage:designs-realized) passes.
- Then the two review subtasks (`internal-quality-ok`, `impl-risks-acceptable`) and the `i3-m6-gate` review.

## Resumability

Each subtask is independently blessable and leaves a working tree. An interruption after subtask N resumes at N+1 — no monolithic build to lose. The Python engine stays the live tooling until the Go binary reaches parity; the cutover is the last step.

## Coverage during the build

`quack lint` will show design-holes shrink as each subtask lands its `# design:` markers. The holes are honest until the code exists.
