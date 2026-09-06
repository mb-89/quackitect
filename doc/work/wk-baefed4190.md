---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: checks lost fresh engine
# where the token stands. The process owns these values.
status: open
---

## detail

A finding on wk-a18983bcc5, check inherits stray engine.

That token asked for one line in src/engine/tests.go, and got it: the check's child now has SE_ENGINE set in both branches. But the same change also took the preference out of util/checks/lib/engine.mjs. liveEngine there now reads

	const engine = join(root, ".bin", "se");

where origin/v4 and the local HEAD read `process.env.SE_ENGINE || join(root, ".bin", "se")`, with a paragraph above saying why. Both the preference and the paragraph are gone.

That undoes wk-711bbd91ec whole. SE_ENGINE was the only way the freshly built engine reached a check that raises one of its own, and three do: engine-args.mjs, mcp-tools.mjs and drive-panel.mjs all call liveEngine. They now spawn .bin/se, the resident build, which is the failure wk-711bbd91ec was minted for. Worse, se test still builds se.fresh and still names it in the run's engine field, so the answer says the check drove the fresh engine while it drove the stale one.

The change is incoherent with itself too: the comment tests.go now carries ends "which is what lib/engine.mjs promises", and the promise it cites is the paragraph the same change deleted.

Restore the two lines in engine.mjs. The tests.go half stands: clearing SE_ENGINE is what makes that fallback correct rather than a hole.

src/engine does not build its tests in this clone, so the Go half must be watched on a worktree at the branch tip.

## done when

- util/checks/lib/engine.mjs prefers SE_ENGINE over .bin/se again, with the paragraph saying why: se find --regex 'process.env.SE_ENGINE' --path 'util/checks/lib/engine.mjs' names it
- a check that raises its own engine drives what se test handed it: export SE_ENGINE to a marker binary and see engine-args.mjs spawn that and not .bin/se
- the comment in src/engine/tests.go cites a promise that is on disk in engine.mjs, not one the same change deleted
- on a worktree at the branch tip carrying this change: cd src/engine && CGO_ENABLED=1 GOFLAGS=-tags=sqlite_fts5 go test -run ACheck ./... is green

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | what is gained by doing it, and not only what it does |  |  |
| [ ] | what breaks if it is never done, and not only that it stays undone |  |  |
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

