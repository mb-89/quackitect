---
form: identify-assumptions
amended: 2026-08-16T06:51:31.505Z by agent — Four register entries were deleted after this form signed, on the owner's ruling that the claim system goes everywhere it ripples. Neither assumption this state…
by: agent
signed_off: 2026-08-16T05:58:21.679Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

i34 stands at identify-assumptions, the last owed leg of the gate-requirements join.

THE INPUT IS THE REGISTER WRITTEN TWO STATES AGO, not memory. Four new requirements, each swept against the six sources.

TWO ASSUMPTIONS STAND FOR THIS DELTA. One was opened at log-risks because it gates the migration and could not wait. One is new, and it is the one the whole model rests on.

## assumptions

- raid-asm-a-record-folder-is-addressed-only-from-inside-itself
- raid-asm-only-one-agent-works-a-clone-at-a-time

## sweep

- environment: ONE FOUND, and it is the load-bearing one. The whole design assumes only one agent works a clone at a time — raid-asm-only-one-agent-works-a-clone-at-a-time. i34 removes the only mechanism that made two trees on one machine possible, so if this is wrong the way back is two clones rather than worktrees. The owner has stated it holds; nobody has probed what happens when a background worker wants its own tree, and satellite.ts and supervisor.ts both exist today.
- toolchain: NONE, and the reason is that nothing new is depended on. i34 uses git verbs the engine already runs every day — branch listing, add, commit, merge — and REMOVES the exotic ones, `worktree add` and `worktree remove`. A change that deletes its own dependencies adds no toolchain assumption.
- host: ONE FOUND AND IT IS NOT AN ASSUMPTION. The belief that a reload makes engine changes visible was tested today and FAILED: entering a freshly seeded iteration crashed three times against a stale engine. That is present tense, so it is an issue and it is filed as one — raid-iss-a-blocked-walk-can-kill-the-connection-instead-of-refusing. Recording an observed failure as an assumption would hide that it already bit.
- platform: NONE FOR THIS DELTA, stated with its reason rather than left blank. The POSIX path is unexercised across this whole engine (exp-the-posix-branches-have-never-run), and that stands whatever i34 does. What i34 changes is git verbs and path joins, both of which the engine already runs identically on both families. It neither adds a platform assumption nor discharges the standing one.
- neighbours: NONE, and it was checked rather than waved. The only neighbour this delta touches is the git host, because closed records now stay in the working tree forever. GitHub's own guidance is "ideally less than 1 GB" (docs.github.com, read 2026-08-16) and the repository is 26.63 MiB repacked with the spec tree at 2,138,305 bytes. Three orders of magnitude of headroom is not an assumption.
- people: NONE BEYOND THE ENVIRONMENT ONE, which already carries it. The people question here is whether anyone needs machine-to-machine travel, and that is not assumed — it is decided, on raid-dec-one-tree-beats-a-record-travelling-between-machines, with what it costs written on the node. A decision is not an assumption, and filing it twice would pad the register.

## follow_up

- BOTH ASSUMPTIONS CARRY A WRITTEN PROBE, because an assumption whose probe cannot be written is a worry rather than an assumption.
- THE FOLDER PROBE RAN AND CAME BACK FALSE. ModelFileSystem.stamp at engine/model-fs.ts:29-35 derives a record id from the worktree directory name to write minted_in, which is a reader outside every record folder using a worktree path. Per meth-raid a falsified assumption becomes an ISSUE, and gate-requirements ruled that change of kind.
- THE ONE-AGENT PROBE RAN AND HOLDS ON BOTH HALVES. The intent half on the owner's words; the code half by searching satellite.ts, supervisor.ts, core.ts and channel.ts for a spawn, fork or cwd naming a worktree — five hits, none starting a worker in its own tree.
- AMENDED 2026-08-16. The register moved under this form after it signed: the owner ruled the claim system out everywhere it ripples, and four register entries went with it — raid-dec-claim-rides-the-claims-branch, raid-debt-claim-pool-surfaces, raid-asm-remote-serializes-claims and raid-asm-owner-pushes-keep-remote-fresh. Neither assumption this state opened was among them.

## anything_else

WHY ONLY TWO, WHEN THE SWEEP HAS SIX SOURCES. Four sources honestly turned up nothing, and each says why rather than saying none. That is the shape the method asks for: a nil answer is cheap given once and expensive given per source with a reason.

ONE SOURCE TURNED UP SOMETHING THAT IS NOT AN ASSUMPTION, and getting that right mattered. The reload belief failed today in front of me. The method warns about exactly this — recording an observed failure as an assumption hides that it already bit — and cites 2026-08-07 as the day it was got wrong. It is an issue, filed as one.
