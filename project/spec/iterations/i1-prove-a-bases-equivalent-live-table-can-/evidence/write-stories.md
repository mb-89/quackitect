---
form: write-stories
by: agent
signed_off: 2026-08-06T09:57:41.781Z
authors: agent
files:
---

# Evidence form / write-stories

## current_situation

The five value props stand signed and their two audiences have nodes. Nothing downstream of them existed: no story, no use case, no requirement.

This state authored the first layer. Six decks, reverse-engineered from what the system already does rather than imagined — v1's IFU arc at ref main, v2's ledger, and this walk's own record.

The method card and the item template were rewritten first, because the shape was under-specified: it said statement and evidence but never said the deck was markdown slides, and never said why a story exists at all.

## stories

- sty-gate-holds-the-walk
- sty-reading-cannot-be-skipped
- sty-worktree-holds-the-iteration
- sty-scoped-test-answers-one-question
- sty-method-arrives-at-the-state
- sty-desk-routes-the-work
- sty-refusal-names-the-remedy
- sty-change-size-picks-the-rigor
- sty-template-mints-the-node
- sty-unattended-run-stops-at-the-gate
- sty-manual-walk-no-agent
- sty-slider-moves-mid-session
- sty-why-answered-years-later
- sty-stray-becomes-a-note
- sty-narration-shows-the-work
- sty-trace-graph-answers-what-serves-what
- sty-vendor-overlays-without-forking
- sty-engine-update-keeps-the-overlay

## coverage

EIGHTEEN STORIES OVER FIVE PROPOSITIONS. Every proposition is realized, and every story refines one. The engine checks both directions now, so neither claim rests on this prose.

vp-systematic-engineering — the machine enforces the order.

- sty-gate-holds-the-walk. The gate refuses until the input is earned.
- sty-reading-cannot-be-skipped. The proof of a read is the document's last words.
- sty-worktree-holds-the-iteration. Unfinished work never sits on the tree you demo from.
- sty-scoped-test-answers-one-question. A run answers a question; the battery is earned.

vp-rigor-without-toil — the method is carried, not memorised.

- sty-method-arrives-at-the-state. The method is handed over before the step opens.
- sty-desk-routes-the-work. The desk reads the live system and recommends one vehicle.
- sty-refusal-names-the-remedy. A refusal carries the call to make instead.
- sty-change-size-picks-the-rigor. The ceremony matches the size, decided once by a person.
- sty-template-mints-the-node. The shape of an artifact is one click from the field asking for it.

vp-autonomy-range — every setting works, including none.

- sty-unattended-run-stops-at-the-gate. The slider at the top, stopping only where it must.
- sty-manual-walk-no-agent. The slider at zero, with no AI in the loop at all.
- sty-slider-moves-mid-session. The setting changes mid-walk without restarting anything.

vp-the-ledger — recorded, attributed, refusable.

- sty-why-answered-years-later. A decision answers its own why from the record.
- sty-stray-becomes-a-note. A finding survives without the detour that would have cost it.
- sty-narration-shows-the-work. Progress is readable without interrupting the work.
- sty-trace-graph-answers-what-serves-what. "Why does this exist" is answered by looking.

vp-vendoring — run it as it is, or overlay it.

- sty-vendor-overlays-without-forking. A builder overlays their method without forking.
- sty-engine-update-keeps-the-overlay. The first upstream update is a replace, not a merge.

THE KILLERS, and why the product dies without each.

- sty-gate-holds-the-walk. If the walk can be talked past a gate, the enforcement is advice, and advice is what every existing tool already gives. The product IS the refusal.
- sty-method-arrives-at-the-state. If the method only sits behind a link, the agent improvises and the rigor is theatre. This is the difference between a machine that carries the method and one that mentions it.
- sty-unattended-run-stops-at-the-gate. If the walk stops at everything or at nothing, the autonomy range collapses to a single setting and the proposition is gone.
- sty-reading-cannot-be-skipped. If a read cannot be told from a polite yes, every downstream step rests on a claim nobody checked. The reading loop is what makes "the agent has the method" a fact rather than a hope.

THE REST ARE NOT KILLERS. They are how the product is pleasant rather than how it is possible. Two deserve their reason recorded.

- sty-manual-walk-no-agent proves the method outlives the AI. It matters, and the product still works for its primary audience without it.
- sty-vendor-overlays-without-forking serves a role that does not yet exist as a real person, which its own node records at influence 0.4.

WHERE THESE CAME FROM. Reverse-engineered from what the system already does, not invented: v1's IFU decks at ref main gave the arc and the split slide; v2's ledger gave the roles; the rest is this walk's own record — the gate that held, the entry read that fired, the slider that stopped a pull, the refusal that named its own remedy.

WHAT THE SET DOES NOT CLAIM. Coverage is not completeness. Every proposition has a story, and that does not mean every pass a person can make is told. The twelve added here trace the machinery a user actually touches: the desk, the note, the refusal, the reading loop, the narration, the worktree, the change size, the graph, the slider, the update, the scoped run, the template. A missing story will surface the way a missing value prop does — something gets built that no story covers.

EVERY EVIDENCE SIDE IS EMPTY, which is correct at M2. They fill at M8, and that is what makes each deck its own validation container rather than a design-time leftover.

## follow_up

- The evidence sides are empty by design and fill at M8. A story whose right half is still blank after validation is a defect from that point on, not before.
- Use cases generalise these stories at M2's next step, and requirements derive from the use cases' steps. A step no story walks is a step nobody asked for.
- The set is not exhaustive. Add a story when something gets built that none covers, rather than sweeping for completeness now.
- sty-vendor-overlays-without-forking describes a chain that is designed and not built. It is a story about the to-be world, which is legal at M2 and becomes a lie if it is still unbuilt when the product claims vendoring works.

## anything_else

THE ENTRY READ FIRED AGAIN, and again served the worktree's copy — the method card as it stood before today, not the rewrite. I wrote these decks from the current card, which I authored an hour ago and still hold.

THE SAME GAP THEN BLOCKED THE SUBMIT, which is the useful part. The reference check reads the trace corpus from THIS RECORD's worktree, which is the owner's ruling and correct. It reads the ITEM TEMPLATE from the same place, and the template is METHOD — authored on trunk, absent here. So the form refused with "no item template exists" while the template plainly existed.

SO THE STOPGAP WAS APPLIED BY HAND: story.md copied into this worktree, which is exactly what the missing mechanism would have done (note-cc562f5f1fab). It also names the seam more precisely than the note did. Two roots are needed, not one: the CORPUS follows the record, the METHOD follows trunk. templateProblems passes a single root for both.

ONE DEFECT FOUND AND FIXED ON THE WAY. The trace graph read the project root while the walk writes to the record's worktree, so every story authored here would have been invisible on the graph — the third instance of that reader split today, after the form check and the green light. engine/render.ts now reads where the walk works, and the source guard in refs.test.ts covers it.

TWO STORIES OMIT `killer` ENTIRELY rather than writing false. The item template carries `killer: false` as a real default, so the node takes it. That is the defaults mechanism the owner ruled this morning, exercised for the first time.
