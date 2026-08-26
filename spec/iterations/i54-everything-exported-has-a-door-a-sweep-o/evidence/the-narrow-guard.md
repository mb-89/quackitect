---
form: the-narrow-guard
by: agent
signed_off: 2026-08-26T12:27:26.759Z
authors: agent
files: null
---

# Evidence form / the-narrow-guard

## current_situation

cand-the-narrow-guard carried its name, its statement and its pick from build_chart. The three prose sections were drafts, each marked "to be replaced at run-candidates".

The drafts described the seam in the abstract. Nothing in them named a file, a line or a caller.

The shape they describe already stands in this tree for one rule, and nothing said so.

## built

spec/trace/candidate/cand-the-narrow-guard.md — the three sections rewritten against the tree rather than from the argument.

### What the composition found

deliverable/engine/widgets.ts is the worked example. It is 186 lines and holds one rule with six exports. The predicate emitsWidget reads one string; surfaceFiles and exempted read the registry and the departure list; emitters, guardNoUnregisteredEmitter and strays are the three shapes a caller wants.

THREE CALLERS, NOT TWO. deliverable/engine/files.ts:449 is the write path. deliverable/engine/bin/sweep.ts:94 is the sweep. deliverable/tests/widget-emitters.test.ts:19 is the test, which asks the sweep's question rather than restating the expected answer. No caller holds a copy of the predicate.

THE SEAM IS REACH, NOT AUTHORITY. The write-time caller is handed the root, one path and the content. It reads at most one file from disk, the one it is about to overwrite, at widgets.ts:154. The sweep is handed the tree. Neither decides anything the other does not.

THE TWO CALLERS ALREADY DISAGREE IN ONE LINE, on purpose. widgets.ts:154 lets a write through when the file already tripped the predicate, so the eighteen files that emit today stay editable. strays() at line 184 has no such clause and reports them. Permissive at the write, strict at the sweep, one rule, one line of difference.

### Costs, measured where a number exists

- At the write: four cheap tests, then at most one existsSync and one readFileSync of the target file. It never reads the tree.
- Against the budget: one second per lane call, observed writes at 4 to 12 milliseconds. Two orders of magnitude of headroom for a content-only check.
- At the sweep: emitters() reads every engine .ts file. The whole sweep measured 974 ms over 3053 nodes, which is the current rule set and not this one alone.
- Never exercised: a corpus-reading check at write time. This candidate is picked so that it never has to be.

### What it leans on

Four register entries, cited by id in the node.

- Every departure-adding write passes through the lane — unprobed, one counterexample standing.
- An exemption key reads the same on every platform — unprobed, needs a machine this container is not. widgets.ts:149 already normalises backslashes, which is evidence the question is real.
- An author refused at write time states a usable reason — the kill criterion, sample of one.
- Every export is declared statically — probed, holds, 984 declarations across 156 files, zero computed.

## follow_up

- The eighteen emitting files are the generalised rule's day-one departure list, and nothing has counted what the equivalent list would be for disk reach. The measured figure that stands is 81 modules importing node:fs. A day-one list of 81 is a different proposition from a list of 18, and the evaluation should say so.

- widgets.ts:150 governs only files under the engine prefix ending in .ts. The generalised rule has to say what its governed set is, and that choice is not made here.

- The test caller is worth keeping in the shape. deliverable/tests/widget-emitters.test.ts asks the sweep's question rather than hard-coding the answer, which is why the eighteen files did not need the test edited.

## anything_else

The honest finding of this compose state is that the narrow guard is not a proposal. It is the shape already standing, and the record's contribution would be generalising the predicate and the two lists rather than designing a mechanism.

That cuts both ways in the evaluation. It is the cheapest to build, because the worked example is 186 lines away. It is also the one with the least new information, because choosing it means the record confirmed what the requirements already assumed.
