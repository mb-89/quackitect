---
id: i2-parallel-iterations-across-machines-seed
status: seeded
opened: 2026-08-11T15:21:26.396Z
goal: "Parallel iterations across machines: seeds live on git, a claim marks who works what, and the backlog cuts into maximally independent iterations."
vision: "Owner rulings 2026-08-11, carried in verbatim where they bind.\n\n- Seeding an iteration puts the STUB on git - the kickoff and its gate only. \"Git knows this iteration exists. It doesn't necessarily know that it's worked on, but it has to know that it exists.\"\n- A CLAIM is a small git-visible mark an agent takes before walking. \"We push that claim up to Git, not the complete work tree.\" A claimed iteration is not claimed again by another agent.\n- ONE AGENT PER MACHINE for now - two agents on one machine is explicitly deferred.\n- After the mechanism stands, the backlog seeds into roughly ten iterations, cut for minimal cross-dependence. Iterations may depend on each other; the cut minimizes it so machines work in parallel.\n\nDesign round FIRST, with the owner: the kinds of parallelism we distinguish; where the claim lives (a claims file on the shared branch, or a refs namespace); the claim race as the lock (first push wins, the loser re-fetches and picks another); how dependency edges gate claiming (claimable only when dependencies shipped); and the SE-C-003 ruling - the ENGINE pushing the claim ref as a machinery act while the agent still never pushes work.\n\nInputs: the parked backlog (184 notes, the engine leads among them), the i1 close machinery as the pattern for engine-owned git acts, and the recorded answers of 2026-08-11."
inputs:
---

# i2-parallel-iterations-across-machines-seed

## Goal

Parallel iterations across machines: seeds live on git, a claim marks who works what, and the backlog cuts into maximally independent iterations.

## Rough vision

Owner rulings 2026-08-11, carried in verbatim where they bind.

- Seeding an iteration puts the STUB on git - the kickoff and its gate only. "Git knows this iteration exists. It doesn't necessarily know that it's worked on, but it has to know that it exists."
- A CLAIM is a small git-visible mark an agent takes before walking. "We push that claim up to Git, not the complete work tree." A claimed iteration is not claimed again by another agent.
- ONE AGENT PER MACHINE for now - two agents on one machine is explicitly deferred.
- After the mechanism stands, the backlog seeds into roughly ten iterations, cut for minimal cross-dependence. Iterations may depend on each other; the cut minimizes it so machines work in parallel.

Design round FIRST, with the owner: the kinds of parallelism we distinguish; where the claim lives (a claims file on the shared branch, or a refs namespace); the claim race as the lock (first push wins, the loser re-fetches and picks another); how dependency edges gate claiming (claimable only when dependencies shipped); and the SE-C-003 ruling - the ENGINE pushing the claim ref as a machinery act while the agent still never pushes work.

Inputs: the parked backlog (184 notes, the engine leads among them), the i1 close machinery as the pattern for engine-owned git acts, and the recorded answers of 2026-08-11.
