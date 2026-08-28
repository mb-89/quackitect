---
form: the-actor-is-stamped
by: agent
signed_off: 2026-08-19T12:06:43.298Z
authors: agent
files: null
---

# Evidence form / the-actor-is-stamped

## current_situation

The third chunk, and the first of the three that share `engine/render.ts`.

It closes a standing demand rather than a new one: req-acts-carry-role-and-channel has said since i1 that the engine stamps every recorded act with its acting role, and nothing did.

## built

Five files, twelve edits, one fact.

- `calllog.ts` — `CallRecord` gains `actor?: "human" | "agent" | "ui"`, pointing at the design section that says why.
- `mirror.ts` — the two control-post paths stamp `human`, four sites. A person pressed something.
- `mirror.ts` — the profile and slow-request records stamp `ui`, two sites. The server measuring itself is neither a person nor the agent.
- `tools.ts` — the lane's single call path and both narration records stamp `agent`, three sites.
- `tools-run.ts` — a verdict written when a background job ENDS stamps `ui`, two sites. Nobody called it; the job finished.
- `render.ts` — `srcOf` takes the record's actor and returns it. The prefix rule survives BELOW it.

THE FALLBACK IS DEMOTED, NEVER REMOVED. A record written before the stamp existed carries no role, and the prefix rule answers for exactly those. Deleting it would rewrite history the engine cannot know.

OBSERVED: `tests/actor-stamp.test.ts` and `tests/mirror-contract.test.ts` together — 34 cases, 34 pass, 0 fail. The second file is not scope creep: it is the feed's standing contract, and this chunk changes what the feed draws.

## follow_up

The next chunk is `preflight-asks-the-reader`, the second of the three sharing `render.ts`.

WHAT THIS CHUNK DID NOT DO, and the requirement's own Detail says so: the CHANNEL half of req-acts-carry-role-and-channel is untouched. The role is stamped; lane, board, phone and chat are not distinguished. That is a wider change and nothing here reaches it.

## anything_else

THE STAMP IS WRITTEN AT TWELVE SITES AND READ AT ONE, which is the shape the requirement asks for and the opposite of what stood. The reader knew nothing and guessed; the writers all knew and said nothing.

WHY `ui` FOR A TEST VERDICT. The record is appended when a background job finishes, from a callback nobody called. Reading it as the agent's act would put a call in the feed that the agent did not make, at a time it was doing something else.

THE THREE ROLES ARE CLOSED, and the type says so. A fourth would have to be added deliberately rather than appearing because somebody named a tool differently.
