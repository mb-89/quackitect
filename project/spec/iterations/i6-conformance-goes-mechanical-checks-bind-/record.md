---
id: i6-conformance-goes-mechanical-checks-bind-
status: seeded
opened: 2026-08-11T15:23:49.685Z
goal: "Conformance goes mechanical: checks bind to the named elements and run at the write, not at a review."
vision: "Both parked conditions came true - the trace carries named elements and design specs since M5, so conformance has something to bind to.\n\n- Conformance moves to the WRITE path (owner direction, note-b93ad16c18a5): a write that breaks a bound rule hears it at the write, not at a later gate.\n- Fitness functions per the parked design (note-d7a26094f592): architectural conformance as checks that run every time - ArchUnit's shape, bound to el- elements and dsp- specs. Prior art already researched: Ford, Parsons and Kua; the Thoughtworks article.\n\nIndependent of every sibling iteration; consumes the trace corpus read-only.\n\nFROM THE POOL, 2026-08-13. Four more checks, each with its subject already named.\n\n- TWO DOCUMENTS SET DIFFERENT BARS FOR ONE CLAIM (note-4c9a8806b8da), and the looser one can be cited to close the gap without doing anything. The requirement asks for a use case AND at least one requirement demanding each capability. Its own test spec asks only for a requirement covering that use case. Under the spec's wording the lane-verb third is fully covered today; under the requirement's, 34 of 35 verbs are uncovered. Make the two agree, or say which governs.\n- THE PAINT RULES HAVE NO TEST PIN (note-b4544437d0c9). Three deliberate choices are guarded only by comments: green means submitted, so a signed gate paints before its bless while the route still demands it; a law-proven state greens from its law; a seeded container of an open record resolves without a descent.\n- THE REGISTER IS NEVER CHECKED AGAINST ITS FOLDER (note-8355729c239a). Coverage runs the register against the use cases in both directions and never against the node folder, so a register that silently disagrees with what is on disk has the same shape as the defect the computed-green rework removed - a truth derived from one side only. THE OWNER RULED THAT AN ORPHAN IS NOT CHASED, so this REPORTS a named difference rather than refusing.\n- ZERO OF THE 24 STORIES LINK A PROVING RUN (note-4ffaba22ce7f). Correct before validation, owed at the story-evidence state.\n\nSEEDING AN ITERATION MUST NAME ITS DEPENDENCY (owner ruling 2026-08-13).\n\nTHE DEMAND: depends_on becomes REQUIRED on the seed. Omitting it refuses. An iteration with nothing to wait for says so explicitly, as an empty list, and that empty list is a STATED DECISION rather than a silence.\n\nWHY THE OWNER CHOSE THIS SHAPE over scanning the vision for wait-words: a scan guesses at prose, and this cannot. The two answers it distinguishes are I FORGOT and I DECIDED NONE, and today only one of those is expressible — they look identical on disk.\n\nWHAT IT COSTS TO GET WRONG, measured on 2026-08-13. Twenty-seven iterations were seeded and the key was set on seven. Three records stated a wait in their own vision prose and carried no edge for it: the UI sitting after the panel round, the comment system after the machine format, and the cloud iteration after the lane binding. The container is a DAG and this key is its ONLY input, so an unset key is not a missing note — it is a missing edge, and two agents can be handed work that fights over the same files.\n\nTHE GUIDANCE ALREADY EXISTED AND DID NOT HOLD. The seed tool's own argument description states the rule exactly, in the argument list, unmissable. It was read, and the key was still missed on three records. A rule broken that way wants a refusal, not another sentence — which is this iteration's whole thesis.\n\nONE LINE OF GUIDANCE STILL RIDES ALONG, because a PERSON seeds iterations too and a person does not read a tool schema. It says the dependency is the container's DAG and the only thing stopping two agents racing the same files. One line, beside the refusal that enforces it.\n\nTHE COVERAGE CHECKS GAIN A FRESHNESS HALF (owner ruling 2026-08-13, at i27's gate-inputs). WAITS ON i18.\n\nTHE GAP IS NOT WHAT IT FIRST LOOKS LIKE. The coverage checks ARE mechanical. Story coverage refuses a submit where a value prop has no story in the listed set, and names the props that are short. Use-case coverage does the same over stories.\n\nTHE QUESTION THEY ASK IS EXISTENCE: does a link exist from every prop to some story, and from every story to some use case.\n\nTHE QUESTION NOBODY ASKS IS FRESHNESS: is the linked node still TRUE after this change, and did anybody look.\n\nWHAT THAT LET THROUGH, live at i27 on 2026-08-13. Its second milestone listed 36 use cases and examined two. Both facts are compatible with a green check, and only the prose says which is which. The same milestone found a story whose PROOF the change makes obsolete - caught by reading, and nothing would have caught it if nobody had read.\n\nWHY THE CAPABILITY CHECK HAS NO SUCH HOLE. It compares two enumerable sets: the verbs the engine registers, and the verbs named in use cases. Both sides are machine-readable and the comparison is total, with no listing step where somebody asserts something. The story and use-case checks depend on a LISTING the agent supplies, and listing is cheap.\n\nTHE TEST FOR WHETHER A CHECK IS REAL: could an agent pass it while examining nothing? If yes, it checks the paperwork rather than the work.\n\nTHE MECHANICAL VERSION, IN TWO HALVES.\n\n- WHICH NODES DID THIS CHANGE TOUCH. The impact set over the trace graph, computed rather than declared. THAT IS i18's, and this waits on it.\n- EVERY NODE IN THE IMPACT SET WAS RE-READ, recorded per node. The check then demands that every reference was either re-read against this delta, or is provably outside the set.\n\nThat converts I LISTED THIRTY-SIX into I READ THE SIX THE CHANGE TOUCHED, and it refuses when a touched node is listed unread.\n\nTHE GENERAL RULE THE OWNER NAMED, and it is this iteration's thesis stated sharply: wherever a check asks a question a LISTING can satisfy, it is not yet mechanical - it is a form of paperwork.\n\nTHE CROSS-COUPLING CHECK AT THE REQUIREMENTS GATE (owner ruling 2026-08-13). WAITS ON i18 AND i15.\n\nTHE GATE DEMANDS A DISPOSITION PER CANDIDATE, not a paragraph of reassurance. Two sources feed it: the impact set i18 computes over the trace graph, and the retrieval candidates i15's BM25 sibling proposes for couplings no edge records.\n\nEVERY CANDIDATE GETS ONE LINE. Coupled and here is how, or not related and why. A candidate left unanswered REFUSES the submit.\n\nTHE FORMAT DECIDES WHETHER THIS WORKS, and it is the whole design risk. False positives are FINE when disposing of one costs a line - BM25 will surface plenty and that is expected. They are FATAL when each demands a paragraph, because then the check becomes the thing everyone dreads and nobody does properly.\n\nASK FOR SYNERGIES TOO. The check is not only a risk list: does this change improve an existing function if modified slightly, and what does it unlock. That half is judgment and cannot be mechanised - what CAN be mechanised is putting the candidates in front of the judgment.\n\nWHY IT BELONGS TO THIS ITERATION AND NOT TO A GATE'S PROSE. A gate can already ASK the question. What it cannot do is make the answer producible or the coverage auditable, and that is the difference between a check and paperwork."
inputs:
---

# i6-conformance-goes-mechanical-checks-bind-

## Goal

Conformance goes mechanical: checks bind to the named elements and run at the write, not at a review.

## Rough vision

Both parked conditions came true - the trace carries named elements and design specs since M5, so conformance has something to bind to.

- Conformance moves to the WRITE path (owner direction, note-b93ad16c18a5): a write that breaks a bound rule hears it at the write, not at a later gate.
- Fitness functions per the parked design (note-d7a26094f592): architectural conformance as checks that run every time - ArchUnit's shape, bound to el- elements and dsp- specs. Prior art already researched: Ford, Parsons and Kua; the Thoughtworks article.

Independent of every sibling iteration; consumes the trace corpus read-only.

FROM THE POOL, 2026-08-13. Four more checks, each with its subject already named.

- TWO DOCUMENTS SET DIFFERENT BARS FOR ONE CLAIM (note-4c9a8806b8da), and the looser one can be cited to close the gap without doing anything. The requirement asks for a use case AND at least one requirement demanding each capability. Its own test spec asks only for a requirement covering that use case. Under the spec's wording the lane-verb third is fully covered today; under the requirement's, 34 of 35 verbs are uncovered. Make the two agree, or say which governs.
- THE PAINT RULES HAVE NO TEST PIN (note-b4544437d0c9). Three deliberate choices are guarded only by comments: green means submitted, so a signed gate paints before its bless while the route still demands it; a law-proven state greens from its law; a seeded container of an open record resolves without a descent.
- THE REGISTER IS NEVER CHECKED AGAINST ITS FOLDER (note-8355729c239a). Coverage runs the register against the use cases in both directions and never against the node folder, so a register that silently disagrees with what is on disk has the same shape as the defect the computed-green rework removed - a truth derived from one side only. THE OWNER RULED THAT AN ORPHAN IS NOT CHASED, so this REPORTS a named difference rather than refusing.
- ZERO OF THE 24 STORIES LINK A PROVING RUN (note-4ffaba22ce7f). Correct before validation, owed at the story-evidence state.

SEEDING AN ITERATION MUST NAME ITS DEPENDENCY (owner ruling 2026-08-13).

THE DEMAND: depends_on becomes REQUIRED on the seed. Omitting it refuses. An iteration with nothing to wait for says so explicitly, as an empty list, and that empty list is a STATED DECISION rather than a silence.

WHY THE OWNER CHOSE THIS SHAPE over scanning the vision for wait-words: a scan guesses at prose, and this cannot. The two answers it distinguishes are I FORGOT and I DECIDED NONE, and today only one of those is expressible - they look identical on disk.

WHAT IT COSTS TO GET WRONG, measured on 2026-08-13. Twenty-seven iterations were seeded and the key was set on seven. Three records stated a wait in their own vision prose and carried no edge for it: the UI sitting after the panel round, the comment system after the machine format, and the cloud iteration after the lane binding. The container is a DAG and this key is its ONLY input, so an unset key is not a missing note - it is a missing edge, and two agents can be handed work that fights over the same files.

THE GUIDANCE ALREADY EXISTED AND DID NOT HOLD. The seed tool's own argument description states the rule exactly, in the argument list, unmissable. It was read, and the key was still missed on three records. A rule broken that way wants a refusal, not another sentence - which is this iteration's whole thesis.

ONE LINE OF GUIDANCE STILL RIDES ALONG, because a PERSON seeds iterations too and a person does not read a tool schema. It says the dependency is the container's DAG and the only thing stopping two agents racing the same files. One line, beside the refusal that enforces it.

THE COVERAGE CHECKS GAIN A FRESHNESS HALF (owner ruling 2026-08-13, at i27's gate-inputs). WAITS ON i18.

THE GAP IS NOT WHAT IT FIRST LOOKS LIKE. The coverage checks ARE mechanical. Story coverage refuses a submit where a value prop has no story in the listed set, and names the props that are short. Use-case coverage does the same over stories.

THE QUESTION THEY ASK IS EXISTENCE: does a link exist from every prop to some story, and from every story to some use case.

THE QUESTION NOBODY ASKS IS FRESHNESS: is the linked node still TRUE after this change, and did anybody look.

WHAT THAT LET THROUGH, live at i27 on 2026-08-13. Its second milestone listed 36 use cases and examined two. Both facts are compatible with a green check, and only the prose says which is which. The same milestone found a story whose PROOF the change makes obsolete - caught by reading, and nothing would have caught it if nobody had read.

WHY THE CAPABILITY CHECK HAS NO SUCH HOLE. It compares two enumerable sets: the verbs the engine registers, and the verbs named in use cases. Both sides are machine-readable and the comparison is total, with no listing step where somebody asserts something. The story and use-case checks depend on a LISTING the agent supplies, and listing is cheap.

THE TEST FOR WHETHER A CHECK IS REAL: could an agent pass it while examining nothing? If yes, it checks the paperwork rather than the work.

THE MECHANICAL VERSION, IN TWO HALVES.

- WHICH NODES DID THIS CHANGE TOUCH. The impact set over the trace graph, computed rather than declared. THAT IS i18's, and this waits on it.
- EVERY NODE IN THE IMPACT SET WAS RE-READ, recorded per node. The check then demands that every reference was either re-read against this delta, or is provably outside the set.

That converts I LISTED THIRTY-SIX into I READ THE SIX THE CHANGE TOUCHED, and it refuses when a touched node is listed unread.

THE GENERAL RULE THE OWNER NAMED, and it is this iteration's thesis stated sharply: wherever a check asks a question a LISTING can satisfy, it is not yet mechanical - it is a form of paperwork.

THE CROSS-COUPLING CHECK AT THE REQUIREMENTS GATE (owner ruling 2026-08-13). WAITS ON i18 AND i15.

THE GATE DEMANDS A DISPOSITION PER CANDIDATE, not a paragraph of reassurance. Two sources feed it: the impact set i18 computes over the trace graph, and the retrieval candidates i15's BM25 sibling proposes for couplings no edge records.

EVERY CANDIDATE GETS ONE LINE. Coupled and here is how, or not related and why. A candidate left unanswered REFUSES the submit.

THE FORMAT DECIDES WHETHER THIS WORKS, and it is the whole design risk. False positives are FINE when disposing of one costs a line - BM25 will surface plenty and that is expected. They are FATAL when each demands a paragraph, because then the check becomes the thing everyone dreads and nobody does properly.

ASK FOR SYNERGIES TOO. The check is not only a risk list: does this change improve an existing function if modified slightly, and what does it unlock. That half is judgment and cannot be mechanised - what CAN be mechanised is putting the candidates in front of the judgment.

WHY IT BELONGS TO THIS ITERATION AND NOT TO A GATE'S PROSE. A gate can already ASK the question. What it cannot do is make the answer producible or the coverage auditable, and that is the difference between a check and paperwork.
