---
form: arm-the-rest
by: agent
signed_off: 2026-08-28T11:44:43.403Z
authors: agent
files:
---

# Evidence form / arm-the-rest

## current_situation

All five corpus checks are wired into the sweep and the sweep is green.

The run reads 2,595 nodes under `spec` in 1,204 milliseconds and exits 0. Eleven work-token notes print; no finding does.

The token check reports and never fails, which is a difference in the sweep's own shape rather than a setting.

## built

### What is armed now

| check | class before i44 | now | armed as |
| --- | --- | --- | --- |
| duplicate heading | 27 | 0 | finding |
| dead lane verb | 2 | 0 | finding |
| stale citation | 35 | 0 | finding |
| dangling reference | 131 | 0 | finding |
| unreferenced work token | 11 | 11 | report |

### The sweep grew a second channel

`SweepResult` now carries `reports` beside `findings`. A report prints on every run, green or red, and never touches the exit code.

WHY THE CHANNEL EXISTS RATHER THAN A FLAG. `req-a-work-token-nothing-references-is-reported` says the check reports and does not refuse, and the tokens-triaged chunk measured why: eleven of eleven unreferenced tokens are healthy and waiting.

A BACKLOG TOKEN IS UNREFERENCED BY CONSTRUCTION. It is minted into the pool precisely because nothing points at it yet. Arming that as a failure would turn the sweep red on the day any retro mints one.

### Where each check sits

- `textFindings` in `deliverable/engine/sweep.ts` runs the four per-node checks, all behind `isNode`.
- The citation and reference checks run on every node; the dead-verb check narrows further to `/use-case/` and `/story/` through `teaches`.
- `sweepCorpus` calls `unreferencedTokens` once, after the file loop, because the token question is a whole-pool anti-join with no single node to hang off.
- `deliverable/engine/bin/sweep.ts` prints the reports before deciding green or red.

### One import crosses a seam

`sweep.ts` now imports `danglingReferences` from `guard.ts`. The design spec already said this would happen: the reference sweep is not new code, and the work was running it from the corpus sweep rather than only at the write.

### The order was the mitigation

EVERY CLASS WAS EMPTIED BEFORE ITS CHECK WAS ARMED, which is what `raid-risk-arming-the-reference-sweep-turns-every-boot-red` asked for. Nothing here was made to pass by loosening a check.

## follow_up

### For verification

RUN THE SWEEP ON A TREE THAT STILL HAS A BREAK. Every class reads zero today, so a green sweep proves the checks are wired but not that they still catch anything. The classifier cases in `deliverable/tests/corpus-sweeps.test.ts` are what carry that proof.

### For the validation gate

THE COST IS 1,204 MILLISECONDS OVER 2,595 NODES. `raid-asm-the-corpus-stays-small-enough-for-the-sweeps-to-fit-in-boot` is the assumption that number probes, and the sweep prints it on every run so it cannot drift unnoticed.

### Still owed, and not this chunk's

THE PROMPT LAYER IS STALE and the preflight is red on it. i44 edited `guidance/contract.md` and `guidance/method/cloud-runner.md`, and the verb that refreshes the projection is illegal inside a build chunk. It clears at a state that allows `se_prompt_place`.

THE OWNER HAS RULED THAT VERB SHOULD NOT EXIST. Projection is to be declared in a file and fired by the engine when it sees the edit. That is a note now and a work token at the retro.

## anything_else

