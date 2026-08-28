---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: dsp-the-door-refusals
type: "[[design-spec]]"
statement: The two write-time refusals - one for a reach nobody declared, one for a departure that states no reason - carried beside the rule module rather than inside it.
realizes:
  - el-door-write-guard
files:
  - deliverable/engine/doorguard.ts
  - deliverable/engine/files.ts
  - deliverable/engine/files-patch.ts
  - deliverable/engine/move.ts
---

## Responsibility

Two refusals, and nothing else.

- A write that turns a quiet module into one that reaches a governed conversation, where no departure declares it, is REFUSED.
- A write to a departure list that adds a line carrying a path and no reason is REFUSED.

Both read `dsp-the-door-rule` and hold no copy of any predicate.

### Every write verb asks them, through one function

A REFUSAL WIRED INTO ONE VERB OF FOUR IS NOT A REFUSAL. Fresh eyes found the pair running on the whole-file write only, while patch, replace and move ran one guard, one guard and none.

That mattered more than a count. The contract tells every agent to edit source with the patch verb, which was the verb running fewest. Both refusals also hand back a remedy whose tool is that same verb, so following the remedy edited the departure list through the path that never checked the reason.

SO ONE FUNCTION IN `deliverable/engine/files.ts` HOLDS EVERY CONTENT REFUSAL, and all four verbs call it. A move asks it about the DESTINATION path, because carrying a quiet file into `deliverable/engine` is what makes it engine source.

The two guards that repair rather than refuse stay with their callers. Each one owns what it does with the repaired bytes and with the note naming the repair.

### Why they sit outside the rule module

`el-door-rule` states that the rule module refuses nothing. Keeping the throws here means the sweep can import the rule without importing a refusal it never uses.

`deliverable/engine/widgets.ts` does not have this split, and it is the one place this generalisation improves on its own worked example.

## Interface

```
guardNoUndeclaredReach(root, rootRelativePath, content, source): void
guardDepartureHasReason(root, rootRelativePath, content, source): void
```

Both throw a typed `Rejection` or return. The signature matches `guardNoUnregisteredEmitter` exactly, because `deliverable/engine/files.ts:449` already calls that shape and the call site should not have to learn a second one.

## Behavior and constraints

### It refuses the ADDITION, never the edit

A file that already reaches keeps being editable. Most of the engine reaches disk today, and a guard that froze them would block the fix as well as the fault.

HOW MANY IS THE SWEEP'S ANSWER. A count written into a spec is right on the day it is typed and wrong on the next import, which is the defect this design exists to stop. This sentence said 81 while the tree held 82.

So the question is: did THIS write turn a quiet file into a reacher. That is one read of the file on disk and one run of the predicate.

`widgets.ts` lines 140 to 154 carry this reasoning for the widget case, and it transfers unchanged.

### The reason refusal names three things

A diagnosis that does not say where to look is a remedy with the remedy removed.

- The file.
- The line, counted in the file rather than in the block.
- The offending path, quoted back.

The remedy it hands over is the exact patch that adds a reason to that line.

### What counts as a reason

Any non-empty text after the dash, once trimmed. Whitespace alone is refused.

THE RULE DEMANDS A REASON, NEVER A GOOD ONE. Judging quality is a reviewer's job, and the list is what they read. `exp-do-the-lists-that-demand-a-reason-collect-considered-ones` measured what a refusing verb actually collects here: 104 of 113 reasons are considered, and the 9 that are not sit in one record where the honest answer genuinely was the same nine times.

### It fits inside the write budget with room to spare

`exp-does-a-corpus-reading-check-fit-inside-the-write-budget` measured a corpus-wide read at 18 to 20 ms against a 1000 ms budget.

These guards read far less than that: one file from disk, plus the departure list. So the budget is not a constraint on this design, and any later argument that cites it is citing a figure this record disproved.

### No blanket off-switch, in either guard

`req-no-setting-disables-every-rule-at-once` binds these as hard as it binds the rule module. Neither guard may read an environment variable, and the call site in `files.ts` may not wrap the call in a condition the guards do not themselves decide.

A caller that wraps the guard in its own `if` has moved the switch rather than removed it.

## Rationale

### Why the reason is refused rather than ignored

`widgets.ts` line 108 says a bullet with no reason is ignored. That was probed at `exp-can-a-reader-act-on-the-departures-the-tree-holds` and the finding is that ignoring makes the list unreadable as an answer: a reader cannot tell a rejected line from one nobody wrote.

`req-an-exemption-without-a-reason-is-refused-at-write-time` is the correction, and it is the single thing the six-system prior-art scan found nobody else doing.

### What the refusal cannot catch

A write that reaches through a shell. The command is a string carrying no path the guard can resolve into a target, and 38 of 178 engine modules hold that channel.

`el-door-sweep` carries the coverage instead, so the sweep stops being a second opinion and becomes the only complete check. That is the prototype gate's own constraint on this design.
