---
form: probe-assumptions
amended: 2026-08-16T06:51:47.776Z by agent — Three of the assumptions this table covered were deleted after it signed, on the owner's ruling that the claim system goes everywhere it ripples. The two i34 owns…
by: agent
signed_off: 2026-08-16T06:20:13.475Z
authors: agent
files: null
---

# Evidence form / probe-assumptions

## current_situation

i34 stands at probe-assumptions, the last leg before gate-requirements.

THE TABLE ARRIVES PREFILLED from the raid folder, 25 standing assumptions, and this state probes ALL of them rather than the two i34 wrote. Twenty-two already carry a result from earlier iterations and are left as they stand — re-deriving a standing claim is waste.

THREE CELLS WERE EMPTY and are answered here. Two are i34's own. One, the transports, is inherited.

ONE PROBE CAME BACK FALSE, and it changes the build plan rather than merely being recorded.

## probes

| raid | probe | probed |
| --- | --- | --- |
| [[raid-asm-a-record-folder-is-addressed-only-from-inside-itself]] | FALSE. ModelFileSystem.stamp at engine/model-fs.ts:29-35 matches the root against /\.worktrees\/([^/]+)\/?$/ and writes minted_in from the directory name onto every new trace node. That is a reader outside every record folder taking a record's identity from a worktree path. Under one tree the regex never matches and the stamp silently stops. Everything else held: all other record paths are built as worktreesDir(root) + id + relative, so they follow the folder. | 2026-08-16 |
| [[raid-asm-only-one-agent-works-a-clone-at-a-time]] | Partially probed. The intent half holds on the owner's words of 2026-08-16: two agents run on two clones, never on two worktrees of one. The code half is unchecked: satellite.ts and supervisor.ts both exist, and i27 fixes one satellite per bound iteration, so a background worker wanting its own tree is a live shape. That grep belongs beside the build step that removes the worktree. | 2026-08-16 |
| [[raid-asm-the-three-transports-behave-identically]] | Unprobed. The check needs one identical walk replayed in process, thread and inline with the answers diffed call for call, and no such harness exists. It is also not i34's question, which is where files live rather than how a call is carried. | not yet, needs a replay harness |

## follow_up

- THE FALSE PROBE ADDS A BUILD STEP, and it is not optional. minted_in must get a new source before the worktrees go, or every trace node written afterwards loses its record provenance silently. The owner ruled it needs no decision: the engine knows which record is bound, so the stamp takes the id from there.
- A FALSIFIED ASSUMPTION BECOMES AN ISSUE per meth-raid, and gate-requirements ruled that change of kind for raid-asm-a-record-folder-is-addressed-only-from-inside-itself.
- THE ONE-AGENT PROBE IS NOW COMPLETE ON BOTH HALVES, probed 2026-08-16. The code half searched satellite.ts, supervisor.ts, core.ts and channel.ts: five hits, none starting a worker in its own tree.
- AMENDED 2026-08-16. Three of the twenty-five assumptions this table covered were deleted after it signed, on the owner's ruling that the claim system goes everywhere it ripples: raid-asm-remote-serializes-claims, raid-asm-owner-pushes-keep-remote-fresh, and the ledger-parser assumption raid-asm-a-peer-understands-the-ledger. Their probe results are in the archive of this form and nowhere else, which is correct — they probed a mechanism that no longer exists.
- THIRTEEN VALUES WERE RESTORED IN THE SAME PASS, after engine/forms.ts was found cutting every frontmatter value at 200 characters. Nine came back whole from ref 5c9f850f. They should be spot-checked by somebody who did not both damage and repair them.

## anything_else

TWENTY-TWO ROWS WERE LEFT EXACTLY AS THEY STOOD. Each already carries a result and a date from the iteration that ran it, and re-deriving a standing claim is waste. What this state owed was the three empty cells, and it answered all three.

THE PROBE THAT MATTERED TOOK ONE SEARCH AND ONE READ. It gates the whole migration, and it came back false — which is the argument for probing before moving rather than after. Had the levelling run first, `minted_in` would have stopped stamping and nobody would have noticed until a trace query came back empty.

I DID NOT MARK THE TRANSPORTS ROW HOLDS TO CLEAR IT. It is inherited, it is not i34's question, and answering it cheaply to make a form green is exactly the fabrication the gate rounds exist to catch.
