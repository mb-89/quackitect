---
minted_in: i27
id: dsp-resolution-seam
type: "[[design-spec]]"
statement: one resolver every verb calls, which decides the store, refuses what falls outside the record, and returns the store beside the path
realizes:
  - el-resolution-seam
  - if-walk-engine-to-resolution-seam
  - if-resolution-seam-to-engine-delta
  - if-resolution-seam-to-method-compiler
  - if-record-store-to-resolution-seam
  - if-resolution-seam-to-account
files:
  - deliverable/engine/paths.ts
  - deliverable/engine/resolve.ts
  - deliverable/engine/tools.ts
---

## Responsibility

Every path a caller names is turned into a store and an absolute path, in one
place, and the answer carries both.

WHAT IT DOES NOT DO. Routing. A path resolving outside its record is refused
here; a call naming a different OWNER is handed up, and that is
[[dsp-core-and-satellite]]'s.

## Interface

`resolve(call) -> { store, abs } | Rejection`

The store is the thing that changes today. `resolveInRoot` returns a bare
string, so a caller cannot tell which tree answered.

- IN: the path, the verb, and the record the caller is bound to.
- OUT: the resolved store and the absolute path, together.
- REFUSED: anything resolving outside that record, with the clause and the
  remedy the lane already carries.

## Behavior and constraints

THE SEAM IS NOT OPTIONAL FOR ANY VERB. `exp-one-seam` counted 40 resolver
call sites against 88 paths built with a direct join. The dispatch layer is
nearly clean at 7 against 1; the work is in modules that read the filesystem
for themselves.

`lint.ts` IS THE WORKED EXAMPLE and it is on this spec's file list for that
reason. It imports `readFileSync` and `join` from node and calls no resolver,
which is why it answered against a different tree than the file lane on
2026-08-14.

THE SHELL NEEDS NO RULE. `exp-one-seam` measured a child inheriting its
parent's working directory. `run.ts` is on the list to keep it that way, not
to add a guard.

THE PLATFORM REFUSES NOTHING. The same probe resolved a path four levels out
to a folder outside the project, cleanly. So the refuse step is load-bearing
rather than defensive.

A WRITE IS PROVED BY READING BACK from the store the answer named, never by
the call's own verdict. [[tsp-read-back-inspection]] is the check.

## Rationale

ONE SEAM RATHER THAN A RULE PER TOOL, per
[[opt-one-resolution-seam-not-a-rule-per-tool]]. The i8 field report of
2026-08-12 records a guard covering five write verbs and not the shell, which
is what a rule per tool decays into.

THE STORE ON THE ANSWER is what [[raid-risk-a-write-lands-in-the-wrong-tree-silently]]
asks for. That entry is an ISSUE rather than a risk: it happened twice on one
day, with the paths recorded.

## Session state is never branch content

`.se/` IS SESSION STATE. The handover, the notes and the call log belong to
the project root, and the NEXT session reads them there whatever branch this
one happened to stand on. Resolving them into a record's own tree wrote them
where nobody would ever look, silently.

EVERYTHING ELSE RESOLVES TO THE ONE WORKING ROOT. The classification survives
the worktrees being deleted because it still separates session state and shared
method from a record's own content, and those are different things whatever the
tree count.

## Shared method belongs to the machine

SHARED METHOD BELONGS TO THE MACHINE, never to a branch. The core owns session
state and shared method, so both resolve to the machine root whatever tree is
bound.

BEFORE THIS, a method write from inside a record landed in that record's own
tree and fanned out over trunk at the merge. Refusing the write was the old
answer. RESOLVING the write is the better one: nothing is refused, and the file
cannot land in a tree that does not own it.

## Every separator, not the two somebody thought of first

EVERY SEPARATOR, not the two somebody thought of first. The rule was
commas and semicolons, so writing the same buried list with middots
or slashes walked straight past it (owner, 2026-08-07).

A SPAN IS ONE THING, WHATEVER IS INSIDE IT (owner report 2026-08-08).
Adding the slash meant `spec/trace/raid/` split into five
"items", so every card saying where its node lives fired the chain
rule on a path. The literal test could not save them: it runs AFTER
the split, and by then the span is in pieces. Mask each span to one
token first, and the test does what it was written to do.

## A part must carry substance to count

A PART MUST CARRY SUBSTANCE TO COUNT (e28, 2026-08-01 — rebuilt on
trunk 2026-08-09 after the worktree fix never landed): the rule
separates an enumeration of THOUGHTS from an enumeration of NAMES.
"alpha, beta, gamma, delta" is reference; nobody wants `pill` on
its own bullet. Fourteen of thirty-seven findings in one sweep
were this miscount.

## The path jail

The path jail. Every lane path is root-relative; anything resolving outside
the project root is refused. The jail is checked at the resolver — no tool
implements its own path handling.

DECLARED ROOTS (ported from v2's req-search-roots; owner rulings 2026-07-29
and 2026-07-30). A read may address a declared root as "@name/rest". The
rule the fence protects is DECLARED, NEVER ARBITRARY: every reachable
folder stands in .se/roots.json, and every read stays logged. The AGENT
writes the declaration itself, through the lane — a person is never asked
to hand-edit a dotfile they cannot be expected to understand. Roots are
READ surfaces, never write targets, machine-local on purpose (an absolute
path means nothing on anyone else's machine).

## The owners declared roots read live so an edit

The owner's declared roots, read LIVE so an edit binds the very next call.

 A DECLARATION THAT CANNOT BE READ MUST NEVER READ AS "NONE DECLARED" (found
 live 2026-07-29): PowerShell wrote this file with a UTF-8 BOM, JSON.parse
 refused it, and a swallowing catch reported the owner's root as undeclared.
 The BOM is stripped, and a broken file is now a LOUD refusal.

## What kind of thing a path is

WHAT KIND OF THING A PATH IS (owner ruling 2026-08-07).

 THE FAILURE THIS ENDS. The engine served ONE tree, chosen by whether a
 walk happened to be bound at that instant. So the same path meant
 different files at different moments, and two failures followed it
 everywhere:

 - A method change applied in one tree and the machine kept its old
   behaviour in the other. The person edits a row, the state machine does
   not change, and nothing says why.
 - A record's state was read from whichever tree was in hand. The mirror
   painted i1's states green out of trunk while i1's own worktree held the
   fall that knocked them down.

 THE RULE. A path is resolved by WHAT IT IS, never by where the walk
 stands. Three kinds, and each has exactly one home:

 - SESSION — `.se/` and the declared roots. Always the project root. The
   handover, the notes and the call log belong to the person's machine,
   not to a branch.
 - METHOD — guidance, machines, matrix rows, templates, the engine and the
   prompt layer. SHARED by every tree. A write fans out to all of them in
   one act, so a change takes effect wherever the reader is standing.
 - RECORD — one iteration's or expedition's own evidence and decisions.
   Owned by that record, and read from ITS tree whether or not it is
   bound. There is only ever one copy that counts, so nothing can drift.

 CONTENT is everything else and behaves as it always did: it rides the
 tree the walk is working in.

## The method surfaces as root-relative prefixes

The method surfaces, as root-relative prefixes. A change to any of these
 changes how the MACHINE behaves, which is why they cannot belong to one
 tree. Kept as a list rather than a clever rule: the set is small, it is
 read by people, and a wrong guess here is the bug this exists to kill.
THE TESTS ARE METHOD TOO. They are the engine's own proof, they belong to no
record, and leaving them out produced exactly the fault this list exists to
prevent: a worktree took the new engine and kept its old tests, so the suite
failed on laws that had already been changed (found live 2026-08-07).

## The resolution seam

THE RESOLUTION SEAM (dsp-resolution-seam, el-resolution-seam).

One resolver every verb calls. It does three things and no more.

  RESOLVE — pick the STORE from what the path IS, then the absolute path.
  REFUSE  — anything falling outside, rather than letting the platform
            serve it. exp-one-seam measured the platform resolving
            ..\..\..\..\Users cleanly to a folder outside the project, so
            this step is load-bearing rather than defensive.
  SAY     — carry the store and the owner ON the answer, so a wrong
            resolution is visible at the call rather than at a merge.

THE STORE COMES FROM THE PATH'S KIND, NOT FROM THE CALLER'S AMBIENT ROOT.
That is the whole fix. On 2026-08-14 se_lint answered ENOENT for
`.se/HANDOVER.md` against a worktree while the file lane served the same
path from the machine root. Both were "correct" against their own root, and
neither answer said which root that was.

Session state belongs to the machine, never to a branch. So it resolves to
the machine root whatever tree the caller happens to be bound to, and the
answer says so.

## Which store serves this path

Which store serves this path. ONE ANSWER, ALWAYS.

 THIS FUNCTION WAS THE CHOOSER. It read `roots.bound ?? roots.machine` for
 anything the core did not own, so the same relative path named different
 files depending on what was bound — and a read and a write could disagree
 about which copy was real.

 WHAT IT COST, measured on 2026-08-16: a filesystem check run while bound to
 i4 reported `.worktrees/i34-…` absent, because it resolved inside i4's
 tree. The answer named no root, so the wrong answer was indistinguishable
 from a right one.

 IT IS KEPT AS A FUNCTION, not inlined, because `store` still rides every
 answer and req-a-resolution-is-proven-by-read-back still wants a name to
 compare against. The owner is still computed and still reported; what is
 gone is any use of it to pick a tree.
