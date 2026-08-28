---
form: specify-build
by: agent
signed_off: 2026-08-26T14:54:11.583Z
authors: agent
files: null
---

# Evidence form / specify-build

## current_situation

The architecture named the elements and this state says how they are built. Four design specs stand below the architectural line.

THE WORK STORE holds every write — minting, matching on re-entry, placing, taking, settling. One writer, which is what makes the merge surface countable.

THE WORK OFFER holds the two hot-path reads: what a hand may take now, and what a position still owes per slot. It writes nothing at all, which is the cut.

MARKING A CARD says how a card declares which parts are work. Any line that opens a part carrying the reserved mark, at any level, with markdown's own scoping deciding where the part ends.

THE BUCKET EDITOR puts the machine and the work editor in one document because the platform delivers no drop between two webviews, and keeps them behaving as two because sharing a document is a plumbing fact rather than a UX one.

THE FOLD IS NOT A NEW SPEC. It belongs to the record lifecycle, which already carries it and was corrected during the architecture round.

## design_specs

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-marking-a-card]] | el-method-compiler · if-engine-delta-to-work-store · if-method-compiler-to-work-store | deliverable/machines/methods · deliverable/engine/machine.ts |
| [[dsp-the-bucket-editor]] | el-mirror · if-mirror-to-work-store | deliverable/engine/renderclient-panel.ts · deliverable/engine/basesclient.ts · deliverable/engine/editors |
| [[dsp-the-work-offer]] | el-work-offer · if-sizing-to-work-offer · if-work-offer-to-mirror | deliverable/engine/workoffer.ts |
| [[dsp-the-work-store]] | el-work-store · if-work-store-to-work-offer · if-work-offer-to-work-store · if-work-store-to-walk-engine · if-work-store-to-record-store | deliverable/engine/workstore.ts |

## promotions

| experiment | promote | chunk |
| --- | --- | --- |
| [[exp-can-a-drag-cross-two-panels]] | the state machine and the work editor must share one webview. The owner requires the drag between them, and the platform does not deliver a drop from one webview to another | merge the two surfaces into one webview — an architecture change rather than build work |
| [[exp-does-a-heading-mark-a-step]] | the requirement and the decision both stand — a card must say which of its parts are work, and a reserved tag on a heading line is how | one pass over 137 cards to mark them, and the compiler reading the mark |
| [[exp-how-many-items-a-position-actually-owes]] | the design question changes shape. Not whether the number is small, but whether the rare large one degrades gracefully | none — the surface work is the mirror's and this only tells it what to expect |
| [[exp-what-one-file-per-item-costs-its-two-neighbours]] | nothing for the repository. The vault half needs one run with the files present, and it needs the vault rather than a script | none — no build step follows from this, and the missing half is a measurement rather than work |

## follow_up

THE ORDER IS RISK FIRST, and the risk is the format nobody has run.

Build the compiler that reads a mark. Prove it on the two cards that disagree — one whose steps are headings, and the retro whose steps are a numbered list. Only then mark the rest.

THAT IS THE OWNER'S RULING AND IT IS ALSO THE STRATEGY. A crude working whole before any polish, and feedback before finish.

THE SECOND LENS IS THE SPINE. The store, the offer and the compiler are one thin end-to-end slice: a card becomes work, the work sits somewhere, and a hand is offered it. Every seam between the three is exercised by that slice before any surface exists.

THE SURFACE IS THE LAST LOT and it leans on exactly one earlier lot, which is what the flow rule asks for. It cannot start before the offer publishes a count and the store accepts a move.

TWO MEASUREMENTS BELONG INSIDE THE BUILD. The whole cost of a mint, once minting exists — one hop timed twice, with and without. And the write half of that mint, since only the derivation was ever timed.

## anything_else

