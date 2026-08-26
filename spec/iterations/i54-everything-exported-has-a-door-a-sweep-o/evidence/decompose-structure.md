---
form: decompose-structure
by: agent
signed_off: 2026-08-26T12:59:47.197Z
authors: agent
files: null
---

# Evidence form / decompose-structure

## current_situation

The engine drew the element matrix and named what is missing. Six functions had no element implementing them, all of them under fn-govern-a-conversation-under-a-stated-rule.

The standing tree carries 29 elements. None of them holds a door rule, because no door rule exists yet.

Four elements now cover the six functions. Three are reuse and one is new.

## elements

- spec/trace/element/el-door-rule.md
- spec/trace/element/el-door-write-guard.md
- spec/trace/element/el-departure-list.md
- spec/trace/element/el-door-sweep.md

## allocation

### The spread, and why it is four rather than one

ONE ELEMENT WOULD HAVE COVERED ALL SIX FUNCTIONS. The winner is one module, and a reader could reasonably ask why the decomposition does not simply say so.

IT IS FOUR BECAUSE REACH IS THE SEAM. The whole design turns on two callers being handed different amounts of the world while reading one rule. Collapsing them into one element hides exactly the property the comparison was won on.

| element | its reach | kind |
| --- | --- | --- |
| el-door-rule | nothing - it answers questions and performs no reach | new |
| el-door-write-guard | one file, the one being written | existing |
| el-departure-list | one file, read as a set | existing |
| el-door-sweep | the whole tree | existing |

### Why three are `existing` and only one is `new`

THE CALL SITES ALREADY STAND. deliverable/engine/files.ts line 449 is the write-time caller, deliverable/engine/bin/sweep.ts line 94 is the sweep, and deliverable/machines/widget-exemptions.md is the list.

WHAT IS ACTUALLY NEW is the rule module being parameterised by which conversation it governs. Today deliverable/engine/widgets.ts holds one rule, fixed. The neighbours walk found four conversations, so the choice was between one parameterised rule and four copies of the same shape.

### The allocation edges

- el-door-rule implements the root function, state-a-rule-once, and enumerate-what-a-rule-governs.
- el-door-write-guard implements refuse-a-departure-that-states-no-reason.
- el-departure-list implements record-a-departure-with-its-reason.
- el-door-sweep implements judge-each-governed-thing.

SIX FUNCTIONS, FOUR ELEMENTS, NO FUNCTION IMPLEMENTED TWICE. The spread is one-to-one except at the rule module, which carries three because they are the same read of the same file.

### What the matrix reported that this state did not create

THE ENGINE ALSO NAMED el-arrival AS IDLE and ten interfaces as undemanded. Neither is this record's doing and neither is fixed here.

THEY ARE WORTH SAYING OUT LOUD ANYWAY, because a later reader seeing them on the drawing will not know whether the door work caused them. It did not.

## follow_up

- el-arrival implements no function and the matrix calls it idle. Ten interfaces are drawn with nothing demanding them, nine of them pointing at el-view-resolver. Neither finding belongs to this record and neither is fixed here, so both should be handed to whoever owns the standing element set.

- The four new elements name interfaces in their bodies that do not exist as nodes yet: door-rule to write-guard, door-rule to sweep, write-guard to departure-list, departure-list to door-rule. The interface nodes are the next state's work, not this one's.

- el-door-rule is the only `new` element and the only `make`. Everything else is reuse of a call site that already stands. That is the cheapest shape this record could have produced, and it is worth checking at the gate that it is not cheap because something was missed.

- The parameterisation is the one design choice inside el-door-rule that nothing outside it constrains. Four conversations were found; whether the rule takes a conversation as an argument or is instantiated four times is a build decision with a real cost difference.

## anything_else

### What this state did NOT do, said plainly

IT DID NOT RE-ALLOCATE THE 29 STANDING ELEMENTS. They implement the functions they already implemented, and the matrix the engine drew carries them unchanged.

WHY THAT IS RIGHT HERE. The door regime is a new cluster of functions with no existing implementer. Touching the standing allocation would be re-deciding work this record was not scoped for.

### The one thing a builder should read first

deliverable/engine/widgets.ts, lines 148 to 185. It is 38 lines and it is the whole design already working for one rule.

WHAT TO NOTICE THERE: line 154 lets an already-breaching file through and line 184 does not. That single line of difference between the two callers is the design, and no prose in these four element nodes explains it as well as the code does.
