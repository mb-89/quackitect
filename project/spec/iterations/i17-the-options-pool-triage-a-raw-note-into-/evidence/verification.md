---
form: verification
authors: agent
files: null
---

# Evidence form / verification

## current_situation

A tester subagent verified with fresh context, reading the specs first and running rather than reasoning. It returned ELEVEN FINDINGS, THREE OF THEM BLOCKING, and it found two that I had not.

WHAT IS GREEN, and the tester says what it ran for each: the full battery through this state's own exit script; 17 pool cases; tsc clean; biome clean over 289 files; 46 cases across retro, surveywindow, mirror-contract and identity-collision, so the survey change broke nothing there. A refused mint truly leaves nothing — checked on the filesystem, not the return value. Slug collisions produce three distinct files. statement and ready_when round-trip exactly through the corpus reader for colon-space, quotes, newlines, leading dashes and emoji.

THE THREE BLOCKERS ARE INDEPENDENT AND ALL THREE ARE MINE.

- F1, THE NAME WAS ALREADY TAKEN. machines/items/option.md declares folder project/spec/trace/option, prefix opt-, and a schema with a required ## Mechanism section. That is the morphological chart's design-search cell, 95 nodes deep. survey() over this repository now answers counts.backlog: 95, every one of them a design alternative with an empty re-entry condition, and the real parked work is gone from the answer. Every minted node is also non-conformant, missing ## Mechanism.
- F2, A SECOND DOOR EXISTS AND IT IS ON THE LANE. se_file_write writes a node into the pool folder with no mint demands at all — the tester landed a fabricated statement carrying a third party's name and a fabricated claim about a CFO, with source: nowhere. tsp-one-door-into-the-pool's checklist line "the lane's own tool surface offers no verb that writes an option directly" is FALSE AS OBSERVED, and I signed a form at observe-red saying that checklist could not discriminate yet. It could not, and I did not go back to it.
- F3, THE PRIVACY CHECK FALLS TO PUNCTUATION. dsp-the-options-pool says the comparison runs "with whitespace and case flattened". It does not — words() splits on whitespace and lowercases and never touches punctuation, so substituting hyphens for spaces carries the note through verbatim. That is a divergence between the spec and the code, NOT the disclaimed limit: the disclaimer covers a REWORDED sentence and none of the tester's transforms is reworded. Worse and more ordinary: an email, a path or a password is ONE TOKEN, and no run-of-six check can ever reach it.

AND THE OWNER RULED ON F1 WHILE THIS WAS BEING WRITTEN: "You can't have two notes that are both named options and mean different things. You need to find a new name... I used to call them work tokens, work items. Don't call them options if the name is already taken." The record already carries `work token` as their own word for exactly this, from 2026-08-17, and a search then returned zero hits for it. It is the name.

WHAT I GOT WRONG UPSTREAM, said plainly rather than in the fix. M1 argued at length for Anderson's vocabulary and never checked whether the corpus had the word. M4 is where the morphological chart lives and M4 does not run at minor — so the one milestone whose artifact would have shown the collision is the one the column skipped. That is not an argument against the column; it is an argument that a new node kind needs a check that does not depend on which milestones ran.

## claims

- [ ] tsp-one-door-into-the-pool — FAILED, and this is the finding I most needed a tester for. Its checklist has five lines and TWO are false as observed. "The lane's own tool surface offers no verb that writes an option directly": se_file_write does, with no statement check, no SE-C-140 and no note behind it. "No call site takes a flag, a role or an actor that changes which demands apply": tools.ts passes judgmentDrainAllowed() and session.ts passes true. The mint demands are identical on both paths and the requirement's core holds, but the checklist line is literally unmet and an inspection that waved it through would not have been performed. THREE LINES DID PASS and the tester says what it ran: mintOption is called from exactly one place, the only writeFileSync under the pool is in pool.ts, and both refusals name se_note_drain and no actor.
- [x] tsp-prose-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-unattended-start
- [x] tsp-autonomy-tiers
- [x] tsp-read-back-inspection
- [x] tsp-coupling-disposition
- [x] tsp-bound-surface
- [owed] tsp-desk-and-gates — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-tour-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-panel-walkthrough — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-two-machines — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-first-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-a-slow-signal-keeps-the-wait — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-record-inspection — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-derivation-analysis — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine

## follow_up

ELEVEN FINDINGS GO INTO fix-findings, collected whole and fixed in one pass, which is that state's own law.

BLOCKING
- F1 the name collision. Rename to the owner's own word: a WORK TOKEN, its own item kind, its own folder, its own prefix. And a guard that refuses a new node kind whose folder or id_prefix another kind already declares — the check that would have refused the design spec at the moment it was written.
- F2 the second door. A write into the work-token folder through the file lane refuses, naming se_note_drain. That is the one-door law made mechanical instead of asserted.
- F3 the privacy check. Make the code match the spec — normalise punctuation before tokenising — and add the check the run-of-six can never make: a shared token carrying an @, a path separator or an opaque secret shape refuses on its own. Then say plainly on the assumption what is still NOT caught: word-insertion and word-deletion obfuscation. The threat model is a lazy author, never a hostile one, and pretending otherwise is worse than the gap.

HIGH
- F4 one unparseable node in the pool throws the WHOLE survey. readNotes catches per line and loadTrace skips a bad node by design; standingOptions does neither.
- F5 source and minted_in are interpolated raw while statement and ready_when are stringified. A crafted source injects frontmatter and the authored statement disappears. mintOption never calls guardParses, which is what SE-C-138 exists for.

MEDIUM
- F6 a second drain of the same note mints a second option and silently overwrites the note's where. req-the-raw-note-stays-local names "one finding gets minted twice" as what it prevents.
- F7 the window's remaining reads 0 past the end while seven stand, so an over-scrolled answer says you have seen everything.

LOW
- F8 mintOption itself accepts an empty re-entry condition; only drainNote guards it, so the module the design spec names as owning how an option is written does not.
- F9 minted_in is accepted and never passed, so a minted node cannot be traced to its iteration while all 95 existing ones can.
- F10 the design spec overstates the identity sweep. prose-inspect reads four needles, all THIS MACHINE's own identity. It catches the machine leaking itself; it cannot catch a note leaking somebody else, which is the case the pool exists to guard. The tester minted three options carrying a third party's email, home directory and password and got no finding.
- F11 the two drain call sites differ by actor flag. The mint demands are identical; the checklist line is not met.

## anything_else

