---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: dsp-the-door-rule
type: "[[design-spec]]"
statement: One conversation's rule, stated once and answering three questions about it, carried by a stateless module that reads no state and refuses nothing.
realizes:
  - el-door-rule
files:
  - deliverable/engine/doors.ts
---

## Responsibility

It holds the rule for each governed conversation and answers questions about it.

Three answers, and each caller takes only what its own reach allows.

- Does this text reach the capability. A predicate over ONE string, reading no file.
- Which modules reach it. A walk over the governed tree.
- Which modules are recorded as departures, with their reasons.

A fourth answer sits beside them because the first kickoff goal asks for it: which files are entry points, enumerated from the source.

### What it deliberately does not do

IT REFUSES NOTHING. `el-door-rule` says so in as many words, and the two refusals live in `dsp-the-door-refusals` instead.

That is the one place this generalisation improves on its own worked example. `deliverable/engine/widgets.ts` holds `guardNoUnregisteredEmitter` beside the rule it reads, so the module that answers questions also throws. Splitting them means the sweep can import the rule without importing a refusal it never uses.

IT NEVER SAYS HOW A REACH IS PERFORMED. That bound is inherited from `raid-dec-the-door-rule-governs-who-may-reach-and-never-what-the-reach-does`.

## Interface

```
type Door = {
  id: string          // named for the CONVERSATION, never the technology
  governs: string     // one line: what the conversation is, and what this rule cannot see
  reaches(text): boolean
  covers(path): boolean
}

DOORS: readonly Door[]
door(id): Door
reachers(id, root?): string[]
departures(id, root?): Map<path, reason>
strays(id, root?): string[]
departureFile(id): string
entryPoints(root?): string[]
unreachedEntryPoints(root?): string[]
```

### Every call takes a root, and that is not decoration

`deliverable/engine/widgets.ts` records at lines 118 to 125 what happens without one. A test root BORROWS the engine as a link, a linked module resolves its own directory to where it really lives, and the guard read the wrong list. It then reported every declared exemption as a violation and held boot short of the front desk in every fixture that walks.

That failed a check rather than skipping one, which is the worse direction. So the root is a parameter here, and the fallback to the module's own directory is the exception rather than the rule.

## Behavior and constraints

### It holds no state between calls

Two callers with different reach consult it. A cached answer would let them disagree about a tree that moved under one of them.

The engine's standing rule allows a computation cache keyed on a stamp of its input. That is not forbidden here. What is forbidden is a stored ANSWER.

### A missing departure list means no departures

Never a crash. The rule has to answer even where nobody has written the list yet, and `widgets.ts` already carries this behaviour.

### A bullet with no reason is REFUSED, not ignored

This is the second improvement on the worked example. `widgets.ts` line 108 says a bullet with no reason is ignored, which means a reasonless departure is silently dropped and the module it names goes on being reported with no explanation of why.

`req-an-exemption-without-a-reason-is-refused-at-write-time` makes it a refusal instead. The reader then knows that every line on the list carries a reason, because no other kind of line can get onto it.

### The separator is any dash

`widgets.ts` line 134 records why: demanding an em dash meant a person typing a hyphen got zero exemptions and no error to explain it. Inherited unchanged.

### It reads no environment variable

`req-no-setting-disables-every-rule-at-once` binds this, and a case in `tests/doors.test.ts` checks the module's own source for `process.env`.

The engine's suite already sets four variables that turn a tool into a no-op, so this is the exact shape being ruled out rather than a hypothetical one.

## Rationale

### Why one module rather than one per conversation

`raid-dec-one-rule-module-is-read-by-a-write-time-guard-and-a-sweep` took this, and the kill criterion was probed at `exp-does-one-rule-fit-all-four-conversations`. It holds by 8 modules: the widest door's day-one departure list would hold 81 of 178 governed modules, against a falsification bar of more than half.

The margin is thin and the spread is wider than the record had been quoting. 81 against 2 is forty to one, not thirteen to one.

### Why the predicate takes a conversation

The neighbours walk found four. Copying `widgets.ts` four times would put four copies of one shape in the tree, which is the failure this whole record is about.

### What the shape does not fix

The predicate reads imports. A module that reaches through a shell carries no path it can judge, and `exp-which-channels-add-a-departure-without-a-path-the-guard-can-judge` measured that at 38 of 178 modules.

So each door's `governs` line states its own coverage limit rather than implying completeness. dependency-cruiser has the same blind spot for the same reason, so this is the category's limit rather than this design's.
