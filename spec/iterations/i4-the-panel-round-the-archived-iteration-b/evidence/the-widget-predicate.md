---
form: the-widget-predicate
by: agent
signed_off: 2026-08-23T18:53:37.869Z
authors: agent
files:
---

# Evidence form / the-widget-predicate

## current_situation

THE RULE HAD NO HOME UNTIL NOW. It existed as a probe script in the scratchpad and as prose on the element card. Two callers were about to need it.

`deliverable/engine/widgets.ts` IS THAT HOME. It exports four things and holds no list of its own.

## built

FOUR EXPORTS, and each answers one question.

- `emitsWidget(text)` asks it of content, which is what the write guard has.
- `emitters()` asks it of the whole engine tree, which is what the sweep has.
- `registered()` reads the editor registry.
- `strays()` is the difference, and that is the finding.

THE PREDICATE IS BUILT RATHER THAN WRITTEN OUT. A literal pattern would contain the very shape it looks for, and the file would flag itself. The block tags are an array and the expression is assembled from it.

THE BLOCK TAGS ARE NAMED, not inferred: div, section, main, aside, table, ul, ol, form, button, svg. A tag with a class attribute counts too.

THE REGISTRY IS READ, NEVER COPIED. `registered()` parses the value imports out of `deliverable/engine/editors/index.ts`. A list kept here would go stale the first time an editor was added and nothing would say so.

THE REGISTRY FILE COUNTS ITSELF AS REGISTERED. It emits the render branches it assembles from the editors, so excluding it would report the registry as its own violation.

PATHS COME BACK REPO-ROOT-RELATIVE, with forward slashes on every host, so a finding names a file a person can open.

THE CHECK NOW RUNS. `deliverable/tests/widget-emitters.test.ts` imported a module that did not exist and failed to load. It resolves now, and the red moved from the import to the assertion.

## follow_up

THE EXEMPTION LIST IS NEXT, and the guard cannot land before it. A guard that refuses before the hatch exists refuses the test fixtures on its own first run.

NOTHING IN THIS MODULE CHECKS FOR DERIVATION. It finds emitters. A registered editor that starts computing its own answers about the walk passes it untouched, which is named on [[el-widget-guard]].

THE SCRATCHPAD PROBE IS NOW DEAD WEIGHT. `scratchpad/spike-emitter.mjs` holds the same predicate and the scratchpad is never committed, so nothing has to be done about it.

## anything_else

