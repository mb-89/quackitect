---
form: write-requirements
by: agent
signed_off: 2026-08-13T20:02:37.526Z
reopened: "2026-08-13T19:59:50.794Z — One minted requirement duplicated req-reading-credit-survives-a-reload word for word in intent, and the register listed it - found by the cross-coupling read at…"
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

REOPENED AND RE-EARNED. The first version minted a duplicate and stated two rows too narrowly, and both were found by reading rather than by any check.

EIGHT ROWS NOW STAND, not nine.

THE DUPLICATE IS GONE. req-the-reading-credit-keys-on-content said what req-reading-credit-survives-a-reload already says, word for word in intent, and the resident row is the better one - it is a must where mine was a should. Deleted, and the resident row now carries the register entry.

TWO ROWS WERE TOO NARROW (owner ruling 2026-08-13). They said a write lands WHERE THE WALK STANDS, which forbids work we want: reaching into another record, reading a committed ref, touching session state. THE REQUIREMENT IS THAT A WRITE ENDS UP WHERE IT IS MEANT TO, a read comes from where it is meant to, and the resolving just works. Renamed and restated.

THE REGISTER FIELD CARRIES 37 ENTRIES: the eight new ones, three resident rows this change couples to directly, and one per remaining use case for coverage. The other 168 stand untouched and unlisted.

## register

- project/spec/trace/requirement/req-a-write-lands-where-it-is-meant.md
- project/spec/trace/requirement/req-a-read-comes-from-where-it-is-meant.md
- project/spec/trace/requirement/req-a-method-change-reaches-every-tree.md
- project/spec/trace/requirement/req-entry-levels-the-record-tree.md
- project/spec/trace/requirement/req-a-shipped-record-is-never-reclaimed.md
- project/spec/trace/requirement/req-record-status-comes-from-the-record.md
- project/spec/trace/requirement/req-the-answer-never-exceeds-its-bound.md
- project/spec/trace/requirement/req-a-resolution-is-proven-by-read-back.md
- project/spec/trace/requirement/req-a-records-dependency-is-declared.md
- project/spec/trace/requirement/req-reading-credit-survives-a-reload.md
- project/spec/trace/requirement/req-guidance-edit-lands-where-it-compiles.md
- project/spec/trace/requirement/req-trees-never-mix.md
- project/spec/trace/requirement/req-call-answers-in-one-second.md
- project/spec/trace/requirement/req-a-size-may-drop-a-question.md
- project/spec/trace/requirement/req-acts-carry-role-and-channel.md
- project/spec/trace/requirement/req-answer-recorded-with-question.md
- project/spec/trace/requirement/req-archive-read-only.md
- project/spec/trace/requirement/req-autonomy-change-applies-forward.md
- project/spec/trace/requirement/req-begin-says-own-window.md
- project/spec/trace/requirement/req-boot-ends-at-front-desk.md
- project/spec/trace/requirement/req-broken-trace-is-a-defect.md
- project/spec/trace/requirement/req-capture-moves-nothing.md
- project/spec/trace/requirement/req-cell-edit-lands-in-the-note.md
- project/spec/trace/requirement/req-choice-records-case-against-losers.md
- project/spec/trace/requirement/req-clean-sweep-is-dated.md
- project/spec/trace/requirement/req-colors-are-configuration.md
- project/spec/trace/requirement/req-desk-offers-a-tour.md
- project/spec/trace/requirement/req-desk-takes-plain-words.md
- project/spec/trace/requirement/req-drain-one-home-with-payload.md
- project/spec/trace/requirement/req-engine-folder-is-sealed.md
- project/spec/trace/requirement/req-every-artifact-is-readable-text.md
- project/spec/trace/requirement/req-expressions-evaluate-per-reference.md
- project/spec/trace/requirement/req-first-green-needs-a-red.md
- project/spec/trace/requirement/req-fresh-machine-runs.md
- project/spec/trace/requirement/req-help-demand-ranked.md
- project/spec/trace/requirement/req-mirror-stays-on-the-machine.md
- project/spec/trace/requirement/req-no-agent-act-destroys-work.md
- project/spec/trace/requirement/req-reachable-capability-is-traced.md

## set_criteria

- complete: Every one of the 36 use cases has a covering requirement, checked mechanically, and zero are uncovered. WHAT HAS NO REQUIREMENT, named because the question asks: the measured split of past step-outs into accidents and deliberate method edits, which is a measurement the business case rests on rather than a demand on the system.
- consistent: No two requirements conflict, and two near-collisions were found by reading and resolved explicitly. req-guidance-edit-lands-where-it-compiles is the METHOD case of the new general write requirement, and both are kept because the compiles-from tree is not always the tree the caller means - where method fans out they differ, and that difference is the fan-out's subject. req-trees-never-mix forbids MIXING and not ADDRESSING: sending work deliberately to another tree stays possible, and what both rows stop is a write crossing without anybody meaning it to. ONE PRE-EXISTING INCONSISTENCY STANDS: req-reachable-capability-is-traced and its own test spec set different bars, which this iteration's scope retires by making the lane an interface.
- affordable: Eight requirements. Three describe behaviour that already exists and need only a test to pin it. Two are one predicate each. Two are real builds, the fan-out and the answer bound, both scoped at the kickoff. One is a rule about how tests are written and costs nothing to adopt.
- bounded: Every requirement answers to a source that is a dated observation, a measurement or an owner ruling. Nothing is gold-plated, and the one I wanted and did not write is a rule about how worktrees are laid out - a mechanism, and this milestone does not choose mechanisms.
- comprehensible: Each statement says what must be true rather than how. The write and read pair reads plainly: it ends up where it was meant to, and where a path could name more than one tree the engine says which it used. The words that needed defining - meant, tree, method - are used the same way throughout.
- no_tbd: Zero. The sweep ran here rather than being asserted: a search for TBD, TBC, TBR and question marks over the whole requirement folder returned no matches.
- behaviour_modelled: Three earned a model and five did not. The fan-out earned a SEQUENCE, because one write to N trees with partial failure is the whole risk. The claim requirement earned a STATE MODEL, because a claim has four states and exactly one transition is terminal. The status requirement earned a LIFECYCLE, because which transitions a peer can observe without a worktree is why it exists. The other five are single predicates over single calls, where a model would be one box.

## follow_up

THE CROSS-COUPLING READ IS PARTLY DONE AND IT ALREADY PAID. Four resident requirements in the method-and-trees family were opened at derive-functions, and two of the four were hits: one duplicate to delete, one near-miss to name. That is a 50 percent hit rate in the first family read, which says the rest of the register is worth the same treatment.

OWED AT THE GATE, on the owner's ruling: the cross-coupling analysis over the whole register, by hand this once. The check is designed and lives in i18, i15 and i6, and none of it is built - so doing it by hand here is both the honest answer and the way to learn what format the check needs.

STILL OWED. The measured split of past step-outs. Two use cases named unread at the inputs gate remain unread: landing work on trunk, and the interaction-capability quality.

WHAT M4 INHERITS. Eight must requirements gating the candidates. No should or could requirements from this iteration, because the reading-credit row - the only one that was a should - turned out to be a duplicate of a must.

## anything_else

WHAT THIS REOPEN PROVES, and it is worth more than the fix.

The first version of this state SAID it had not swept the resident register, and passed every mechanical check anyway. The sweep then happened by accident, one state later, because deriving functions meant reading four requirements in the same family.

TWO OF THOSE FOUR WERE HITS. A duplicate I had minted forty minutes after writing a finding about not sweeping. And a near-miss whose relationship to my new row needed stating.

SO THE FRESHNESS CHECK IS NOT A THEORETICAL IMPROVEMENT. On its first informal application it found a defect in work that had already been signed, in the same session, by the same agent that had already named the risk.

The check is i6's, waiting on i18's impact set. Until it exists, this is what an iteration's honesty depends on: whether somebody happens to read the right neighbour.
