---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-16T16:31:48.196Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

DESIGN INPUT ENDS HERE. M1, M2 and M3 are signed — ten states, no owed items.

WHAT STANDS FOR THIS GATE.

- 8 new requirement rows, EARS-shaped, every one verify_method test, no TBD in the whole folder.
- 1 new function, 5 extended, and 2 standing requirements rescued from having no function at all.
- 11 register entries from this delta, 4 of them assumptions, all 4 probed or unprobed-with-reason.
- 2 new stories, 2 new use cases, 2 standing value props extended with mechanical pass lines.

THIS GATE CARRIES NO FIELDS OF ITS OWN. Six mechanical checks were removed from it because a gate that re-asks a mechanical check teaches people to skim. What is left is the four rounds.

THE WALK WAS TRAPPED FOR ELEVEN CALLS BETWEEN M3 AND HERE, by a defect this iteration exists to prevent. It is the first thing round 0 reports.

## round_0_verify

- evidence vs claims: PASS, and one claim was disproved by opening what it pointed at. The record said prior art was already researched. Following it to project/spec/references/ found no entry for any of the three sources, so raid-iss-the-prior-art-is-cited-but-never-recorded was minted rather than a sentence written. Every number quoted in M3 comes from a real channel — the write budget from se_log_query's own duration_ms, the parser count from four greps over the engine, the cage history from the cage file's own record.
- types: NOT RUN, and nothing here changes code. M1 through M3 produced 24 markdown nodes and 5 node edits. No TypeScript moved.
- lint: RUN BY THE MACHINE, three times, and it refused three times. write-stories on missing prop coverage. generalize-use-cases on missing story coverage. write-requirements on a weasel word plus missing use-case coverage. Each was fixed before its state signed. The weasel catch was the good kind — it read the content being submitted and found a real softening in a statement written carefully.
- tests: NOT RUN, deliberately. The discipline says a run answers a question. Design input changes no behaviour, so there is no question, and the battery is earned. The standing baseline is i11's verification at 4.3.0.

## round_1_validate

- exercised against the goal: YES, and the goal was exercised against ITSELF three times. Every requirement here turns a rule that can be read and broken into a check that refuses. Three live instances of the failure the goal names were measured inside this milestone, not modelled.
- missing: ONE ROW IS OWED AND NAMED. The eleven-call trap between probe-assumptions and this gate was caused by status: part-closed, a value I invented, outside the vocabulary the check enumerates. It PARSED FINE. req-a-write-that-breaks-the-corpus-refuses covers only what the reader cannot read at all, and says so in its own Scope section. The row for a node that parses and says something wrong does not exist yet. It cannot be written here — this gate grants six read verbs — so it is routed to author-tests.
- wrong: ONE THING WAS WRONG AND IS FIXED. raid-iss-the-prior-art-is-cited-but-never-recorded carried an invented status. It now reads open, which is honest: one source of three recorded, two owed, and nobody here has run ArchUnit.
- out of scope: NOTHING WAS PULLED IN BEYOND THE FIFTEEN. One scope item was RECOVERED at gate-motivation — the se_lint whole-repo sweep — and its inclusion was the retro's decision of 2026-08-13 rather than this walk's.
- prior art: MADE, PARTLY, AND RECORDED. ref-archunit now stands in the glossary with its url and accessed date, from archunit.org and github.com/TNG/ArchUnit. WHAT THEIRS DOES BETTER, first as the guard demands: it needs no new runner and no new report surface, riding the test framework every Java team already has, and its subject is compiled BYTECODE, which cannot lie about what the code does. WHAT OURS SHEDS: the compile step and the wait for it — a rule broken at 10:00 is heard at 10:00 rather than at the next build. WHAT IS STILL OWED: two of the three cited sources are unrecorded, and nobody here has RUN ArchUnit, so nothing above is a quality judgment. It is what the documentation claims.

## round_2_red_team

- STEELMAN AGAINST THE WHOLE REGISTER, at its strongest => Eight requirements were written in one sitting by the agent that will also build them, judge them and sign their gate. Every measurement cited is that agent's own mistake, recorded by that agent, in the same session. A register built that way does not need a red team, it needs a second person. The three live instances are not evidence about the system; they are evidence that one author had a bad afternoon.
- THE ANSWER, and it concedes half => The self-authorship is real and no round fixes it. What does not survive the steelman is calling the instances one author's bad afternoon. They came from three DIFFERENT mechanisms, and the third was found by the machine refusing rather than by the author noticing. depends_on's 3-of-27 count is somebody else's measurement from 2026-08-13, before this iteration existed.
- THE SHARPEST ATTACK, and it lands => The eleven-call trap between M3 and this gate was caused by a value that PARSED FINE and was outside its vocabulary. The register has no row for that case. req-a-write-that-breaks-the-corpus-refuses says in its own Scope section that a node which parses and says something wrong is a different row — and that row was never written. So the register misses the exact failure that trapped the walk on its way here.
- WHAT THAT MEANS FOR THE VERDICT => It is a named gap with a home rather than a defect in what stands. Nothing here is wrong; something is absent. It routes to author-tests, which can write.
- THE KILL-CRITERION => This register is the wrong one if the write-path checks cannot be built without engine code per check. req-a-check-binds-without-engine-code is a constraint, not a preference, and if the first two checks each need engine work then the constraint is aspirational and half these rows are unbuildable as written.
- LOOKING FOR IT, honestly => Unsettled, and it is the right kind of unsettled. The falsifying test is specific and cheap — add a SECOND check without touching any file under project/deliverable/engine/, and show it firing. It cannot be run before the first check exists, so it belongs to the build rather than here.
- A SECOND ATTACK, on the probes => Two of the four assumption probes were satisfied by reading the repository rather than by exercising the channel. The parser probe counted imports; it did not feed a malformed sample to each reader. The cage probe read a config file; it did not attempt a native write.
- THE ANSWER TO THAT => Conceded and stated on the nodes themselves. The cage entry stays OPEN because of it, with the Claude half named as never verified. The parser entry says holds-on-the-parser and fails-on-the-handling, which is what counting imports can honestly support and no more. Only the write-budget probe exercised a real channel, and it is the one that moved the plan.

## raid_additions

- none

## verdict

pass — design input closes with a register that is verifiable, traced, function-covered and probed, and with its one gap named, homed and routed rather than absorbed.

WHY raid_additions IS none AND THAT IS NOT A BLANK. This gate grants six READ verbs. It cannot mint a node. The one entry this review would add — a row for a value that parses and is outside its vocabulary — is named in round 1 and routed to author-tests, which can write.

THAT IS ITSELF THE ITERATION'S OWN THESIS POINTED AT ITS OWN MACHINE, for the second time on this walk. gate-motivation demanded a comparison it had no verb to research. This gate demands register additions it has no verb to write. Both are demands written from the demander's side without checking the demanded state can answer.

WHAT CARRIES THE PASS.

- THE MECHANICAL CHECKS ALL RAN AND ALL REFUSED AT LEAST ONCE. Coverage three times, the weasel word once, the vocabulary once. Nothing was waved through.
- THE ONE PROBE THAT EXERCISED A REAL CHANNEL CHANGED THE PLAN. The write budget was sitting in the call log the whole time and had been argued about at two gates instead of read. 4 to 12 ms against 1000.
- TWO STANDING REQUIREMENTS FROM i1 AND i27 WERE FOUND ORPHANED and given functions. Neither was this delta's, and the check that found them reads BOTH sides from disk.

WHAT THE PASS DOES NOT CLAIM.

- THAT THE PRIOR ART IS FULLY POSITIONED. One source of three is recorded and nobody here has run the tool.
- THAT THE ARCHITECTURE IS PROVEN BUILDABLE. req-a-check-binds-without-engine-code is the kill-criterion and its falsifying test needs the second check to exist.
- THAT SELF-AUTHORSHIP WAS SOLVED. The red team's steelman stands and no round here answers it.

## follow_up

M7 OPENS. At minor, M4, M5 and M6 are struck, so author-tests is next and design input is over.

WHAT IS OWED THERE, in order.

- ONE REQUIREMENT ROW, not yet written. A node that PARSES and carries a value outside its declared vocabulary must refuse at the write. That is the defect that trapped this walk for eleven calls, and req-a-write-that-breaks-the-corpus-refuses explicitly does not cover it.
- A CASE PER ROW. Eight rows, every one verify_method test, so nothing is owed to a harness that does not exist.
- THE FIRST BUILD CHUNK'S ORDER IS ALREADY BINDING, from raid-risk-the-small-fixes-crowd-out-the-conformance-system. The write-budget probe first, the conformance chunks before the fixes, and gate-implementation checking the order rather than the count.

WHAT IS OWED LATER, with named homes.

- Two prior-art sources, still unrecorded.
- The Claude cage, never verified against a live session.
- se_web_search, inert without a key. That is the owner's to set.
- Three files citing the dead i27 long id, and vp-the-engine's stale claim line — both deferred to sweep-consistency.

NOTHING IS BLOCKED.

## anything_else

### The eleven-call trap, in full, because it is this iteration's best evidence

WHAT HAPPENED. probe-assumptions signed. The next pull refused: probe-assumptions is dropped because identify-assumptions is not standing. The remedy named se_amend on identify-assumptions.

I RAN THE REMEDY. Twice — once on current_situation, once on the field the change actually touched. The refusal came back identical both times.

I RAN IT ON log-risks TOO, guessing further up the chain. Identical refusal.

THEN I ASKED THE DIAGNOSTIC VERB. se_why on identify-assumptions named write-requirements. se_why on write-requirements named the root in one line: raid-iss-the-prior-art-is-cited-but-never-recorded carries status part-closed, and the vocabulary is open, probed, mitigated, accepted, deferred, closed, decided or superseded.

I INVENTED THAT VALUE, four states earlier, and the write accepted it.

### Three things this proves, and one it does not

THE VALUE PARSED. Perfect YAML, wrong word. req-a-write-that-breaks-the-corpus-refuses covers only what the reader cannot read AT ALL, and says so in its Scope section. The row for this case does not exist and is now owed.

THE BREAK SURFACED FOUR STATES LATER, NAMING A DIFFERENT STATE. The refusal pointed at identify-assumptions, which was fine. Its own remedy was structurally incapable of working, because an amend deliberately keeps the signature and the ripple is recomputed from content.

THE DIAGNOSTIC VERB SETTLED IT IN TWO CALLS after three failed remedies. se_why exists for exactly this and is callable from anywhere on purpose — session.ts says a verb that explains greyness but is only callable where nothing is grey is useless at the one moment it exists for.

WHAT IT DOES NOT PROVE is that the remedy is always wrong. It names the FIRST fallen input, which is correct as far as it goes. What it cannot do is walk to the root, and the root is where the fix is.

### The measured cost

Eleven calls. Three of them ran a remedy that could not work. Two were se_why, and those two ended it.

ONE REFUSAL AT THE WRITE would have cost zero. The vocabulary is enumerable, the value was wrong the moment it was typed, and the check that eventually caught it already knows the list — it printed all eight.
