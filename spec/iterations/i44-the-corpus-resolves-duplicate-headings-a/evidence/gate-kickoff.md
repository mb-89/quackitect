---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-28T10:28:52.261Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

i44 was seeded on 2026-08-20 and entered today. It is seed 6 of the 2026-08-20 overhaul plan: reference and heading hygiene across the corpus, plus the lints that keep it clean.

The onboarding retro was skipped by its own empty-inbox rule. The survey counted zero pending notes when this milestone opened.

Boot arrived red. One raid entry carried the frontmatter key `probed` twice, so preflight and the conformance sweep both refused it. The two values were merged and the check went green.

One item of the seed was re-checked before proposing a size. Twenty-four files still carry the `## Detail` heading twice, which is exactly what the plan recorded eight days ago.

## retro_drained

- note-301f9ac89b92 — The arrival hook reported the lane as failed whi: pending, captured after this milestone's retro had already run, so it belongs to the closing retro
- note-09fbf3ec4ee1 — An empty inbox skips the retro's judgment but st: pending, same reason, and both are process findings rather than work this iteration absorbs

## goals

- Sweep the duplicate headings and duplicate reference entries out of the corpus.
- Make every id-shaped and path-shaped reference resolve, or carry an explicit marker saying why it cannot.
- Rewrite stale narration bodies into the past tense, and reconcile rows that contradict newer rulings.
- Land the work-token vocabulary wherever the pool spec still teaches the old noun.
- Take the dead git verbs out of the use cases and the story that teach them.
- Settle the test-spec layer's file and path references on the repository root.
- Arm the lints that make each of the above impossible to reintroduce.

## pulled_in

- Mechanical sweeps, from plan seed 6 item 1: 24 duplicate Detail headings, 6 files with duplicate source_refs or refines entries, about 46 unresolvable path-shaped references, the mangled reference in req-refusal-carries-remedy, the empty weighs_against in req-desk-offers-a-tour.
- Stale narration repair, from item 2: the named past-tense bodies, the handover row, the container row against the newer i34 ruling, the categorical autonomy row, the swept slider wording, and three renamed id misnomers with their inbound links.
- The work-token rename, from item 3: dsp-the-options-pool, flow-standing-option and uc-see-the-whole-pool, against pool.ts as the reality.
- Dead verbs, from item 4: uc-land-work-on-trunk and sty-land-the-work lose se_git_sync and se_git_land, plus the two neighbouring use-case corrections.
- The test-spec layer, from item 5: 11 dead file references repaired and 156 path references settled on the repository root.
- Retired references, from item 6 and owner decision 2: the claim-verb-race and watchdog dangling references marked retired under the standing i34 ruling, and the trimmed-spread candidate reconciled.
- The lints, from item 7: the corpus-wide dangling-reference sweep over every reference key, the verbs and paths sweep extended to spec/trace, the stale-code-citation lint, the duplicate-heading lint, and the option-coverage report.

## left_out

- The source_refs migration and the reference glossary stay with i10, as the seed says in as many words.
- The raid close list stays with plan seed 5, and it is blocked on owner decision 1.
- The rest of owner decision 2 stays out: the voice matrix, the decision-matrix form and the read_consume condition type were not routed into this seed.
- The archive slice for the 208 settled nodes is owner decision 4 and is untouched here.
- The engine structure work is plan seed 8 and is a separate iteration.
- The fourteen zero-reference work tokens are triaged into the three piles the findings name, and any pile needing new design leaves as a note.

## change_size

minor — The change repairs corpus documents and arms mechanical checks. No production behaviour changes, no interface a person or an agent touches changes, and the machine format is untouched. The volume is large but the class is repair plus lint, which is the same shape the sibling seed took at i45. Strikes: none proposed. The floor law rows stand as they are, and the walk escalates visibly if a lint turns out to need a design decision rather than a rule.

## round_0_verify

- evidence vs claims: The seed's item list is concrete and file-level, and one claim was re-measured today. Twenty-four files still carry a doubled Detail heading, matching the plan's 11 plus 13.
- types: Not run at kickoff. No code has been written yet, and the machine makes the type check legal at verification.
- lint: Not run at kickoff, except boot's own preflight and sweep, which are green after the duplicate-key repair.
- tests: Not run at kickoff. The new lints are this iteration's own acceptance points and will carry their tests.

## round_1_validate

- exercised against the goal: The seven goals map one to one onto the seed's seven item groups, so nothing in the goal list is unsourced.
- missing: The seed's remaining counts are unverified today. Only the heading count was re-measured. Each sweep re-counts its own class before it edits, so the numbers are checked as the work reaches them.
- wrong: Nothing found wrong in the seed. The one contradiction met so far was in the corpus itself, not in the plan, and it is already repaired.
- out of scope: Four things were pushed out and are named in left_out. The largest is the source_refs migration, which belongs to i10.
- prior art: Not compared, and here is why. The candidates are the general markdown link and prose checkers, remark-lint and Vale among them. Comparing them fairly means measuring what they catch on this corpus, and that measurement belongs with the lints once they exist. The comparison is owed at the validation gate, not asserted here.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached, and nothing was measured against it in this window. This gate has never signed before, so the window opens at the session's first call. The three slow records it holds are mirror page loads, which this interface does not cover.

## round_2_red_team

- Steelman: the whole iteration is unnecessary churn => The opposing case at its strongest is that a dangling reference harms nobody until somebody follows it, and 220 kilobytes of findings can absorb a week for cosmetic gain. It fails on one fact: preflight already refuses the whole boot over one malformed file, so corpus rot is not cosmetic here, it stops the machine. That happened this morning.
- Kill-criterion: the sweeps find the plan's counts stale => This would be the wrong call if the corpus had moved far enough that the item lists no longer describe it. It was tested on the one class that is cheap to count, and it held exactly. If a later sweep finds its class has drifted, that is the signal to re-derive the list rather than follow it.
- The lints could outgrow the size => Arming five sweeps is engine work with tests, and a lint that turns out to need a design decision is a major-shaped question wearing a minor's clothes. The named escape is the visible escalation, not a silent one.
- The rename could be adopted in the wrong direction => The pool code is named as the reality, so the corpus follows the code rather than the reverse. If the code turns out to be the wrong noun, this iteration would spread the mistake. Nothing in the plan questions it, and neither does this gate.

## raid_additions

- none

## verdict

pass — The seed is concrete, its one cheaply-checkable claim was re-measured and held, the scope has a named boundary against i10 and the other seeds, and the size matches the sibling seed's precedent. The one open question, whether the plan's remaining counts still describe the corpus, is discharged by the work itself rather than carried as an assumption.

## follow_up

Walk into the milestones and take the sweeps in the seed's own order, re-counting each class before editing it.

Two process notes stand pending for the closing retro: the arrival hook's false failure verdict, and the empty-inbox retro that still demands a full form.

The prior-art comparison is owed at the validation gate, once the lints exist to compare.

## anything_else

The gate was blessed by the agent rather than by the owner. The gate weighs tactical and the session dial stands at strategic, so the choice was within the dial.
