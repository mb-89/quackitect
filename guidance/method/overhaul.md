---
id: method-overhaul
tags: overhaul
statement: Overhaul — sweep everything active against the standard as it now stands, and close the gap.
---

# overhaul — the method

Overhaul is a FUNCTION, not a project. Fire it at idle when the system has
drifted. Fire it at the end of an unattended run, when there is nothing
left to build.

THE NAME (owner ruling 2026-07-29). This was called pruning, and the name
was smaller than the job.

A mechanical engineer overhauls a machine:

- strip it
- discard what is worn
- replace what is bad
- put it back together better

That is this, exactly.

## The three jobs

The scope was ALWAYS this wide. Only the build was narrow.

- Throw out what should not be there at all.
- Replace bad METHODS with good ones.
- Replace bad STYLE with good style.

The first and third are visible in the artifact itself. The second is not.
Calling a method bad needs a standard to compare it against.

For this repo that standard already exists: guidance IS it. For a
product recovered from outside, it is what the reverse-engineering function
reconstructs, so the method half waits on that and the other two do not.

## The one-line difference from the retro

The retro looks at the DELTA. Overhaul looks at EVERYTHING.

They are producer and consumer. The retro is where the standard MOVES.
Overhaul is where the system CATCHES UP to it.

Every good retro creates debt. The moment the bar rises, everything
written before it is out of compliance.

## What it reviews

Overhaul walks everything ACTIVE, deep. It asks five questions.

- Is the prose still in the voice?
- Is the code still in the style we hold?
- Is the METHOD still the best one we know?
- Has the guidance drifted from what the machines actually do?
- Does every file still earn its place?

## Scope it by the standard, never by the corpus

Do not review everything against everything. That does not finish.

The input is the set of RULES THAT CHANGED since the last overhaul. Take
each changed rule. Sweep the whole system against that one rule.

A rule that did not move needs no sweep. The last overhaul already closed
it.

This is what keeps an overhaul tractable. The corpus grows without limit.
The delta of the standard does not.

## Mechanise everything you can

The prior art is blunt here. Debt work fails as a periodic cleanup sprint.
It succeeds as a continuous check.

So split every finding along one seam.

- A check a MACHINE can make becomes a lint or a test. It runs on every
  write. It never waits for an overhaul session.
- A judgment only a person or an agent can make is what the session is
  actually for.

If an overhaul finds the same thing twice, it was always a lint. Write the
lint. Move on.

This mirrors the dated-guidance rule in software.md. Guidance that rations
LABOUR is suspect, because a machine does that work now. Guidance that
rations JUDGEMENT still holds.

## The criteria — SORTED

Weeding practice does not trust taste. It uses a fixed named list, so two
passes reach the same verdict. Libraries have run on MUSTIE since 1976.
Content audits run on ROT.

Those sources cover the REMOVAL half only. The method half wants
maintenance engineering's own literature, which turns on exactly this
choice: overhaul, repair, or replace. That prior art is not adapted here
yet, and it is owed.

Ours is SORTED. Mark every candidate with exactly one letter.

- Superseded — a newer rule or file already covers it.
- Orphaned — nothing references it, and nothing reads it.
- Redundant — it repeats what lives elsewhere. DRY says one home.
- Trivial — it adds nothing. A field that echoes another field is noise.
- Erroneous — it says something that is no longer true.
- Drifted — it was true, and the code moved out from under it.

Take the Erroneous first. A wrong document is worse than no document.

A candidate that fits no letter is KEPT. Record that it was looked at.

## The pattern checklist

OWNER RULING 2026-08-20. The overhaul asks one more fixed question set,
about the CODE: would a named design pattern, applied where we do not
use it, improve us? The list is named so two passes reach the same
verdict, exactly like SORTED.

HOW TO RUN IT. Run it in step 3, beside the rule sweep. For each
pattern, try to name ONE place where applying it would delete code or
a defect class. No place found? Write "none" and move on. A hit is a
finding like any other: evidence, proposal, a CODE letter.

HOW IT GROWS. Add a pattern when an overhaul finds the same improvable
shape twice and a named pattern covers it. The list is the rule's
memory, the same doctrine as the forbidden-words list in voice.md.

- ONE SOURCE, DERIVED VIEWS. Is one fact stored in two places, so the
  copies can disagree? The owner's words (2026-08-20): copies that
  diverge are the defect, size is not. The exemplar is se_coverage —
  the verb and the submit-time law share one function, so they cannot
  drift.
- STRATEGY. Is one decision re-made by if/switch on the same kind in
  several places? The tell: three copies of a kind-test, and a fourth
  that quietly diverges.
- REGISTRY. Does a list grow by editing code in N places instead of
  registering an entry in one? The exemplars are the editors and the
  condition types: an unknown entry refuses, a new one is one file.
- TEMPLATE METHOD. Do two procedures share most of their steps and
  differ in one? The tell: a copied block with a ten-line comment
  duplicated verbatim.
- ADAPTER. Are host or environment differences handled inline where
  they occur, instead of at one seam? The exemplar is the harness
  registry: measured limits live in one module, callers never ask
  which host they are on.
- INVALIDATE ON THE EVENT. Does a write path have to remember to clear
  a cache by hand? The tell: an invalidation call sprinkled at some
  call sites and missing at others. Put it in the one write funnel.
- ONE CACHE, ONE OWNER. Does every cache have exactly one writer and
  one invalidation point, and a test for its poisoning case?
- VALUE OBJECT. Is a small domain idea — a qualified id, a reference,
  a path — hand-parsed wherever it is touched? The tell: the same
  split or strip spelled out in many files, each slightly different.
- FACADE ONLY WHERE IT ADDS A CONTRACT. Does a wrapper layer only
  forward? Forwarding without a contract is ceremony, and it hides
  the real surface.
- ONE DOOR PER RESOURCE. Is a file, a folder or a log read through one
  module, or does everybody open it themselves? The exemplar is the
  corpus door; the counterexample is a second hand-rolled parser
  beside the real one.
- TYPED RESULT. Does a failure carry a type, a reason and a remedy, or
  only a string? The exemplar is the refusal.
- LAYERS POINT ONE WAY. Does a lower module import an upper one, or
  shape answers that belong to the layer above it?

## The steps

1. Inventory. List what is active, because you cannot weed what you have
   not listed.
2. Run the machines. Every lint, every test and the whole suite, collecting
   what fails.
3. Take the rules that changed since the last overhaul. Sweep the system
   against each one.
4. Mark every candidate with its SORTED letter.
5. Split the findings. The mechanisable ones become lints, and the rest
   need a ruling.
6. Bring the rulings to the owner. Deletion is theirs.
7. Execute what was ruled. Record what was KEPT and why, so the next
   overhaul does not re-litigate it.

## What an overhaul never does

- It never deletes on its own judgment. Removal is the owner's word.
- It never treats age as a defect. Age is a reason to LOOK, never a reason
  to remove.
- It never works the delta. That is the retro's job, and doing it here
  duplicates the retro.
