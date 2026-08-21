---
form: the-verdict-lands-against-its-step
by: agent
signed_off: 2026-08-21T11:33:38.688Z
authors: agent
files:
---

# Evidence form / the-verdict-lands-against-its-step

## current_situation

A leaving judgment's verdict lived in a Map keyed by evidence key, and the entry was deleted the moment the judgment settled. It never reached disk at all — measured 2026-08-21 in [[exp-what-a-fresh-session-sees]].

IT LANDS ON THE FORM NOW, beside the signature. `judgment: passed at <clock>` sits in the same frontmatter as `signed_off` and `by`, which is where a step's other durable standings already live.

A VERDICT THAT HAS NOT CHANGED LEAVES THE FILE ALONE. Most pulls re-reach the same answer, and a write per pull would dirty the tree for nothing.

A JUDGMENT WHOSE PROCESS IS GONE SETTLES AS FAILED. `spawnScript` resolves on both close and error, so a dead child always reaches the settle path; nothing is left deciding for ever inside a live session.

## built

FOUR FILES CHANGED.

`deliverable/engine/forms.ts` — `withJudgment` writes the verdict into the frontmatter, following `withSignedOff`'s own shape. It returns the raw unchanged where the verdict already reads the same.

`deliverable/engine/sessionscript.ts` — the script host gains `recordVerdict`, called where the result is set into the evidence map. The comment beside it says why: the map is memory and this is not.

`deliverable/engine/session.ts` — `recordVerdict` finds the state's own form through `stateFormHome` and writes THROUGH THE DOOR, both ways.

`deliverable/tests/handback.test.ts` — three cases: the verdict is written beside an untouched signature, an unchanged verdict leaves the file alone, and a changed verdict replaces the older one rather than sitting beside it.

MEASURED, 2026-08-21: THE WHOLE BATTERY IS GREEN. 1730 tests, 1730 pass, 0 fail. Biome green over 352 files, preflight green, the sweep green over 2497 nodes.

## follow_up

`a-fresh-session-knows-a-deciding-step` IS THE LAST CHUNK and the fatal one. The verdict is now durable; what is still undecided is what a session does when it finds a step deciding and no live judgment behind it.

THE ANSWER IS NEARLY WRITTEN. [[raid-ar-walk-resumes-from-repo]]'s fallback says re-run the judgment rather than trust a word the repository cannot settle, and the form now carries the word to find.

ONE THING THE GATE MAY WANT TO WEIGH. Every state with a leaving judgment now writes one line into its own evidence form the first time a verdict changes. That is a new kind of write into the record, and it is deliberate.

## anything_else

TWO RATCHETS CAUGHT ME WALKING AROUND THE DOOR, and both were right.

The first read the form with `readFileSync` and the second wrote it with `writeFileSync`, which is what the neighbouring claims code does. The checks counted 120 reads against 119 and 43 writes against 42.

RAISING BOTH CEILINGS WOULD HAVE PASSED. The check offers that in as many words, and the reason would have been true: an evidence form is a file this code has always written directly.

THE DOOR WAS THE BETTER ANSWER. `readNode` and `writeNode` take the same path, share one read with every other reader, and tell the door about the write. The code is shorter than what it replaced and the ceilings did not move.
