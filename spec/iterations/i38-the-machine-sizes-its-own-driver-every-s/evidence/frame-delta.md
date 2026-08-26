---
form: frame-delta
by: agent
signed_off: 2026-08-20T19:03:08.692Z
reopened: "2026-08-20T19:03:06.923Z — The value proposition this state registered was widened: a finished walk must say which HAND did each part, not only which model. The owner named a WALKER doing the daily work and a GUIDE asked for the hard steps, and either may work the lane. Neither the model nor the state coordinate can tell them apart, so the proposition needed a third success criterion and its outcome restated."
authors: agent
files: null
---

# Evidence form / frame-delta

## current_situation

The actual is measured and signed: the rails exist, the cargo does not. No rating anywhere, no model list, no model on a call, and no way to say which state a call belonged to.

This state turns that into a claim positioned against the field the kickoff gate actually scanned, rather than against nothing.

Two value-prop nodes were minted here, one for each half of the delta.

## gap_claim

THE GAP, AS A CLAIM: the machine knows what work it is asking for and does not use that knowledge to decide who does it.

Everything needed to know is already declared. A state's row says what it produces, whether a template bounds the answer, whether a live source draws it, and whether a gate reviews it. The machine reads all of that to build the walk. It then hands every one of the fifty-three states to the same driver, chosen once, outside the machine, by whoever typed the command.

POSITIONED AGAINST THE FIELD THE GATE SCANNED, and the field splits in two.

THE ROUTERS SHED DETERMINISM. Cursor's router scores complexity per request from a model trained on live traffic; Bedrock predicts response quality per request against a tunable threshold; OpenRouter classifies into task types and ranks on a rolling spend index. All three fit the individual item and are corrected by outcomes. What they give up is reproducibility: the same work does not get the same model twice, Cursor hides the routed model by default, and Copilot's review path does not disclose it at all. For a process whose whole output is an auditable record, that is the wrong thing to shed.

THE AGENT FRAMEWORKS SHED THE DECISION ITSELF. Claude Code puts the subagent model in frontmatter defaulting to inherit; the OpenAI Agents SDK makes it a constructor argument and says plainly that mixing is the developer's call; LiteLLM's router strategies are about infrastructure state rather than task difficulty. They are static like us, and none of them derives the declaration from anything — the human types it and it stands.

SO WHAT OURS SHEDS AND WHAT IT KEEPS. We shed per-item fitness and the feedback loop, which is the routers' whole advantage, and we keep determinism and disclosure, which is the frameworks' whole advantage minus their arbitrariness. THE DIFFERENCE FROM THE FRAMEWORKS is that our declaration is attached to a STATE the machine already understands rather than to an agent somebody configured, so it can be derived and it can be audited. That is the narrow, defensible strip between the two halves of the field, and it is the only strip worth standing on.

THE HONEST WEAKNESS IN THE CLAIM, said here rather than discovered later: the schedulers that have run declared resource classes for years all learned the same lesson, and it runs against us. Kubernetes refuses to let anyone declare a QoS class and computes it instead. Google measured hand-managed jobs at twice the slack of machine-corrected ones. A 2026 survey of more than twenty-three thousand clusters found sixty-nine percent of requested CPU unused, cause given as declarations that are never updated. Under-declaration fails loudly and over-declaration fails silently, everywhere, which is why the drift always runs one way. OUR DESIGN HAS EXACTLY THAT SHAPE and the claim does not pretend otherwise; it stands as a registered risk with a named way out.

## why_now

THREE THINGS MATURED, AND THE THIRD IS THE ONE THAT MAKES IT CLOSABLE RATHER THAN MERELY DESIRABLE.

THE MATRIX BECAME ONE FILE PER STATE WITH PER-COLUMN CELLS. A per-state value now has an obvious home, and 53 row files are already the unit of authorship. Before that, a rating had nowhere to live that was not a table somebody would have to keep in sync.

THE READ-LIVE MACHINE FILE BECAME A PATTERN RATHER THAN A ONE-OFF. Both dials — the autonomy rungs and the stop-at notches — are now files a person edits, read live by the engine, with the ordering of the lines carrying the scale and no numbers on the page. The owner ruled the numbers out of both in the same week. A model list is the third of exactly that kind, and it does not need its mechanism argued.

AND THE SPLIT BETWEEN THE TWO AXES WAS SETTLED RATHER THAN ASSUMED. The first shape put autonomy on one side and complexity on the other and a model in each cell. Dropping the grid is what makes this a small change: two independent lookups, each answering the question it is actually about — autonomy decides whether a person or a reviewer must look, complexity decides how strong the hand is. Prior art agrees, and it is old: GitHub Actions puts runner selection in one place and human approval in another, configured entirely separately.

WHAT HAS NOT MATURED, AND WHY IT IS STILL WORTH DOING NOW. The record still cannot say which state a call belonged to, so the backward half of this delta is reachable only in part. That is a reason to name the gap in scope rather than a reason to wait: the forward half — rate the states, publish the list, name the driver — stands on its own and is what makes the backward half worth building at all.

## value_props

- vp-the-machine-says-how-strong-a-hand-each-step-needs
- vp-a-finished-walk-can-say-who-did-which-part-of-it

## business_case

SKIPPED WITH A REASON, AND THE REASON IS THE FIRST HALF OF THE FIELD. There is no acquirer here — the product's own development is its user, and the currency it would be measured in is the owner's token bill and the owner's attention.

WHAT CAN BE SAID WITHOUT INVENTING A NUMBER. The published cost reductions from live routers are large and they were bought with the machinery this design deliberately does not have: Cursor reports figures in the tens of percent against its own baseline, achieved by a trained predictor corrected by outcomes. Quoting those in support of a fixed table would be borrowing the numbers of a different design.

AND THE ONE NUMBER THIS DESIGN COULD HONESTLY QUOTE DOES NOT EXIST YET, because nothing today can attribute a call to a state. The saving is unmeasurable in this system until the coordinate is there. Saying so is the case; a projection would be a fiction.

AND THE CASE IS WEAKER THAN THIS FORM FIRST WROTE IT, which the register sweep found after this state was first signed.

THE PAYOFF WAITS ON A DOOR THIS ITERATION DOES NOT OWN. A standing entry from i28, still open and graded crippling and expected, says weaker models cannot produce the boot reading proof at all — the first step of the first thing every machine does closes to them. Routing a cheaper driver to a cheaper state buys nothing while that holds.

SO THE SEQUENCING IS THE CASE RATHER THAN THE SAVING. This iteration makes the saving nameable; something else has to make it reachable. Stated here because a case that reads as though the payoff arrives on ship day is a promise the tree cannot keep, and raid-dep-the-payoff-waits-on-a-weak-model-being-able-to-boot-at-all now carries it where a reader will meet it.

## follow_up

- The scope state is next and it has one real question to settle: whether the backward half of the delta ships with the forward half or waits. `raid-iss-a-call-cannot-be-attributed-to-the-state-it-was-made-in` is the input to it.

- The gap claim's honest weakness — the scheduler literature runs against a declared class — should be carried into the requirements rather than left in this form. The two named ways out (derive the rung from a declared checker, or reconcile it afterwards) are requirements-shaped, not prose-shaped.

- vp-a-cheaper-model-does-the-mechanical-work already stood before this iteration and is its direct ancestor. It is referenced from both new nodes rather than restated.

- RE-EARNED AFTER define-actual WAS RE-SIGNED. The gap claim is unmoved: the machine still knows what work it is asking for and still does not use it. The why-now is unmoved. What moved is the business case, and only in the direction of being weaker — the payoff waits on the boot door.

- ONE SENTENCE HERE WAS FALSE WHEN FIRST WRITTEN and is now true: the ancestor value prop is referenced from both new nodes. It was fixed in the world rather than edited here, and the node it was missing from carries the sharper version — nothing today could tell you whether a record walked to its gates on a small model, which is exactly what that ancestor asks.

## anything_else

