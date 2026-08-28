---
form: arm-the-empty-classes
reopened: "2026-08-28T11:13:43.766Z — its claim was dropped when verbs-repaired had no standing claim, and the form is now neither served nor accepted"
by: agent
signed_off: 2026-08-28T11:14:07.857Z
authors: agent
files:
---

# Evidence form / arm-the-empty-classes

## current_situation

Two checks are wired into the corpus sweep and boot is green afterwards.

The sweep reads 2,581 nodes in 977 milliseconds and exits 0. The suite runs eleven cases, eleven green.

## built

`deliverable/engine/sweep.ts`, four edits.

- The finding kinds grew by `duplicate-heading` and `dead-verb`.
- `textFindings` calls the two classifiers and is called from inside the node loop, after the frontmatter parses.
- `isNode` gates the whole thing on frontmatter that declares a type, so a form instance and a working document are not swept.
- `teaches` narrows the dead-verb check to use cases and stories.

MEASURED AFTER WIRING. `node engine/bin/sweep.ts --root .. --under spec` exits 0 and prints `sweep green` over 2,581 nodes in 977 milliseconds.

## follow_up

Repair the three classes that still report, then arm their checks the same way.

The counts are 35 stale citations, 131 dangling references and 11 unreferenced work tokens.

## anything_else

THE DEAD-VERB CHECK IS NARROWER THAN THE HEADING CHECK, and the difference is deliberate.

Seven nodes name a verb the engine does not serve. Two of them teach it, and those were repaired. The other five mention it as history or as the example a requirement is about: two raid entries recording that `se_git_sync` was retired, and `req-guidance-names-only-what-the-engine-has` naming `se_package` as the thing it forbids.

REPORTING THOSE WOULD BE WRONG. A node recording that a verb is gone is doing its job.

SO THE CHECK READS USE CASES AND STORIES, the nodes that tell a reader what to do. That is where a retired verb costs somebody a refused call.

THE COST OF THE NARROWING is that a retired verb taught in a design spec would be missed. That is a real gap and it is named here rather than left to be discovered.
