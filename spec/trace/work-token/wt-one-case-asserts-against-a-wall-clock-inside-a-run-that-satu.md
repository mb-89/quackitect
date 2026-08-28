---
id: wt-one-case-asserts-against-a-wall-clock-inside-a-run-that-satu
type: "[[work]]"
statement: One case asserts against a wall clock inside a run that saturates the machine, so it fails for load rather than for behaviour. The assertion still stands unchanged, and two sibling cases still sleep a fixed span each. NONE OF THE THREE REPAIRS HAS BEEN TAKEN. A check that fails only sometimes teaches people to run it again, which is the opposite of what a check is for, so leaving it is the one option that costs something every run.
place: retro
ready_when: "ready when the retro picks one of three: measure the call's own cost rather than the clock, quarantine these cases out of the saturating run, or raise the bound deliberately and record the new promise"
source: note-bedbeb45e2e7
---

## Why it stands

One case asserts against a wall clock inside a run that saturates the machine, so it fails for load rather than for behaviour. The assertion still stands unchanged, and two sibling cases still sleep a fixed span each. NONE OF THE THREE REPAIRS HAS BEEN TAKEN. A check that fails only sometimes teaches people to run it again, which is the opposite of what a check is for, so leaving it is the one option that costs something every run.

## When it comes back

ready when the retro picks one of three: measure the call's own cost rather than the clock, quarantine these cases out of the saturating run, or raise the bound deliberately and record the new promise
