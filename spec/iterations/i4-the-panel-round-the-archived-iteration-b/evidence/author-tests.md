---
form: author-tests
by: agent
signed_off: 2026-08-23T18:46:05.210Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

SIX OF THE ROUND'S SEVEN DEMANDS ALREADY HAD A CHECK, and one had none.

The six were minted in earlier iterations and still resolve:

- a control draws from its spec — `tsp-autonomy-surface` line 10
- a surface shows the state an act produced — `tsp-a-control-is-legible` line 9
- a wrong act never passes silently — `tsp-bound-resolution` line 10
- a surface resolves to what it shows — `tsp-bound-surface` line 9
- the panel shows the machine — `tsp-panel-walkthrough` line 10
- the filter draws only what serves — `tsp-trace-graph-view` line 8

WHAT HAD NO CHECK IS THIS ROUND'S OWN DECISION. The guard element declares one rule, and no spec asserted it.

SO ONE SPEC WAS MINTED AND ONE TEST FILE WRITTEN. The rule reads: only a module the editor registry names may emit widget markup. The spec is `tsp-only-a-registered-module-emits` and the file is `deliverable/tests/widget-emitters.test.ts`.

THE TEST IS RED TODAY, AND THAT IS THE POINT. The spike on 2026-08-23 ran the same predicate over the tree: 38 of 171 sources emit, twenty of them registered editors, eighteen not. The eighteen are the surface's own parts, and deciding each one is the build's work.

THE RULE IS THE SPIKE'S, NOT THE DECISION'S ORIGINAL. The decision first said one exported entry point. That does not fit a tree where twenty form editors have to emit. The registry at `deliverable/engine/editors/index.ts` already says who owns the widget vocabulary, so the check compares two lists that both stand today.

TWO CASES, NOT ONE. The second asserts the registry is not empty, because a rule comparing against an empty list passes for the wrong reason. That silent pass is the failure this whole check is against.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-only-a-registered-module-emits]] | test | req-a-wrong-act-never-passes-silently |

## follow_up

GO GREEN BY DECIDING THE EIGHTEEN, at `build-steps`. Each stray emitter is either part of the one surface or part of a second one. The check goes green when the registry says which.

WHAT THE PREDICATE CANNOT SEE, and it is named on the guard element: a derivation INSIDE a registered module. It finds emitters, not derivers. A registered editor that starts computing its own answers about the walk is invisible to this check, and that gap needs a different one.

THE REDRAW ROUTE IS STILL OPEN, and it belongs to the build. Six places preserve state across a redraw today — `basesclient.ts:130`, `editors/node-table.ts:197` and `:242`, `renderclient-detail.ts:114-117`, `renderclient-log.ts:37,52,55`, `renderclient-live.ts:286`, `renderclient-walk.ts:218`. Either the view model carries focus, scroll and unsubmitted edits, or the surface keeps exactly those three and nothing else. Decide it once.

THE SIX INHERITED SPECS WERE NOT REOPENED. Each still resolves and each still matches its requirement's declared method. Rewriting a standing check because this round touched its subject would be work with no question behind it.

## anything_else

