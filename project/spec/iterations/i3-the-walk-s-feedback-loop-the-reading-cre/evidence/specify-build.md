---
form: specify-build
by: agent
signed_off: 2026-08-13T12:06:06.413Z
reopened: "2026-08-13T12:04:38.464Z — the promotions row named an experiment i2 owns; the filter is scoped now, so this record's answer is none and the borrowed chunk is gone"
authors: agent
files:
---

# Evidence form / specify-build

## current_situation

Seventeen design specs stand. Not one is added, and not one changes its element edges.

WHY NONE WAS NEEDED, checked rather than assumed. This iteration's work lands in four engine files, and every one is already claimed:

- machine.ts and session.ts by [[dsp-walk-machine]]
- rigor-matrix.ts and iterations.ts by [[dsp-method-compilation]] and [[dsp-record-lifecycle]]

No new file was added to the deliverable's engine. Three new TEST files were written, and design specs do not claim tests - those belong to the test-spec slice, which author-tests just extended.

THE BUILD DRAWING IS AUTHORED, nine chunks, in machines/build-chunks.md. That file arrived carrying the placeholder this iteration taught the walk to refuse, which is the mechanism testing itself on its own record.

## design_specs

| dsp-boot-and-power | el-bootstrap | project/deliverable/engine/bin/bench-boot.ts, project/deliverable/engine/bin/se-pty.ts, project/deliverable/engine/bin/se-hook-stop.ts, project/deliverable/engine/bin/package.ts |
| dsp-call-log | el-account, if-walk-engine-to-account, if-holding-pen-to-account, if-method-compiler-to-account, if-record-store-to-account | project/deliverable/engine/calllog.ts, project/deliverable/engine/survey.ts |
| dsp-decision-mathematics | el-method-compiler | project/deliverable/engine/dsm.ts, project/deliverable/engine/pugh.ts, project/deliverable/engine/pareto.ts, project/deliverable/engine/compare.ts, project/deliverable/engine/elematrix.ts, project/deliverable/engine/morphbox.ts |
| dsp-evidence-forms | el-walk-engine | project/deliverable/engine/stateform.ts, project/deliverable/engine/forms.ts |
| dsp-file-lane | el-walk-engine | project/deliverable/engine/files.ts, project/deliverable/engine/paths.ts, project/deliverable/engine/search.ts, project/deliverable/engine/move.ts, project/deliverable/engine/run.ts, project/deliverable/engine/web.ts |
| dsp-form-editors | el-mirror | project/deliverable/engine/editors/index.ts, project/deliverable/engine/editors/kinds.ts, project/deliverable/engine/editors/checklist.ts, project/deliverable/engine/editors/choice-rationale.ts, project/deliverable/engine/editors/compare-card.ts, project/deliverable/engine/editors/decision-matrix.ts |
| dsp-front-desk | el-front-desk | project/deliverable/machines/main.canvas |
| dsp-lane-door | el-walk-engine | project/deliverable/engine/tools.ts, project/deliverable/engine/mcp.ts, project/deliverable/engine/errors.ts, project/deliverable/engine/discipline.ts, project/deliverable/engine/promptlayer.ts, project/deliverable/engine/params.ts |
| dsp-live-register | el-mirror | project/deliverable/engine/bases.ts, project/deliverable/engine/basesclient.ts, project/deliverable/engine/baseui.ts, project/deliverable/engine/tables.ts, project/deliverable/engine/vault.ts, project/deliverable/engine/expr.ts |
| dsp-method-compilation | el-method-compiler | project/deliverable/engine/rigor-matrix.ts, project/deliverable/engine/canvas.ts, project/deliverable/engine/catalogs.ts, project/deliverable/engine/machines/compile.ts, project/deliverable/engine/expmachine.ts |
| dsp-mirror-render | el-mirror, if-account-to-mirror, if-front-desk-to-mirror, if-holding-pen-to-mirror, if-method-compiler-to-mirror, if-record-store-to-mirror, if-walk-engine-to-mirror | project/deliverable/engine/render.ts, project/deliverable/engine/mirror.ts, project/deliverable/engine/panel.ts, project/deliverable/engine/brand.ts, project/deliverable/engine/card-parts.ts |
| dsp-narration | el-walk-engine | project/deliverable/engine/decisions.ts, project/deliverable/engine/toll.ts, project/deliverable/engine/bin/render-decisions.ts |
| dsp-note-pen | el-holding-pen, if-holding-pen-to-front-desk | project/deliverable/engine/notes.ts, project/deliverable/engine/inbox.ts |
| dsp-quality-toolchain | el-test-runner, if-record-store-to-test-runner, if-test-runner-to-record-store | project/deliverable/engine/lint.ts, project/deliverable/engine/lintfix.ts, project/deliverable/engine/bin/selftest.ts, project/deliverable/engine/bin/smoketest.ts, project/deliverable/engine/bin/preflight.ts, project/deliverable/engine/bin/test-timings.mjs |
| dsp-record-lifecycle | el-record-store, if-front-desk-to-record-store | project/deliverable/engine/iterations.ts, project/deliverable/engine/worktree.ts |
| dsp-trace-corpus | el-account | project/deliverable/engine/trace.ts, project/deliverable/engine/traceschema.ts, project/deliverable/engine/frontmatter.ts |
| dsp-walk-machine | el-walk-engine, if-method-compiler-to-walk-engine, if-record-store-to-walk-engine | project/deliverable/engine/session.ts, project/deliverable/engine/machine.ts, project/deliverable/engine/pull.ts, project/deliverable/engine/route.ts, project/deliverable/engine/atamwalk.ts, project/deliverable/engine/conditions.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |

## follow_up

The build states follow, and the drawing above is what build-steps will run.

At trace-design the dead-code sweep runs over the deliverable. Every file this iteration touched is long-claimed, so the sweep should find nothing unclaimed - and if it does, that is a finding to discuss rather than to bury under the nearest spec.

## anything_else

NO PROMOTED SPIKE ENTERS THIS BUILD, and the road to that one-word answer is worth recording.

M6 is struck whole at minor by the owner's ruling of 2026-08-13, so this iteration seeded no spikes and promoted nothing.

The field disagreed. It listed [[exp-trunk-read-cost]], which i2 promoted and i2 built - the long-lived batch reader that stands today in expmachine.ts. The filter behind the field read every promoted experiment in the project, with no owner and no expiry, so i2's promotion turned up here and would have turned up in i4's and i5's.

The only way to satisfy it was to copy a chunk into this plan for work another record had done. I did that first, which was wrong, and the owner caught it.

FIXED AT THE SOURCE. An experiment now records the iteration that made it, all three standing experiments are stamped to i2, and the field asks only for this record's own. A promotion is a spike aimed at a later step of the SAME iteration and does not outlive it - exactly like the spike, which never travelled.

WHAT THE MACHINE WOULD HAVE CAUGHT ANYWAY, checked rather than assumed: every chunk in a build plan compiles to a work state with a required `built` field - what was built and where, the commit or artifact. A borrowed chunk could not have been passed empty. The plan was wrong, and the step after it would have refused.

THE DRAWING IS HONEST ABOUT ITS OWN ORDER. The method has this state author the plan BEFORE the build. Here the work was done as the defects arrived: the owner met them while the walk was running, ruled on them, and they were built the same hour. The drawing records what was built and in what order it actually had to happen, with edges only where a real dependency existed. Five of the nine chunks depend on nothing.

Writing it as a prediction would be false, and would teach the next reader that these drawings are decoration.
