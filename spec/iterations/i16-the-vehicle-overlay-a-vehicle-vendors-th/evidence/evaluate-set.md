---
form: evaluate-set
by: agent
signed_off: 2026-08-18T15:39:16.581Z
reopened: 2026-08-18T15:39:12.884Z — cut-criteria was re-signed after the fitness flags landed, so this claim answered ground that has since moved
amended: 2026-08-18T14:19:01.513Z by agent — the rewrite dropped the exercised examples, which this state requires, and the earlier version carried two claims since disproved
authors: agent
files: null
---

# Evidence form / evaluate-set

## current_situation

FOUR CANDIDATES ON TEN CRITERIA, rescored after the candidates gate failed and cut-criteria was redrawn a third time.

### What changed under this state

THREE AXES WERE CUT FOR TYING and two were restored, then both restorations tied too and went back under. The set went eleven, then thirteen, then ten. Every survivor was checked against its own statement rather than its name, which is what none of the earlier passes did.

FOUR CELLS ALSO MOVED on the axes that carried over, all four found by an independent reader checking anchors against the candidate nodes. Three of the four moved against the scorer's own earlier reading.

### The result, and it is not the one the arithmetic gives

THE TABLE SAYS cand-the-program-route DOMINATES ALL THREE RIVALS. It is a front of one.

THE DEMAND CHECK SAYS THAT CANDIDATE IS INELIGIBLE. It resolves method by walking up from its executable, and req-the-system-runs-in-a-tree-that-is-not-its-own is priority must and binds resolution to a recorded pointer. The owner ruled on 2026-08-18 that the demand stands and is not to be softened.

SO THE BEST-SCORING DESIGN AND THE ONLY ELIGIBLE DESIGN ARE DIFFERENT ONES. cand-everything-declared is the eligible one, and the table has it dominated.

THAT IS EXACTLY WHAT raid-dec-a-must-outranks-a-score EXISTS FOR: a design cannot buy past a demand by doing well elsewhere. It is recorded here rather than resolved, because the winner is M5's.

## scores

| candidate | axis | score | anchor | prior_art |
| --- | --- | --- | --- | --- |
| cand-what-ships-today | req-a-wrong-act-never-passes-silently | 1 | Nothing bounds the producing act and nothing records changes, so a bad produce or a stale edit completes reporting success. | |
| cand-nothing-but-a-channel | req-a-wrong-act-never-passes-silently | 3 | The version pin gives a hard machine refusal when upstream moves, but the producing act sits outside the system entirely and is unbounded. | |
| cand-the-program-route | req-a-wrong-act-never-passes-silently | 4 | The write jail bounds every act to a tree by property of the act; the transformation's diff is still left for a person to eyeball, where the named tool refuses a no-op transform outright. | Bazel linux-sandbox, bazel.build/docs/sandboxing. Copybara VoidOperationException, TransformationStatus.java |
| cand-everything-declared | req-a-wrong-act-never-passes-silently | 4 | Same write jail, plus a departure void until its reason is filed and a lapse that is itself a fault. Two named tools already do both halves, so this is par. | Bazel linux-sandbox. Snyk .snyk reasonType and expires, docs.snyk.io. Yocto fatal BB_DANGLINGAPPENDS_WARNONLY, docs.yoctoproject.org |
| cand-what-ships-today | req-overlay-resolution | 2 | There is no copy layer, so the copy's version wins by having physically overwritten the file. The stated first-hit-wins rule never governs a copy-versus-source case. | |
| cand-nothing-but-a-channel | req-overlay-resolution | 4 | Path search with first hit wins, over exactly two well-separated locations. The named tool states the same rule: a name in both layers resolves to the upper and hides the lower. | Linux OverlayFS, docs.kernel.org/filesystems/overlayfs.html |
| cand-the-program-route | req-overlay-resolution | 4 | Matching by stable identity survives a file moving, and the merge is defined key by key. Both named tools do exactly this, by attribute and by resource identity. | Nixpkgs overlays, overlays.chapter.md. Kustomize patches, kubectl.docs.kubernetes.io |
| cand-everything-declared | req-overlay-resolution | 4 | Identity matching plus a named part plus a call back to the replaced version. The named tool supplies all three through prev and overrideAttrs. | Nixpkgs overlays prev/super, overlays.chapter.md |
| cand-what-ships-today | req-overlay-survives-update | 1 | The copy shares no commit with its source, so no merge is possible. There is no update for the overlay to survive. | |
| cand-nothing-but-a-channel | req-overlay-survives-update | 4 | The update replaces the mirror and never touches the sibling, and a moved pin is held by refusal rather than half-applied. A whole-file override never has to re-apply against anything, so its stop is a policy refusal rather than a mechanical break. | quilt(1), manpages.debian.org. quilt push rollback, sources.debian.org push.in |
| cand-the-program-route | req-overlay-survives-update | 4 | The diff side was measured and conflicted; the program side applied with no conflict on both the far and the near copy. Same design as the named tools, so par rather than beyond. | Nx migration generators, nx.dev. Angular ng-update schematics, angular-cli docs/specifications/update.md |
| cand-everything-declared | req-overlay-survives-update | 3 | Lowered from 4 on the pick's own words. Debian's format demands patches apply with ZERO fuzz and errors out otherwise, so an upstream change near a patched region means re-cutting by hand. The changes are never lost; they stay in force automatically only where upstream did not move near them. | Below the bar: a Nixpkgs overlay names an attribute rather than a line range and needs no refresh at all; Copier and cruft three-way merge non-overlapping edits where zero fuzz errors out |
| cand-what-ships-today | req-overlay-drift-reported | 1 | Nothing records them is the pick. With no shared commit there is not even a diff to compute a report from. | |
| cand-nothing-but-a-channel | req-overlay-drift-reported | 4 | Everything in the sibling folder is the drift, enumerable, each entry carrying the version it was cut against. The named tool renders the template at the recorded commit and exits non-zero on any drift. | cruft diff, cruft.github.io and diff.py |
| cand-the-program-route | req-overlay-drift-reported | 4 | A copy-only difference inventory generated on each update and never hand-maintained. Same derived-report bar as the named tool, marginally weaker for being generated at update time rather than on demand. | cruft diff, cruft.github.io |
| cand-everything-declared | req-overlay-drift-reported | 4 | The patch set is the drift, so the report cannot lag reality. The named format already ships this: an ordered series plus a header carrying description and origin per patch. | Debian 3.0 quilt, dpkg-source(1) man7.org. DEP-3, dep-team.pages.debian.net |
| cand-what-ships-today | req-fresh-machine-runs | 3 | Produces a copy that is complete and standalone in one command, and discovery needs no lookup and no network. Hole recorded and shared by all four: install the binary and the method tree separately and the walk finds nothing, silently. | |
| cand-nothing-but-a-channel | req-fresh-machine-runs | 3 | Identical. The clone carries history and the history is never consulted at run time, so standalone-ness costs nothing. A larger fetch is slower, which is not a step. | |
| cand-the-program-route | req-fresh-machine-runs | 3 | Identical. Its machine-local layer does not travel to a fresh machine, and its own pick rules that harmless: losing a preference is an inconvenience, losing the answer to which copy drives a tree is a broken system. | |
| cand-everything-declared | req-fresh-machine-runs | 3 | Identical, and this is the one expected to separate. Its identity resolution does need a lookup on a new machine, but not on this act: the reference case named in the requirement is the colleague cloning the VEHICLE, and standing the vehicle up needs no resolution. | |
| cand-what-ships-today | req-missing-document-stops-the-walk | 3 | The resolver joins the relative path onto each layer and takes the first that exists. A miss is unambiguous, and nothing in the candidate touches the reading loop. | |
| cand-nothing-but-a-channel | req-missing-document-stops-the-walk | 3 | Same resolver pick, same behaviour. Mirror-and-sibling adds a layer to search, not a way for a miss to pass. | |
| cand-the-program-route | req-missing-document-stops-the-walk | 3 | The one pick that looked like it might break this does not. Its identity option warns that the failure is silent unless made loud, but that is about an override matching NOTHING, where the owed document still resolves to its base version. Un-overridden is not missing. | |
| cand-everything-declared | req-missing-document-stops-the-walk | 3 | Same reasoning and the same shared identity pick. Its patch series errors loudly rather than half-applying, which if anything helps here. | |
| cand-what-ships-today | req-call-answers-in-one-second | 3 | Cannot tell from what I was given. No latency figure is offered. | |
| cand-nothing-but-a-channel | req-call-answers-in-one-second | 3 | Cannot tell from what I was given. No latency figure is offered. | |
| cand-the-program-route | req-call-answers-in-one-second | 3 | Cannot tell from what I was given. Identity indexing and key-by-key merge do more per call than a path stat, but no measurement exists. | |
| cand-everything-declared | req-call-answers-in-one-second | 3 | Cannot tell from what I was given. Patch application and the invoke chain do more per call, but no measurement exists. | |
| cand-what-ships-today | req-instruction-names-its-source | 1 | In-place edits are indistinguishable from received content, so a served instruction has no source to name. | |
| cand-nothing-but-a-channel | req-instruction-names-its-source | 3 | The two-location split makes the source determinable by location, but nothing says the served instruction carries it. | |
| cand-the-program-route | req-instruction-names-its-source | 3 | Identity matching makes the answering layer determinable at resolve time, but nothing in the picks says the served instruction carries its source. | Bar not met: ECMA-426 source maps, tc39.es/ecma426, where the generated file itself names its origin |
| cand-everything-declared | req-instruction-names-its-source | 3 | It names the departure, not the served text. Copier, cruft and Nixpkgs write no per-file provenance either, so this is a gap in the field rather than in this candidate. | Bar not met: ECMA-426 source maps, tc39.es/ecma426 |
| cand-what-ships-today | req-sweep-covers-every-drift-class | 1 | No sweep exists, and no shared commit means no diff basis to build one on. | |
| cand-nothing-but-a-channel | req-sweep-covers-every-drift-class | 3 | Sibling overrides are covered. Nothing is sealed, so a hand-edit to the mirror is a real class the update silently overwrites and no sweep sees. | |
| cand-the-program-route | req-sweep-covers-every-drift-class | 3 | The generated inventory covers committed drift. The machine-local never-committed layer is a class the shared inventory cannot carry. | |
| cand-everything-declared | req-sweep-covers-every-drift-class | 3 | The named comparison beats it. The named tool fails the build when the tree holds changes not recorded as patches and ships a flag for exactly that check; this candidate names no equivalent. | Prior art ahead: Debian dpkg-source(1) --abort-on-upstream-changes, man7.org |
| cand-what-ships-today | req-setup-serves-shipped-method | 2 | The strip is a manual script with nothing checking it, and discovery walks up from the executable, so correctness rests on the person running it right. | |
| cand-nothing-but-a-channel | req-setup-serves-shipped-method | 3 | Internal records are removed and no key means no layer gives a clean default, but removal is manual and discovery is still a walk-up. | |
| cand-the-program-route | req-setup-serves-shipped-method | 4 | Raised from 3. The strip IS named in the pick, the machine-local layer is never committed so it cannot ride a fresh clone, and the produce is bounded by the tree it is producing. The named tool does the last part by moving known outputs out and deleting the sandbox. | Bazel per-action sandbox, bazel.build/docs/sandboxing |
| cand-everything-declared | req-setup-serves-shipped-method | 4 | The produced tree records which copy drives it and at what version, never a location, so it cannot silently bind to the wrong tree. The named tool works the same way and errors rather than falling back. | .NET global.json and NETSDK1141, learn.microsoft.com |

## front


## reading

THE FRONT IS ONE CANDIDATE AND IT IS NOT THE ELIGIBLE ONE. That is the whole reading, and everything below is why it is honest rather than a failure of the method.

NO WINNER IS PICKED HERE. That is M5's.

### What the arithmetic says

cand-the-program-route DOMINATES ALL THREE RIVALS on the ten criteria. It is at least as good everywhere and strictly better somewhere against each.

- Against cand-everything-declared it leads on one axis only, whether the overlay survives an update, 4 against 3. It ties on the other nine.
- Against cand-nothing-but-a-channel it leads on a wrong act never passing silently and on what setup serves.
- Against the incumbent it leads on eight.

THREE ELIMINATIONS, ALL ACCEPTED AS ARITHMETIC. None is disputed as a reading of the table.

### The elimination I do not accept as a decision

cand-everything-declared IS DOMINATED AND IT IS THE ONLY CANDIDATE ELIGIBLE TO BE BUILT. A Pareto elimination is a statement about scores. A demand is a statement about legality. The design that wins the table cannot be built and the design that can be built loses the table.

THE SEPARATING AXIS IS ONE CELL. cand-everything-declared scores 3 on whether the overlay survives an update, against 4, because Debian's source format demands patches apply with zero fuzz and errors out otherwise. An upstream change near a patched region means re-cutting by hand.

SO THE ELIMINATION IS ARITHMETICALLY CORRECT AND DECISIONALLY EMPTY. M5 does not get to choose the dominator.

### The axes every candidate scored alike

FIVE OF TEN ARE FLAT ACROSS ALL FOUR: latency, a fresh machine running, a missing document stopping the walk, an instruction naming its source, and the drift sweep's coverage.

THEY ARE FLAT FOR THREE DIFFERENT REASONS and the method says to name which.

- LATENCY IS A MISSING ROW IN THE OPTION SPACE. No design question asks about per-call cost, so no candidate carries a pick that could answer it. Every anchor reads "cannot tell from what I was given", which the 0-5 scale has no value for: 3 means "meets the requirement" and 0 means "not addressed at all". The scorer resolved an unrepresentable state by inventing a middle, and the scale needs a `not answered`.
- A FRESH MACHINE AND A MISSING DOCUMENT ARE OUTSIDE THE FUNCTION UNDER REDESIGN. Both belong to functions this iteration does not touch, so every candidate meets them through machinery none of them changes. Both were restored by a sweep and both tied, which is the sweep being wrong twice.
- AN INSTRUCTION NAMING ITS SOURCE AND THE DRIFT SWEEP'S COVERAGE ARE GAPS THE WHOLE FIELD SHARES. The named bar for the first is a source map, where the generated file carries its own origin, and Copier, cruft and Nixpkgs write no per-file provenance either. The second is the one place prior art is strictly ahead: Debian refuses the build when the tree holds changes not recorded as patches, and no candidate has a counterpart.

AND ONE STRUCTURAL FINDING CAME OUT OF THAT. Every axis that discriminated belongs to the function this iteration redesigns. Every axis that tied belongs to a different one. That is checkable from one frontmatter field and it would have caught all five criteria mistakes this state made. note-1f9a82df68db carries it.

### The corners

UTOPIA, best any candidate reached: 4, 4, 4, 4, 3, 3, 3, 3, 3, 4.

NADIR OVER A FRONT OF ONE is that candidate's own vector, which says nothing. The band is degenerate because the front is a point.

THE CEILING IS STILL THE FINDING, unchanged by the recut. Utopia reaches 4 on five axes and 3 on five. It reaches 5 nowhere, across all forty cells. No candidate does anything a named shipping tool cannot already do, and the two strongest are re-derivations: Copybara's model with Nixpkgs-style identity overrides, and Debian's 3.0 source format down to the fixed-vocabulary reason header.

### The cross-check the owner ordered, and what it found

THE OWNER INVERTED THE QUESTION rather than accepting the gate-out. Instead of asking whether the elimination stands, they asked what would have to CHANGE for each failing candidate to pass, where the survivor is WORSE, and what it can LEARN. Two independent readers answered.

### One failing candidate repairs cleanly and stays distinct

cand-the-program-route NEEDS ONE PICK SWAPPED AND NOTHING ELSE MOVES. Three of its existing picks already pay the identity pin's price: its producing act is bounded by the tree it produces, its resolution already uses the corpus's stable ids, and its updates are already taken in order one version span at a time.

AND IT STAYS A DIFFERENT DESIGN. Repaired, it differs from cand-everything-declared on five of nine rows, and four of those are the payment axis the chart exists to sample. Upstream hand-writing a migration per breaking change is the opposite answer to the copy's owner declaring every edit before making it.

### The other two repair badly, and the incumbent's repair destroys it

BOTH WOULD NEED A PRODUCING ACT THEY DO NOT HAVE. Their production sits outside the lane by pick, so the pointer has no writer, and adding one is a second hand-written guard set rather than a jail behaviour.

AND REPAIRING THE INCUMBENT DELETES WHAT IT IS FOR. Its claim is zero build and changing nothing, and it exists on the chart as the zero the others are priced against. A repaired incumbent is not the incumbent.

### Where the survivor is worse, and none of it is on the table

UNDER THE CORRECTED TEN CRITERIA cand-everything-declared is not below any rival on any scored cell. Its real weaknesses are all unscored.

- IT PAYS BOTH SIDES OF A TRADE EVERY RIVAL PAYS ONE SIDE OF. Its clock raises a question whenever upstream moves; its zero-fuzz patches do work whenever upstream moves. The option nodes state that as a choice between a review cost and a rewrite cost, and this candidate takes both.
- ITS UPDATE MECHANISM IS A DUTY, NOT A TRANSPORT. Its pick says what the copy owes when a fix arrives. It never says how the fix arrives, when it is asked for, or where from. There is no fetch, no moment and no address anywhere in it.
- IT FORBIDS AN ACT A USE CASE CALLS LEGAL. Editing one of the source's own files in place is extension 3a of uc-vendor-and-overlay, marked legal with an ordinary consequence. This candidate forbids it outright, which its own node names as the assumption most likely to fail and least likely to be caught.
- ITS INVENTORY IS THE ONLY ONE THAT CAN SILENTLY BECOME FALSE. The other two produce theirs mechanically, by directory listing or by recomputation. This one asks a person to keep a record honest, with no body standing to reject a filing.

### What the survivor should take, and what would end it

FOUR ADOPTIONS LEAVE ITS SEAM INTACT. The seam is that every mechanism in it produces or consumes a declared departure with a reason and a version.

- THE CHANNEL'S UPDATE TRANSPORT, which supplies the moment and the address its own pick lacks, adds no new machinery because the staleness question already has an owner, and is the only mechanism in the set that can express pulling from a source that is not this copy's ancestor. That case was measured by a probe, and it is the owner's own hardest constraint.
- KEY-BY-KEY MERGE BESIDE THE CALL-THROUGH, so structured frontmatter needs no extension point named in advance while prose still calls through.
- THE ORIGIN RECORDED AS ONE FACT, which costs almost nothing because the file carrying the name can carry it.
- THE EXPORT'S TWO HARD-WON GUARDS, both found the hard way: refusing unless all three arguments are given, and excluding the repository marker as a FILE as well as a directory, because a worktree checkout has it as a file.

THREE ADOPTIONS WOULD CUT THE SEAM AND ARE REFUSED. The pin replaces the clock's inversion, where silence is a fault rather than a default. The update-as-a-program has nothing to transform in a copy that never edits its base. Whole-file replacement removes the delta the whole design rests on.

AND ONE IS DEFERRED DELIBERATELY. A personal machine-local layer gives the drift report an honest boundary, and under a declared-patch regime it grows a second undeclared class of change, which is a hole in the inventory this candidate exists to keep true. Cheap to defer, expensive to retrofit, and recorded rather than left to arrive silently.

### The examples, exercised through each candidate

### uc-vendor-and-overlay

THREE STEPS DISCRIMINATE, and they are the last three.

STEP 6, later they take an update, what the source changed arrives and what they changed stays.

- WHAT SHIPS TODAY cannot reach this step at all. A copy sharing no commit with its source has no merge base, so the update never arrives.
- NOTHING BUT A CHANNEL reaches it and pays a conflict. The probe measured it: a copy that had merely reordered a file's sections took a merge conflict on an upstream change to a line it never touched. Both versions were present and marked, so the cost is one human resolution per restructured file rather than a change that cannot arrive. The earlier wording said "could not merge" and was corrected at the gate.
- THE PROGRAM ROUTE reaches it and pays nothing on the measured case. A change expressed as WHAT rather than WHERE never refers to a position, so restructuring cannot break it. That arm of the probe had no failure mode available, so it demonstrates the mechanism rather than measuring it.
- EVERYTHING DECLARED reaches it and pays where upstream moved near a patch. Debian's format demands zero fuzz and errors out, so the copy's changes are never lost but stay in force automatically only away from the change.

STEP 7, where the update and one of their own changes meet the same place, they decide it once.

- The word ONCE is the discriminator. Under the channel the decision is owed on every file the copy restructured, not only where changes genuinely meet. Under the other two it is owed only where the mechanism cannot decide.

STEP 8, the copy reports every identity their content claims that the update moved.

- THIS IS WHERE PATH-KEYED RESOLUTION FAILS OUTRIGHT. An override matched by path cannot report that an identity moved, because it never knew an identity. The incumbent and the channel both resolve by path, so neither can perform step 8 at all.

EXTENSION 8a IS THE SHARPEST SINGLE TEST IN EITHER USE CASE: an identity the copy's content claims no longer exists upstream, reported and never silently defaulted to the source's own card. Path-keyed resolution does not merely fail this. It fails it SILENTLY, which is the exact shape of the top-ranked criterion.

EXTENSION 3a CUTS THE OTHER WAY AND IS WORTH THE SAME WEIGHT. "They edit one of the source's own files in place rather than writing a card of their own. Legal." The eligible candidate forbids that outright, so the use case marks legal an act the surviving design refuses.

EXTENSION 6a IS THE INCUMBENT, NAMED IN THE USE CASE. Never taking an update is the fork case and it is legal; what it costs is everything the source learned since. So the incumbent's elimination does not contradict the use case, which anticipated and priced it.

### uc-drive-a-foreign-product

STEP 2 IS NOT MET IDENTICALLY, WHICH THREE SIGNED FORMS CLAIMED IT WAS. Three candidates pick self-location and one picks the recorded pointer, at line 11 of each candidate's frontmatter. All three forms are corrected.

AND THE FALSE CLAIM IS WHY THE DEMAND WENT UNCHECKED. A row believed uniform is a row nobody runs a demand check over, so the must that gates three candidates out sat unexamined through four states.

EXTENSION 2y NAMES THE POINTER AND THE REQUIREMENT DEMANDS IT. An earlier note read 2y as illustration and treated self-location as satisfying the guarantee more completely. That reading cannot reach req-the-system-runs-in-a-tree-that-is-not-its-own, which carries the pointer in its normative statement and is graded must. The note was wrong and the owner has ruled the demand stands.

EXTENSION 6a DISCRIMINATES AND WAS NOT EXPECTED TO. The driven product's tree carries something that looks like method, and it must be treated as that product's WORK. Identity-keyed resolution has a harder time here than path-keyed does: a file in the driven tree claiming a method identity is a collision, where a path search never looks in that tree at all.

THAT IS THE ONE PLACE THE PATH SEARCH IS SAFER, and it is the sharpest argument against the identity route. It appears in no criterion, so the arithmetic cannot see it.

AND STEPS 5 AND 6 ARE UNREACHABLE FOR EVERY CANDIDATE AS DRAWN. Writing a record into the driven tree while a note about the system's own machinery lands in the system's tree needs two write targets at once, and no candidate carries a pick that answers it because the chart has no row for it. The owner ruled on 2026-08-18 that one write target cannot serve driving. Under contract rule 5 that is incompleteness shared by all four rather than a failure of any.

### What the survivor still owes

FACET 4 OF THE DEMAND IT SURVIVES ON. It has the pointer and never says what happens when the pointer is absent. Three states are owed, not two: absent, present but unresolvable, and present and resolvable. The middle one is where a machine that has never seen the named copy lands.

ONE OF ITS OWN PICKS ARGUES AGAINST INFERRING IT. A key naming a folder that does not exist yields no layer, indistinguishable from a copy that declared nothing, with the overrides silently ceasing to apply. That is facet 4's failure mode accepted one row over, so the refusal has to be written rather than assumed.

## follow_up

### The decision this state produces, and it is the owner's

THE FLIPPED CHECK FOUND A SECOND ELIGIBLE CANDIDATE. cand-the-program-route becomes eligible by swapping one pick, with nothing else moving, and stays distinct on five of nine rows.

SO THE TWO-CANDIDATE RULE DOES NOT NEED OVERRULING after all. Whether to make that repair is scope and it waits.

### Owed to M5 either way

- CONVERGE-PUGH AND DECLARE-WINNER, over whatever the candidate set turns out to be.
- RECORD-ADRS should expect the four decisions the survivors do not agree on, plus one nobody has options for: the check that refuses a tree holding changes no declaration accounts for.
- THE FACET-4 SENTENCE, in whichever candidate goes forward. Its wording is fixed by three existing sources rather than invented.

### Parked, each with what makes it ready

- THE LATENCY MEASUREMENT. Ready when a candidate exists as running code.
- THE SCALE HAS NO `not answered` VALUE. Ready at a retro; it is a change to meth-scoring-anchors.
- THE MISSING PRECEDENCE AXIS, note-aa4d271a7717. No criterion asks whether the resolution order is stated and unambiguous, in an iteration whose whole subject is the overlay. The hole is at write-requirements, which is M3's.
- THE MISSING DRIVING ROW, recorded in build_chart. Nothing on the chart asks where work, method and machinery land while driving, and a `must` requires every candidate to answer it. All four are silent, so it gates nobody out and leaves every line unfinished in the same place.
- ONE ENUMERATION GAP. A function node names a copy-side registry of what it drives, and no option expresses it. It repairs nothing, because the demand wants a pointer from the tree to the copy and a list runs the other way.

## anything_else

