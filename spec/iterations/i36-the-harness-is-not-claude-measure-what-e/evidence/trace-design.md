---
form: trace-design
by: agent
signed_off: 2026-08-19T17:19:56.823Z
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

The build landed ten chunks and six new engine modules. Nothing claimed them, which is exactly what the dead-code sweep exists to catch.

THE SIX, and the spec that now claims each.

- lifecycle.ts, stopping-layer.ts and cage-inventory.ts under dsp-boot-and-power. All three are the seam between the engine and the host it lives in — standing up, lying down, and what the host is allowed to hold.
- harness.ts and payload-limit.ts under dsp-lane-door. Both are about what the lane serves and to whom.
- failure-shapes.ts under dsp-call-log. It reads the call log and nothing else.

TWO INTERFACES WERE UNREALIZED, found by this state's own check at specify-build: if-arrival-to-walk-engine and if-test-runner-to-walk-engine. They now sit on dsp-the-arrival and dsp-quality-toolchain, where the design that serves them already lives.

A LINK IS A CONTRIBUTION, and each of these six was placed where its design actually serves, not under the nearest spec to silence the sweep.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/lifecycle.ts · project/deliverable/engine/stopping-layer.ts · project/deliverable/engine/cage-inventory.ts · project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/version.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/failure-shapes.ts · project/deliverable/engine/calllog.ts · project/deliverable/engine/survey.ts |
| [[dsp-coupling-disposer]] | el-coupling-disposer | project/deliverable/engine/disposition.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | project/deliverable/engine/paths.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts · project/deliverable/engine/stateform-problems.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/search.ts · project/deliverable/engine/run.ts · project/deliverable/engine/gitlane.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/harness.ts · project/deliverable/engine/payload-limit.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/bound.ts |
| [[dsp-legible-controls]] | el-mirror | project/deliverable/engine/params.ts · project/deliverable/engine/mirror.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/expr.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store · if-test-runner-to-walk-engine | project/deliverable/engine/lint.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/record-inspect.ts |
| [[dsp-query-evaluator]] | el-query-evaluator | project/deliverable/engine/query.ts |
| [[dsp-radial-layout]] | el-mirror | project/deliverable/engine/trace.ts |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/records.ts · project/deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-walk-engine-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/tools.ts |
| [[dsp-the-arrival]] | el-arrival · if-arrival-to-walk-engine | project/deliverable/engine/bin/se-arrive.ts · project/deliverable/engine/bin/se-hook-arrive.ts |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | project/deliverable/engine/machine.ts · project/deliverable/engine/session.ts |
| [[dsp-the-options-pool]] | el-holding-pen · el-front-desk | project/deliverable/engine/pool.ts · project/deliverable/engine/inbox.ts · project/deliverable/engine/survey.ts |
| [[dsp-the-outside-boundaries-and-their-bounds]] | if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts |
| [[dsp-write-guard]] | el-walk-engine · if-satellite-to-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/sweep.ts |

## follow_up

THIS STATE'S OWN CHECK WAS WIDENED, and that is a change to the machine rather than to the corpus.

The field declared `covers: element`, so a design spec realizing only INTERFACES read as covering nothing. dsp-the-outside-boundaries-and-their-bounds realizes eleven interfaces and no element, and it was refused on that ground.

The state's own law says "every element AND INTERFACE is realized by at least one design spec". Two sources disagreed, and the narrower one was the checker. `covers` now accepts several types, and the matrix row reads `covers: element,interface`.

THE DEAD-CODE GRAIN IS STILL THE FILE. Dead code inside a claimed file is invisible here, which the state's guidance already accepts. Six new modules were each placed under the spec whose design serves them, and none was filed somewhere convenient.

tests/ IS NOT SWEPT by this state. Nine new test files landed with the build and no spec claims a test file, because test files are claimed by test-specs at author-tests instead. That split is by design and worth knowing when reading the unclaimed list.

## anything_else

