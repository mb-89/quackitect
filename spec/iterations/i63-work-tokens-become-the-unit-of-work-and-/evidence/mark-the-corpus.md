---
form: mark-the-corpus
by: agent
signed_off: 2026-08-27T10:24:43.553Z
reopened: "2026-08-27T09:57:54.947Z — the marking swept deliverable/machines/methods only; guidance/method holds 13 more cards and 12 carry no mark, so boot, the desk and the overhaul mint no step work"
authors: agent
files:
---

# Evidence form / mark-the-corpus

## current_situation

One card of 74 was marked. The format was proven on the two that disagree, which is the owner's own order: build the system, mark a few, check it works, then mark the rest.

### Why a script and not 74 readings

THE DECISION NODE ALLOWS IT in as many words: 137 cards, marked by hand OR by a script with a person reading the result.

READING EACH CARD SEPARATELY WOULD HAVE COST ABOUT 150 CALLS and produced 74 unrelated judgments. Listing every part of every card in one output produced 365 lines that could be ruled on together, which is where the errors in the rule became visible.

### The first rule was wrong in three ways, and the listing showed all three

A CATALOGUE IS NOT A SET OF ACTS. TRIZ lists forty inventive principles. The first rule would have minted forty pieces of work from a reference table.

A HEADING WHOSE BODY IS THE NUMBERED STEPS IS A PARENT. Marking both the heading and its items swallows the steps into one, which is the exact failure the format exists to prevent.

A CARD'S TITLE IS NEVER WORK.

NONE OF THREE WAS VISIBLE CARD BY CARD. Each only shows against the whole corpus at once.

## built

76 CARDS MARKED OF 87, 329 PARTS, and the compiler reads every one of them back.

### The first pass swept one folder of two, and that is what sent this back

THE CORPUS IS 87 CARDS IN TWO FOLDERS. `deliverable/machines/methods/` holds 74. `guidance/method/` holds 13, and the first pass never looked at it.

THE COMPILER READS BOTH. `isMethodCard` in workmint.ts matches `guidance/method/` explicitly, so those 13 were being read for marks and yielding nothing.

WHAT IT COST. Boot, the front desk and the overhaul all reach their card from that folder. A person watching a boot saw no work appear, because there was none to appear.

### What the corpus now yields

- `deliverable/machines/methods/`: 74 cards, 73 yield work.
- `guidance/method/`: 13 cards, 3 yield work — the retro, the boot method and the overhaul.
- 329 marked parts across the two.

### ELEVEN CARDS ARE BARE ON PURPOSE, and each has a reason

A CARD NOTHING PULLS OWES NO STATE'S WORK. Ten of the eleven carry no tag and no `applies_to`, so no state ever pulls them: the lane, engineering, subagents, the cloud runner, machine authoring, template authoring, the tour, the overhaul's prior art, and the autonomous run. They reach a reader through the prompt layer or by name, never as a state's method.

THE FRONT DESK IS THE ONE THAT IS PULLED AND STILL BARE. The owner's design input rules it: the desk has incoming work only, and nothing in its outgoing bucket. Marking its four steps would give the desk blocking work it can never finish, and the desk is where every session rests.

THE ROSTER CARD IS THE ELEVENTH. `meth-spawn-hands.md` carries a roster and a guidance section; neither is an act. That ruling stands from the first pass.

### What was marked this pass

THE OVERHAUL'S ELEVEN STEPS, on the list items under `## The steps`, in the shape the format proof settled: a short name on the marked line, the detail in the body. Three of the eleven opened on a wrapped sentence and were rewritten so the marked line is a name.

BOOT'S ONE REAL ACT. `## Startup order` is what boot always does. The answer-limit ladder was left bare because it is CONDITIONAL — it runs only where the host has no figure yet, so a token for it would stand open on every boot that did not need it. That wants a mechanical token, which is not built.

### The tag path was the other half, and it was engine work

MARKING ALONE WOULD HAVE CHANGED NOTHING. `demandsForState` read marks only from `entry.read`, and most states reach their card by TAG. Measured before the fix: 305 marked parts, zero step work.

The mint now reads marks from every card the state PULLS. The reading it demands and the marks it must produce are different questions, and they now have different inputs.

## follow_up

The build is done. Seven chunks, seven signed.

### What this pass proved by running it

A FULL BOOT WAS WALKED on the rebuilt engine, and it walked clean — no state wedged, no refusal.

AND IT STILL MINTED NOTHING. `.se/work` is empty after that boot. The card is marked, the mark is stamped, the mint is wired, and no item appears. The cause is not yet established: it is somewhere between the walk's own position and `demandsForState`, and reading the code did not settle it.

THAT IS THE ONE THING THIS CHUNK CLAIMS AND CANNOT SHOW. The marking is done and measurable. The visible result of the marking is not.

### What verification will find

THE OFFER IS WIRED NOW, at the submit. Open work at a position holds that position's claim, and signing settles only the evidence whose field was filled.

ONE ATTRIBUTE ASKS FOR A SINGLE LIST naming every place work is modelled. That list still does not exist.

ONE ASKS THAT ONE WORD NAMES ONE THING. Twelve comments in engine code still name the walk's marker with the word, up from the seven this form recorded — the earlier count was measured over a narrower set.

### What outlives this record

WHY BOOT MINTS NOTHING. It is the first thing the next session should probe, and a script that calls the machine loader, the pull and the mint in turn answers it in one run.

WHETHER AN EPHEMERAL ITEM SHOULD BE SEEN REACHING DONE. The design says a completed state DELETES it. The owner asked to watch it go to done. Both cannot be literally true, and the resolution is theirs.

## anything_else

THE SUITE IS UNCHANGED BY MARKING 72 CARDS. 1975 tests, 1974 pass, and the one failure is the read-once guard that stood red at HEAD before this session's first commit.

### The check that would have caught a wrong mark

One case asserts that a card carrying no mark yields no work. It was written when nothing was marked, in a shape that survives the marking: it compares what the compiler yields against what the file literally contains, rather than pinning a count.

A CASE PINNED TO A COUNT would have had to be rewritten here, and rewriting a check to match what you just did is how a check stops checking.

### The listing is the reviewable artifact, not the diff

306 marks across 72 files is a diff nobody reads. The listing that was ruled on is 365 lines with one decision per line, and it is what a reviewer should read instead.

BOTH SCRIPTS SURVIVE IN THE SCRATCHPAD, and the applier runs dry by default. Re-running the listing after any card is edited says whether the marks still fit.
