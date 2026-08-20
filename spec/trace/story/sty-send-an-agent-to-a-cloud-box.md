---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: sty-send-an-agent-to-a-cloud-box
type: "[[story]]"
statement: An engineer sends an agent to a machine nobody is watching, and it is working on the record within the minute rather than on its own setup.
actor: stk-engineer-driving-agents
refines:
  - vp-autonomy-range
  - vp-autonomy-range
priority: must
---

## Deck

An engineer has an iteration seeded and a cloud box available. They send the agent at it and go and do something else.
|||
THIS IS THE COMMON CASE AND IT IS NAMED IN THE GUIDANCE AS ARRIVAL A: a chat session with a checkout, where nobody ran a command. The card that describes it has existed since i28.

---

The agent wakes up with a checkout and no lane. `.mcp.json` is not in git, so the tools the contract says it must work through do not exist yet.
|||
AND IT CANNOT FIX THAT BY ASKING. A cage placed after a session starts does not bind it, and the same is true of the MCP registry — the server list was read before the agent existed. Measured on this harness, 2026-08-17.

---

Before this story, it read a card and did five acts by hand.
|||
MEASURED, i15 on 2026-08-16 and i35 on 2026-08-17: most of an hour before the first `se_pull`. A runtime below the pin. An install. A shallow clone carrying neither `main` nor `v2`, so every record citing `ref: main` was dead. A cage to place. And finally a JSON-RPC client written from scratch, because there was no other way to reach the lane at all.

---

Now the session-start hook has already run before the agent reads anything, and the agent's first act is its first `se_pull`.
|||
`se-arrive.ts` does the five acts and writes `.se/se-call.mjs` so the client is never hand-rolled again. It is idempotent: a second run reuses the lane already answering. Every ending is a printed line and exit 0, so an arrival that fails costs a message rather than the session.

---

The refs the corpus cites resolve, so the agent can read what v1 and v2 did.
|||
BOTH HALVES ARE NEEDED AND THE SECOND IS THE ONE PEOPLE SKIP. Measured: after `git fetch --all --prune` alone, a search at `ref: main` still answered `unknown revision`, because a remote-tracking ref is not a revision named `main`. After `git branch main origin/main` it returned real matches.

---

The engineer comes back to a walk that stopped where their hand was actually needed.
|||
NOT MET YET, AND THIS SLIDE IS THE OPEN ONE. At the default dial the walk stops at `gate-kickoff` — the first gate of every iteration — because entering it is tactical and the default is operational. The arrival is mechanical; the dial is a configuration the owner sets, and until they do, "walk away" means "walk away until M0".

## Unlike

[[sty-hand-over-and-walk-away]] starts where this one ends. It assumes an agent
that is already walking and asks where it stops; this one asks whether it ever
started. The two failed differently on the same run: the walk stopped at a gate,
which the log showed, and the arrival cost an hour, which nothing recorded at all.
