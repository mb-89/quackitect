---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: sty-watch-the-machine-think
type: "[[story]]"
statement: When the agent is working, I want to see which piece it is on and how it broke the job down, so I understand what the machine is doing without interrupting it.
actor: stk-engineer-driving-agents
refines:
  - vp-the-engine
priority: must
---

## Deck

I cannot tell what the agent is doing right now. It is somewhere in a state,
working on something, and the only signals are a checklist it maintains by
hand and whatever it happens to say in chat. Silence looks the same as
stuck.
|||
THE OWNER HIT THIS TONIGHT AND SAID SO: "I don't see what you're working on
because you're not working on any token. What's up?" A token WAS in hand. It
sat at the backlog, which is not a position, so the board drew nothing and the
work read as silence.

---

The machine is on screen and a state is active. Its counts tell me five
things are owed there. They do not tell me which one the agent has in its
hands, or whether it has hands on anything at all.
|||
THE COUNTS ARE SERVED AND CORRECT. Five states carried `open` early this
evening and `fix-findings` did not, which was the tell that its four tokens
were parked at the backlog rather than at the position.

THE SCREEN WAS NOT LOOKED AT. The same fact was read as text through
`se_surface`; whether it reads at a glance is the owner's judgment.

---

The agent starts on a piece. That piece is now in work, and it says so on
its own face. One row in the table, one marker on the state, and I know
where the machine is.
|||
OBSERVED. Nine tokens were taken tonight, and a take writes the hand onto the
item before that hand acts. SE-C-152 refuses a second take and names the hand
already holding it, so two hands on one piece is visible rather than silent.

---

The piece is bigger than it looked. Rather than working it silently, the
agent breaks it into three children beneath it and starts on the first.
|||
OBSERVED IN ITS HONEST FORM, WHICH IS TWO RATHER THAN THREE. The write-count
fix turned out to be bigger than it looked: the first build was inert. Rather
than quietly patching, a second token was opened for the defect with its own
statement and comment, and the split is readable as two objects.

SUB-TOKENS AS A NESTED SHAPE were not exercised. The break was two siblings,
not a parent with children.

---

Those three children are the agent's reasoning, made into objects. I can
read how it decided to split the job without asking it and without reading
a transcript.
|||
PARTLY OBSERVED. The reasoning IS readable from the objects: the second token's
own words say the count was captured before the verdict's write and was stale
by exactly one. Nobody had to read a transcript to know that.

WHAT IS NOT PROVEN is that this holds for a job split many ways. One split of
two is a thin sample.

---

Each child opens and closes with an entry in the log. The trail is written
by the work itself rather than typed alongside it, so it cannot drift from
what happened.
|||
OBSERVED, AND BUILT TONIGHT TO THE OWNER'S RULING: "I wanna see the name of the
token you finished and your comment in the log." The feed now prints
`finished "<the name>" — <the comment>`, reading the ANSWER rather than the
arguments, because neither the name nor the comment is in what a settle sends.

Seven cases pin it in `deliverable/tests/tokens-speak.test.ts`.

ONE KNOWN LIMIT: the feed brief is capped at 90 characters, so a long comment
is cut. The name always survives.

---

The children are ephemeral. When the state completes they are gone, and
what survives is the evidence they produced. The parent piece carries the
result.
|||
OBSERVED. Every token opened tonight carried `lifetime: state`, and a completed
state clears its ephemeral work while the evidence stays. The four tokens
reopened this morning were ephemeral in exactly this way, which is why moving
them to the position was what made them visible at all.

---

I watched the machine think. I know what it is on, how it chose to break the
work down, and when each part landed — from the work itself rather than from
a second structure somebody had to remember to update.
|||
THE SECOND STRUCTURE IS GONE, AND THAT IS THE STRONGEST PART OF THIS SLIDE.
The decision graph came out this iteration on the owner's ruling, with three
clauses retired. There is nothing left to keep up to date beside the tokens.

THE WATCHING ITSELF WAS DONE BY THE OWNER, NOT BY ME. Twice tonight they read
the board and corrected the walk from it — once because a settle said "finished
unbuilt and carried" and they could not tell whether anything was fixed, once
because the board showed no work in hand while work was in hand. Both
corrections came from the trail rather than from asking.
