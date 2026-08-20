---
form: write-requirements
amended: "2026-08-19T15:13:03.813Z by agent — the security answer and the design hand-off both describe a consent prompt the owner struck on 2026-08-19"
by: agent
signed_off: 2026-08-19T13:00:04.330Z
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

The requirements milestone opens on a corpus where the collapse has been decided but nothing has moved.

FOUR STANDING ROWS ASSERT SOMETHING THE MOVE TOUCHES, found by searching for layout claims rather than for citations. The first search returned 157 hits and almost all were source_refs naming an archive path, which is noise. The second asked which rows SAY something about where things sit, and returned four.

THREE OF THE FOUR SURVIVE THE MOVE UNCHANGED.

- req-a-resolution-is-proven-by-read-back is about how a proof is written, not about layout. Its four path kinds keep their meanings; two of them merely stop differing by address.
- req-newcomer-one-command counts commands and hand-edited files. The counts do not change.
- req-every-artifact-is-readable-text demands that the product folder be readable. The collapse brings more into that folder, so the row gains reach rather than losing truth.

ONE DID NOT SURVIVE. req-one-script-installs listed three acts, one of which was starting the engine and one of which opened a workspace distinct from the product folder. Both were written when the product folder and the opened folder were two different places.

## register

- project/spec/trace/requirement/req-one-script-installs.md
- project/spec/trace/requirement/req-the-editor-is-the-only-entry-point.md
- project/spec/trace/requirement/req-a-folder-is-driven-only-with-consent.md
- project/spec/trace/requirement/req-the-machine-state-sits-in-the-folder-that-is-open.md
- project/spec/trace/requirement/req-the-folder-shows-what-to-run.md

## set_criteria

- complete: Every step and extension of the touched use case has a covering row, and the one that had none was WRITTEN rather than named. uc-install-quackitect step 2 — the person SEES what to run — was uncovered until req-the-folder-shows-what-to-run, which states the outcome with a population measure and names no mechanism. THE FAN-OUT CHECK RAN: fourteen rows refine that use case against a threshold of five, and two genuine fold families were found and deliberately left alone, recorded as note-c3d5ffbe2186, because folding ten standing rows is a register refactor this iteration never named. The first count was wrong and was redone — the regex matched source_refs citations as well as refines edges, and req-newcomer-one-command cites the use case but refines uc-quality-flexibility.
- consistent: No two rows conflict, and the one term that carried two meanings was settled. "Once" meant either once per machine or once per project, and req-one-script-installs now says machines while the use case's extension 1a says the same thing. The launcher row and req-the-editor-is-the-only-entry-point could read as overlapping, so each names the other and states the different trigger, the different frequency and the different failure. The word "root" now means one place where it used to mean two, which is the whole point of the delta. FOUND WHILE DERIVING FUNCTIONS AND FOLDED BACK HERE: req-product-is-a-folder has stood since i1 as a must graded crippling, demanding that every artifact a product owns live inside that product's own root folder with zero product-owned files outside it. Its own Detail list names the notes, the inbox, the evidence files and the logs, and all four sit outside that folder today. So this iteration closes a standing violation rather than adding a demand, which is a stronger case for the change than anything argued at the kickoff. req-the-machine-state-sits-in-the-folder-that-is-open was narrowed in response, to identity and branch invariance only, so the two rows no longer restate one another.
- affordable: Yes, and three of the four new rows are cheap because what verifies them already exists. Two want a test the suite can hold. One wants a demonstration the launcher already half-performs. THE EXPENSIVE ONE IS NAMED RATHER THAN HIDDEN: req-the-folder-shows-what-to-run needs first-time readers who have never seen the product, which the ramp-up report has owed since i1 and which no amount of code produces. That row is affordable only if somebody schedules people, and saying so now is cheaper than discovering it at verification.
- bounded: Every row sits inside the blessed goals and answers to a source. The entry-point row serves the fourth goal. The resolution row serves the first, second and seventh. The consent row serves the vision's consent ruling as corrected at the M2 gate. The discoverability row serves the use-case step that had nothing. NOTHING WAS GOLD-PLATED, and one thing was deliberately NOT written: the owner reported today that a button press takes over a second when it should answer in under a quarter. That is a real demand on the panel and it is not this delta's, so it is note-89046bd7361e rather than a row here.
- comprehensible: A reader from any discipline can say what the system must do from the set alone, with one qualification worth stating. The four new rows avoid naming mechanisms on purpose, so a reader learns what must be TRUE and not HOW. That is correct for requirements, and it means the set describes what a product has to satisfy rather than describing a product. The Detail tables carry the concrete part, and each row that declined a mechanism says in its own words why.
- no_tbd: ZERO, and the sweep was run rather than assumed. The whole requirement register was searched for TBD, TBC, TBR and the three-question-mark marker on 2026-08-19, and it returned no matches at all.
- behaviour_modelled: THE LOOK WAS DONE ON ALL FIVE ROWS AND TWO EARNED A MODEL. req-the-editor-is-the-only-entry-point carries a state model, and its last transition is the one that pays — closing and reopening the window returns to `open` and never to `installed`, which is precisely what makes the launcher a one-time act rather than a recurring one. req-a-folder-is-driven-only-with-consent carries one because prose kept losing the point that a copy lands in `project` and never in `consented`. THREE WANTED NONE and each says so in one line: the resolution row and the discoverability row are one condition and one response, and the launcher row's ordered table already carries everything a sequence would have shown. The participant test passes on both models — nothing in either appears from nowhere.
- quality_groups_swept: NINE ANSWERED, in the order the corpus carries them. FUNCTIONAL SUITABILITY — touched, and it is the bulk of this delta: req-one-script-installs, req-the-editor-is-the-only-entry-point and req-the-machine-state-sits-in-the-folder-that-is-open all say what the system must do. PERFORMANCE EFFICIENCY — TOUCHED, and this answer was CORRECTED at the M3 gate. It was first answered as untouched, which was wrong the moment opening the folder became the only way in: the entry-point row carries no clock, so a product that came up eventually would satisfy it exactly. req-the-desk-is-usable-soon-after-the-folder-opens now bounds it, and the probe made it concrete rather than theoretical by finding that the extension activates on the editor's own after-everything-else event, chosen when there was no bound to choose against. The owner's separate report of a button press taking over a second stays a note against the person-facing boundary, because a control answering a press is a different demand for a different reason. COMPATIBILITY — not touched; the collapse changes no format, no protocol and nothing about co-existing with another product. INTERACTION CAPABILITY — touched, and it is where the sharpest open question sits: req-the-folder-shows-what-to-run covers it, and the prior-art comparison showed a conventionally-named script surfaces nothing to a person. RELIABILITY — touched, and already covered by a standing row: req-a-resolution-is-proven-by-read-back demands a read-back proof per path kind, and the collapse makes two of its four kinds share an address, which sharpens that row rather than breaking it. SECURITY — touched, and newly so: req-a-folder-is-driven-only-with-consent exists because opening any folder at all would otherwise start a caged agent against it, so a person who opened a directory to look at something would find it made into a project. THE CLONE CASE WAS ADDED HERE AND STRUCK BY THE OWNER on 2026-08-19; the three vendors keeping a trust record outside the tree guard against a tree that can RUN something, and the machine-state folder is not that. The row now demands two outcomes and no prompt. MAINTAINABILITY — TOUCHED, and this answer was CORRECTED at the M3 gate. A blessed goal with no requirement under it leaves the design milestone nothing to satisfy, which is the opposite of what design input is for. req-what-the-corpus-is-has-one-answer now states the outcome the goal wanted: every caller agrees on what the corpus contains, including when the answer is a failure. It is written as an outcome rather than as one reader, because one reader is a mechanism and naming it here would freeze a design choice as an obligation. The row rests on a probe rather than a worry — two functions of the same name, in two files, disagreeing about what a malformed node does. FLEXIBILITY — touched at the edge: driving a product that is not our own depends on where machine state sits, and raid-asm-a-machinery-note-still-has-a-home-when-the-open-folder-is-not-ours carries the open question with a one-call probe. SAFETY — not touched; nothing here can injure anybody, and the nearest thing is losing work on an unmigrated checkout, which the owner accepted as a hand migration with no mechanism.

## follow_up

WHAT THE DESIGN MILESTONE MUST NOW SATISFY, as rows rather than as intentions.

- STRUCK. No consent record is kept anywhere, on the owner's ruling of 2026-08-19. Whether the folder carries machine state is the whole test, and there is nothing for design to satisfy here.
- The machine-state folder resolving inside the opened folder, and to one place across a branch switch.
- The one thing to run, presented where a first-time reader looks first, by a mechanism design chooses.

ONE ROW CANNOT BE VERIFIED BY CODE, and it should be scheduled rather than discovered. req-the-folder-shows-what-to-run needs first-time readers who have never seen the product. Its numbers are a chosen bar with their reasoning written down, not an observed value, and they move the first time somebody is actually watched.

TWO FOLD CANDIDATES WERE FOUND AND LEFT ALONE. The install use case is refined by fourteen rows against a threshold of five, and two families would genuinely fold. note-c3d5ffbe2186 carries them with the reason for waiting: a register refactor inside an iteration that is moving files would leave a reviewer unable to tell a folded row from a deleted one.

ONE THING ARRIVED FROM OUTSIDE THIS MILESTONE. The owner reported that a button press takes more than a second when it should answer in under a quarter. It binds every control rather than the one button, and it belongs on the person-facing boundary that has never been given a bound. note-89046bd7361e carries it.

THE NEXT STATE INHERITS a set whose mechanisms are all deliberately unnamed, which is what makes the design milestone a real choice rather than a transcription.

## anything_else

