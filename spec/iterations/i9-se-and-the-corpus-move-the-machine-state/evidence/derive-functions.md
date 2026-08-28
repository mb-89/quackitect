---
form: derive-functions
amended: 2026-08-19T15:12:38.816Z by agent — the consent prompt this field hands to the design milestone was struck by the owner on 2026-08-19
by: agent
signed_off: 2026-08-19T13:35:11.252Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

The resident function structure has two roots and 37 nodes. The change's cone touches three of them, and one of the three did not exist.

DERIVING THESE FUNCTIONS FOUND SOMETHING THE REQUIREMENTS MILESTONE HAD MISSED, which is the twin-peaks effect the method warns to expect. req-product-is-a-folder has stood since i1 as a must graded crippling: every artifact a product owns lives inside that product's own root folder, with zero product-owned files outside it. Its own list names the notes, the inbox, the evidence files and the logs.

ALL FOUR SIT OUTSIDE THAT FOLDER TODAY. So this iteration closes a standing violation rather than adding a demand, and that is a stronger case for the change than anything argued at its kickoff.

THE REQUIREMENT WRITTEN HERE WAS NARROWED IN RESPONSE. req-the-machine-state-sits-in-the-folder-that-is-open no longer restates containment. It claims only the referent — which folder the product's root IS — and the invariant that the answer does not change across a branch switch. write-requirements was amended to record both, with its signature kept.

## functions

- project/spec/trace/function/fn-run-a-governed-walk.bring-the-product-up.md
- project/spec/trace/function/fn-run-a-governed-walk.resolve-a-path.md
- project/spec/trace/function/fn-run-a-governed-walk.stand-up-a-product.md

## flows

- project/spec/trace/flow/flow-scaffolded-product.md
- project/spec/trace/flow/flow-toolchain.md
- project/spec/trace/flow/flow-live-lane.md

## neutrality

THE TEST WAS RUN ON EACH ROW: could two honestly different designs both do this?

BRING-THE-PRODUCT-UP — THREE DESIGNS, ALL LIVE IN REAL PRODUCTS. The editor activates on something it finds in the folder and starts the lane. A resident service notices the folder opening and starts one. Or the lane runs always and binds to whichever folder is in front of it. Each satisfies both rows this function carries.

THE CONSENT RECORD'S HOME IS LEFT OPEN TOO. The row demands only that it sit outside the folder, because a record kept inside would travel with the next copy. Where outside is a design question with several real answers, and the prior art showed three vendors each choosing differently.

THE RESOLUTION ROW NAMES NO MECHANISM, and this is where the M2 gate's prior-art comparison changed something. Every command-line tool in the sample finds its root by walking up to a marker, and testing for the machine-state folder at the root IS a marker check under another name. So the design space is wider than this iteration's own prose had assumed, and the row was written to leave it open rather than to close it.

THE DISCOVERABILITY ROW WAS THE HARDEST TO KEEP NEUTRAL and it survives. It says the folder presents the one thing to run where a first-time reader looks first. It does not say a readme, a launcher name, a notification or an activation event, and the comparison found four mechanisms that genuinely surface something plus one convention that surfaces nothing.

ONE SUBTLE FAILURE WAS LOOKED FOR AND NOT FOUND. A function that only makes sense given one design is the tell no word list catches. Asked of bring-the-product-up: in a design where the lane is always running, this function is what binds it to a folder and checks whether that folder carries machine state, which is still real work with the same outcomes. The function survives its own rejected designs.

## follow_up

THE DESIGN MILESTONE ENUMERATES FROM THREE FUNCTIONS, and every one of them was left with a real choice rather than a foregone one.

- How a folder is recognised as a project, where a marker check and a walk upward are both mainstream and neither is chosen.
- STRUCK. This read "where the consent record lives". The owner ruled on 2026-08-19 that no record is kept and nobody is asked, so there is nothing here for design to place.
- Which mechanism presents the one thing to run, from four that a host already scans for.

ONE ALLOCATION MOVED AND THE REASON IS WORTH KEEPING. Discoverability first looked like the newcomer tour's work. That function derives its explanation FROM the live system, and nothing is live before the launcher runs, so it could not reach the moment at all. It sits with standing a product up instead.

ONE FUNCTION NOW CARRIES A PASS LINE READ OFF PEOPLE. stand-up-a-product has never had one. Verifying it now needs first-time readers, and that is a scheduling cost rather than an engineering one.

A STRUCTURAL ODDITY WAS NOTICED AND NOT TOUCHED. The arrive-on-a-machine branch has seven children and no root node of its own, while the walk branch has both. It is outside this iteration's cone and nothing here depends on it.

## anything_else

### What crosses, and why nothing new had to be minted

ONE FUNCTION IS NEW AND ITS FLOWS ARE THE ONLY NEW ONES. bring-the-product-up consumes the installed product and the toolchain, and produces a lane that answers. All three already stood as nodes.

THE PANEL IS DELIBERATELY NOT AN OUTPUT HERE. Drawing where the walk stands belongs to show-where-it-stands, which already produces that surface. Claiming it here would give one output two producers.

THE OUTPUT-NOBODY-CONSUMES CHECK RAN AND FOUND NOTHING NEW. The live lane is consumed by every function that answers a call, which is what serving a step does on each pull.

THE TWO PATCHED FUNCTIONS GAINED NO FLOWS, and that is a result rather than an omission.

- resolve-a-path gained a question about which tree, which its controls already asked. This iteration gave one of the path kinds a referent it never had, and a referent is not a thing that crosses a boundary.
- stand-up-a-product gained a row whose pass line is read off people rather than off the machine. That changes what verifying the function costs and adds nothing that flows.
