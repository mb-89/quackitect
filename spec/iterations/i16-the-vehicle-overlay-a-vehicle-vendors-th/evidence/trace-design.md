---
form: trace-design
by: agent
signed_off: 2026-08-18T19:11:14.769Z
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

EVERY ELEMENT IS REALIZED AND EVERY SPEC NAMES WHERE ITS CODE LIVES.

### What the sweep caught, and what it taught

ONE NEW FILE WAS UNCLAIMED. `engine/actbound.ts` holds the bound that travels with a producing act, and it belongs to the seam that bound is checked at. It joins `dsp-resolution-seam`.

AND ONE SPEC NAMES A FILE THAT DOES NOT EXIST. `dsp-the-update-channel` names `engine/update.ts`. The update channel is designed and deliberately unbuilt — the owner ruled the priority on 2026-08-18 and the build plan's six chunks never included it.

EMPTYING THAT `files:` WAS TRIED AND THE ENGINE REFUSED IT, in the right words: "a design-spec naming no files — name the code it lands in, PLANNED NAMES INCLUDED".

SO THE RULE IS THE OPPOSITE OF WHAT IT LOOKED LIKE. A design spec is not a claim that code exists. It is a claim about where code goes, and a planned name is the one fact a later builder needs. Removing it would have destroyed that and called the destruction honesty.

THE NAME IS RESTORED and the spec says plainly that nothing answers it yet.

### What i16 added to the picture

`dsp-the-producing-acts` NAMED `engine/produce.ts` BEFORE IT EXISTED, which is the same rule working forwards. The file now exists and answers it.

BOTH PRODUCING ELEMENTS ARE REALIZED, and so is the interface between the project producer and the resolution seam.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-boot-and-power]] | el-bootstrap | project/deliverable/engine/bin/bench-boot.ts · project/deliverable/engine/bin/se-pty.ts · project/deliverable/engine/bin/se-hook-stop.ts · project/deliverable/engine/bin/package.ts · project/deliverable/engine/version.ts |
| [[dsp-call-log]] | el-account · if-walk-engine-to-account · if-holding-pen-to-account · if-method-compiler-to-account · if-record-store-to-account | project/deliverable/engine/calllog.ts · project/deliverable/engine/version.ts · project/deliverable/engine/survey.ts |
| [[dsp-core-and-satellite]] | el-core · el-satellite · if-core-satellite · if-core-to-mirror · if-satellite-to-account · if-record-store-to-satellite · if-method-compiler-to-satellite · if-engine-delta-to-satellite | project/deliverable/engine/core.ts · project/deliverable/engine/satellite.ts · project/deliverable/engine/channel.ts · project/deliverable/engine/transports.ts · project/deliverable/engine/supervisor.ts · project/deliverable/engine/delta.ts · project/deliverable/engine/mode.ts · project/deliverable/engine/bin/se-satellite.ts · project/deliverable/engine/bin/se-mcp.ts |
| [[dsp-coupling-disposer]] | el-coupling-disposer | project/deliverable/engine/disposition.ts |
| [[dsp-decision-mathematics]] | el-method-compiler | project/deliverable/engine/dsm.ts · project/deliverable/engine/pugh.ts · project/deliverable/engine/pareto.ts · project/deliverable/engine/compare.ts · project/deliverable/engine/elematrix.ts · project/deliverable/engine/morphbox.ts · project/deliverable/engine/bin/flow-closure.ts · project/deliverable/engine/bin/grades-complete.ts |
| [[dsp-engine-delta]] | el-engine-delta · if-engine-delta-to-account · if-engine-delta-to-mirror · if-engine-delta-to-walk-engine | project/deliverable/engine/delta.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/machines/compile.ts |
| [[dsp-evidence-forms]] | el-walk-engine | project/deliverable/engine/stateform.ts · project/deliverable/engine/forms.ts |
| [[dsp-file-lane]] | el-walk-engine | project/deliverable/engine/files.ts · project/deliverable/engine/signals.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/search.ts · project/deliverable/engine/move.ts · project/deliverable/engine/run.ts · project/deliverable/engine/web.ts · project/deliverable/engine/gitlane.ts · project/deliverable/engine/jsonio.ts · project/deliverable/engine/hash.ts · project/deliverable/engine/model-fs.ts · project/deliverable/engine/bin/outward-search.ts · project/deliverable/engine/bin/se-hook-websearch.ts |
| [[dsp-form-editors]] | el-mirror | project/deliverable/engine/editors/index.ts · project/deliverable/engine/editors/kinds.ts · project/deliverable/engine/editors/checklist.ts · project/deliverable/engine/editors/choice-rationale.ts · project/deliverable/engine/editors/compare-card.ts · project/deliverable/engine/editors/decision-matrix.ts · project/deliverable/engine/editors/dsm.ts · project/deliverable/engine/editors/element-matrix.ts · project/deliverable/engine/editors/exposure-pick.ts · project/deliverable/engine/editors/findings.ts · project/deliverable/engine/editors/list.ts · project/deliverable/engine/editors/morph-box.ts · project/deliverable/engine/editors/node-table.ts · project/deliverable/engine/editors/pareto-plot.ts · project/deliverable/engine/editors/per-item.ts · project/deliverable/engine/editors/rank-cut.ts · project/deliverable/engine/editors/scenario-deck.ts · project/deliverable/engine/editors/sensitivity.ts · project/deliverable/engine/editors/table.ts |
| [[dsp-front-desk]] | el-front-desk | project/deliverable/machines/main.canvas |
| [[dsp-help-search]] | el-walk-engine | project/deliverable/engine/help.ts · project/deliverable/engine/tools.ts |
| [[dsp-lane-door]] | el-walk-engine | project/deliverable/engine/tools.ts · project/deliverable/engine/mcp.ts · project/deliverable/engine/errors.ts · project/deliverable/engine/discipline.ts · project/deliverable/engine/promptlayer.ts · project/deliverable/engine/params.ts · project/deliverable/engine/bound.ts · project/deliverable/engine/bin/se-mcp.ts · project/deliverable/engine/bin/se-manual.ts |
| [[dsp-legible-controls]] | el-mirror | project/deliverable/engine/params.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/run.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-live-register]] | el-mirror | project/deliverable/engine/bases.ts · project/deliverable/engine/basesclient.ts · project/deliverable/engine/baseui.ts · project/deliverable/engine/tables.ts · project/deliverable/engine/vault.ts · project/deliverable/engine/expr.ts · project/deliverable/engine/bin/bench-vault.ts · project/deliverable/engine/bin/format-vault.ts · project/deliverable/engine/signals.ts |
| [[dsp-method-compilation]] | el-method-compiler | project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/canvas.ts · project/deliverable/engine/catalogs.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/expmachine.ts · project/deliverable/engine/machines/supply.ts · project/deliverable/engine/bin/supply-gaps.ts |
| [[dsp-mirror-render]] | el-mirror · if-account-to-mirror · if-front-desk-to-mirror · if-holding-pen-to-mirror · if-method-compiler-to-mirror · if-record-store-to-mirror · if-walk-engine-to-mirror | project/deliverable/engine/render.ts · project/deliverable/engine/mirror.ts · project/deliverable/engine/panel.ts · project/deliverable/engine/brand.ts · project/deliverable/engine/card-parts.ts · project/deliverable/engine/cards.ts · project/deliverable/engine/traceui.ts · project/deliverable/engine/gitgraph.ts · project/deliverable/engine/shoot.ts · project/deliverable/engine/bin/brand.ts · project/deliverable/engine/bin/mermaid-check.ts · project/deliverable/engine/bin/place-prompt-layer.ts |
| [[dsp-narration]] | el-walk-engine | project/deliverable/engine/decisions.ts · project/deliverable/engine/toll.ts · project/deliverable/engine/bin/render-decisions.ts |
| [[dsp-note-pen]] | el-holding-pen · if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts · project/deliverable/engine/inbox.ts |
| [[dsp-quality-toolchain]] | el-test-runner · if-record-store-to-test-runner · if-test-runner-to-record-store | project/deliverable/engine/testreporters.ts · project/deliverable/engine/tools.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/bin/grades-complete.ts · project/deliverable/engine/bin/backfill-minted.ts · project/deliverable/engine/lintfix.ts · project/deliverable/engine/bin/selftest.ts · project/deliverable/engine/bin/smoketest.ts · project/deliverable/engine/bin/preflight.ts · project/deliverable/engine/bin/red-observed.ts · project/deliverable/engine/bin/battery.ts · project/deliverable/engine/bin/test-timings.mjs · project/deliverable/engine/bin/prose-inspect.ts · project/deliverable/engine/bin/record-inspect.ts |
| [[dsp-query-evaluator]] | el-query-evaluator | project/deliverable/engine/query.ts |
| [[dsp-record-lifecycle]] | el-record-store · if-front-desk-to-record-store | project/deliverable/engine/iterations.ts · project/deliverable/engine/worktree.ts · project/deliverable/engine/seed.ts |
| [[dsp-resolution-seam]] | el-resolution-seam · if-satellite-to-resolution-seam · if-walk-engine-to-resolution-seam · if-satellite-supervisor-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/actbound.ts · project/deliverable/engine/files.ts · project/deliverable/engine/run.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/tools.ts |
| [[dsp-satellite-lifecycle]] | el-satellite-supervisor · if-satellite-supervisor-to-satellite · if-satellite-supervisor-to-record-store · if-satellite-supervisor-to-walk-engine · if-satellite-supervisor-to-test-runner · if-satellite-supervisor-to-mirror · if-front-desk-to-satellite-supervisor | project/deliverable/engine/supervisor.ts · project/deliverable/engine/worktree.ts |
| [[dsp-the-arrival]] | el-arrival | project/deliverable/engine/bin/se-arrive.ts · project/deliverable/engine/bin/se-hook-arrive.ts · .claude/settings.json |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | project/deliverable/engine/machine.ts · project/deliverable/engine/stateform.ts · project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/session.ts |
| [[dsp-the-outside-boundaries-and-their-bounds]] | if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools · if-satellite-supervisor-to-cloud-host · if-satellite-supervisor-to-peer-machine | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-the-producing-acts]] | el-vehicle-producer · el-project-producer · if-project-producer-to-resolution-seam · el-mirror | project/deliverable/engine/produce.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/tools.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-the-update-channel]] | el-update-runner · el-change-reporter · if-change-reporter-to-update-runner | [] |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts |
| [[dsp-write-guard]] | el-walk-engine · if-satellite-to-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/vocabulary.ts · project/deliverable/engine/sweep.ts · project/deliverable/engine/bin/sweep.ts · project/deliverable/engine/files.ts · project/deliverable/engine/tools.ts |

## follow_up

IMMEDIATELY: verification, which fires the full battery.

### What verification will meet

ONE RED, AND IT IS NOT THIS ITERATION'S. The formatter-churn alarm stands at 872 of 1693 notes against a 50 percent limit, spanning i10 through i16, the method cards, the form templates and the guidance.

IT WILL STOP THE WALK THERE, because a red battery refuses.

THE FIX IS ONE `se_format` CALL AND IT IS PROVEN SAFE. The test directly above the failing one reprints the whole vault and asserts that no note's data and no note's body changes; it passes.

READY WHEN the owner says whether an 872-file reprint may land inside this iteration. It touches method and guidance files, which is why it was not done unasked.

### Parked, with what makes each ready

- THE UPDATE CHANNEL has a design and no code. Ready when somebody opens work for it; the tripwire that would falsify the whole route is unprobed.
- RESOLVING AN IDENTITY TO A TREE. Ready when somebody decides where a register of seen copies lives.
- WHERE A VEHICLE'S OVERLAY CONTENT LIVES, still open and graded crippling.

## anything_else

### The grain of this sweep, and what it cannot see

THE GRAIN IS THE FILE. Dead code inside a claimed file is invisible here, which the state's own guidance says and accepts.

SO A GREEN HERE MEANS every file has an owner, not that every line in it is reached. `engine/bound.ts` and `engine/actbound.ts` now sit under different specs with similar names, and only a reader can tell whether both still earn their place.

### One thing worth watching

THREE SPECS NOW CLAIM `engine/paths.ts` — the file lane, the resolution seam and the producing acts. That is legitimate under the trace rule that a link is a contribution rather than an exclusive claim.

BUT IT IS ALSO A SIGNAL. A file three designs need is a file doing three jobs, and this iteration added a fourth concern to it: the writable declared root, the source guard and the act's bound all landed there. It is not split here because splitting it was not this iteration's work, and because the sweep's own guidance says the coarse grain is revisited when it stops finding things.
