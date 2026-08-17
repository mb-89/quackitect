---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: uc-arrive-on-an-unattended-machine
type: "[[use-case]]"
statement: Take a fresh checkout on a machine nobody is watching to a caged agent standing on a live lane.
actor: stk-engineer-driving-agents
trigger: a session starts on a clone that has no lane
precondition: the clone carries the repository and a runtime; nothing else is assumed
guarantee: either the agent stands on a caged lane and knows how to call it, or it is told plainly what failed and is left with its native tools and the card
refines:
  - sty-send-an-agent-to-a-cloud-box
priority: must
---

## Main scenario

1. The session starts. The host reads the committed root settings and fires the arrival hook before the agent reads anything.
2. The arrival fetches every ref and creates the local branches the corpus cites, so `ref: main` and `ref: v2` resolve.
3. It checks the running runtime against the pin the project declares, reading the declaration rather than carrying a copy of it.
4. It installs the project's dependencies, unless they are already there.
5. It places the cage and the lane config from their templates.
6. It starts the lane headless, so an agent that already exists can attach rather than be launched.
7. It writes a lane client into `.se/`, so an agent with no `se_` tools can still make a call.
8. The agent's first act is `se_pull` with no payload, and the machine takes it from there.

## Extensions

- 1a. The arrival has already run in this session. Every step reports what it found and nothing is done twice; the lane already answering is reused rather than duplicated.
- 1b. The host is a developer's own machine, where the editor places the cage. `SE_NO_ARRIVE=1` skips the whole thing, loudly.
- 2a. The remote is unreachable. The arrival says so and carries on — a failed fetch degrades `ref:` searches and stops nothing else.
- 2b. The clone is shallow and carries one branch. The fetch and the local branch together repair it; the fetch alone does not, because a remote-tracking ref is not a revision.
- 3a. The runtime is below the pin. The arrival STOPS and names the pin and the running version. It never edits the declaration to pass, because that turns a loud failure into a silent one.
- 5a. A cage template is missing. The arrival stops rather than starting a lane that would not be a cage.
- 6a. The lane does not answer within a minute. The arrival says which port it waited on and stops.
- 8a. The pull answers `wait` because the step ahead outweighs the dial. The agent says which step waits and stops; nobody is there to move it, and the dial is the owner's.
- Any step failing: the hook prints what happened and exits 0. A hook that breaks a session start is worse than the hand-work it saves.

## Why the guarantee is two-sided

AN ARRIVAL THAT FAILS MUST NOT LOOK LIKE ONE THAT SUCCEEDED. The dangerous
shape is an agent holding native tools believing it is caged, so the failed
branch of the guarantee is stated as loudly as the successful one: it is told
what failed, and it is told to read the card.
