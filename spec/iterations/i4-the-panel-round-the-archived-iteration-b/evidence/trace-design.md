---
form: trace-design
by: agent
signed_off: 2026-08-23T19:53:34.512Z
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

TWO DESIGN SPECS COVER THIS ROUND'S DELTA, and both name files that now exist.

`dsp-the-computed-view` realizes the view resolver and its nine crossings. `dsp-the-widget-guard` realizes the guard and its two.

THREE FILES ARE NEW and each is claimed: the resolver, the guard's rule, and the one place the surface keeps the reader's place.

## design_trace

| design-spec | realizes | files |
| --- | --- | --- |
| [[dsp-the-computed-view]] | el-view-resolver · if-account-to-view-resolver · if-engine-delta-to-view-resolver · if-front-desk-to-view-resolver · if-holding-pen-to-view-resolver · if-method-compiler-to-view-resolver · if-mirror-to-view-resolver · if-record-store-to-view-resolver · if-view-resolver-to-mirror · if-walk-engine-to-view-resolver | deliverable/engine/viewmodel.ts · deliverable/engine/mirror.ts · deliverable/engine/renderclient-place.ts |
| [[dsp-the-widget-guard]] | el-widget-guard · if-walk-engine-to-widget-guard · if-widget-guard-to-account | deliverable/engine/widgets.ts |

## follow_up

THE DEAD-CODE HALF OF THIS STATE IS NOW PARTLY MECHANICAL, from a different direction. The widget guard asks whether the panel REACHES a file, and a file nothing reaches is exactly what the unclaimed list is looking for.

THEY ARE NOT THE SAME CHECK. The guard only looks at files that emit markup. A file that emits nothing and is reached by nobody is invisible to it, and the claim sweep is what finds that one.

THE TWO COULD BE ONE. Reachability from the panel plus reachability from the lane's entry points would give a dead-code answer with no list to maintain, which is the same reason the guard needs none. That is a record of its own.

## anything_else

