---
form: trace-design
by: agent
signed_off: 2026-08-26T16:05:50.515Z
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

The build is done and five new code files stand. The question this state asks is whether each one is claimed by a design spec, and whether each spec's named files exist.

### The drawn table caught a stale claim before I read it

`dsp-the-bucket-editor` named three files the design EXPECTED to edit: the panel client, the bases client and the editors folder. None of the three turned out to be the home.

WHAT IT ACTUALLY TOOK was two new files and one product declaration. So the spec named files it did not realize, and left two real files unclaimed.

THE GUESS MISSED FOR A REASON WORTH KEEPING. The design reasoned from where the DRAG precedent lives, and a precedent is a shape to copy rather than a home. The editors folder was the sharper miss: those render inside an evidence form, and a panel card is a different thing that happens to share the word.

The spec now names what it realizes, and says why the first list was wrong.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-marking-a-card]] | el-method-compiler · if-engine-delta-to-work-store · if-method-compiler-to-work-store | deliverable/machines/methods · deliverable/engine/cardwork.ts |
| [[dsp-the-bucket-editor]] | el-mirror · if-mirror-to-work-store | deliverable/engine/work-card.ts · deliverable/engine/workclient.ts · deliverable/views/cards.md |
| [[dsp-the-work-offer]] | el-work-offer · if-sizing-to-work-offer · if-work-offer-to-mirror | deliverable/engine/workoffer.ts |
| [[dsp-the-work-store]] | el-work-store · if-work-store-to-work-offer · if-work-offer-to-work-store · if-work-store-to-walk-engine · if-work-store-to-record-store · if-record-store-to-work-store · if-holding-pen-to-work-store · if-work-store-to-work-registry | deliverable/engine/workstore.ts |

## follow_up

Verification is next, and it runs the whole battery itself.

### What it will find, said before it runs

ONE TEST IS RED AND IT IS NOT THIS BUILD'S. The read-once guard, measured at 298 + 3 per node against a ceiling with no constant term.

THE CORPUS INSPECTION HAS AN ATTRIBUTE THAT CANNOT PASS YET. No single list names every place work is modelled, and nothing was written to be that list.

THE DEMONSTRATION CANNOT BE PERFORMED BY A TEST. Whether a person can steer by dragging is a thing a person judges, which is why its spec is a demonstration.

### What is claimed and what is not

FIVE NEW CODE FILES, all five claimed: the card compiler, the work store, the work offer, the work card and its client.

FILES THIS BUILD EDITED BUT DOES NOT CLAIM are existing ones owned by other specs: the renderer, the stylesheet, the widget vocabulary, the mirror's routes and the session. Each was extended rather than realized here.

## anything_else

