---
minted_in: i37-training-iterations-a-disposable-iterati
id: exp-does-the-current-engine-run-against-a-rewound-tree
type: "[[experiment]]"
statement: "Does the current engine boot and answer against a tree rewound to the commit before an archived iteration started?"
probes:
  - raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine
  - raid-asm-a-rewound-tree-carries-none-of-the-answers-the-walk-must-derive
timebox: "minutes — boot it and call se_pull once"
form: skeleton
faked: "no walk was driven. The lane was booted and asked for one pull; nothing was filled and no state was signed."
fallback: "pre-agreed before the run: if the engine cannot run against a rewound tree, the whole rewind mechanism needs a different shape and M4 reopens."
folds_to: "raid-dec-a-benchmark-rewinds-content-and-never-the-machine and el-benchmark-binding — the rewind is a three-way split"
promote: "rewound spec, today's machines and guidance, history bounded"
verdict: holds
source_refs:
  - el-benchmark-binding
  - raid-dec-a-benchmark-rewinds-content-and-never-the-machine
  - exp-can-the-lane-read-from-a-history-that-ends-at-the-rewind-point
chunk: stand-the-rewound-tree
---

## The run

RUN 2026-08-19, two attempts. The first failed and the failure is the finding.

### Attempt one: the whole tree rewound. IT FAILS.

A depth-1 fetch of i33's rewind point, 1723 files, with the CURRENT engine
binary pointed at it as its root:

    MachineCompileError: main: canvas node n-boot: boot.canvas declares no
    priority in its frontmatter

THE ENGINE READS `machines/` FROM THE ROOT, and the root is rewound. The old
drawings predate the `priority` field, so the current compiler refuses them.
The child exited 1 and the mirror never came up.

SO "THE CURRENT ENGINE RUNS OVER A REWOUND TREE" IS TRUE OF THE BINARY AND
FALSE OF THE ROOT. The engine is not only `engine/`. It reads its machines,
its guidance and its rigor matrix out of the tree it is given.

### Attempt two: the hybrid. IT HOLDS.

Same rewound tree, with `deliverable/machines` and `guidance`
replaced by today's:

    se-mcp 5.0.0 root=/tmp/i37hyb autonomy=0.6 headless
    se-mcp: mirror (the human's hand) at http://localhost:7445/

`se_pull` answered a normal `read` instruction at `start`.

### And the ceiling survives the hybrid

| asked, in the hybrid tree | answer |
| --- | --- |
| HEAD | `20abd83` |
| history depth | 1 |
| `git rev-parse 5f85977f` | does not resolve |
| `grep -rl i33` under `spec/trace` | **0** |
| control: `grep -rl i15`, same tree | **71** |
| tree size | 22 MB |

## What it settles

THE REWIND IS A THREE-WAY SPLIT, not a two-way one, and only the middle term
was named before this ran.

- REWOUND: `spec` — the records, the corpus, the trace. The work.
- CURRENT: `deliverable` AND `guidance`. The method.
- BOUNDED: the git history, which ends at the rewind commit.

`raid-dec-a-benchmark-rewinds-content-and-never-the-machine` said content
rather than machine. It did not say that `guidance` is machine, and
the engine's own compile error is what forced the distinction.

## What it does not settle

- Whether a walk can be DRIVEN to completion in such a tree. One pull is not a
  walk.
- What the rewound `spec` does to a state whose entry condition reads
  a corpus node that today's machines expect and yesterday's tree lacks.
