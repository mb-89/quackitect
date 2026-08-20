---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: nbr-the-driver-that-performs-the-spawn
type: "[[neighbour]]"
direction: out
statement: "The GUIDE — whoever is asked for a hand stronger than the walker has, and gives it. The walker never becomes the guide; it delegates. The guide may work the lane itself, and where it does not, whatever the walker carries back is recorded as the guide's work and not the walker's."
---

## Two parties, and the record had a word for neither

THE OWNER'S NAMING IS BETTER THAN ANYTHING THE TRACE HAD. Two agents walk the
system rather than one.

- THE WALKER holds the session. It pulls, it fills, it reads, it patches, it
  submits. It is the weak and persistent hand, and it makes every lane call.
- THE GUIDE is occasional and strong. It is handed one step — a question, a
  comparison, a decision the walker cannot make alone — and it answers.

BOTH HANDS MAY WORK THE LANE (owner ruling, 2026-08-20). Nothing bars a guide
from pulling, reading or filling. Where a step is the guide's, the guide can do
it, and the lane sees the guide.

AND WHERE THE WALKER RELAYS INSTEAD, THE RELAY CARRIES ITS ORIGIN. A walker that
submits a guide's judgment under its own name has erased exactly the thing the
record is being grown to hold. The owner's words: "make sure that the walker
relays information that is from the guide as information from the guide."

SO THERE ARE TWO LEGAL ARRANGEMENTS AND ONE ILLEGAL ONE.

- The guide calls the lane itself, and the call is stamped as the guide's.
- The walker relays the guide's work, and stamps it as the guide's.
- The walker relays the guide's work as its own. That is the failure this
  coordinate exists to make visible.

THE STRONG HAND IS NOT THE ONE THAT PULLS. That is the whole economic point.
Paying a strong model to call `se_pull` two hundred times is the arrangement
this iteration exists to avoid, and an arrangement where the strong model walks
and the weak one advises is the same waste with the labels swapped.

NEITHER OF THESE WORDS WAS IN THE CORPUS BEFORE 2026-08-20. "Driver",
"receiver" and "walker" were doing three jobs between them, and that confusion
is what let a spike conclude an absence that was not there — see below.

## Interface

THE MACHINE PUBLISHES A STATEMENT OF HOW STRONG A HAND A STEP NEEDS, and
nothing else. That is the whole outbound half; the lane starts nothing.

WHAT THE PARTY ON THE OTHER SIDE OWES BACK:

- WALK THE STEP ON A HAND AT LEAST THAT STRONG, or say plainly that it cannot.
- SAY WHAT ACTUALLY ANSWERED. Whatever performed the spawn is the only party in
  the exchange that knows, and it is not the party being measured.
- SAY WHICH PART IT PLAYED, whether it calls the lane itself or hands its work
  back through the walker. Today both are indistinguishable at the lane, which
  serves every agent through one dispatcher and stamps them all `agent`.
- ASK FOR SOMETHING ELSE WITH A REASON, where the named strength does not fit.
  Stronger needs no argument; weaker needs the sentence recorded.

## The party can act, and this node said the opposite for most of the record

THIS NODE SAID THE RECEIVER READS AND CANNOT ACT. A spike trusted that,
searched the engine for a spawner, found none, and returned a verdict that
nothing could act on a published driver at all. Both were wrong, and the error
was one of vocabulary rather than of measurement.

THE SHAPE BOTH MISSED, named by the owner. A walking agent that reads "this
step needs a stronger hand" can hand that step to a subagent running on a
stronger model. It does not need to become a different agent. It needs to
DELEGATE.

THE PATH IS SANCTIONED AND DOCUMENTED IN THIS REPOSITORY. Contract rule 11
grants spawning subagents without asking, in as many words. And
`project/guidance/method/subagents.md` carries a "Which model" section under an
owner grant of 2026-07-11: mechanical work rides a lower tier, judgment work
inherits the session model, judged per subagent.

SO THE PARTY IS NOT MISSING, NOT EMPTY AND NOT POWERLESS. It is the agent
already walking, and the capability it needs is one it already has and already
uses.

WHAT REMAINS TRUE, AND IT IS NARROWER. A running agent cannot become a
different one. `se-start.ts` chooses the walker's own model on the command line
before the first pull, and nothing re-invokes the entrypoint mid-walk. A walk
whose own steps outgrow its walker must DELEGATE them; it cannot upgrade
itself. That is the sentence this node should have carried from the start, and
"reads and cannot act" is the over-statement it carried instead.

AND THE OPEN QUESTION MOVES FROM CAPABILITY TO OBEDIENCE. Nothing makes the
walker delegate. A weak walker that reads "this needs a stronger hand" and does
the step itself leaves a record indistinguishable from one driven properly,
which is exactly what `req-a-weaker-driver-than-named-owes-a-recorded-reason`
marks rather than refuses.

## What is actually there, measured

THIS NODE FIRST SAID THE NEIGHBOUR WAS EMPTY — that on an unattended box a
milestone would name its driver into a room with nobody in it. THAT WAS WRONG,
and it was wrong in the most embarrassing way available: the claim was written
through the very channel it said did not exist.

MEASURED, by opening the files the claim cited:

- `se-start.ts:141` spawns the LANE, `:147` unrefs it, and `:155-170` polls
  `http://127.0.0.1:<port>/` until it answers, dying after sixty seconds if it
  never does. The entrypoint PROVES something is listening before it launches
  an agent at all.
- `se-mcp.ts` under `--headless` serves the lane over HTTP on the mirror port,
  and the mirror routes `/mcp`, `/pull` and an SSE stream at `/events`.
- `se-arrive.ts` writes `.se/se-call.mjs`, a client for exactly that, so an
  agent with no `se_` tools of its own can still call the lane. Every call in
  this iteration went through it.
- `se-start.ts:245` then launches the agent with a briefing whose first
  instruction is to pull. THAT AGENT IS ALIVE AND PULLING, so a name published
  on a pull reaches a reader — and that reader is the walker.
- `se-pty.ts:275` starts an agent inside a pseudo-terminal, streams its output
  as server-sent events and takes KEYSTROKES BACK OVER POST. That is a live
  read-write channel into a running agent.
- `se-mcp.ts` also runs a SHIM that respawns the engine child on request or on
  crash. The engine does re-spawn; it does not re-spawn on a different model.

## The lane cannot tell the two apart, and that is this node's real gap

THE WALKER AND THE GUIDE ARRIVE AS THE SAME CALLER. `engine/tools.ts` stamps
`actor: "agent"` on every lane call it serves. A guide calling the lane directly
is stamped exactly as the walker is, and a guide's work relayed by the walker
carries nothing at all. Either way the log cannot be asked how much of a walk
the strong hand did.

THAT IS THE SAME TRUST SHAPE AS THE MODEL COORDINATE AND IT HAS THE SAME
RESOLUTION. `req-every-call-records-the-model-that-answered-it` says the value
can only come from the caller today, and that the mark comes off when the value
arrives from whatever performed the spawn. The part played is in exactly that
position, and whatever performed the spawn knows both.

AND THE MODEL DOES NOT STAND IN FOR THE PART. `subagents.md` says judgment work
INHERITS the session model, so a guide can carry the same model name as the
walker that asked it. Grouping the log by model would then return one bucket
for two hands.

## Why it is a neighbour and not a part of the machine

THE LANE DOES NOT START PROCESSES, in the same way it does not push, does not
open records unasked, and does not reach the screen. That division is the
lane's grain and it is why this role sits outside the box.

## What it is not

IT IS NOT `nbr-agent-harness`. The harness is inbound: it calls the lane. This
one is outbound and it is whatever answers a step the walker will not take
alone.

IT IS NOT `nbr-engineer` EITHER, though a person often plays it. On a laptop
the engineer reads the name and relaunches, and the exchange completes. The
unattended case is the one this node exists for, and its answer is the walker
delegating rather than a person arriving.
