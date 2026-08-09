---
form: write-stories
by: agent
signed_off: 2026-08-07T19:42:48.034Z
reopened: "2026-08-07T18:59:02.767Z — the qualities restructure was ruled on 2026-08-07 and never applied: five stretched quality stories stand where one explainer belongs"
authors: agent
files: null
---

# Evidence form / write-stories

## current_situation

THE FIRST SET WAS THE WRONG SHAPE, all eighteen of it, and the owner ruled it so on 2026-08-06. They quoted two back: "When a new engine version arrives, I want my own method to survive untouched" and "When I point the agent at building, I want the machine to refuse until the input is earned." Neither is a story. Nothing happens in them.

A STORY IS A JOURNEY. A person walks through the product from one end to the other. They arrive somewhere, they click something, something answers, they arrive somewhere else. That order is why it draws as slides, and a capability statement has no order at all.

The test is mechanical: if any two sentences could swap without loss, it is not a story.

THE EIGHTEEN ARE NOT LOST. They describe what the system can DO, which is the use-case question. They are preserved as `inputs/use-case-seeds.md` and generalize-use-cases mines them.

THE METHOD CARD WAS AT FAULT and is fixed. It said "a named actor doing one real pass", which is nearly right and not enough — it never said the pass had an ORDER, and it never said what the shape rules out. Both failing examples now sit in the card as counter-examples.

TWO MORE STORIES ARRIVED FROM THE NEXT STATE. Reverse-engineering the use cases found two goals no journey told, and the rule is that the story comes first.

AND FOUR MORE ARRIVED FROM THE GATE. Its first run found four capabilities with no story and no use case, LISTED them, and recommended pass anyway. The owner ruled that a fail on 2026-08-06: naming a gap does not close it. So they are closed rather than disclosed.

AND THREE MORE FROM THE GATE'S SECOND RUN. Walking the live tool list and the live doors by hand found three capabilities a person can reach this minute with no journey describing them. The last of the three was created while filling the gate: the prior-art scan was exactly that pass, and no journey covered it.

THE FIVE QUALITY STORIES ARE STRUCK, and one explainer replaces them (owner ruling 2026-08-07). One each for auditability, learnability, maintainability, portability and recoverability. Every one named a property of the system and then described it — the same defect the first eighteen had, surviving inside the second set because nobody re-applied the test to them.

A QUALITY IS NOT A JOURNEY. There is no pass through the product called being maintainable. What IS a journey is a person meeting their first quality and needing somewhere to put it, and that is the explainer in the list below. It walks them to the nine characteristics of ISO/IEC 25010:2023 and shows the row landing under one of them.

WHY ONE AND NOT NONE. The qualities proposition is a value prop, and the coverage check refuses a proposition no story refines. It also deserves one: the qualities section is the part of the register a newcomer least expects, so the explainer earns its place.

Twenty-two stories. Six killers, unchanged — none of the struck five was one, and the explainer is not one either.

## stories

- sty-what-a-quality-is
- sty-ramp-up
- sty-take-the-tour
- sty-next-iteration
- sty-start-a-new-product
- sty-review-a-gate
- sty-land-the-work
- sty-close-the-day
- sty-hand-over-and-walk-away
- sty-walk-it-by-hand
- sty-improve-the-machine-mid-walk
- sty-ask-the-tests-a-question
- sty-come-back-after-a-week
- sty-clear-the-inbox-with-a-retro
- sty-capture-a-stray
- sty-answer-why-a-year-later
- sty-look-at-a-closed-record
- sty-the-agent-proves-it-read
- sty-vendor-it-into-my-product
- sty-diverge-on-purpose
- sty-let-the-system-catch-up
- sty-ask-and-record-the-answer

## follow_up

- THE COVERAGE FIELD IS STRUCK. It restated what the engine already computes, and the owner ruled it out on 2026-08-06. The mechanical check stays; the prose describing it goes. The row change is written and waits on the trunk.
- WHAT WAS NOT COMPUTED MOVED HERE. Which stories are killers and why is judgment, and it lives under `anything_else` below rather than in a field that duplicated the check.
- NOTHING RENDERS THE DECKS. Not this repo, not VS Code, not any marketplace extension that knows the `|||` split. A small renderer belongs in the panel: split on `---`, split each slide on `|||`, draw two columns.
- THE RENDERER MUST NOT GO IN THE HTML MIRROR, which the owner ruled out the same day. It goes in the panel, once.
- THE PRODUCT-SELECTION ANSWER WANTS A RULING. The story proposes folder-is-product; nothing is built on it yet.
- The evidence sides are empty by design and fill at M8. A blank right half after validation is a defect from that point on, not before.
- The set is not exhaustive and coverage is not completeness. Add a story when something gets built that none of these covers.

## anything_else

THE RAMP-UP IS FIRST, AND EVERY OTHER STORY BEGINS WHERE IT ENDS. An empty machine, nothing installed, and the person has to reach the first screen. Installing, booting and every click on the way live in that one story rather than being scattered through the others.

THE KILLERS, six of them, and why the product dies without each. This is judgment, which is why it survives the struck coverage field.

- sty-ramp-up. A system nobody can install is a system nobody has. Every other claim is downstream of somebody reaching the front desk.
- sty-start-a-new-product. If the second product is harder than the first, this is a project and not a product.
- sty-review-a-gate. If a gate cannot be read, argued and rejected against the artifacts themselves, the bless is a rubber stamp and the enforcement is theatre.
- sty-hand-over-and-walk-away. The unattended walk is the proposition. If it stops at everything or at nothing, the autonomy range collapses to one setting.
- sty-walk-it-by-hand. The zero end of the same range. If the method only works with an agent, the method is the agent.
- sty-the-agent-proves-it-read. If a read cannot be told from a polite yes, every step downstream rests on a claim nobody checked.

A STORY DID DESIGN WORK, which is the point of writing one. sty-start-a-new-product could not be told without answering a question nobody had answered: is a product chosen at boot, or at the front desk?

THE ANSWER THE STORY SETTLES: a product IS a folder, chosen at boot by which folder is opened. There is no picker and there should not be one, because everything a product owns — spec, machines, notes, log — lives in that tree. A picker would have to switch trees, which is what opening a folder already does. Starting a new product from the desk means scaffolding a folder and opening it in its own window.

THAT IS A PROPOSAL, not a ruling. It is recorded here because the story cannot stand without it, and it wants the owner's word before anything is built on it.

WHAT THE SECOND ATTEMPT CHANGED. The first set answered "what can the system do". Every entry named a property and then described it. Read as slides, the slides could be shuffled without loss, which is the tell.

The second set answers "what happens to a person using it". Each one has a first slide where they arrive with nothing and a last slide where they have something. The middle is in the only order it could be in.

## choice

iterations/i1/generalize-use-cases
