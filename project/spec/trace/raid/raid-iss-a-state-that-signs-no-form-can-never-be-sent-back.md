---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-state-that-signs-no-form-can-never-be-sent-back
type: "[[raid]]"
kind: issue
statement: "A state with no evidence fields leaves no form on disk, so a reopen is refused and the work it owns cannot be re-earned."
owner: the maintainer
trigger: any state whose evidence list is empty, and any gate that refuses over one
status: open
impact: "The one state whose whole job is filling a story's evidence is the one state that cannot be sent back to do it. A must story reached the validation gate with seven empty evidence halves, and the repair had to be made at the gate instead of where it belongs."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - raid-iss-reopening-inside-a-sub-machine-has-no-short-way-back
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---
## What was observed

MEASURED 2026-08-19 in i5. `fill-story-evidence` compiled with an empty
evidence list, so the walk passed straight through it and wrote no form.

`gate-validation` then refused its own bless, correctly, naming two defects of
the story: no demonstration spec named it, and its evidence half was empty on
slides one to six.

`se_reopen fill-story-evidence` was refused SE-C-112, "no form on disk". There
was nothing to send back, because nothing had been claimed.

## Why it is an issue and not a risk

IT ALREADY BIT, in the record that found it. The fix was made at the gate under
the gate's own tool list, which is the wrong place for it — a gate judges, and
here it also had to author.

THE STORY TEMPLATE POINTS AT THE SAME STATE. `items/story.md` says the
evidence side is empty until M8 and fills there. M8 is where the state sits.

## What repair consists of

- A state that owns work owes a claim, even when the claim is "nothing was
  needed". An empty evidence list should compile to one field, not to none.
- Or the reopen should accept a state that has been walked, using the walk
  record rather than the form file as its proof.
- The gate's refusal was RIGHT and must stay. It is the only reason the empty
  deck was caught at all.
