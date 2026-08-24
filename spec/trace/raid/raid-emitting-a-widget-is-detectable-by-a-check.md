---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-emitting-a-widget-is-detectable-by-a-check
type: "[[raid]]"
kind: assumption
statement: Emitting a widget can be defined precisely enough for a check to refuse it, so the guard against a second surface is a rule rather than a convention.
owner: the owner
trigger: the first attempt to write the rule, or any module that emits surface markup and passes the check
status: open
probe: holds — the predicate is writable and cheap, and running it showed the rule it was written for was the wrong rule
probed: 2026-08-23
impact: The guard is the whole reason the winner took the fatal axis. If the predicate cannot be checked, the guard degrades to a convention, the axis it won becomes a draw, and the winner's seat rests on latency alone.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - spec/trace/candidate/cand-the-guarded-collapse.md, its own Not established section
  - spec/trace/requirement/req-a-wrong-act-never-passes-silently.md
---

## Not established

THE PREDICATE HAS NEVER BEEN WRITTEN. Emitting a widget is easy to say and
hard to detect. A template literal holding markup, a helper that returns a
string, a component imported from elsewhere and re-exported — each is a
different shape and only some of them are the thing meant.

## Not controlled

THE LEGITIMATE CASES ARE REAL AND VARIED. A test fixture, a one-off diagnostic
page and a vendored component all emit markup and none of them is a second
surface. The rule needs a declared exemption, and a rule with a wide exemption
is a convention wearing a check's clothes.

## Why it is a tripwire

THE WINNER TOOK THE FATAL AXIS ON THIS GUARD, scoring 4 against the rival's 3.
The candidate's own note concedes the failure mode in the same breath: without
a precise predicate the guard degrades to a convention with extra words, and a
convention is exactly the silent pass the requirement forbids.

## Probe

WRITE THE PREDICATE AND RUN IT OVER THE TREE AS IT STANDS.

- State the rule in one sentence a linter could implement.
- Run it across the engine and count what it flags.
- Read every flag and decide whether it is a second surface or an exemption.

THE PROBE PASSES when the flags are a short list and every entry is plainly one
or the other. It fails when the exemption list is longer than the violation
list, because that is the convention arriving with paperwork.

IT IS CHEAP AND IT NEEDS NO BUILD. The rule can be a script over the source
before it is ever a lint rule.
