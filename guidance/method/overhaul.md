---
id: method-overhaul
tags: overhaul
statement: Overhaul — sweep everything active against the standard as it now stands, and close the gap.
---

# overhaul — the method

Overhaul is a FUNCTION, not a project. Fire it at the front desk when the
system has drifted. Fire it at the end of an unattended run, when there is
nothing left to build.

A mechanical engineer overhauls a machine:

- strip it
- discard what is worn
- replace what is bad
- put it back together better

That is this, exactly.

## Step zero: overhaul the method before anything else

The first thing an overhaul touches is its own method. Not the corpus, not the
code, not the guidance it is about to sweep.

WHY IT COMES FIRST. Every later step is judged against this page. A stale
method does not merely miss things; it teaches the sweep to miss them, the
same way every time.

FOUR ACTS, IN ORDER.

- GO AND LOOK OUTSIDE. `se_web_search` and `se_web_fetch` are legal here for
  exactly this.
- NAME WHAT YOU COMPARED AGAINST — a page, a standard, a study, with its
  publisher and its address. "Still current" with nothing behind it is an
  answer with the answer taken out.
- CHANGE THE METHOD WHERE IT IS BEHIND, or record the rejection with its
  reason. Silence is the default, and the default loses the improvement.
- SAY WHAT YOU FOUND in the run's report, even where nothing moved.

THIS IS THE STATE-OF-THE-ART SCAN
([meth-state-of-the-art.md](deliverable/machines/methods/meth-state-of-the-art.md)),
pointed at this page. The retro asks it of the way we WORK; this asks it of
the way we CATCH UP.

A METHOD THAT NEVER CHANGES IS NOT A STABLE METHOD. It is one nobody checked.

## THE MARKDOWN THE AGENT RUNS IS CODE

The markdown that describes the machine is also code, and it is cleaned up
like code.

WHAT COUNTS. Anything the engine LOADS and an agent READS AS INSTRUCTION.

- `guidance/**` — the contract, the craft cards, the method cards.
- `deliverable/machines/**` — state notes, method cards, item templates, form
  templates, rigor-matrix rows, condition notes.

SO THE COMMENT RULES IN `guidance/craft/software.md` BIND IT. That card bans
provenance in a comment, and it binds every artifact rather than source alone.

FOUR SHAPES ARE STRUCK FROM A LOADED PAGE.

- A DATE. `(owner ruling 2026-08-21)` says who and when, and the rule is the
  same rule without it.
- AN ATTRIBUTION at the rule it produced.
- CHANGE NARRATION. "This card used to say the opposite."
- THE MEASURED ANECDOTE. "Measured on the i15 walk: four refused calls."

THE RULE STAYS. Only the backstory moves. Deleting the ruling with its date
would lose the ruling, which is the opposite of what this asks for.

WHERE IT MOVES: a sibling page with NO `tags:` key, linked from the rule it
belongs to. An untagged page is never served by the reading loop, so the agent
pays for it only when it goes looking.

[overhaul-prior-art.md](guidance/method/overhaul-prior-art.md) is the worked
example. This card's own evidence sits there, and the reasons for the move sit
there with it.

MEASURE IT RATHER THAN JUDGING BY EYE. A script over the loaded trees counts
the four shapes and ranks the pages, so the sweep has a work list.

## The three jobs

The scope was ALWAYS this wide. Only the build was narrow.

- Throw out what should not be there at all.
- Replace bad METHODS with good ones.
- Replace bad STYLE with good style.

The first and third are visible in the artifact itself. The second is not.
Calling a method bad needs a standard to compare it against.

For this repo that standard already exists: guidance IS it. For a product
recovered from outside, it is what the reverse-engineering function
reconstructs, so the method half waits on that and the other two do not.

## The one-line difference from the retro

The retro looks at the DELTA. Overhaul looks at EVERYTHING.

They are producer and consumer. The retro is where the standard MOVES.
Overhaul is where the system CATCHES UP to it.

Every good retro creates debt. The moment the bar rises, everything written
before it is out of compliance.

## What it reviews

Overhaul walks everything ACTIVE, deep. It asks five questions.

- Is the prose still in the voice?
- Is the code still in the style we hold?
- Is the METHOD still the best one we know?
- Has the guidance drifted from what the machines actually do?
- Does every file still earn its place?

## Scope it by the standard, never by the corpus

Do not review everything against everything. That does not finish.

The input is the set of RULES THAT CHANGED since the last overhaul. Take each
changed rule. Sweep the whole system against that one rule.

A rule that did not move needs no sweep. The last overhaul closed it.

This is what keeps an overhaul tractable. The corpus grows without limit. The
delta of the standard does not.

### WITH NO PREVIOUS OVERHAUL ON RECORD, SWEEP EVERYTHING

An overhaul is a heavy operation, and it is fine to recheck important rules.
Where an earlier overhaul stands, take it into account. Where none does, do
everything.

SAY WHICH ONE YOU RAN. A whole-corpus sweep and a delta sweep look identical
from their findings.

### THERE ARE TWO DELTAS AND THIS METHOD SWEPT ONE

A RULE CAN STAND STILL WHILE THE CODE MOVES OUT FROM UNDER IT, and that is
the commoner half of drift.

SO THE SCOPE IS THE UNION OF TWO SETS.

- The RULES that changed since the last overhaul.
- The CODE and prose that changed since it, against every rule.

BOTH ARE CHEAP FOR A MACHINE-CHECKABLE RULE. What stays expensive is the
judgment half, and the second delta keeps that half bounded.

### AND STAMP THE BOUNDARY WHEN YOU FINISH

Commit the run under a subject beginning `overhaul:`, so
`git log --grep '^overhaul:'` answers the scoping question in one call.

WHY GIT AND NOT THE CALL LOG. A fresh clone starts the log empty, and the
boundary has to outlive the container.

## Mechanise everything you can

Debt work fails as a periodic cleanup sprint. It succeeds as a continuous
check. So split every finding along one seam.

- A check a MACHINE can make becomes a lint or a test. It runs on every
  write, and never waits for a session.
- A judgment only a person or an agent can make is what the session is for.

If an overhaul finds the same thing twice, it was always a lint. Write the
lint. Move on.

This mirrors the dated-guidance rule in software.md. Guidance rationing
LABOUR is suspect, because a machine does that work now. Guidance rationing
JUDGEMENT still holds.

### A NEW LINT LANDS FROZEN, NEVER SHOUTING

MINTING A LINT OVER A GROWN CORPUS PRODUCES HUNDREDS OF VIOLATIONS. Nobody
fixes hundreds at once, so the lint gets suppressed and the rule dies with it.

SO RECORD THE COUNT AND REPORT ONLY WHAT IS NEW. The baseline may fall and
may never rise ([[ref-archunit]], [[ref-betterer]]).

NOT BUILT YET HERE. Nothing in this repository freezes a baseline. Until it
does, a lint over a corpus with more violations than the run can fix is
seeded rather than armed.

### AND EVERY LINT OWES A FALSE-POSITIVE BUDGET

A LINT NOBODY TRUSTS IS WORSE THAN NO LINT, because distrust generalises to
every lint beside it.

Google holds its analysers to a rate just under 5%, watched, with the
contract that anything above it is switched off ([[ref-swe-at-google]]).

SAY WHAT THE RATE IS when you mint one, or say you did not measure it.

### THE FINISHED FORM OF A MECHANISED FINDING IS LINT PLUS FIX

Filing bugs from tool output failed at Google, with 84% never fixed. What
worked was the finding carrying its repair ([[ref-swe-at-google]]).

SO A LINT THAT ONLY ACCUSES IS HALF DONE. Where the repair is mechanical, the
lint applies it and says so, as this lane already does for a formatter.

## The criteria — SORTED

Weeding practice does not trust taste. It uses a fixed named list, so two
passes reach the same verdict.

Ours is SORTED. Mark every candidate with exactly one letter.

- Superseded — a newer rule or file already covers it.
- Orphaned — nothing references it, and nothing reads it.
- Redundant — it repeats what lives elsewhere. DRY says one home.
- Trivial — it adds nothing. A field echoing another field is noise.
- Erroneous — it says something that is no longer true.
- Drifted — it was true, and the code moved out from under it.

Take the SAFETY class first, whatever letter it carries. The severity axis is
below, and it replaces the older instruction to take the Erroneous first.

A candidate that fits no letter is KEPT. Record that it was looked at.

## The rulings the maintenance literature adds

THE EVIDENCE IS IN
[overhaul-prior-art.md](guidance/method/overhaul-prior-art.md), with its
sources. These are the rules it produced.

### THE TRIGGER IS A MOVED STANDARD, NEVER ELAPSED TIME

A corpus has no age at which it starts failing. It fails when the world
moves. So a calendar-driven sweep has no support in that literature, and the
retro-driven cadence this method already uses has its full support.

### THE SWEEP OWES ITS OWN LEDGER

Count defects prevented against artifacts touched. Where the second exceeds
the first, the sweep was a net cost and the report says so.

### SEVERITY IS A SECOND AXIS AND SORTED HAS ONLY ONE

Classify the CONSEQUENCE before choosing the remedy. Four classes, in the
order they outrank each other.

- SAFETY. The failure routes real work wrongly — a wrong rule, a wrong
  verdict, a wrong gate. Fix it whatever it costs.
- OPERATIONAL. The failure stops or misdirects a walk.
- ECONOMIC. The failure only wastes effort.
- HIDDEN. Nobody would notice the failure at all.

### TWO VERDICTS SORTED LACKS, AND BOTH ARE NAMED POLICIES

- FAILURE-FINDING. A rule nothing currently exercises has already failed or
  not, and nobody can tell which. It wants a deliberate PROBE.
- RUN-TO-FAILURE. Keeping a thing and doing nothing about it is a DECISION,
  recorded with its reason.

### JUDGE IT AS IF NOBODY WERE MAINTAINING IT

A page is not justified by somebody's habit of keeping it. Sunk cost is not
an argument either.

### WHAT THE WORD ITSELF PROMISES

"Overhauled" means disassembled, cleaned, inspected, repaired as necessary,
reassembled, and TESTED against the approved standard.

THE LAST STEP IS THE ONE A SWEEP SKIPS. Here that test is the battery and the
lint, both green before the run is called done.

## Migration cost is never a reason to keep something wrong

Where something we did in the past is not correct, we fix it rather than leave
it because fixing is an effort.

THE COROLLARY BINDS US. Where the fear of a change comes from a missing
capability, we build the capability.

SO A RECOMMENDATION AGAINST A FIX MAY NOT REST ON ITS SIZE. Say what is
wrong, what the fix costs, and what tool would make the cost small. Deferring
is the owner's decision, never the agent's.

## The pattern checklist

The overhaul asks one more fixed question set, about the CODE: would a named
design pattern, applied where we do not use it, improve us?

HOW TO RUN IT, beside the rule sweep. For each pattern, name ONE place where
applying it would delete code or a defect class.

- No place found? Write "none" and move on.
- A hit is a finding like any other: evidence, a proposal, a CODE letter.

HOW IT GROWS. Add a pattern when an overhaul finds the same improvable shape
twice and a named pattern covers it. The list is the rule's memory, the same
doctrine as the forbidden-words list in voice.md.

- ONE SOURCE, DERIVED VIEWS. Is one fact stored in two places, so the copies
  can disagree? Copies that diverge are the defect, and size is not.
- STRATEGY. Is one decision re-made by if/switch on the same kind in several
  places? The tell: three copies of a kind-test and a fourth that diverges.
- REGISTRY. Does a list grow by editing code in N places instead of
  registering one entry? The exemplars are the editors and the condition
  types: an unknown entry refuses, a new one is one file.
- TEMPLATE METHOD. Do two procedures share most steps and differ in one? The
  tell: a copied block with a long comment duplicated verbatim.
- ADAPTER. Are host differences handled inline where they occur instead of at
  one seam? The exemplar is the harness registry.
- INVALIDATE ON THE EVENT. Does a write path have to remember to clear a
  cache by hand? Put it in the one write funnel.
- ONE CACHE, ONE OWNER. Does every cache have one writer, one invalidation
  point, and a test for its poisoning case?
- VALUE OBJECT. Is a small domain idea — a qualified id, a reference, a path
  — hand-parsed wherever it is touched?
- FACADE ONLY WHERE IT ADDS A CONTRACT. Does a wrapper layer only forward?
  Forwarding without a contract hides the real surface.
- ONE DOOR PER RESOURCE. Is a file, a folder or a log read through one
  module, or does everybody open it themselves?
- TYPED RESULT. Does a failure carry a type, a reason and a remedy, or only a
  string? The exemplar is the refusal.
- LAYERS POINT ONE WAY. Does a lower module import an upper one, or shape
  answers belonging to the layer above it?

## Every finding goes to one of four places

THE OVERHAUL DOES THE WORK. A run that produces findings and notes and stops
there leaves the system exactly as it found it, and spends a day saying so.

### A REFACTOR — the overhaul does it, now, itself

A refactor changes HOW something is expressed and not WHAT the system can do.
The behaviour a person can observe is the same afterwards.

- Prose out of voice, walls, buried lists, a stale sentence.
- A copy that could diverge, folded back to one home.
- A pattern from the checklist applied where it deletes code.
- A check asserting a surface that was deliberately retired, retargeted at
  the one that replaced it.
- A guidance page teaching a mechanism the engine no longer has.

DO IT IN THE RUN. Do not file it, propose it or park it. Where the state
lacks the verb the fix needs, GRANT THE VERB — that is a refactor too, and a
state note is a file like any other.

### A NEW FUNCTION — the overhaul seeds an iteration

Something the system cannot do today and would have to be built. "To be state
of the art, this needs X" is always this, never a refactor.

- SEED ONE ITERATION for the whole overhaul where the work coheres. That is
  the preference, and it is the owner's.
- SEED SEVERAL only where one would be incoherent — unrelated subsystems, or
  a dependency forcing an order.
- `se_seed_iteration` is legal here. Carry the findings in as the goal, the
  vision and the inputs, so the record says WHY on its own.
- The change size is NOT chosen here. The kickoff proposes it and the person
  decides.

### A DEFECT — it turns on whether you can already see the cause

- THE CAUSE IS VISIBLE and the fix is local. That is a refactor in everything
  but name. Do it now, and prove it with the check that caught it.
- IT NEEDS REAL DIAGNOSIS — instrumenting, bisecting, measuring. That is not
  a sweep's work. It goes into the seeded iteration with the evidence the
  sweep already has: the failing check, the numbers, what was ruled out.

NEVER LEAVE IT AS A BARE NOTE. A red check with no home is the thing this
method was changed to stop.

### A RULING — the owner's word, and only theirs

Deletion, and anything changing what the system is FOR. Present it, say what
it costs to leave it, and stop.

## The steps

1. Overhaul the method itself. Research, change or record the rejection, and
   say what you compared against.
2. Inventory. List what is active, because you cannot weed what you have not
   listed.
3. Run the machines. Every lint and the whole suite, collecting what fails.
4. Scope the sweep. The rules that changed since the last overhaul, or
   everything where none stands.
5. Mark every candidate with its SORTED letter, and run the pattern checklist
   beside it.
6. Sort every finding into refactor, new function, defect or ruling.
7. EXECUTE THE REFACTORS. All of them, in this run.
8. Mechanise what a machine could have caught.
9. SEED THE ITERATION for the new functions, one where one will do.
10. Bring the rulings to the owner. Deletion is theirs.
11. Write the report INTO THE COMMIT MESSAGE, under a subject beginning
    `overhaul:`. That one act stamps the boundary and records the run.

## What the report has to carry

SEVEN THINGS, and a missing one is a hole rather than brevity.

- WHAT THE FIELD SCAN FOUND, and what you compared against.
- WHICH SCOPE YOU RAN — the rule delta, the code delta, or everything.
- WHAT WAS EXECUTED, counted.
- WHAT WAS SEEDED, and into which record.
- WHAT WAS KEPT and why, so the next overhaul does not re-litigate it.
- THE LEDGER: defects prevented against artifacts touched.
- WHETHER THE BATTERY AND THE LINT ARE GREEN. A red one is named, with what
  it is and where it now lives.

## The field scan

Three of the prior art's rulings bind the scan itself.

- REPORT FINDINGS, NEVER COVERAGE. An agent-run sweep cannot claim it looked
  at everything, and "nothing found" reads the same as "nothing looked at".
- STRUCTURAL FINDINGS GET THE MOST DELIBERATE ATTENTION. An agent left to its
  own preference does renames and leaves the design alone.
- NOTHING THERE IS SETTLED. Whether a periodic sweep beats continuous work is
  contested, and so is whether an agent helps on a mature codebase.

## What an overhaul never does

- It never deletes on its own judgment. Removal is the owner's word.
- It never treats age as a defect. Age is a reason to LOOK, never a reason to
  remove.
- It never works the delta. That is the retro's job.
- IT NEVER FILES A REFACTOR IT COULD HAVE DONE. A note describing a fix the
  run had the tools and the hour to make is the failure this method was
  changed to stop.
