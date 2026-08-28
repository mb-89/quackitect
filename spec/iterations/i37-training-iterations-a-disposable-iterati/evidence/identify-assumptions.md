---
form: identify-assumptions
reopened: 2026-08-20T07:23:40.853Z — a feeder re-signed above it after the v3 merge moved the rigor matrix and the M6 spikes moved the winner
by: agent
signed_off: 2026-08-20T07:23:42.517Z
authors: agent
files: null
---

# Evidence form / identify-assumptions

## current_situation

i37 stands at identify-assumptions, the third work state of M3. Six requirements, eight functions and seven flows are signed.

The register carried four assumptions before this state. Three are opened here, from the environment and the neighbours.

One of the three is graded fatal, and it is a question nothing in the iteration had asked yet.

## assumptions

- [[raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine]]
- [[raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it]]
- [[raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in]]

## sweep

- environment: TURNED UP THE FATAL ONE. A benchmark stands a tree at an old commit, and nothing had said which ENGINE runs over it — the old one checked out with the tree, or the current one over old content. Opened as raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine, graded fatal. If the old engine runs, every number describes a machine nobody is improving.
- toolchain: TURNED UP ONE. node_modules is gitignored and engines.node may differ between a rewind commit and today, so a rewound tree has no dependencies and possibly no compatible runtime. This is the practical half of the environment assumption above and is probed by the same spike rather than opened twice.
- host: NONE NEW, and the reason is that i36 already owns it. The harness is not Claude and two hosts give the lane different things. This iteration's answer is to STAMP the harness on every report rather than to assume anything about it, which is req-a-benchmark-report-carries-the-conditions-of-its-run.
- platform: NONE. Nothing in the benchmark mechanism is platform-specific. The rewind is git, the ceiling is an ancestry test, the concealment is a path rule and the report is a corpus node. The POSIX branch of the entrypoint remains untested, and that is exp-the-posix-branches-have-never-run rather than anything new here.
- neighbours: TURNED UP ONE. nbr-git carries the whole ceiling, and the assumption underneath it is that every shipped iteration has exactly one commit naming it as started. Checked on i33 and on nothing else. Opened as raid-asm-every-shipped-iteration-carries-a-started-commit-naming-it, graded crippling. The other two neighbours the delta touches, nbr-agent-harness and nbr-engineer, carry nothing this iteration relies on that is not already stamped on the report.
- people: TURNED UP ONE, and it was already open. raid-asm-an-agent-told-its-work-is-discarded-still-walks-the-machine-the-same-way is the only people-shaped assumption in the iteration, opened at log-risks and graded corrosive with the bias direction now named. Nothing was found beside it: the engineer reading a report and the owner ruling on the design are both doing things they already do.

## follow_up

- probe-assumptions is next. Two of the three opened here are cheap to probe and the third needs a spike.
  - The started-commit assumption is one log query against the eleven pinned records.
  - The call-log attribution assumption is answerable against this session's own log.
  - The engine-version assumption needs a tree stood at a rewind commit, which is M6 work rather than M3.
- THE ENGINE-VERSION QUESTION IS A RULING BEFORE IT IS A PROBE. Which engine runs over a rewound tree is a design decision the owner may want to make, and M4 will design around whichever answer it gets.
- The rewind assumption from M1 is already probed and holds, with a control.

## anything_else

ONE ASSUMPTION FOUND HERE IS SHARPER THAN ANYTHING THE ITERATION HAS OPENED SO FAR, and it was missed by four milestones.

Every artifact up to this point says a benchmark run stands a tree at the rewind commit and walks it. Not one of them says which ENGINE walks it.

TWO ANSWERS ARE POSSIBLE AND THEY ARE DIFFERENT PRODUCTS. The old engine checked out with the tree measures the machine as it was, which is the opposite of the point. The current engine over an old content tree measures the machine we are improving, which is what the whole iteration is for.

THE SECOND IS ALMOST CERTAINLY INTENDED and it has never been written down. That is exactly the kind of hole the environment sweep exists to find, and it took until M3 to find it because every earlier state was reasoning about content rather than about what executes.

IT ALSO SHARPENS THE REWIND. If the current engine runs over old content, then "rewind the tree" means rewind the CONTENT — the records, the corpus, the trace — and not the deliverable. That is a narrower and cheaper operation than a full checkout, and M4 should design against the narrow version.
