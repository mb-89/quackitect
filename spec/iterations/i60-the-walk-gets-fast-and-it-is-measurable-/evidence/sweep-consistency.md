---
form: sweep-consistency
amended: "2026-08-24T19:47:38.039Z by agent — the walking.md addition pushed a guidance page over the payload line and was reverted, so the form must not claim it"
judgment: passed at 2026-08-24T19:39:07.581Z
by: agent
signed_off: 2026-08-24T19:39:05.121Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

WHAT THIS ITERATION CHANGED, in the words a surface would use to teach it.

- A HOP REPORTS ITS OWN DURATION. `swept_ms` rides any answer that walked, naming each hop and its milliseconds.
- THE SEARCH REPORTS WHAT IT LOOKED AT. `visited` says how many states it examined before finding a way or giving up.
- THE STOP-AT NOTCH REACHES THE STOP HOOK. The pull's answer carries `stop_at`, and the hook reads it off the last pull.
- THE AIM IS ONE CALL that walks every already-passing hop.
- A THREE-HOP SWEEP COSTS 2,562 MILLISECONDS where it cost 15,404.

TWO SURFACES TAUGHT THE SUPERSEDED WAY and now do not.

TWO MORE SHOULD HAVE TAUGHT A NEW BEHAVIOUR AND DID NOT. A gap is a defect here on the same terms as a stale sentence.

ONE CLASS HAS NO MEMBERS. There is no book in this repository, checked by glob over the whole tree.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

### What was corrected, by surface

DELIVERABLE/MACHINES/STOPAT.MD TAUGHT THE NOTCH AS DEAD. It said `blockers only` was "the setting an overnight run wants and cannot have today", and that only `state end` was held by the engine while the loose notches were the agent's own discipline.

IT NOW SAYS WHAT HOLDS EACH NOTCH, and that they are two different mechanisms. `state end` is held by the engine, which refuses the transition. `bless` and `blockers only` are held by the stop hook, which blocks the agent ENDING ITS TURN rather than blocking a pull.

DSP-MIRROR-RENDER.MD ARGUED FOR A STROKE THAT IS GONE. See the dashed state below.

GUIDANCE/WALKING.MD WAS LEFT ALONE, AND THAT IS A DECISION RATHER THAN A MISS.

IT WAS EDITED FIRST. Three lines naming `swept_ms` and `visited` went in, and the payload guard turned red: walking.md sat about fifty bytes under the line, and the addition tipped it over. Removing the addition made it green again, which is what proved the cause.

THE TOOL DESCRIPTION IS THE RIGHT SURFACE ANYWAY. An agent meets `swept_ms` when it calls `se_aim`, and that string is where the answer's own fields belong. The contract page is read by every agent on every turn, so it pays for teaching a field most turns never see.

GETTING A PAGE BACK UNDER THE LINE IS THE OWNER'S RULING, not a test edit. `deliverable/tests/payload-limit.test.ts` line 73 says so in as many words, so nothing here raised the recorded count.

THE `se_aim` DESCRIPTION DID NOT EITHER. It is an engine-served string and the one an agent actually reads, so it names both fields now.

### The dashed state, on the owner's ruling

THE STROKE IS REMOVED. `.state.done.proven` carried `stroke-dasharray`, so a law-proven green painted differently from a stamped one.

THE OWNER'S WORDS: "We don't have dashed states. I don't know what this is. I want this removed."

NO PANEL CARD NAMED IT, so a reader met a fourth stroke in a vocabulary of three with nowhere to look it up.

WHAT IT COSTS IS RECORDED IN THE SPEC, not hidden. The design spec calls that difference "the one distinction a reader most needs", and nothing on the panel draws it now. The decider still computes it, so a readable form needs no new computation.

### Residue, named rather than skipped

BOOK CHAPTERS HAVE NO MEMBERS. A glob for markdown under any `book` directory returns nothing across the whole tree. The box is checked as vacuously true, not as looked at.

THE PER-PASS CACHES ARE NOT A TAUGHT SURFACE. Four landed in this round and none changes anything an agent or a person does. They are recorded in the design spec, which is where an engine change belongs.

## anything_else

