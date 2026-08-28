---
form: observe-red
judgment: passed at 2026-08-26T14:58:45.148Z with deliverable/engine/bin/red-observed.ts@94845e5a35bf
by: agent
signed_off: 2026-08-26T14:58:19.035Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

Nine test specs stand below the architectural line. Seven of them are `method: test`, and the engine observes their reds itself by running them.

Two are not tests. One is an inspection of the corpus, and one is a demonstration a person performs. No run can show their red, so this state is where a person observes it by hand.

Both are red today, and for the same underlying reason. Nothing in the build has started, so the thing each check looks at does not exist.

What is worth recording is that they are red in two DIFFERENT ways, and only one of them is countable.

### The inspection: one attribute is countable today, four are not

The inspection spec carries six attributes. I ran them against the tree with `scratchpad/observe-red-inspection.mjs`, over 2,506 files under `deliverable/`, `guidance/` and `spec/trace/`.

Four of them count something inside the work model. There is no work model, so the count is not zero — there is nothing to count at all. That is an honest red, and it clears the moment the store lands.

One attribute asks that a single list names every place work is modelled. The requirement exists at `spec/trace/requirement/req-every-place-work-is-modelled-is-named-in-one-list.md`. The list itself does not exist anywhere in the tree. Red.

One attribute is countable right now, and it fails. The word `token` is used for two different things.

- 743 uses name a piece of work.
- 41 uses name the walk's own marker, in `inbox.ts`, `machine.ts`, `sessionclaims.ts`, `branching.test.ts` and `tokens.test.ts`.

The pass line is zero. This one is red on text that already exists, which makes it the only attribute this state can prove rather than assert.

### The demonstration: unperformable, not failed

The demonstration spec asks a person to steer a running iteration by looking at the work and dragging it.

Its procedure cannot be performed. There is no bucket editor, no count on a state, and no place to drop a row. A procedure with no surface to run on has not failed the demonstration — it has not been able to start it.

I am recording that distinction rather than writing `fail`, because the two clear differently. An unperformable procedure clears when the surface exists. A failed one clears when the behaviour changes.

## red_observed

- [x] tsp-a-person-steers-the-work-by-looking-and-dragging
- [x] tsp-the-corpus-models-work-the-way-it-says-it-does

## follow_up

Two things carry into the build, and neither is a new piece of work.

### The word collision has a home already

The 41 walk-marker uses of `token` are renamed in `mark-the-corpus`, the last chunk. That chunk already owns the sweep over the corpus, and this is the same sweep.

I am not opening a separate item for it. It is one `se_file_replace` over a named set of files, inside work that is already planned.

### The measurement script stays

`scratchpad/observe-red-inspection.mjs` is what re-runs the countable attribute. It is the check that turns green, so it gets promoted into the inspection spec's own checklist rather than left in the scratchpad.

That promotion happens when the work store lands, because four of the six attributes cannot be written as counts until there is something to count.

### Next

The build starts at `mark-a-card`, which nothing depends on and which everything downstream reads.

## anything_else

The engine drew both checklist items and I accepted both without moving either. There was nothing to reject: the two non-test specs are exactly the two the drawing named.

What I added is the OBSERVATION on each line, which is the part the drawing could not compute. A drawn item says which specs are non-test. It cannot say what their red looks like today, and that is the whole point of a person standing here.
