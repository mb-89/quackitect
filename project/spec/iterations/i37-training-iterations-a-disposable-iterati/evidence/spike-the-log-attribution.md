---
form: spike-the-log-attribution
by: agent
signed_off: 2026-08-19T19:39:54.325Z
authors: agent
files:
---

# Evidence form / spike-the-log-attribution

## current_situation

The third spike of M6, on the unknown ranked fourth by damage and named at rank-unknowns as the one that worried the agent most.

The question: can the call log say which state each call was made in?

IT HOLDS, by a route the assumption did not name, and one measurement inside it was wrong before it was right.

## built

- [[exp-can-cost-per-state-be-derived-from-the-call-log]]

## follow_up

- NOTHING NEW HAS TO BE CAPTURED. el-benchmark-report derives cost per state from the log as designed, with one added rule: walk forward and carry each se_pull's `where` until the next one.
- HALF THE ASSUMPTION IS FALSE AND SHOULD BE CORRECTED ON ITS NODE. No call record carries a state field; 0 of 1282. The position is recoverable only because se_pull logs its whole response.
- A STATE FIELD WOULD STILL BE BETTER and is worth a work token rather than a design change. It removes the carry-forward, survives a log that starts mid-session, and costs one field the session already knows at dispatch.
- THE 99% IS A BOUNDARY, NOT A GAP. The one unattributable call precedes the session's first pull.

## anything_else

THE SPIKE'S FIRST ANSWER WAS WRONG AND SAID THE DESIGN WAS BROKEN.

The first pass reported 0 of 359 pull responses retaining their position. Read cold that means cost per state is not derivable, el-benchmark-report needs a different input, and a design change lands after two blessed gates.

IT WAS THE AGENT'S BUG. The response is stored as a STRING, and searching it with a pattern that works against an object finds nothing, because the quotes inside a JSON string are escaped. The truth is 338 of 359.

THIRD TIME IN THIS ITERATION. An empty search read as no-rows-match, a probe read as falsifying the central premise, and now a zero read as a broken design. Every one was an absence that was really a measurement fault.

THE RULE EXISTS AND WAS UNDER-APPLIED. find_analogy's transfer says an absence-shaped measurement runs a paired positive control, and an absence without one is not recorded as a finding. Here the control was skipped because the number looked decisive.

A NUMBER THAT WOULD OVERTURN A DESIGN IS EXACTLY THE ONE THAT NEEDS ITS CONTROL, and the instinct runs the other way: a result that confirms gets checked, a result that contradicts gets believed.

THAT IS THE SHARPEST THING THIS ITERATION HAS LEARNED ABOUT ITSELF, and it belongs in the fold-back rather than only here.
