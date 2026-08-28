---
minted_in: i9
id: req-the-folder-shows-what-to-run
type: "[[requirement]]"
statement: When a person obtains the product's folder and opens it for the first time, the folder shall present the one thing to run where a first-time reader looks first, with nobody explaining it.
kind: quality
characteristic: interaction-capability
verify_method: test
breaks_if_removed: A fresh checkout is a list of folders with no instruction, and the newcomer reads source before running anything. The collapse makes this worse than it was, because the launcher moves inside the folder it used to sit above.
breaks_how_badly: abrasive
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 2
  - raid-iss-the-collapse-hides-the-one-thing-a-newcomer-must-run
  - sty-ramp-up slide 2, and reports/rpt-ramp-up.md, which has owed a fresh-machine run with a real first-timer since i1
  - "prior art, GitHub's own documentation: a readme at the repository root is surfaced automatically to visitors — on the website, not in an editor"
  - "prior art, the setup-script convention: its own readme says it works because contributors already know the pattern"
priority: must
---

## Scenario

- Source: a person who has never seen this product.
- Stimulus: they obtain the folder and open it, in an editor or a file
  browser.
- Artifact: the top level of the folder, as their tool actually renders it.
- Environment: no README has been read, nobody is helping, and no link
  brought them here with instructions attached.
- Response: they identify the one thing to run and run it.
- Response measure: at least two in every three do so within 60 seconds, with
  no guidance beyond what the folder itself shows them.

## The number is a chosen bar, not an observed one

NOTHING HAS BEEN MEASURED. No first-timer has been watched, and the ramp-up
report says so plainly and has said so since i1.

SO THE MEASURE IS A TARGET WITH ITS REASONING, and it is written that way on
purpose. A tolerance inferred from nothing reads exactly like a measured one,
and that is the failure mode the authoring method names for rows written with
a model in the loop.

WHY TWO IN THREE AND WHY 60 SECONDS. Below two in three, the folder is not
showing anything and the successes are people who guessed. Past 60 seconds a
person has started reading source code, which is the behaviour this row exists
to prevent. Both numbers move the first time somebody is actually watched.

## What this row does NOT say

IT NAMES NO MECHANISM, and that is deliberate. The prior-art comparison at the
M2 gate found four mechanisms that genuinely surface something to a person,
each because a host already scans for that filename, and found that a
conventionally-named script at the root surfaces nothing at all.

NAMING ONE HERE WOULD FREEZE A DESIGN AS AN OBLIGATION. Which mechanism to use
is the design milestone's call, and this row is what that call has to satisfy.

THE RENDERING SURFACE IS PART OF THE PROBLEM. A readme is surfaced by the
code-hosting website and is one more file in an editor's tree, so a row that
demanded a readme would pass on one surface and fail on the other.

## Behaviour

No model wanted. One condition and one response, and the measure carries the
whole demand.
