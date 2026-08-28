---
form: scope-non-goals
by: agent
signed_off: 2026-08-26T11:15:27.366Z
authors: agent
files: null
---

# Evidence form / scope-non-goals

## current_situation

THE DELTA IS SIGNED AND THE SIZING EVIDENCE IS IN. This state says what the iteration takes on and what it leaves.

THE SCOPE WRITTEN HERE IS NARROWER THAN THE ONE THE ITERATION OPENED WITH. That is the falsifier pass doing its job, and the reason is recorded in each cut.

THE OWNER RULES ON THE SIZE AT THE GATE. This form recommends; it does not decide. The iteration was blessed at change size major at M0, and nothing here changes that without the owner's word.

## scope

### 1. Generalise the exemption pattern to a declared capability

THE PATTERN EXISTS ONCE AND IS TAKEN GENERAL. One rule, one registry, one declared hatch, a written reason per entry, and no second copy of the rule. The precedent is `deliverable/machines/widget-exemptions.md` with the SE-C-146 section of `guidance/refusals.md`.

A REGISTRY ENTRY WITHOUT A REASON IS REFUSED. That is the one thing the scanned field does not do, and it is the part that must not be traded away.

### 2. The disk capability, scoped to what the probe justifies

THE CLAIM WRITER. 23 of the 64 examined sites are a read-modify-write of a claim, record or form instance, and 7 more are the `mkdirSync` that precedes one. None replaces its file atomically and none checks a hash. `sessionclaims.ts` alone writes `h.instanceAbs` from eight call sites, and a signature lives in that file.

THE GUARDED DESTRUCTIVE WRITE. `rmSync` and `cpSync` with `recursive` set, in `benchmark.ts` and `produce.ts`.

THESE TWO ARE THE OBJECT, and neither is a facade over disk. Calling them what they are is what keeps the work sized.

### 3. Finish the path jail

EXPORT THE CONTAINMENT PREDICATE FROM `paths.ts` AND DELETE THE FIVE HAND-WRITTEN COPIES, in `benchmark.ts`, `produce.ts`, `tables.ts`, `bases.ts` and `machines/compile.ts`.

THIS IS IN SCOPE EVEN IF EVERY DOOR IS DISMISSED. It is a crippling-graded issue with two guards disagreeing about absolute paths while guarding recursive deletes, and the fix needs no new mechanism.

### 4. Probe the sampling assumption before the scope is fixed

TEN OF THE REMAINING 43 ENGINE-CORE FILES, read the same way. The seven were chosen for carrying the most writes, so 42-to-22 is an upper bound rather than an estimate.

THIS IS SCOPE, NOT A FORMALITY. If the other 53 look like `run.ts`, item 2 shrinks again.

### Why narrowing here dissolves a risk rather than deferring it

THE 79-MODULE PROBLEM ONLY BITES A GENERAL RULE. `raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets` is about switching on a blanket refusal of `node:fs`.

A CLAIM WRITER TOUCHES FOUR MODULES, not seventy-nine. `sessionclaims.ts`, `session.ts`, `iterations.ts` and `sessionforms.ts` carry all 30 sites of that shape between them. At that size there is nothing to ratchet, so no ratchet has to be built.

THAT IS THE ARGUMENT FOR THE NARROWER SCOPE and it is worth more than the effort it saves. A rule small enough to switch on in one step never needs the mechanism that makes a large rule survivable.

## non_goals

- A GENERAL FACADE OVER ALL 117 ENGINE-CORE WRITES. 22 of the 64 examined gain nothing from a door, and the sample is biased toward those that do.
- A DOOR IN FRONT OF `run.ts`. All 10 of its writes are appends to logs it owns, already jailed by three module-local helpers at lines 438, 442 and 1403. This is the dismissal the owner invited on 2026-08-26, with its reason.
- THE INTERNET DOOR. 52 network sites counted, none read. It must not inherit the disk verdict in either direction.
- THE WARM MODEL. Six private caches named, none read. Same reason.
- MIGRATING THE SIX PRIVATE CACHES into anything. Naming them was the survey's work; moving them needs a judgment nobody has made.
- A RATCHET OR A FROZEN VIOLATION SET. Not needed at the scope above, and building it would create the generated baseline this iteration exists to avoid.
- AN EXPIRY MECHANISM. Named as a real gap against Rust and ESLint, registered as `raid-risk-an-exemption-registry-with-no-expiry-silts-up`, and left because the registry it would prune does not exist yet.
- A BLANKET OFF-SWITCH, of the kind Rust, Bazel and dependency-cruiser each carry. Adding one would undo the rest.
- ANY CHANGE TO THE AGENT-FACING LANE. `files.ts`, `web.ts` and the cage list already work, and their importer counts are not adherence figures for the engine.
- REWRITING THE SEVEN MODULES. Only the 30 sites of the claim-writer shape and the destructive writes are in scope; the rest of those files is untouched.
- A NEW VALUE PROPOSITION. Forbidden unasked by the owner's ruling of 2026-08-21, and recommended instead in the delta's own notes.

## follow_up

1. THE SAMPLING PROBE IS THE FIRST ACT OF THE DESIGN WORK, before anything is built. Ten files, one reading pass.

2. THE CONTAINMENT FIX CAN RUN IN PARALLEL AND NEEDS NOTHING FROM THE REST. Export one predicate, delete five copies.

3. THE GATE MUST RULE ON THE NARROWING. The iteration opened at change size major on a claim the probe has since narrowed. Whether major still fits is the owner's call, and this form does not make it.

4. TWO REGISTERED RISKS ARE NOW SCOPE-DEPENDENT RATHER THAN OPEN-ENDED. The ratchet risk does not bite at the scope above, and the expiry risk bites only once a registry exists. Neither is closed, and both should be re-read by the state that widens the scope if it ever does.

5. IF THE OWNER RESTORES THE WIDER SCOPE, THE RATCHET DECISION COMES BACK WITH IT. That pairing is the thing to carry forward, because the two were separated here on a sizing argument and not on their merits.

## anything_else

THE NARROWING IS A RECOMMENDATION AND NOT A DECISION, and the difference matters enough to say twice.

CONTRACT RULE 9 PUTS SETTING AND CUTTING SCOPE WITH THE PERSON. This form is the state the machine routed to, so filling it is execution rather than planning. What it must not do is quietly reduce an iteration the owner blessed at change size major.

SO THE CUTS ARE WRITTEN AS A LIST WITH REASONS, and the gate is where they are ruled on. Every non-goal above names why it is out, so any single one can be put back without unpicking the others.

### The one cut somebody might reasonably reverse

THE INTERNET DOOR IS OUT ON ABSENCE OF EVIDENCE, not on evidence of absence. 52 sites were counted and none was read, so the honest statement is that nobody knows whether it pays.

READING THEM WOULD COST ONE PASS, roughly what the disk probe cost. If the owner wants the iteration to stay at its opened size, that pass is the cheapest way to spend it and it would settle the question rather than defer it.

THAT IS THE RECOMMENDATION IF THE SCOPE IS RESTORED. Measure the internet door before building it, exactly as the disk door was measured, rather than building it on the strength of the disk result.
