---
form: specify-build
by: agent
signed_off: 2026-08-18T18:11:53.289Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

THE BUILD IS SPECIFIED AND SEEDED. Two design specs written, six chunks drawn, and the scope is the one the owner gave the go on plus the two things they added while it was being written.

### What was uncovered

FOUR ELEMENTS HAD NO DESIGN SPEC, and they are exactly this iteration's four. Thirty specs stood and every one of them predates i16.

TWO SPECS COVER THE FOUR, because they are two design concerns rather than four.

- dsp-the-producing-acts. Making a vehicle and making a driven project are one mechanism seen twice: a bounded write into a tree that did not exist, ending in a file that says what the tree is. The difference is that last file and nothing else.
- dsp-the-update-channel. Designed and NOT BUILT this iteration, on the owner's ruling that an engine update is a deliberate act rather than an automatic one.

### What the owner added after the go

TWO BUTTONS IN VS CODE, one per producing act, each asking for what it needs and opening a new window on what it produced.

THAT WAS ALREADY SPECIFIED and nobody had built it. sty-press-create-vehicle-and-land-in-it carries it seven slides deep, and its own footnote quotes the owner from earlier the same day. The story opens on somebody who cannot find the export script and does not know it exists.

AND THE EXPORT LEAVES RUNME.md. A second way to do it in the front-door document keeps the exact problem the story describes, in the place a newcomer reads first.

### What the chunks look like

SIX, AND THE SHAPE IS MOSTLY A CHAIN with one genuine fork. The travelling bound and the declared write target are independent of each other and both wait only on the guard tests, so they fan out.

THE TWO WRITE MECHANISMS ARE NOT THE SAME THING, and separating them is what makes the fork real. A producing act carries its bound with it, for the duration of the act. Driving a foreign project needs a standing declared target. The spike answered the second; the first is its own decision.

## design_specs

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
| [[dsp-resolution-seam]] | el-resolution-seam · if-satellite-to-resolution-seam · if-walk-engine-to-resolution-seam · if-satellite-supervisor-to-resolution-seam · if-resolution-seam-to-engine-delta · if-resolution-seam-to-method-compiler · if-record-store-to-resolution-seam · if-resolution-seam-to-account | project/deliverable/engine/paths.ts · project/deliverable/engine/resolve.ts · project/deliverable/engine/files.ts · project/deliverable/engine/run.ts · project/deliverable/engine/lint.ts · project/deliverable/engine/tools.ts |
| [[dsp-satellite-lifecycle]] | el-satellite-supervisor · if-satellite-supervisor-to-satellite · if-satellite-supervisor-to-record-store · if-satellite-supervisor-to-walk-engine · if-satellite-supervisor-to-test-runner · if-satellite-supervisor-to-mirror · if-front-desk-to-satellite-supervisor | project/deliverable/engine/supervisor.ts · project/deliverable/engine/worktree.ts |
| [[dsp-the-arrival]] | el-arrival | project/deliverable/engine/bin/se-arrive.ts · project/deliverable/engine/bin/se-hook-arrive.ts · .claude/settings.json |
| [[dsp-the-goal-binds-the-walk]] | el-walk-engine | project/deliverable/engine/machine.ts · project/deliverable/engine/stateform.ts · project/deliverable/engine/rigor-matrix.ts · project/deliverable/engine/machines/compile.ts · project/deliverable/engine/session.ts |
| [[dsp-the-outside-boundaries-and-their-bounds]] | if-agent-harness-to-entrypoint · if-engineer-to-mirror · if-vscode-to-mirror · if-test-runner-to-toolchain · if-bootstrap-to-toolchain · if-account-to-git · if-record-store-to-git · if-record-store-to-origin-remote · if-account-to-obsidian · if-walk-engine-to-web · if-mirror-to-output-tools · if-satellite-supervisor-to-cloud-host · if-satellite-supervisor-to-peer-machine | project/deliverable/machines/items/interface.md · project/deliverable/engine/trace.ts · project/deliverable/engine/elematrix.ts |
| [[dsp-the-producing-acts]] | el-vehicle-producer · el-project-producer · if-project-producer-to-resolution-seam · el-mirror | project/deliverable/engine/produce.ts · project/deliverable/engine/paths.ts · project/deliverable/engine/tools.ts · project/deliverable/vscode/src/extension.ts |
| [[dsp-the-update-channel]] | el-update-runner · el-change-reporter · if-change-reporter-to-update-runner | project/deliverable/engine/update.ts |
| [[dsp-trace-corpus]] | el-account | project/deliverable/engine/trace.ts · project/deliverable/engine/traceschema.ts · project/deliverable/engine/frontmatter.ts · project/deliverable/engine/bin/backfill-minted.ts |
| [[dsp-unattended-entrypoint]] | el-entrypoint | project/deliverable/engine/bin/se-start.ts · project/deliverable/package.json |
| [[dsp-walk-machine]] | el-walk-engine · if-method-compiler-to-walk-engine · if-record-store-to-walk-engine | project/deliverable/engine/session.ts · project/deliverable/engine/machine.ts · project/deliverable/engine/pull.ts · project/deliverable/engine/route.ts · project/deliverable/engine/atamwalk.ts · project/deliverable/engine/conditions.ts · project/deliverable/engine/scale.ts |
| [[dsp-write-guard]] | el-walk-engine · if-satellite-to-walk-engine | project/deliverable/engine/guard.ts · project/deliverable/engine/rules.ts · project/deliverable/engine/vocabulary.ts · project/deliverable/engine/sweep.ts · project/deliverable/engine/bin/sweep.ts · project/deliverable/engine/files.ts · project/deliverable/engine/tools.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

IMMEDIATELY: observe-red, where every new check runs and fails before anything is built.

### One thing about observe-red is unusual here and worth naming first

TWO OF THE FOUR GUARD CASES SHOULD PASS ON THE UNCHANGED ENGINE. They characterise behaviour that already exists — resolveInRoot refusing an @ address, and resolveDeclaredRoot refusing a climb-out.

OBSERVE-RED WANTS A RED BEFORE A GREEN, and a characterisation test is green from the start. The state's own script rules on that; naming it here means nobody is surprised by it.

THE OTHER TWO ARE GENUINELY RED. A writable declared target does not exist, and a target that is the tree this system came from is not refused because nothing can be declared writable yet.

### The lenses that shaped the order

RISK FIRST, and it decided the head of the chain. The guard tests come before everything because they answer whether the containment rules the whole design leans on have ever worked. That is the cheapest question available and the most expensive one to get wrong.

PARALLEL FLOW, and it produced exactly one fork. The travelling bound and the declared write target both wait only on the guard tests and are independent of each other, so they fan out to two builders.

SPINE FIRST IS THE LENS THAT DID NOT APPLY. A walking skeleton buys integration confidence when the parts are clear and their fit is not. Here the fit is one seam and the doubt was in the parts.

### What is deliberately not in the plan

THE UPDATE MECHANISM. dsp-the-update-channel is written and el-update-runner and el-change-reporter are designed, and none of it is built. The owner's ruling: an engine update is a deliberate act, ergonomics later, and right now the engine has to run.

THAT LEAVES TWO ELEMENTS WITH A SPEC AND NO CHUNK, which trace-design will see as unclaimed files rather than as a hole. It is a deliberate gap and this is where it is recorded.

### Parked, each with what makes it ready

- WHERE A VEHICLE'S OVERLAY CONTENT LIVES, raid-risk-the-overlay-location-is-unchosen, open and crippling. The producing acts must not close it by accident, and dsp-the-producing-acts says so.
- WHAT A VEHICLE'S IDENTITY IS. The upstream file and the driven record both name one, and nothing has decided what one is. A vehicle today is a folder with a name.
- THE SCOPED RUN handed off as job test-msyun0bj-2, whose verdict records itself.
- THE CONFIRM RUN on the retro's window fix, owed at verification since this morning.

## anything_else

