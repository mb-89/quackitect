---
form: package
by: agent
signed_off: 2026-08-17T19:58:36.721Z
authors: agent
files:
---

# Evidence form / package

## current_situation

THE ENGINE AND THE METHOD BOTH MOVED, so this is a real release rather than a re-zip.

The version bumped 4.4.0 to 4.5.0 in `project/deliverable/package.json`, the one manifest `version.ts` reads.

The archive assembled by script in 14.9 seconds, exit 0. Nothing was assembled by hand.

It was then extracted to a folder outside the repository and used from there, which is the only way to catch what the exclusion filter got wrong.

## package

- dist/quackitect-4.5.0.zip

## works

yes

## emit_back

- engine/session.ts — a state that carries a claim without declaring FIELDS is recognised in four places, so the walk can no longer cross one unsigned; six sites had used "declares fields" as a proxy for four different questions
- engine/session.ts — an amendment leaves every claim below it standing and a reopen drops them; `claimTime` reads `signed_off` only, so a correction never moves the ground (owner ruling 2026-08-17)
- engine/session.ts — a field another form READS is unamendable, and the refusal hands back se_reopen; the kickoff's goals list feeds every gate below it
- engine/session.ts — a claim refusal NAMES the failing check instead of withholding it, which is what let this walk's gate report five stories by name instead of sending somebody hunting
- engine/trace.ts — a corpus-ask counter, so a drift guard counts the thing it names rather than reading a clock; a door-access count cannot see a load the memo sits above
- machines/demos.md — the first real demonstration drawing any iteration has authored, and five demonstration procedures now stand in the trace where three were a paragraph and two were nothing
- guidance/refusals.md — SE-C-112 carries the amend-versus-reopen rule forward, so the next walk meets it before it guesses
- README.md — the Status block named two verbs that have never existed, and the entry document is what a stranger reads first

## follow_up

THREE THINGS THE NEXT RECORD INHERITS, and the owner has ruled on the first two.

THE BATTERY SCOPE. Non-code files force a full battery, and `engine/session.ts` maps to no scoped test because the scope map is a filename lookup with no `tests/session.test.ts` behind it. One file edit therefore costs about a minute behind a single call. note-ce4ac7d7af2d and note-4bfbbe7e8d93.

THE REWIND. A walk that made a mistake has no way back to a state it already crossed; the only route was twenty-five hops forward through `shipped`. note-1447294a356d, with i31's re-run-from-a-chosen-state as the planned mechanism.

TWO BUILT ENGINE PARTS WITH NO DOOR, found tonight at the acceptance gate. i15's query evaluator and coupling ranker are on disk and tested, no lane verb reaches either, and `recordCouplingDisposition` is called by nothing at all. note-8a7a3030c5e9. Whose walk finishes them is the owner's call and has not been asked.

TWENTY-ONE NOTES STAND IN THE INBOX for the retro to drain.

## anything_else

THE CHECKS RUN AGAINST THE EXTRACTED COPY, not the repository.

- The packaged launcher read the packaged brand, found node, and printed the packaged engine's flag registry from the extract. One help, whole, exit 0 in 1978 ms.
- The version stamp read 4.5.0 out of the archive, from the packaged `version.ts` rather than from the manifest beside it. That is the exact defect `version.ts` records, where a 4.1.0 archive announced 3.0.0-bootstrap.
- 0 record files shipped under `project/spec`. The folder exists and is empty, which is what the receiver needs.
- README.md is the entry document at 1265 bytes, opening `# Quackitect`, with 0 unrendered brand placeholders. The placeholders that DO ship are in the templates they belong to — `brand/README.entry.md` and the extension manifest — which is where the installer renders from.
- The installer is inside at 30,267 bytes, and the editor extension is inside under `project/deliverable/vscode`.
- `node_modules` and `.se` stayed home. A glob for each returns nothing.

SIZE: 2,794,821 bytes, up 41,939 from 4.4.0's 2,752,882. That is 1.52 percent for a milestone that added thirteen interface nodes, five demonstration procedures and seventeen test cases.
