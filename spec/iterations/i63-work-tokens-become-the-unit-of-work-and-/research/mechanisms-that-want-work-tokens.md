---
id: i63-token-sweep
type: research
statement: Which mechanisms in the system still carry outstanding work in a private shape, and which are right as they are.
---

# The sweep — what should become a work token, and what should not

Six mechanisms still model outstanding work without a token. Four of them
should move. Two should not, and one of the four is already opened.

Every claim below cites the file it was read from.

## The verdict, in one table

| mechanism | where the work lives now | should it move |
| --- | --- | --- |
| the decision graph | a checklist in the call payload | YES |
| gate round findings | prose inside a form field | YES |
| battery findings | a generated list in one run result | YES |
| register issues and debts | a node with a trigger, no place | YES |
| unwalked fan legs | one sentence in one pull answer | YES, and it is the cheapest |
| the recheck mark | the claim's own frontmatter | NO |
| entry and exit conditions | the state declaration | NO |

ALL FIVE MOVERS ARE THIS ITERATION'S WORK, on the owner's ruling: a finding
needed for the system to be complete is worked here rather than parked.

They stand as open tokens at `iterations/i63/fix-findings`.

## What already moved, so the baseline is clear

Minting on entry already turns three things into tokens.

- THE READING a state demands, one token per document.
- THE MARKED STEPS of its method card, one token per marked heading.
- THE EVIDENCE FIELDS it must produce, one token per required field.

A state that can write also owes the trace chain above what it builds, and
that becomes reading tokens too.

Source: `deliverable/engine/workmint.ts` lines 150 to 161, and `readingFor`
at line 133.

So the sweep is not about those. It is about what mint-on-entry never sees.

## 1. The decision graph — two systems saying what the hand is doing

WHAT IT IS. Every lane call may carry `update: {op: "plan" | "fork" | "done" |
"obsolete" | "revert" | "defer" | "update"}`. A `plan` starts a checklist and
`done` ticks items off.

WHERE IT LIVES. In the call payload, and in a graph the engine keeps beside
the work store.

WHAT IT COSTS. Two mechanisms answer the same question. The tokens say what is
being done now; the checklist says what the whole state's work is. A reader
watching the board must read both to know either.

The guidance already concedes the overlap. It says the engine never asks for a
checklist, and that a checklist is the one thing the graph buys
(`guidance/walking.md`, section "The update field still works, and nothing
demands it").

WHAT A TOKEN WOULD CARRY. Sub-tokens under a parent give the same checklist,
on the surface the person already reads. The owner has asked for sub-tokens
with a collapsible preview, so the vehicle is coming anyway.

STATUS. Open as "Tokens replace the graph", at this state.

## 2. Gate round findings — named accurately, then abandoned

WHAT IT IS. Every gate runs four review rounds. Round two lists what is
missing, wrong or out of scope. Round four red-teams and may record an
override with its dissent. The verdict may be REOPEN, with named states and
reasons.

Source: `deliverable/machines/methods/meth-review-rounds.md` lines 37, 88 and
106 to 109.

WHERE IT LIVES. Prose inside the gate's evidence form.

WHAT IT COSTS. A finding written into a form field has no place, no status and
no settle. Nothing routes it to the state that would fix it. Nothing says
afterwards whether it was fixed or forgotten.

THIS IS THE FAILURE THE CONTRACT NAMES. Rule 5 calls it out by name: the
defect gets named accurately, in the right place, with the right severity, and
then the work continues past it as though naming were fixing.

The mechanism currently makes that failure the default.

WHAT A TOKEN WOULD CARRY. One token per finding, opened at the state that
fixes it, with the gate as its source. The gate's own verdict field then
references token ids rather than restating them. A gate cannot be left with
its findings standing open, because the state holds shut until its tokens
settle.

## 3. Battery findings — the repair state keeps no account of its repairs

WHAT IT IS. `fix-findings` is the state whose whole job is fixing what the
test battery found.

WHERE IT LIVES. Nowhere durable. The row says so in as many words: "NO
EVIDENCE OF ITS OWN. The findings ARE the red verifications — a generated
list, nothing anyone answers here."

Source: `deliverable/machines/rigor_matrix/rows/M7_60_fix-findings.md` lines
64 to 66.

WHAT IT COSTS. The confirm run holds the state, so the walk cannot leave red.
That is a real hold and it works.

What it cannot tell anybody is HOW each red went green. A test deleted, a test
weakened and a bug actually fixed all produce the same green.

WHAT A TOKEN WOULD CARRY. One token per failing test, minted from the run
result, settled with the comment saying what was done. The settle comments are
then the findings-and-fixes list the row's specification note already asks for
at line 56.

THE COST IS HONEST TO STATE. A battery with forty reds mints forty tokens. The
token model is built for that volume, and the pen already draws a hundred and
fifty at the backlog without trouble.

## 4. Register issues and debts — the graveyard the method predicted

WHAT IT IS. The register holds risks, assumptions, issues, dependencies,
decisions and debts, each as a node in `spec/trace/raid/`.

Two of those kinds are work by their own definition.

- An ISSUE "has happened, hurts now".
- A DEBT is "a shortcut taken knowingly, cost deferred", and it compounds.

Source: `deliverable/machines/methods/meth-raid.md` lines 48 and 51.

WHERE IT LIVES. A durable node with an owner role and a trigger. That is
better than a table row, and the method is right about why.

WHAT IT COSTS. The node has no place, no status and no settle. The method
already names the failure mode: "An entry with no trigger is filed, not
watched, and the register becomes a graveyard the first time nobody re-reads
it" (lines 33 to 35).

The trigger is meant to be the live part. Nothing mechanical reads it.

WHAT A TOKEN WOULD CARRY. The trigger IS a re-entry condition, and the pool
token already has that field: `ready_when`. An issue or a debt could mint a
pool token whose `ready_when` is its trigger, so the one inbox surfaces it
when the trigger fires.

WHAT NOT TO DO. Do not turn the whole register into tokens. A risk that has
not happened is not work. An assumption you are relying on is not work. A
decision can only be superseded.

THE ASSUMPTION PROBE IS THE EDGE CASE. A probe is a piece of work somebody
runs. Whether it is a token or stays a field of its assumption is a judgment I
am not making here.

## 5. Unwalked fan legs — recorded once, in an answer nobody keeps

WHAT IT IS. Where the road splits and work fans out, the engine walks one leg
and reports the rest.

The answer says: "one agent is walking, so only the first choice was taken —
the others are yours to hand out."

Source: `deliverable/engine/session.ts` line 2841.

WHERE IT LIVES. In that one pull answer. Nothing writes it down.

WHAT IT COSTS. The call log caps every response except a shell run at about
five hundred characters, so the list is not even recoverable from the log.
Work that was explicitly offered and explicitly not taken leaves no mark at
all.

WHAT A TOKEN WOULD CARRY. One token per unwalked leg, opened at that leg's own
state, saying it was offered and not taken.

THIS IS THE CHEAPEST OF THE FIVE. It is one call at one site, and it turns a
sentence that scrolls past into a row on the board.

## 6. What should stay as it is

Two mechanisms look like candidates and are not. Saying so is part of the
sweep.

### The recheck mark

It is derived from the claim's own frontmatter — `recheck:
reopenedAfterSigning(fmData)` at `deliverable/engine/sessionclaims.ts` line
519.

It already has everything a token would add. It has a place, which is the
state. It blocks. It settles, and the settle is the resubmit.

A token beside it would count one thing twice.

### Entry and exit conditions

A condition already holds its state shut and carries an executable remedy.

Making conditions into tokens would also double-count: mint-on-entry already
mints the reading and the evidence, which is what most conditions are about.

## What this sweep did not settle

THE ROUTING IS RULED. All five are worked in this iteration.

THE RETRO'S OWN ROUTING is already noted separately, on the owner's
instruction, and is not re-argued here.

THE GATE-AGAINST-GIT-DELTAS mechanism is also already noted, and belongs to
the round that moves deltas onto version control.

## Why the shape repeats

All four movers share one shape.

A mechanism NAMES work accurately, in a place that suits its own purpose, and
then has no way to say the work was done.

The register says it best against itself. Filed, not watched.

A token is the opposite bargain. It is worse at describing a thing, because
four words name it. It is better at the only question that matters afterwards:
is this done, and who did it.
