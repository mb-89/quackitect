# Report — e4 persistence floor

## What shipped

- Expedition records. `se_exp_new` mints `product/spec/expeditions/<id>/record.md` on the branch. Frontmatter carries id, kind, status, opened, goal. The body is free prose for people.
- List serves the record. `se_exp_list` returns id, goal, status, and report verdict per expedition, open and archived.
- Report before close. `se_exp_close` refuses while `report.md` is missing from the record. On close the record flips to `status: closed` with `report: pending`. A retro adjudicates pending reports later.
- Escape to idle. `se_tick {escape: "<reason>"}` leaves a stuck sub-machine. The machine is left standing. The reason lands in the instance's escape record and the history carries an `escaped` outcome. Boot cannot be escaped. Empty reasons are refused.
- Decision capture. While an expedition is bound, every decision-graph op also appends to `decisions.jsonl` in its record. Parts per visit ride the visit key.
- Re-entry resets. A machine entered again starts gray. Its evidence from the previous pass is cleared at seed. The mirror draws the live run only.
- Autonomy rename. The slider and the concept are called autonomy everywhere user-facing: packet field, mirror route, CLI `--autonomy` (old spelling accepted), env `SE_AUTONOMY`, guidance, contract, AGENTS.md.

## Deliberately not done

- Evidence forms. The floor stops before the first per-state evidence form is written. Its human-editable shape is an owner design decision (see the open thread below).
- Retro adjudication of pending reports. No retro machinery exists yet.
- The merge split (live claims to main, heavy state stays on the branch). Bootstrap merge-back stays until iterations receive design input.

## Open threads

- Evidence form shape — owner discussion owed before any state persists evidence.
- continue_expedition does not yet match the owner's intent; redesign after persistence.
- Escape has no mirror affordance yet; the verb is lane-side only (visual design is the owner's).

## Verification

- 56/56 selftests green, including new coverage: record mint + frontmatter in the list, report-refusal at close, closed+pending record on main after merge, decision capture into the record, escape (recorded reason, lands at idle, boot exempt, empty refused), re-entry reset.
