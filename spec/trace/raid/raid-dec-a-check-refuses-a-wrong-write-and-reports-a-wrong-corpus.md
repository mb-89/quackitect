---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
type: "[[raid]]"
kind: decision
statement: A bound check REFUSES where the write itself breaks the rule, and REPORTS a named difference where the corpus already disagreed with itself before this write.
owner: the owner
trigger: any new check, and the first complaint that a check refused something the author did not cause
status: decided
impact: Without the seam every check is either too soft to matter or aims its refusal at whoever happened to edit next. The second is worse — it taxes an unrelated edit with somebody else's debt, which is exactly how a check becomes the thing everybody dreads.
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - note-8355729c239a
  - "owner ruling: an orphan is not chased"
  - req-no-agent-act-destroys-work
  - i6 draft-vision — conflict 3, both win, scoped
---

## The conflict this settles

THIS ITERATION'S THESIS is that a rule which can be read and still broken
wants a refusal rather than another sentence.

ONE OF ITS OWN CHECKS CONTRADICTS THAT. The register-versus-folder check
is ruled to REPORT a named difference rather than refuse, because the
owner ruled an orphan is not chased.

Left unruled, that reads as an exception, and an exception with no rule
behind it becomes the precedent for the next one.

## The seam

WHO CAUSED THE BREAK decides which it is. Not how serious it is, and not
how confident the check is.

### A check REFUSES where the write itself is wrong

The author is present. The break arrived with this edit. The fix is
theirs and it is cheapest now, before anything downstream reads it.

That is the whole case for conformance at the write, and it holds only
while the person refused is the person who can fix it in one move.

### A check REPORTS where the corpus disagreed already

The break predates this write. The author did not cause it and may have
no idea what it is about.

REFUSING HERE MAKES AN UNRELATED EDIT CARRY SOMEBODY ELSE'S DEBT. The
author's rational move is to work around the check, and a check that
teaches people to route around it is worse than no check.

## What this rules out

A CHECK MAY NOT REFUSE ON A CORPUS-WIDE CONDITION. "Every story links a
proving run" is a corpus condition; it may report, and the demand for it
belongs at the state that owns stories.

A CHECK MAY NOT REPORT WHERE THE WRITE IS PLAINLY WRONG. Reporting a
break the author just made is the paperwork failure one level down:
it looks like a check and enforces nothing.

## Trigger

Any new check, because the seam is a design question every one of them
asks.

And the first complaint that a check refused something the author did
not cause. That is the observation that says the seam was drawn in the
wrong place.

## Rejected options

### Everything refuses

THE PURE FORM OF THE THESIS, and it was the starting position. A rule
worth having is worth enforcing, so every check refuses and there is no
seam to draw or argue about.

REJECTED because it aims the refusal at whoever edits next. The corpus
already disagrees with itself in places nobody has looked. Under this
option the first person to touch a neighbouring file inherits all of it.

THE OBSERVABLE CONSEQUENCE would be people routing around the checks,
which is worse than no checks: it teaches that the machine is an
obstacle.

### Everything reports

SAFE, AND IT KEEPS EVERY CHECK CHEAP TO ADD. Nothing can ever block
anybody, so nothing can ever be dreaded.

REJECTED because it is the paperwork failure this iteration exists to
remove. A report nobody must act on is a rule wearing a check's clothes,
and the record's own test catches it: could an agent pass while
examining nothing? Yes, every time.

### Severity decides

REFUSE ON FATAL, REPORT ON THE REST. It is the obvious shape and it is
what most linters do.

REJECTED because severity is the wrong axis. A fatal break somebody else
caused still should not block this author, and a trivial break this
author just made is still cheapest to fix now. Severity says how much it
matters; it says nothing about who can fix it.

### The author chooses

A FLAG ON THE WRITE, so the person decides whether to be blocked.

REJECTED because the flag is always set to off under deadline, and a
check that can be waved through is a report with extra steps.

## Consequences

WHAT THIS BINDS FROM NOW ON.

- EVERY NEW CHECK DECLARES WHICH IT IS, refuse or report, and the
  declaration is part of the check rather than a review note.
- A CHECK THAT DECLARES NEITHER IS UNFINISHED and does not ship.
- A CHECK MAY NOT REFUSE ON A CORPUS-WIDE CONDITION. "Every story links
  a proving run" reports; the demand for it lives at the state that owns
  stories.
- A CHECK MAY NOT REPORT WHERE THE WRITE IS PLAINLY WRONG.
- THE REPORTING HALF NEEDS SOMEWHERE TO LAND. A report nobody reads is
  the same as no check, so the write's result carries it and the state
  that owns the subject is where it becomes work.

WHAT IT COSTS. Two mechanisms instead of one, and a judgment call on
every new check. That judgment is cheap because the question is single:
did this write cause it?
