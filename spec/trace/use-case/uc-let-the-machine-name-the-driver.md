---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: uc-let-the-machine-name-the-driver
type: "[[use-case]]"
kind: interaction
statement: Open a milestone with the machine naming the model its own work needs, so the strength of the walker stops being a decision taken once before anything was read.
actor: stk-engineer-driving-agents
trigger: a walk reaches a milestone boundary with a rated matrix behind it
precondition: every row the milestone holds has a complexity the engine can obtain, and the engine holds whatever it needs to turn a complexity into a statement of the hand the work requires
guarantee: either the milestone publishes a statement of how strong a hand its work needs, in a form the party reading it can act on, or it says plainly what it lacks — a complexity, or a way to turn one into that statement — and names nothing at all
refines:
  - sty-the-machine-picks-the-hands
priority: must
---

## Main scenario

1. The walk reaches a milestone boundary. Nothing has been spawned and nothing has been decided.
2. The engine obtains the complexity of every row that milestone holds.
3. It settles on one difficulty for the milestone, no weaker than the hardest row in it. One walker strong enough for the hardest item is what the milestone needs, and how far each row sits below that figure stays readable.
4. It turns that difficulty into a statement of the hand the work requires, the same way on every supported host, discovering nothing at run time.
5. It puts that statement on the pull, beside the state and the tier, and does nothing else with it.
6. The walking agent reads the statement and gets the next stretch onto a hand at least that strong — walking it itself where its own hand suffices, and delegating it to a stronger one where it does not.
7. The walk proceeds. Every call it makes records which model answered and which state it was made in.

## Extensions

- 3a. The milestone's rows span more than one rung. The settled figure still governs, and the per-item values ride along so a reader can see what it cost. Registered: `raid-risk-a-submachine-maximum-drags-easy-items-onto-an-expensive-walker`.
- 5a. `se-pty.ts:275` runs an agent inside a pseudo-terminal, streams its output as server-sent events and takes keystrokes back over POST. That is a live read-write channel into a running agent, and it is one way a published name could reach a party other than the walker. Whether it should travel that way is a design question this case does not settle.
- 4a. Nothing the engine holds covers that difficulty. The milestone names no driver and says which difficulty was unmatched. It does not fall back to the session's current model silently, because a silent fallback is indistinguishable from a working lookup.
- 4b. The statement resolves to different models on different hosts. Open: `raid-asm-one-model-list-serves-every-host-the-engine-supports`, raised to expected on the evidence that an alias already does exactly this.
- 6a. THE READER CANNOT BECOME A DIFFERENT MODEL, and that is narrower than it sounds. `se-start.ts:141` spawns the lane and `:155-170` proves it answers before launching an agent at `:245`; that agent pulls, so a published name reaches a live reader. What no path does is start a NEW agent on a DIFFERENT model once the walk is under way — the entrypoint has returned, and the shim in `se-mcp.ts` respawns the engine child rather than the walker. THE READER DOES NOT NEED TO. It DELEGATES the step to a subagent on a stronger hand, which contract rule 11 grants without asking and `guidance/method/subagents.md` § Which model tells it how to size. CORRECTED 2026-08-20: this extension read "THE RECEIVER READS AND CANNOT ACT" and it was false. `nbr-the-driver-that-performs-the-spawn` carries the corrected shape.
- 6d. THE READER DELEGATES AND THE RECORD MUST SAY SO. Where a step is handed to a stronger hand, the work is that hand's whether it files it directly or hands it back through the walker. `req-every-call-records-the-part-its-caller-played`.
- 6b. The reader wants a STRONGER hand than named. It takes it and owes nothing.
- 6c. The reader wants a WEAKER one. It owes a recorded reason, and today nothing checks that the reason is there — `raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it`.

## Restated at gate-candidates, 2026-08-20 — the mechanism entered the spec here

WHAT THIS CASE USED TO SAY, in its own steps:

- step 2: the complexity is read "live from the matrix, and never from a pin"
- step 3: "It takes the MAXIMUM over those rows"
- step 4: it looks the rung up "in the fixed list, which is one file in the
  repository and the same file on every host"
- step 5: "It puts the model name on the pull"
- the precondition: "one model list stands in the repository"
- the guarantee: "the milestone publishes a model name a receiver can act on"

EVERY ONE OF THOSE IS A MECHANISM, and together they are the seed's design
written out as a pass. This state's job is to GENERALIZE from the story. It
copied the story.

WHAT IT COST, MEASURED RATHER THAN ARGUED. Five requirements were derived
faithfully from these steps and every one of them named a mechanism as a result.
M4 then enumerated twenty-nine options from seven finders, composed four
candidate lines, and every line on the resulting chart violated at least one of
those five. The design space was excluded before anybody compared anything.

THE REQUIREMENTS WERE RESTATED FIRST AND THIS NODE WAS NOT. For most of a day
five musts named outcomes while every one of them cited a step here that
mandated the mechanism it had dropped — `req-the-complexity-value-is-read-live-and-never-pinned`
citing "step 2" being the sharpest, because step 2 said "never from a pin" and
the restatement exists to permit exactly that. A fifth cold pass found it.

## What the restatement keeps and what it releases

KEPT, BECAUSE IT IS THE POINT OF THE CASE: the machine names the hand its own
work needs, at a milestone boundary, before anything is spawned; it publishes and
starts nothing; the party reading it acts or does not; and the walk records what
answered, in which state, and which hand it was.

RELEASED: where the complexity is read from and when, how a milestone's rows are
reduced to one figure, what holds the mapping from difficulty to hand, and
whether what is published is a model name or a class.

WHAT IS NOT RELEASED AND IS NOT THIS NODE'S TO RELEASE. The owner ruled ONE FIXED
LIST mapping rung to model name, identical everywhere, maintained by hand, and
rejected per-host resolution. THAT RULING STANDS. It is recorded on
`raid-asm-one-model-list-serves-every-host-the-engine-supports` and it is the
owner's, not the spec's.

WHAT CHANGED IS WHERE IT LIVES. A ruling is an input to a design choice. A
guarantee in a use case is an obligation on every design. Writing the ruling into
the guarantee made M4's search a formality, and this record spent two milestones
discovering that.

SO A DESIGN THAT PUBLISHES A CLASS RATHER THAN A MODEL NAME NOW CLEARS THIS CASE
AND STILL OWES THE OWNER AN ARGUMENT. That is the honest position: the spec stops
deciding it, and the record still has to say plainly that the leading design does
not serve the kickoff's second goal.

## What this use case is not

IT IS NOT A ROUTER. Nothing predicts, nothing scores, nothing learns. The same milestone names the same driver every time, which is the whole trade: fitness given up for reproducibility, with the drift registered rather than denied.

IT DOES NOT SPAWN. Step 5 ends the machine's part. That line is the lane's grain, the same one that keeps pushing and opening records outside.
