---
form: gate-architecture
bless: blessed by agent
amended: "2026-08-26T14:00:50.513Z by agent — the owner ruled on the format, the old folders, the presence requirement and the spike, and blessed the gate on those rulings"
by: agent
signed_off: 2026-08-26T13:23:08.110Z
authors: agent
files:
---

# Evidence form / gate-architecture

## current_situation

The architecture stands and its evaluation is signed.

The winner is "Archive in git". A piece of work is an editable file while its iteration is open. At close the whole iteration folds to one file, leaves the working tree, and is read back at a recorded commit.

Two elements were added. The work store writes every piece of work and the offer writes none — that is the cut, and it is narrower than the read-against-write split first claimed. The fold is neither element's: closing is a record-level act and the record store already implements closing and the archive.

Eleven interfaces were minted. Ten for the crossings the matrix reported as owed, and one more for the handover that moving the fold created.

The ATAM walk ruled 57 scenarios. After two review rounds and the owner's rulings: 51 addressed, 5 at risk, 1 unaddressed. Each of the six has its register entry.

A COLD REVIEW FAILED THIS GATE ON FOUR BLOCKING FINDINGS and all four are fixed. The sharpest was a must graded fatal that the design appeared to contradict, reaching the gate unmentioned because the deck deals only quality requirements.

The structure numbers: interface debt 0, unimplemented functions 0, allocation spread 5, two-way pairs 5, idle elements 1, undemanded interfaces 10.

## round_0_verify

- evidence vs claims: every verdict in the walk cites the decision it rests on or says plainly that the structure is unchanged for that row. The structure numbers are engine-computed and none is typed. Two requirements reached the state with no scenario at all, so there was nothing to judge on them; both were written before the walk ran rather than reported as findings.
- types: nothing owed. Measured on the working tree: 0 changed source files outside the scratchpad, against 162 changed trace nodes and 49 evidence forms. The lane typechecks after a source edit and there was none.
- lint: not run, and not runnable here. The lint verb is illegal at this state (SE-C-110 names the legal set). No source changed, so nothing new is lintable.
- tests: nothing owed, on the engine's own rule that an unchanged tree keeps its last verdict. 0 source files changed. The test verb is illegal at this state; the full battery is verification's and is fired by that state's own exit script.

## round_1_validate

- exercised against the goal: yes, and against all twelve, and against the functional corpus the deck never deals. That sweep was run as a PROGRAM over all 267 functional requirements rather than by reading, because the by-hand pass ruled three and missed a fourth that a review then found. Seven more are genuinely touched: four hold and three are at risk on one shared cause. The two new elements carry the five work-cluster functions that no element implemented before, and unimplemented functions is now 0. Two goals were checked at the corpus rather than assumed, and both held: read credit already lives with hold-the-method, and the offer's output reaches a hand across the agent edge that i33 already modelled.
- missing: nothing is missing from the allocation now, and three things were. The bucket editor is the third: the owner's clarification that a token's body is markdown does NOT answer the surface that groups rows into buckets, and that surface is now allocated to the mirror, drawing from the offer and writing through the store. A cold review found the fold written into an element that implements neither closing nor the archive, and a handover with no contract once it moved. Both are closed. The work editor looked missing and was ruled out of existence: a work token is markdown and opens in whatever opens markdown.
- wrong: four things were wrong and a cold review found all four, none of which my own red team caught. One close described in two directions. A fatal must dealt nowhere. A read-against-write cut contradicted by two of the ten interfaces this round minted. Three nonzero structure numbers argued in prose the state's card forbids. A second reading then found the fixes had landed on the files it NAMED rather than on the files carrying the same CLAIM, and a corpus sweep closed the residue in three more files.
- out of scope: the pool migration, which the windowing row names itself and which this record declares a non-goal. The cross-panel drag, which the kickoff sent to a spike.
- prior art: NOT COMPARED AT THIS GATE, and that is a finding rather than a blank. The comparison was made at the kickoff and is recorded there: five systems converged on a log with derived state, and two mature projects rejected or abandoned files-in-tree and published why. That evidence stands against the STORAGE choice, and this gate is about the DECOMPOSITION. No new comparison was run for the element split, and none of the named systems publishes an element matrix to compare against.

## goals_served

- Every piece of work is a work token: one markdown file per item, carrying frontmatter and prose together.: served. The chosen decision is that work is a file while its record is open, and the work store owns every write to it.
- A position has TWO SLOTS. Incoming holds what must be taken in before it can be worked. Outgoing holds what must be produced before it can be left.: served. The owed count crossing to the surface carries two numbers per position, one per slot.
- A method's steps become outgoing tokens, one per marked heading, each carrying its own guidance in the body beneath it and its evidence in subheadings under that.: served. The compiled machine reaches the store carrying the marked steps, their guidance and the evidence each must produce.
- Reading requirements become incoming tokens, and only where the evidence is not already proven. Read evidence is global and version-keyed.: served, and checked rather than assumed. The reading demands cross on the same compiled-machine flow, and read credit itself is satisfied by hold-the-method, which two elements already implement.
- A token has a PLACE and a STATUS, and they are separate. Place is a position or the backlog. Status is open, in work, or one of several terminal kinds.: served. The store-to-offer contract carries identity, place, status and difficulty as separate fields, and the offer never writes any of them.
- A position may be left when every token in it has reached a terminal status or moved elsewhere. Moved is a real exit, not a failure.: served. The store-to-walk contract reports what settled and what moved away, and says in as many words that moving is a real exit.
- A token may depend on another token, or on a position finishing.: served. Owner ruling 2026-08-26 put the second kind in. The work store holds both edges and the store-to-offer contract carries which kind a predecessor is. A position finishing is one fact rather than a list over its items, and it is modelled as one.
- Outside a record everything is ephemeral. Inside a record a done token IS the evidence, and there is no second act of writing it.: served. The record-store crossing says no open record means no position, so a mint has nowhere to land outside one.
- The pull returns open tokens rather than instructions.: served. The offer function stands on the pull's path and its output reaches the hand over the agent edge i33 modelled. This was the one allocation that looked missing and it was checked.
- The four ladders become two. Complexity is a ROUTING key that decides which hand a token is given to. Autonomy is unchanged.: served. The sizing publishes one difficulty per piece of work and the offer filters on it, so the mark routes rather than labels.
- Every position shows a count per slot, and clicking one opens the token editor.: served. Owner ruling 2026-08-26: a work token is markdown and opens in whatever opens markdown. There is no editor for this system to build, so no element is missing. The count is the offer's and the surface draws it.
- THE ARCHITECTURE ANALYSIS LATER IN THIS ITERATION SWEEPS EVERY PLACE WORK IS DONE, so nothing the work token system touches is missed. The state machines and the token editor are the two largest surfaces, and they are not the whole list.: served, and it took two review rounds to be true. The sweep found the state machines and allocated them. It found the token editor, which the owner then ruled out of existence. It MISSED four things a cold review found: three files still describing the old close, a handover with no interface, a functional requirement contradicted inside one element, and 33 call sites reaching past the element that owns them. All four are closed.

## bound_breaches

- if-agent-harness-to-entrypoint: breached, and measured here rather than repeated from the node. Across the standing raw call log, 611 of 2,143 timed calls passed the one-second bound, which is 28.5 percent. The worst single answer took 85,606 ms. Restricted to calls stamped with an i63 state, 294 of 1,576 passed it, which is 18.7 percent. The figure is a FLOOR: it was taken from the raw log file because the log query is known to omit matching records and report that it did not. The breach is not this record's to fix and no milestone here owns it. What this record adds to that edge is two new reads on it, and the sharper of the two is already an open assumption saying minting on every entry is unmeasured.

## round_2_red_team

- STEELMAN, the opposing case at its strongest => Leave the closed records on trunk and change nothing. Every figure arguing for the fold was taken on a throwaway repository at 20,000 files. The real one holds 1,312 across 68 folders, 9.7 MB of content. At that size git is not slow, search is not slow, and nothing hurts. The fold therefore buys a benefit nobody can feel today and costs a new close-time step, a new format, and a per-item diff that is lost permanently. The strongest version of this case is not "the fold is wrong" but "the fold is premature, and premature is how formats calcify".
- The attack that follows from it => The measurement does not describe this repository. 26,073 ms against 97 ms is a real gap and it was measured at fifteen times the current file count. Sixty-eight iterations produced 1,312 files, about nineteen each, so reaching the measured size needs roughly a thousand more iterations. Nobody has measured the rate, so nobody can say whether that is three years away or thirty.
- Where the attack fails => The archive half does not rest on the fold. Taking a closed record off the working tree and reading it back at a commit is argued on its own grounds, and a folder removed from the tree has to be read back AS something. The fold is the cheap answer to a question the archive decision asks anyway.
- The reference cost is not the fold's cost => 56 paths name an iteration folder from outside, across 49 files, 12 of them source. Those break the moment the folder leaves the working tree, whether it folded or not. Charging them to the fold overstates the fold's price, and I made that mistake before checking.
- TWO DECISIONS ARE BUNDLED AS ONE => Where the archive lives, and what shape it takes there. They were argued together and they can fail apart. Filed as raid-asm-the-folds-measured-benefit-arrives-at-a-scale-this-repository-has-not-reached.
- THE KILL-CRITERION => This is the wrong call if the tree never reaches a scale where per-file cost matters AND the fold's format turns out to cost more than it saves. Looked for it, and it is not disproven — it is unmeasured. The probe script exists and takes a file count, so pointing it at 1,312 is one run, and that run is owed before the build writes the fold.
- The published figure that was wrong => An earlier probe reported the folded tree twelve times smaller. Every test item in it carried an identical body, which git deduplicates. Re-run with varied prose the real figure is 2.0x, and the timings were unaffected. The wrong number is corrected everywhere it stood and is recorded here because a withdrawn figure that leaves no trace is how a wrong number comes back.
- The element split, attacked => Two elements for one subject invites the charge that it is one element written twice. It survives on one test: they fail differently. A wrong write loses work; a wrong read shows a wrong number and loses nothing. That is a real seam rather than a tidy one, and it is why every write stayed in one place.
- The two-way pair it creates => The offer reads the store and names taken work back to it, which the metric flags as a candidate cycle. It cannot be removed, only moved: whoever reads the work must report that a piece was taken, so routing the report through the walk would make the cycle walk-to-store instead. Keeping it in the tightest pair is a containment, not a fix, and it is named as such.
- THE COLD REVIEW LANDED AND FAILED THIS GATE => Four blocking findings and seven notes, from a reviewer with clean context. All four blocking findings were real. Every one is fixed below rather than recorded and walked past.
- BLOCKING 1: two elements described the same close in opposite directions => FIXED. The work store claimed the fold while implementing neither closing nor the archive, and the record store, which implements both, still read "closing refuses loose ends and leaves the folder where it is". The fold moved to the record store and that sentence is rewritten. The work store now says in as many words that it does not fold, archive or close.
- BLOCKING 2: a must graded fatal that the fold appears to contradict was dealt nowhere => FIXED AND FILED. req-archive-shows-it-as-it-closed asks for zero states omitted and zero bytes differing. The corpus said a form "becomes a line in one file", which reads as a retelling. The record store now states the fold is LOSSLESS and a form goes in VERBATIM, which is what the row demands. The row holds; before the edit it did not.
- WHY BLOCKING 2 ESCAPED, and it is the sharper half => The quality deck deals only requirements with kind quality. It dealt 57 of 57 and refused to let the state leave, so every signal it gave said the requirements were walked. Completeness of the deck stood in for coverage of the corpus. Filed as raid-iss-a-functional-requirement-the-design-touches-is-dealt-nowhere, graded fatal.
- BLOCKING 3: the read-against-write split was contradicted by two of the ten interfaces this round minted => FIXED. The store serves the leaving report and reads the standing position, so "every read is in the offer" was false. The cut is restated as what is actually true: the store writes everything and the offer writes nothing. Both element bodies and the structure form now say that.
- BLOCKING 4: three nonzero structure numbers were argued in follow-up prose => FIXED. The state's card says a nonzero number is worked in the deck or back at the structure and never typed about. The two-way pair, which this round created, is now raid-dec-the-work-pair-exchanges-both-ways-and-the-cycle-is-contained-rather-than-removed, with rejected options and consequences. The other two cite a standing decision or say plainly that nothing here touched them.
- NOTE, two of seven fitness candidates carried no flag on their node => FIXED. Both now carry fitness_candidate.
- NOTE, a row ruled "unchanged" that the winner does move => FIXED. req-a-resolution-is-proven-by-read-back names four kinds of tree and asks that a write be proven by reading back FROM THAT TREE. A folded record has no tree. Re-ruled at risk, with raid-risk-a-ref-read-is-not-a-tree-read-and-the-read-back-rule-names-only-trees.
- NOTE, the settle description covered two of its four requirements => FIXED. The person-only mark and the snapshot-or-live declaration are both written in now.
- NOTE, the element count was one short => FIXED. Twenty-nine stood, not twenty-eight.
- NOTE, 33 call sites read the iteration folder from disc and none is allocated => STANDS, deferred on purpose. The gate's own card says a new element found mid-build returns here, so this baseline is built to send the build back. Named rather than closed.
- NOTE, two of five things owed at the winner's declaration are still owed => STANDS. The cross-panel drag spike and the predecessor read.
- NOTE, the work registry does not list the interface aimed at it => STANDS. Not fixed here.
- WHAT THE REVIEW CHECKED AND FOUND HOLDING, said plainly => The deck is complete: exactly 57 requirement files carry kind quality and the walk has 57 rows. All six non-addressed verdicts minted their register entry. The ten interfaces name elements that exist at both ends and each carries a failure behaviour specific to this system. Three empty sections are drawn fields rather than holes. The benchmark concealment holds on the ref path too, which was chased expecting a leak.
- THE SWEEP THE FATAL ISSUE DEMANDED, RUN PROPERLY => All 267 functional requirements, as a script. Seven more rows are touched beyond the four already ruled. Four hold: the close refusal is untouched, trunk still ends clean, no call selects between trees, and one crippling must ALREADY DEMANDS WHAT THE WINNER DOES. Three are at risk on one shared cause and are filed as raid-risk-three-guards-match-a-folder-path-and-a-closed-record-no-longer-has-one.
- THE SHARP ONE AMONG THEM, and it fails open => req-archive-read-only is a must graded fatal. An edit targeting an archived record must be refused. A guard matching a folder path matches nothing once a closed record has no folder, so the edit lands. A guard that fails open looks exactly like a guard that passed.
- THE GIFT THE MILESTONE ARGUED WITHOUT => req-record-status-comes-from-the-record is a standing must, graded crippling, and it says the engine shall resolve the archive through git and that a finished record keeps no folder. It is the strongest corpus support the archive decision has, and it was cited nowhere in the candidates, the structure, the decision records or the evaluation. Found by the sweep, not by the design.
- THE ONE ATTACK I MADE THAT MEASUREMENT KILLED => I argued the fold was premature because its figures came from a 20,000-file probe. Ran it at the real shape: 68 folders, 1,292 files, 3.55 MB of varied prose. git add 1,535 ms unfolded against 129 ms folded, over the one-second bound. The fold pays at this repository's size today. The assumption I filed against it is closed by its own probe.

## raid_additions

- raid-asm-the-folds-measured-benefit-arrives-at-a-scale-this-repository-has-not-reached
- raid-risk-a-folded-archive-no-longer-diffs-one-piece-of-work-at-a-time
- raid-risk-work-taken-by-a-hand-that-dies-has-no-path-back
- raid-risk-the-fold-runs-at-close-on-the-process-that-serves-the-surface
- raid-risk-the-merge-cost-a-decision-accepts-is-a-cost-a-requirement-measures-as-zero
- raid-iss-nothing-in-the-structure-says-a-pool-answer-was-windowed
- raid-iss-no-element-implements-the-work-editor-the-requirement-is-about
- raid-iss-a-functional-requirement-the-design-touches-is-dealt-nowhere
- raid-iss-a-folded-record-is-readable-by-an-agent-at-every-autonomy-setting
- raid-risk-a-ref-read-is-not-a-tree-read-and-the-read-back-rule-names-only-trees
- raid-dec-the-work-pair-exchanges-both-ways-and-the-cycle-is-contained-rather-than-removed
- raid-iss-fourteen-files-reach-past-the-record-store-and-touch-its-substrate
- raid-risk-three-guards-match-a-folder-path-and-a-closed-record-no-longer-has-one

## verdict

pass with overrides — two review rounds and the owner's rulings closed three of the five dissents; two remain and both are named work rather than doubt

THIS IS THE THIRD RULING ON THIS GATE. The first rested on my own reading and a cold review failed it on four blocking findings. The second fixed those four and a second reading found the fixes had landed on the files the review NAMED rather than on the files carrying the same CLAIM. That residue is now closed by a corpus-wide sweep rather than by another round of named files.

WHAT THE OWNER RULED, and each ruling is why an override is gone.

THE TOKEN EDITOR DOES NOT EXIST. A work token is markdown and opens in whatever opens markdown. No element is missing, because no surface is being built. That is the strongest possible answer to a row demanding no new instruction.

THE POSITION-LEVEL DEPENDENCY GOES IN. Both edge kinds are now held by the work store and carried on its contract to the offer.

THE CALL SITES ARE NOT MISSING ELEMENTS. They are fourteen files reaching past the element that already owns a record's content. The record store now states it resolves a record whichever shape that record is in, and the 33 sites are filed as a boundary to close at the build, with 33 to 0 as the measure.

A REGISTERED RISK IS NOT AN OVERRIDE. The owner is right and this ruling was wrong to count it as one. Five quality rows at risk, each with a live register entry and a trigger, is the register doing its job.

THE OWNER RULED ON EVERYTHING THIS GATE RAISED, and four rulings land here.

THE FORMAT IS THE DESIGNER'S. No preference, because it goes into version control either way, and two constraints are LIFTED: the folded file need not be human readable and need not be human editable. One is demanded harder instead — the whole iteration must be RECONSTRUCTABLE, because the owner wants to browse an archived iteration and see the whole statement stream. That is the same demand the fatal must makes, arriving from the person rather than the corpus, and the two agree.

SO THE FIRST OVERRIDE DISSOLVES. It was "demanded and not designed". The demand is now stated and the design is explicitly the build's, which is a normal handover rather than a dissent.

EVERY OLD RECORD FOLDS TOO, reversing an earlier ruling the same day. The aim is that no old iteration keeps a folder. That leaves ONE archive shape rather than two, which is simpler — and the 68 old records hold no work tokens, so the format must survive an absent field.

THE PRESENCE REQUIREMENT STAYS. The owner offered to delete it and said its motivation was unclear. It is written in its own file: on 2026-08-16, i28 carried status shipped while its worktree stood, the survey left it out and the container kept it in. Two readers, one record, opposite answers. That is not an archive rule and the fold neither causes nor cures it. Deleting a must on an unclear motivation was the one move not to make blind.

A FOLDED FILE MEANS CLOSED, AND A FOLDER MEANS NOTHING. The owner corrected my rule: a folder can be planned, or seeded, or half-walked. The inference runs one way only, and the decision is still the status field's.

ONE OVERRIDE REMAINS.

THE CROSS-PANEL DRAG SPIKE IS OWED AND THE GATE PASSES OVER IT, on the owner's disposition: bless, run the spike, and if it does not work go back and find another solution. That is a real dissent rather than a formality — a spike that fails reopens a signed comparison with a structure built on top of it, which is why it is filed as raid-iss-a-prototype-arrives-after-the-winner-is-declared-and-cannot-change-it and why the owner said in as many words that prototypes come too late.

WHAT THE FIRST OVERRIDE USED TO SAY. Losslessness answers what goes IN. The fatal must asks four things of what comes OUT, and three of them need the folded file to be separable back per state, byte for byte, with the route and the machine files included. The demand is now written where the build must meet it. The mechanism is not chosen, and choosing it here would freeze it.

Two. THE CROSS-PANEL DRAG SPIKE IS STILL OWED from the candidates gate. It was one of five things named there; the other four are discharged.

ROUND THREE FOUND TWO BLOCKING THINGS AND BOTH ARE CLOSED.

THE FIRST WAS MADE BY MY OWN FIX. Closing the archive-listing finding, I wrote that a folder means open and a folded file means closed. A must graded crippling forbids deciding open-or-closed from presence in as many words. The rule now reads off the record's own status field, and that also closes the crash window in the handover: a fold that stops between committing the file and removing the folder leaves BOTH shapes standing, where a presence rule returns two answers for one record.

THE SECOND WAS A RULING STRETCHED PAST WHAT IT SAID. The owner ruled a work token is markdown; I read that as answering a row about a list surface that narrows, folds and moves rows. It does not. The owner has since said plainly there are TWO editors: the token body, which is markdown and needs nothing built, and the BUCKET EDITOR, which we build. The stretched verdict is withdrawn, the row stands unaddressed, and the bucket editor is now allocated across three standing elements with a new crossing for the write.

THE OWNER ALSO RULED THERE IS NO MIGRATION. The 68 records already archived keep their folders; the fold applies to records closed from here on. That makes both shapes PERMANENT rather than transitional, which is smaller on day one and larger forever.

ONE THING FOUND AFTER THE RULINGS, AND IT IS NOT AN OVERRIDE. A program sweep of all 267 functional requirements found three more that the fold breaks, on one shared cause: they find a closed record by its folder, and a closed record has none. The sharpest is a must graded fatal whose guard FAILS OPEN — an edit to an archived record would land rather than be refused.

IT IS REGISTERED WITH A TRIGGER AT THE BUILD, which the owner has ruled is enough. It is named here anyway because a guard that fails open is the one failure that looks identical to success, and a gate that found it should say so rather than let a register entry carry it alone.

THE SAME SWEEP FOUND THE DESIGN'S BEST SUPPORT. A standing must, graded crippling, already says the engine shall resolve the archive through git and that a finished record keeps no folder. The whole milestone argued the archive without it.

WHAT NO LONGER STANDS AS A DISSENT. The fold's scale, killed by measurement at the real size. The element cut, verified against all ten interfaces by the reviewer. The two-way pair, now a decision with three rejected options. The stale interface debt, now carried by if-work-store-to-record-store.

THE BLESS IS THE OWNER'S. They have ruled on every dissent this gate raised, and the two that remain are work the build owns rather than questions the gate can settle.

## follow_up

The build owns four things and each has a register entry with a trigger.

ROUTE THE 33 CALL SITES through the record store. Fourteen engine files build a record path themselves and read the disc. After the fold a closed record has no folder, so every one of them reads a closed record as missing. The measure is 33 today and 0 when it closes.

CHOOSE THE FOLD'S SHAPE, against the four demands the fatal must makes of what comes out. A boundary the content cannot produce, or lengths carried per part. The route and the machine files go in too.

GIVE TAKEN WORK A THIRD PATH. A hand that takes a piece of work and then dies leaves it taken forever. Either the take expires, or the take is never recorded and the settle is the only write — and the second would also close the two-way pair.

PUT THE FOLD IN THE BACKGROUND. The owner ruled it belongs there and no element holds a background task.

Three more stand in the register and none blocks the build.

A folded record is readable by an agent through the ordinary git verb, so the archive's person-only rule guards one path of two. The read-back proof rule names four kinds of tree and a folded record is not one. The architecture milestone deals only quality requirements, so a functional one the design touches is dealt nowhere — that last is graded fatal and is a method hole rather than this design's.

One is owed at whichever state allows a rename. req-a-closed-records-folder-stays-on-trunk now demands readability rather than a place, and its id still says the opposite. The test spec that verifies it says so too.

One is owed from the candidates gate. The cross-panel drag spike.

THE METHOD TOOK THREE CHANGES FROM THIS GATE, all written into meth-gate-review. A ruling that changes behaviour owes a claim sweep before any edit. An allocation change owes a fresh look at what now crosses. A verdict never rests on text written in the same pass.

## anything_else

