# Level 3 — apps and factories

**Status: first draft.** Built on Levels 0–2 and nothing else.

| | |
|---|---|
| Date | 2026-08-29 |
| Scope | v4, the application layer |
| Depends on | Level 0 (interception, identity, record) · Level 1 (tokens, crew) · Level 2 (machines) |

Same admission test: **name, ruling, why, and what breaks without it.**


**This document states intended behaviour, not solutions**. Where an earlier version is
cited it is as evidence. That evidence is a measured failure, or a confirmed fact about
what exists. It is never a mechanism to inherit. How any of this is built is decided
when it is built.

---

## What Level 3 is

**The things that actually do something.** Level 2 gives you the ability to order work. It
deliberately does not know what work. Level 3 is where a machine says something.

Two kinds, and they are different:

- An **app** is a machine plus its link. It is the unit somebody walks.
- A **factory** is a function from parameters to a machine. It is one of two ways an app
  comes to exist — the other being that somebody drew it.

**This layer is deliberately thin**. Almost all of it is content, not design. The design
surface is how an app is linked and what a factory is allowed to be. Everything else is
the method itself, which is authored, not architected.

## What Level 3 knows about the levels below

It uses machines, states, conditions, tokens and the crew, and **re-decides none of them**.
A new app is a new PlantUML file and a link. A new factory is a new function. Neither may
require a change in a lower level — if one does, that is the finding, not the feature.

## Level 3 standalone

One hand-authored app, linked, and no factories at all. Everything below runs unchanged.
The first factory must be addable without touching Levels 0–2.

## Governing rules

1. **An app is a machine plus a link.** No registry, no manifest, no install step.
2. **A factory is deterministic**: same parameters, same output, always.

3. **A factory emits UML.** It has no other power, and needs none.
4. **Adding a factory is adding a function.** If it needs a special case anywhere, the
   design is wrong.

---

## Apps

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| An app is authored as a machine and **linked from where walks begin** | **ACCEPTED** | The edges leading out of the starting point already are the list of what can be done. Linking is drawing one. | A registry, a manifest, and a discovery mechanism — three things to keep in step with a drawing that already knows. |
| That drawing **is** the app list | **ACCEPTED** | Nothing to keep in sync, because there is only one statement of it. | The list and the reality drift, and the drift is silent. |
| App names share the uniqueness check with archived machines | **ACCEPTED** | Level 2 enforces uniqueness across live machines ∪ archive tags. An app is a live machine. | Two things answer to one name and a reference resolves to whichever was found first. |
| Anything else about apps | **NOT DESIGN** | An app is content. What states it has and what it means is authored. | — |

## Factories

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A factory **modifies the UML**, and nothing else happens | **ACCEPTED** | The compiler is the append mechanism and machines are re-read live, so there is no splice operation, no attachment protocol and no transaction to design. A factory edit and a human edit are the same event. | An entire append subsystem exists to do what a text write already does. |
| Appending to the current machine is the **default** | **ACCEPTED** | It is what v3 does, it works, and milestones as group boxes rather than sub-machines is the drawing that is wanted. | A structure change nobody asked for, to buy a purity nobody needed. |
| A dedicated sub-machine is a **parameter**, not a different mechanism | **ACCEPTED** | The factory emits a fresh machine holding only a start, and appends from there. Same operation, different target. | Two mechanisms for one idea, and the second one only ever used occasionally. |
| A factory is **deterministic** | **ACCEPTED** | It makes the machine reproducible from its inputs, which is what lets git be the whole audit trail. | The same parameters produce different walks and nothing can be replayed or checked. |
| A factory is invoked as a **token assigned to the engine** | **ACCEPTED** | Mechanical work is work assigned to the engine — Level 1 already says so. No new invocation path. | A bespoke trigger mechanism per factory, which is the special-casing this layer exists to avoid. |
| The factory's **name and parameters** are recorded with the edit | **ACCEPTED** | The generated text is in git. The recipe that produced it must be too, or a later factory change makes the walk unexplainable. | The machine can be read but not accounted for. |
| Writes go through the ordinary guarded path | **ACCEPTED** | Level 0's CAS applies, so a factory and a human editing the same file conflict rather than clobber. That is why they may share a file. | Concurrent edits silently overwrite each other, and the earlier "generated and authored must not share a file" rule would have to come back. |
| Git is the append log | **ACCEPTED** | Every factory edit is a commit. Result and history, without inventing either. | A separate append log, kept in step with the file by hand. |
| A factory may splice **behind** the walker | **REJECTED** | Level 2 already answers what happens: a cleared state whose conditions change reopens. A factory is not exempt from that, so there is nothing extra to allow. | A second, factory-shaped path to the same effect, with different semantics. |

**The rigor matrix is the first instance of the class, not the class**. It takes a change
size and emits the states for it. Nothing about it may be privileged. If it needs
something no other factory could ask for, that is a defect in this layer.

## Delta review

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A phase boundary **marks the tree** | **ACCEPTED** | Expressible with what exists: an entry script that commits, recorded as evidence on the state that made it. No new primitive. | A bespoke marking mechanism, or no way to say "since when". |
| An approver's token names **two marks**, and it reviews the delta | **ACCEPTED** | Content review over the whole grows without bound. Eventually the approver reads shallowly, and a shallow approver is worse than none. | Batch review stops scaling exactly when the record gets big enough to need it. |
| **Delta for the work — the whole for the coverage** | **ACCEPTED** | Not everything can be delta-scoped: a forgotten requirement is only visible in the set. But coverage runs over an *index*, not over content, so it stays cheap while content review does not. | Either nothing ever sees the whole again — losing the one check that finds omissions — or every gate re-reads everything. |

## SIPOC

A process is authored as a note with fixed slots. Source, input, process step, output,
consumer, enabler.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A process is a **note**, not a drawing | **ACCEPTED** | Six fixed slots means a form. Layout is decided, so there is nothing to draw | A diagram for something whose shape never varies |
| The note is a **factory input** | **ACCEPTED** | A factory compiles it into a machine, exactly as a change-size template does | A second path from authored content to a machine |
| **P is every step**, not the whole process | **ACCEPTED** | The owner's correction to the standard model. Uncertainty attaches to a step | Uncertainty floats free, and the register has nothing to anchor to |
| **A step whose output nothing consumes is an orphan** | **ACCEPTED** | This is the check the model exists for. Mechanically: evidence produced at one state and read by no later condition | Ideas that nothing consumes, which is the failure in both earlier versions |
| A step whose input has no source is **also** an orphan | **ACCEPTED** | The other direction. That step cannot run | A step that can never start, discovered by standing in it |
| **Enablers are the dependency layer** | **ACCEPTED** | What makes a step possible without being consumed by it: guidance, a skill, an engine, a licensed source. An unavailable enabler is a register issue, not work | Dependencies with no name and no home |

## What is not here

The method itself. Which apps exist, what states they have, what each gate asks, which
change sizes exist, what the milestones are. That is authored content, and it belongs in
the vault rather than in a design document.
