# Level 2 — the state machine

**Status: first draft.** Built on Levels 0 and 1 and nothing else.

| | |
|---|---|
| Date | 2026-08-29 |
| Scope | v4, the ordering layer |
| Depends on | Level 0 (interception, identity, record) · Level 1 (work tokens, crew) |

Same admission test: **name, ruling, why, and what breaks without it.**


**This document states intended behaviour, not solutions.** An earlier version is
cited as evidence only. It is a measured failure, or a confirmed fact about what
exists — never a mechanism to inherit. How any of this is built is decided when it is
built.

---

## What Level 2 is

**Ordering.** Level 1 can describe, delegate, evidence and close work. It cannot say what
comes before what. Level 2 adds exactly that and nothing else.

A state is an identifier with conditions. **The state does not know what its conditions
are**. They are encoded, evaluated elsewhere, and expressed entirely in Level 1 tokens.
That is what keeps this layer thin.

## What Level 2 knows about the levels below and above

**Below:** it uses Level 1 primitives — token, assignee, scope, evidence — and never
re-decides them. A condition is a set of tokens. Whether they are met is Level 1's answer.

**Above:** nothing. Which machines exist, what they contain, and what method they encode is
Level 3. Words that must not appear in a Level 2 implementation: iteration, milestone,
kickoff, rigor. The name of any specific process must not appear either.

## Level 2 standalone, and the degenerate case

**One machine, one state, no edges.** Level 1 sits inside it and behaves exactly as it does
alone. Every Level 2 mechanism is inert: nothing to enter, nothing to leave, no choice, no
archive. That is the test — if the degenerate case needs a special path, the layering is
wrong.

## Governing rules

1. **One state at a time.** No token sets, no joins, no parallel legs.
2. **All conditions are Level 1 tokens.** A condition is never a bespoke predicate.
3. **A machine has exactly one walker, and the walker holds the marker.**

4. **You may always walk back. Re-deciding is a reopen, not a walk.**
5. **Recorded-ness is declared per machine**, not per state and not per record.
6. **A closed machine is immutable, so a pointer to it is a record.**

---

## The machine

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **PlantUML** is the machine format | **ACCEPTED** | Text: diffable, greppable, mergeable. It also collapses the hand-drawn / generated split, which is the actual complaint. A generated machine is generated text, an authored one is written text — one parser and one renderer. | Two authoring paths with two compilers, and a machine whose diff is dominated by box positions. |
| **No coordinates, ever** | **ACCEPTED** | Layout is derived. A diff then shows only meaning. | Moving a box to see it better registers as a change to the method. |
| Layout must be **deterministic** | **ACCEPTED** | Small edits must produce small visual changes. | The picture reshuffles on every edit, the human loses orientation, and coordinates get demanded back. |
| Composite states carry sub-machines | **ACCEPTED** | PlantUML nests natively. The kernel already nests. | A convention has to be invented for something the format already expresses. |
| Edge roles ride the **transition label**, not colour | **ACCEPTED** | Survives copy-paste, diffs legibly, cannot be ambiguous. v3 puts roles on canvas style attributes, which none of that is true of. | Role information that is invisible in a diff and lost on edit. |
| A declared **subset**, everything else refused by name | **ACCEPTED** | PlantUML's grammar is large. A tenth of it is needed. v3's compiler already refuses with the offending element named. | Syntax that is silently ignored, so the machine means something other than what it draws. |
| Generated and authored machines are **not the same file** | **OPEN — needs a ruling** | Two writers on one file is the clobber problem already settled for config. Either a generated machine is regenerated wholesale and hand-edits refused, or the first hand-edit promotes it to authored and generation stops. | An owner edit is silently overwritten on the next regeneration, or a generator refuses to run. |

States stay **Markdown**, as today: the machine names them, the note carries statement,
guidance, conditions, tools and priority.

## The state

**Kinds — reduced from six to four.**

| Kind | Ruling | Why | Breaks without it |
|---|---|---|---|
| `start` | **KEEP** | One per machine. It is a position, not a place work happens, so it grants nothing but orientation. | No defined entry point. |
| `end` | **KEEP** | One per machine. Activating it closes the instance, which is what pops a nested machine. | Nothing marks completion, and a nested machine never returns. |
| `work` | **KEEP** | The default, and with the gate kind the only kind that can owe a signature. | — |
| `gate` | **KEEP** | The only place a batch check over everything so far attaches. | Continuous review, with nothing that ever looks at the whole. |
| `terminal` | **DROP** | Two names for one behaviour. v3 has both and treats them identically everywhere. Nothing authored uses the second. | Nothing. |
| `join` | **DROP** | It exists to collect parallel legs, and parallelism is out. | Nothing — with one state at a time there is nothing to join. |

**Conditions** — what has to be true to enter a state, and to leave it:

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| One evaluator, one parameter: `enter` \| `leave` | **ACCEPTED** | Entry and exit are the same question asked at two moments. | Two code paths that must be kept in agreement. |
| Absent dictionary means always true | **ACCEPTED** | The degenerate machine needs no conditions at all. | Every state must declare emptiness. |
| One spelling per condition, nesting refused | **ACCEPTED** | Two ways to write the same declaration is two parsers and one of them eventually lags. | Two spellings for one thing, and a state that means something different from what it reads. |
| A condition kind cannot exist without a written explanation of what it means | **ACCEPTED** | Adding a kind then costs writing it down, which is the only thing that keeps the vocabulary explicable. | Condition kinds accumulate that nobody can explain and nobody dares remove. |
| Each kind names a **distinct kind of proof** | **ACCEPTED** | Something was read. Something was read and is then done with. A form is filled. An inbox is clear. A script passed. Distinct proofs, not variations on one. | A single general condition that means whatever its author assumed. |
| Pending work never blocks by itself — a state may **demand** that it be clear | **ACCEPTED** | Inventory is not a barrier — but a state is entitled to say it wants a clean slate before proceeding. Two different things. | Either pending blocks everywhere, and the place it accumulates cannot be left, or no state can ever demand one. |
| Which bucket a token is in is **derived, not stored** | **ACCEPTED** | It is already implied by where the token sits and what it came from. Storing it too means two answers that must agree. | Bucket membership drifts from what the token actually is. |

**Two more state properties carried forward:**

- **What is permitted in a state**. This is the answer Level 0's permission check
  consumes. Level 2 supplies it, Level 0 enforces it, neither knows the other's
  vocabulary. It is a **grant above the floor, not a total set**. Level 0 holds an
  always-allowed floor no state may deny. So a state declaring nothing still leaves an
  agent able to orient, read, note and leave.

- **`priority` as an autonomy tier.** A hop into a state above the current autonomy is
  refused for an agent. This is the same ceiling the Level 0 config caps.

**A state may not demand something it gives no way to provide**. *Breaks without it:* a
state that can be entered and never left, discovered by standing in it.

## Movement

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Walk back to **any** cleared state, including a decision | **ACCEPTED** — overturns v3 | Decision points are where returning is needed most. v3 forbids returning to an OR branch, so the only way back is out of the record and in again. | The owner walks out and back in to touch an earlier state, every time. |
| Walking through a cleared state is a **no-op** | **ACCEPTED** | Nothing is re-earned by passing through. | Every backward walk re-does work already evidenced, so nobody walks backward. |
| **Amend** edits standing evidence without disturbing it | **ACCEPTED** | Monotone: adding never un-clears. Refused where the edit changes something downstream work was built on — a changed question is a reopen. | Any correction requires a reopen, so small fixes cost a cone and stop being made. |
| **Reopen** un-clears and propagates | **ACCEPTED** | Non-monotone changes must announce themselves. It requires a reason, and prior evidence is superseded rather than deleted — the walk that happened still happened. | Evidence downstream of a changed answer silently stands. |
| Propagation must **respect what an edge means** | **ACCEPTED** | Following every edge alike marks everything reachable. Edges already carry roles. Propagation that ignores them is the mass-suspect failure v1 died of. | Reopening one state suspects half the walk, the signal becomes noise, and people learn to ignore it. |
| Leaving one machine for another leaves the first **as it stands** | **ACCEPTED** | Machines are independent instances. Green stays green. | Switching context costs the work already done. |
| Re-entry **does not** clear evidence | **ACCEPTED** — overturns v3 | v3 wipes a re-entered machine's evidence on the theory that a machine left through its end starts over. With walking back allowed, that destroys the thing being returned to. | Returning erases what you returned for. |
| A choice at a branch is an **aim, not a hop** | **ACCEPTED** — as v3 | Naming where you are going and going there are different acts, and only the second should be hard to undo. | Choosing and moving become one irreversible act. |
| Roads not taken are **recorded, without blocking** | **ACCEPTED** — as v3 | A branch declined is a decision, and decisions are what this system exists to keep. | The record shows what was done and never what was ruled out. |
| **Escape unwinds one level**, to the parent | **ACCEPTED** — overturns v3 | v3 empties the whole stack. With a walker per machine, a nested escape returns to the walker above. | One nested problem discards the entire walk above it. |
| No escape above the top machine | **ACCEPTED** | There is nothing above it. The exit at the top is upward to the human, which is Level 1's escalation. | An undefined move at the root. |

**When the machine changes under a running walk**. A human edit and a generated edit are
the same event, so one rule covers both. That is the same rule that governs evidence: **a
changed question is a reopen.**

| Case | Ruling | Why | Breaks without it |
|---|---|---|---|
| A state **ahead** of the walker changes | **Nothing special** | Conditions are met on arrival, whatever they are then. | — |
| A **cleared** state's conditions change | **That state reopens**, cone with it | Its evidence answered the old question. | Cleared work stands as an answer to a question nobody asked. |
| A **cleared** state is deleted | **The machine loses it — the record keeps its evidence** | The machine says what is next, the record says what happened. Those were always different things. | Editing the method rewrites history. |
| The state the walker **stands in** changes | **Nothing special** | It is not cleared yet, so it is the first case. | — |

This needs a **condition hash** per state so "changed" is detectable. It hashes what the
state demands, not the file, so reformatting the UML does not reopen the walk.

**Pass-through must be cheap**, or nobody walks backward and the whole rule is decorative.
v3 has the operation and it is reported as very slow. But before designing around that,
confirm it is the walk logic and not the invalidation defect. That defect is in the
2026-08-29 field report, and it would make everything look slow.

## Position

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| Exactly one **marker** per stack — holding it means you may advance | **ACCEPTED** | A walker may enter a nested machine itself rather than spawning, so the marker cannot be implied by the walker's existence. | Two walkers can advance the same machine, and nothing says which move was authoritative. |
| The marker is **transferred, never acquired** | **ACCEPTED** | A baton, not a lock: no contention, no waiting, no deadlock. Entering yourself carries it in. Spawning hands it over, which is what "stands aside" means mechanically. | A locking protocol with all of a locking protocol's failure modes, for a system that never needs concurrent access. |
| The parent is **owner-of-record and may reclaim** | **ACCEPTED** | A holder that dies without handing back is the only failure mode. | One crashed sub-walker freezes its parent permanently. |
| A sub-walker is **bound to its machine** | **ACCEPTED** | It cannot escape upward. The machine it was created in is its world. | Escape semantics become unbounded and a nested agent can act on its parent's machine. |
| A lock over states | **NOT ADMITTED** | v3 declares one and never writes it, so there is no mutual exclusion there today and nothing has missed it. The marker makes the question not arise. | Nothing. |

## Recording and the archive

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **Recorded-ness is declared per machine** | **ACCEPTED** | One flag on the machine decides whether its tokens persist and become evidence. v3 decides by record binding — the place, not the state — which is the same idea with a less direct handle. | Per-state marking: many places to get wrong, and no single answer to "is this being recorded". |
| A recorded machine **closes** — it is not moved | **ACCEPTED** | Moving breaks every reference into it, which is why the current mechanism is annoying. Closure changes status. Location is unchanged. | Links into finished work rot on completion. |
| The archive is a **flat list of paths**, a view rather than a place | **ACCEPTED** | A closed machine is immutable, so a pointer to it is a record. That is the inverse of the config case, where a pointer to something mutable was not. | An archive that must be maintained in step with the thing it indexes. |
| Archived content lives in **git only**, not in the working tree | **ACCEPTED** | Reading a committed ref already works — search takes a `ref:` and greps any committed branch or tag. | The tree grows without bound with material nobody walks. |
| One **tag per closed machine**, pushed by the engine on closing | **ACCEPTED** | The tag list *is* the archive, so there is no index to keep in sync. The name check is a tag existence check. Uniqueness is enforced across live machines ∪ archive tags. | An index file that drifts, plus a bespoke name-conflict mechanism. |
| Records carry a **number**, reserved at creation with a push | **ACCEPTED** | "Record 23" is how a person refers to it. Reserving at creation with a push resolves collisions between clones at the moment of minting rather than at closing. | Two clones mint the same number independently and collide at push, after the work is done. |
| The human never sees git | **ACCEPTED** | The archive renders from the tag list. Clicking one renders that machine read-only from its ref. | The archive becomes a git skill rather than a feature. |
| A closed machine is **not walkable** | **ACCEPTED** | Visitable, inspectable state by state, but out of the walk. | Finished work is re-entered and re-earned. |

**Nothing of this exists in v3**. Closing writes a status word and commits. There is no
archive operation at all, and a finished record simply stops being drawn.

## One behaviour worth stating because v3 gets it wrong

**A proof must be invalidated by any change to what it proved**. In v3 a script-backed
condition records its verdict against the *list* of scripts rather than their contents.
So editing a script leaves the stale pass standing. Same class as the corpus stamp in the
field report: identifying inputs by name instead of by content.

## Processes as machines

A process is a machine internally. It is **never displayed as one**.

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| A process compiles to a machine | **ACCEPTED** | Steps with entry and exit conditions are a machine. Nothing new is needed | A second execution model beside the one that works |
| A process is **not drawn** | **ACCEPTED** | A drawn process is harder to read than the note that describes it | Every pipeline needs a diagram nobody asked for |

## Not a state

| Entry | Ruling | Why | Breaks without it |
|---|---|---|---|
| **A boot state in a machine** | **REJECTED** | The user never boots. Preparation is what an agent does to become usable, and it is Level 0 work. A machine models the work, not the worker. | Every machine carries a state that has nothing to do with what it models, and the user walks through it. |
| **Where a ready agent stands** | **ACCEPTED, here and not below** | Level 0 ends at ready, which is a condition. A resting place is a position, and positions are this level's business. | Level 0 defines a place, and every level above inherits a resting place that may not fit. |

---

## Deferred to Level 3

Which machines exist and what they encode. How a machine is generated from a method.
Change sizes, milestones, gates' actual rounds, and every specific process. Level 2 must
run with none of it — one hand-authored machine and nothing else.
