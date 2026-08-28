---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: dsp-the-widget-guard
type: "[[design-spec]]"
statement: one predicate over the source tree, compared against what the VS Code panel actually reaches, so a file the person never sees cannot emit markup
realizes:
  - el-widget-guard
  - if-walk-engine-to-widget-guard
  - if-widget-guard-to-account
files:
  - deliverable/engine/widgets.ts
---

## Responsibility

REFUSE A SECOND SURFACE AT THE WRITE, and find one that arrived some other way
at the sweep. Both halves run the same predicate against the same registry.

WHAT IT DOES NOT DO. It does not look for derivation. A registered editor that
begins computing its own answers about the walk emits no new markup and passes
this check untouched. That gap is real and it belongs to a different check.

## Interface

`emitters(tree) -> string[]` — the files that emit widget markup.

`registered() -> Set<string>` — the files the editor registry names.

`strays(tree) -> string[]` — the difference, which is the finding.

TWO CALLERS, BOTH ALREADY EXISTING. The walk engine's write guard asks before
a write lands, carried by [[if-walk-engine-to-widget-guard]]. The finding
reaches the person through [[if-widget-guard-to-account]].

THE WIRING IS THE WRITE GUARD'S OWN DESIGN, unchanged by this rule.
[[dsp-write-guard]] already describes how a rule is read and applied, and this
one is another rule read the same way.

## Behavior and constraints

THE PREDICATE, in one sentence: a module emits a widget if it holds a template
literal carrying an opening block tag, or a tag with a class attribute.

THE BLOCK TAGS ARE NAMED, not inferred: div, section, main, aside, table, ul,
ol, form, button, svg.

IT WAS RUN BEFORE IT WAS SPECIFIED. On 2026-08-23 it flagged 38 of 171 engine
sources. The heaviest were `renderclient-form.ts` at 58 hits, `render.ts` at
52, `editors/scenario-deck.ts` at 42 and `baseui.ts` at 40.

`mirror.ts` FLAGGED ZERO, and that is the negative case the predicate had to
get right. A predicate that flags everything says nothing.

THE REGISTRY IS THE OTHER LIST. `deliverable/engine/editors/index.ts` already
names who owns the widget vocabulary. Twenty of the 38 are on it.

### The rule is reachability, in the owner's words

THE OWNER'S RULE (2026-08-23): "check which files are used by VS Code. These
files can exist. Any other files cannot exist."

WHAT THAT MEANS MECHANICALLY: reachable by imports from
`deliverable/engine/render.ts`, which is where the panel's page is built.

### How the count fell from 21 to 0

THE REGISTRY RULE FLAGGED 21 FILES on 2026-08-23. Almost all of them were the
one surface's own parts, and the rule could not tell.

THE REACHABILITY RULE FLAGGED 3. Same predicate, same tree, one question
changed. That is the measure of how much better the owner's rule is than the
one it replaced.

EACH OF THE THREE WAS DECIDED:

- `mirror.ts` built a `doclink` anchor itself, which made the server a place
  markup came from. Moved into the surface as `linkDocRefs`.
- `tools.ts` was a false positive: a tool description writing a payload shape
  in angle brackets. The predicate now treats a tag preceded by a quote as a
  placeholder.
- `bin/mermaid-check.ts` is a diagnostic page a maintainer opens, and it is
  declared in the exemption list with that reason.

THE SWEEP IS GREEN. [[tsp-only-a-registered-module-emits]] asserts it and
`deliverable/tests/widget-emitters.test.ts` runs it.

### The exemption is declared, never silent

A TEST FIXTURE, A DIAGNOSTIC PAGE AND A VENDORED COMPONENT all emit markup and
none of them is a second surface. The exemption list is a file anyone can read.

A HATCH NOBODY CAN FIND IS THE SAME AS NO HATCH, so the list is checked in
beside the rule rather than being an engine constant.

### It answers at the write where it can

A WRITE THAT PLAINLY ADDS AN EMITTER OUTSIDE THE REGISTRY is refused as it
lands. The predicate runs over one file's content, so the cost is one regular
expression over the incoming text.

A BREAK THE WRITE DID NOT ARRIVE WITH IS THE SWEEP'S. That follows
req-a-check-too-slow-for-the-write-moves-to-the-sweep rather than being a
special case invented here.

## Rationale

THE RULE WAS REWRITTEN TWICE, and each time by evidence rather than by taste.

ONE EXPORTED ENTRY POINT WAS THE FIRST READING, and a probe killed it. Twenty
form editors each emit their own markup and have to.

THE EDITOR REGISTRY WAS THE SECOND, and the owner replaced it. A file can be on
the registry and still not be reachable from the panel, so the registry rule
passes things the person never sees.

REACHABILITY IS THE THIRD AND IT NEEDS NO LIST AT ALL. The imports already say
what the panel reaches, so nothing has to be kept in step with anything.

WHAT IT COSTS. A file the panel does not reach yet, but will, is refused before
its caller exists. The remedy is to wire the caller first, which is the order
the work happens in anyway.

[[opt-a-second-surface-is-made-unrepresentable]] is where the choice was made.
