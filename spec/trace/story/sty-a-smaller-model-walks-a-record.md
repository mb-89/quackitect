---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: sty-a-smaller-model-walks-a-record
type: "[[story]]"
statement: An engineer sends a night's work to a cloud box on a cheap model, and wakes up to signed states rather than to a transcript of an agent failing to understand its own instructions.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: must
---

## Deck

An engineer has a day's work queued and a token budget that will not cover it on the strongest model. They send it to a cloud box on a small one instead.
|||
The sum that forces the choice: a cloud session is billed by the token, and the strong model's price is what caps how much work gets sent at all.

---

The agent boots. It is handed one document at a time and asked three questions about each to prove it read them.
|||
MEASURED, first run: one document came back twice. The instruction said to quote the document's last words; the engine had asked for four words following a phrase. The agent answered what the instruction described and was refused.

---

It reaches the front desk, recites the rules, and takes the door to the record it was sent for.
|||
MEASURED, first run: it stopped there and waited for a word it was already holding. Nobody was beside the box to send it.

---

It fills the kickoff gate's evidence, submits it, and the gate signs.
|||
MEASURED, first run: the gate signed. Then every pull answered with the same form again, and nothing in the answer said the bless was what remained. The agent inferred it, spent calls confirming, and stopped.

---

IT IS NOT HANDED EVERY PIECE OF WORK. Each work token carries how hard it is,
and a cheap hand is given the ones it can carry. The harder ones wait for a
stronger hand rather than being attempted badly.
|||
Added by i63. Difficulty stops being an estimate and becomes a routing key: it
says which strength of hand takes the work, which is the one idea in this
design that no surveyed system covers, because human teams never routed work
to less capable people out loud.

---

It meets one that is beyond it. It does not guess. It raises the difficulty on
that work token and leaves it for a stronger hand, and the raise is a recorded
act rather than a silent skip.
|||
EMPTY UNTIL M8. The honest limit is in the register: the hand least able to
notice it is out of its depth is the hand asked to notice.

---

It walks on into the milestone, and the states below sign one after another.
|||
THIS IS THE SLIDE THAT DOES NOT FILL YET. On the first run the walk ended at the gate. What the record shows is boot, a routing, and one gate.

---

The engineer reads the record in the morning: what was built, what was signed, and what waits on their thumb.
|||
Owed at validation.

## Unlike

[[sty-send-an-agent-to-a-cloud-box]] is about the box reaching the lane at
all. This story starts after that has worked and asks a different question:
the lane is up, the agent is caged, and the agent is not clever enough to
guess what the machine meant.

[[sty-a-finding-outlives-the-box-that-found-it]] shares the unattended
setting and asks that what the agent LEARNED survive. This one asks that the
agent get far enough to learn anything.

## What the evidence side is for

EVERY MEASURED SLIDE ABOVE IS A GUIDANCE DEFECT, NOT A MODEL DEFECT. Each one
is a place where the machine's own words described something the engine does
not do. A capable model reads past all three, which is why they stood for
weeks. That is the whole argument for this story existing: THE DEFECTS ARE
INVISIBLE UNTIL A SMALLER MODEL IS POINTED AT THEM.
