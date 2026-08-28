---
form: write-the-emitter-predicate
by: agent
signed_off: 2026-08-23T18:31:14.396Z
authors: agent
files: null
---

# Evidence form / write-the-emitter-predicate

## current_situation

THE PREDICATE WAS WRITTEN IN ONE SENTENCE AND RUN OVER THE TREE, well inside the hour.

THE RULE AS STATED: a module emits a widget if it contains a template literal holding an opening block tag or a tag carrying a class attribute.

IT FLAGS 38 OF 171 SOURCE FILES. The heaviest are renderclient-form at 58 hits, render at 52, the scenario-deck editor at 42 and baseui at 40. The lightest carry one.

TWENTY OF THE THIRTY-EIGHT ARE FORM EDITORS, under editors/. Those are not violations and they are not exemptions either — they are the widget vocabulary itself.

mirror.ts FLAGS ZERO, which confirms independently what the earlier measurement found: it is plumbing rather than a renderer.

## built

- none

## follow_up

THE ASSUMPTION HOLDS AND THE RULE IT NAMED DOES NOT. That is the useful outcome, and it took running the thing to see it.

WHY THE ORIGINAL RULE FAILS ITS OWN TEST. It said one exported entry point may emit and every other module is refused. Thirty-eight modules emit today, and twenty of them are the form editors, which have to. An exemption list covering more than half the flags is the convention arriving with paperwork, which is exactly the failure the spike was written to detect.

THE CORRECTED RULE, and it is stronger rather than weaker: ONLY A MODULE REGISTERED IN THE EDITOR INDEX MAY EMIT WIDGET MARKUP. The registry already exists at deliverable/engine/editors/index.ts, so the check compares two lists that both stand today rather than inventing a category.

WHAT THAT BUYS. A new emitter is refused unless somebody registers it, and registering it is a visible act in a file whose whole job is to say what the widget vocabulary is. That is a narrower and more checkable rule than the one the candidate proposed.

WHAT IT STILL COSTS. The surface's own parts — render, baseui, the renderclient files, params, tables, traceui — are eighteen modules that emit and are not editors. Each is either part of the one surface or a second one, and deciding which is exactly the six-widget decision M7 already owes.

THE ASSUMPTION NODE SHOULD RECORD BOTH: that the predicate is writable and cheap, and that the rule it was written for was the wrong rule.

## anything_else

