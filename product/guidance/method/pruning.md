---
id: method-pruning
tags: pruning
statement: Pruning — sweep everything active against the standard as it now stands, and close the gap.
---

# pruning — the method

Pruning is a FUNCTION, not a project. Fire it at idle when the system has
drifted. Fire it at the end of an unattended run, when there is nothing
left to build.

## The one-line difference from the retro

The retro looks at the DELTA. Pruning looks at EVERYTHING.

They are producer and consumer. The retro is where the standard MOVES.
Pruning is where the system CATCHES UP to it.

Every good retro creates debt. The moment the bar rises, everything
written before it is out of compliance.

## What it reviews

Pruning walks everything ACTIVE, deep. It asks four questions.

- Is the prose still in the voice?
- Is the code still in the style we hold?
- Has the guidance drifted from what the machines actually do?
- Does every file still earn its place?

## Scope it by the standard, never by the corpus

Do not review everything against everything. That does not finish.

The input is the set of RULES THAT CHANGED since the last pruning. Take
each changed rule. Sweep the whole system against that one rule.

A rule that did not move needs no sweep. The last pruning already closed
it.

This is what keeps pruning tractable. The corpus grows without limit. The
delta of the standard does not.

## Mechanise everything you can

The prior art is blunt here. Debt work fails as a periodic cleanup sprint.
It succeeds as a continuous check.

So split every finding along one seam.

- A check a MACHINE can make becomes a lint or a test. It runs on every
  write. It never waits for a pruning session.
- A judgment only a person or an agent can make is what the session is
  actually for.

If pruning finds the same thing twice, it was always a lint. Write the
lint. Move on.

This mirrors the dated-guidance rule in voice.md. Guidance that rations
LABOUR is suspect, because a machine does that work now. Guidance that
rations JUDGEMENT still holds.

## The criteria — SORTED

Weeding practice does not trust taste. It uses a fixed named list, so two
passes reach the same verdict. Libraries have run on MUSTIE since 1976.
Content audits run on ROT.

Ours is SORTED. Mark every candidate with exactly one letter.

- Superseded — a newer rule or file already covers it.
- Orphaned — nothing references it, and nothing reads it.
- Redundant — it repeats what lives elsewhere. DRY says one home.
- Trivial — it adds nothing. A field that echoes another field is noise.
- Erroneous — it says something that is no longer true.
- Drifted — it was true, and the code moved out from under it.

Take the Erroneous first. A wrong document is worse than no document.

A candidate that fits no letter is KEPT. Record that it was looked at.

## The steps

1. Inventory. List what is active. You cannot weed what you have not
   listed.
2. Run the machines. Every lint, every test, the whole suite. Collect
   what fails.
3. Take the rules that changed since the last pruning. Sweep the system
   against each one.
4. Mark every candidate with its SORTED letter.
5. Split the findings. The mechanisable ones become lints. The rest need
   a ruling.
6. Bring the rulings to the owner. Deletion is theirs.
7. Execute what was ruled. Record what was KEPT and why, so the next
   pruning does not re-litigate it.

## What pruning never does

- It never deletes on its own judgment. Removal is the owner's word.
- It never treats age as a defect. Age is a reason to LOOK. It is never
  a reason to remove.
- It never works the delta. That is the retro's job, and doing it here
  duplicates the retro.
