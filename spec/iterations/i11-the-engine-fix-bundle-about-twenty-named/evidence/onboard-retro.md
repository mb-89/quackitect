---
form: onboard-retro
by: agent
signed_off: 2026-08-16T10:59:07.594Z
authors: agent
files: null
---

# Evidence form / onboard-retro

## current_situation

i11 is bound and started. It is the engine-fix bundle, seeded 2026-08-12 as enabler 3 of 4, and it took i34's whole speed-up set an hour ago on the owner's word.

THIS ROW IS A SKIP, NOT A RETRO. The inbox stands at zero — 21 notes were drained at the standalone retro minutes before this iteration opened. The rule that makes it a skip was written into this row's own guidance at that same retro, and the engine is now serving it back.

WHAT THE BUNDLE HOLDS: about twenty named defects from August, plus ten speed-up items added today, plus one slice pulled forward from i18 — name what points at a node before it is deleted.

## field_feedback

ASKED AND ANSWERED AT THE STANDALONE RETRO MINUTES AGO, and not asked twice. That retro emptied the inbox, which is what makes this row a skip.

WHAT CAME BACK, in the owner's words.

- THE PACE: "you are spending way too much time doing things that are not productive. This all takes way too long."
- THE FEATURES: "I feel like all the features we implemented in the last iterations don't work properly. We have written the requirements properly... but I don't see them working properly. The last iteration is the biggest example. We took out the whole worktree stuff because the implementations all didn't work."

THE RECORD AGREES WITH THE SECOND ONE. raid-dec-one-tree-beats-a-record-travelling-between-machines rejected fixing the resolution seam "on evidence rather than taste: two or three attempts have been made and the fault recurs". i28's validation gate passed with an override recording that no rented host had ever run the travel mechanism.

SO THE GAP IS BETWEEN A GREEN BATTERY AND A WORKING SYSTEM. Four fresh-eyes rounds on i34 each found real defects with 1299 of 1299 passing. Requirements are not the failure.

## notes_drained

- none: THE INBOX STANDS AT ZERO, which is why this row is skipped rather than worked. Twenty-one notes were drained at the standalone retro minutes ago — 3 done, 3 obsolete, 15 to the backlog with ready-when conditions. Running a second retro here would produce an empty report and cost a full state to say so (owner ruling 2026-08-16, now carried in this row's own guidance).

## call_log_mined

- 2,850 calls logged on 2026-08-16. BUILDING — patch, write, delete — was 200 of them, 7%.
- se_test: 494 calls producing 66 verdicts. About 428 asked only whether a job had finished.
- 40 of 66 test verdicts were RED, 61%.
- 148 refusals. The largest group is 56 narration updates, refused on FORMAT, not on absence.
- 448 calls took over a second. 81 of 206 pulls — 39% of the core verb — break the one-second rule.
- 7 refusals were wrong argument NAMES, each a wasted round trip: se_file_search wants query, se_file_glob wants glob, se_file_list wants dir, se_file_read wants path.
- se_update records carry `via` and duration_ms 0, which proves narration already piggybacks and costs no call of its own. An earlier claim that narration was 25% of calls was wrong and is corrected here.

## waste_leads

- ONE ROOT CAUSE PRODUCED MOST OF i34'S REWORK: ten requirements deleted without sweeping what referenced them. That alone produced a refused register, a ripple that greyed four states, six se_why calls to find the root, two unusable remedies, one escape, one re-entry, one wrong note filed and drained within the hour, and two full batteries.
- THE RIPPLE ITSELF IS NOT THE WASTE. When the root was fixed, all four grey states came back green in ONE pull with nothing re-done. That is early cutoff and it works. What cost was not being able to SEE the root.
- `reentry: "restart"` on the containers threw away fired edges on re-entry, forcing an already-walked leg to be walked again.
- TWO REQUIREMENTS WERE RETIRED BY READING THEIR IDS INSTEAD OF THEIR STATEMENTS, and both had to be restored after a verifier read them properly.
- Correcting three lines of a 207-row register meant resending all 207 rows, twice, because se_amend takes a field whole.

## promotions

- THE CATCHING END OF i34'S EMIT: its package state filled emit_back with seven items, and this iteration's scope now carries five of them outright — the deletion warning, se_test blocking rather than polling, the full battery being refused outside verification, se_why naming the root in one answer, and the router having no backward route.
- LANDED ALREADY, NOT PROMOTED: the empty-inbox retro skip, written into machines/states/retro.md and this row's own guidance at the retro that preceded this one. It is being served back right now, which is the check that it took.
- DROPPED DELIBERATELY: i34's emit item about the consistency sweep's grain — that a vocabulary search finds what NAMES the old thing, never what describes it in other words. It is true and it belongs to the voice lint in i25, not here.
- DROPPED DELIBERATELY: the package state having no check that the version actually moved. Real — i34 reached its package state still carrying the previous release's number — but it is a matrix-row change rather than an engine defect.
- NOT FOUND: nothing in i34's emit_back contradicts this bundle's existing twenty items.

## process_stale

CHECKED OUTWARD THIS SITTING, AND THE CHECK CHANGED A DESIGN DECISION RATHER THAN CONFIRMING ONE.

AGAINST FORMAL REVIEW PRACTICE. NASA NPR 7123.1 holds that a review is complete when agreement exists on the DISPOSITION of every Review Item Discrepancy — not when every finding is fixed — together with an agreed plan to address them. Our gates demand resolution where the standard demands disposition. The owner proposed exactly this shape independently, as a defect bucket, and the mechanism is already half-built here: the checklist template accepts `- [owed] <item> — <open raid ref>` and req-close-refuses-loose-ends guards the other end. Neither was used once in i34.

AGAINST BUILD-SYSTEM PRACTICE. Bazel and Shake both implement EARLY CUTOFF — when a task's result is unchanged, dependents are not re-executed — and both hash content rather than trusting timestamps. Our ripple already does both, which is why four greyed states recovered in one pull. This check DISCONFIRMED the suspicion that the ripple was the waste.

AGAINST AGENT-RUNTIME PRACTICE. Speculative tool execution is current work, with reported 2-5x latency gains, explicitly modelled on CPU branch prediction. It would fit our owed reads, since se_aim already computes the whole route's demands and discards them. It is deliberately NOT in this iteration's scope: speculation hides work rather than removing it, and our pull payload is the thing to remove first.

WHERE THE PROCESS IS GENUINELY STALE: nothing routes a finding into the bucket. A grey claim offers fix or reopen, never accept-as-owed — so every finding either blocks or is forgotten, and i34 spent its day in the first mode.

## follow_up

THE FIRST ACT OF THIS ITERATION IS TO DISTRUST ITS OWN LIST. The bundle was seeded 2026-08-12 and i34 has since rewritten the resolution seam, both containers, the claim system and the archive. Some of the twenty named defects are probably already gone; at least one may have been made worse.

THE OWNER RULED WHERE THAT HAPPENS: "during the kickoff, you can decide on the areas that have been rewritten." So gate-kickoff carries it, not this row.

WHY IT MATTERS MORE THAN IT SOUNDS: acting on a stale list without checking what still stands is precisely what cost i34 the most — ten requirements deleted on a list nobody re-read, producing a day of rework. Repeating it here would be the joke writing itself.

CARRIED INTO THE KICKOFF, in order of measured cost: the pull payload pagination the owner has already ruled twice, se_test blocking instead of being polled, the delete-time dependents query, and dropping `reentry: "restart"` from the containers.

## anything_else

