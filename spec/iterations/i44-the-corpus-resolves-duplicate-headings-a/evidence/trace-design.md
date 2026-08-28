---
form: trace-design
by: agent
signed_off: 2026-08-28T11:45:25.456Z
authors: agent
files: null
---

# Evidence form / trace-design

## current_situation

The design trace has one item to judge: `dsp-the-corpus-sweeps`, the only design spec i44 minted.

It realizes `el-method-compiler` and `el-front-desk`, and its `files:` names the four it was written against. All four exist and all four carry the build.

No element or interface was minted this iteration, so the coverage side of the trace is unchanged.

## design_trace

### What the delta added, and who claims it

| file | claimed by |
| --- | --- |
| `deliverable/engine/corpus-sweeps.ts` | dsp-the-corpus-sweeps |
| `deliverable/tests/corpus-sweeps.test.ts` | dsp-the-corpus-sweeps |
| `deliverable/engine/guard.ts` | dsp-the-corpus-sweeps, and its own earlier spec |
| `deliverable/engine/sweep.ts` | dsp-the-corpus-sweeps |

NO NEW FILE IS UNCLAIMED. The design spec was written before the build and named all four in its `files:` list, so the claim is not a label applied afterwards to quiet the sweep.

### What the delta realizes

`dsp-the-corpus-sweeps` realizes `el-method-compiler` and `el-front-desk`. Both already stood; this iteration added a capability to them rather than a new element.

NO ELEMENT OR INTERFACE WAS MINTED. i44's whole delta is five checks over an existing corpus and the repairs that emptied their classes.

### One file changed outside the spec's list

`deliverable/engine/vscoderegistry.ts` and `deliverable/tests/files.test.ts` both changed, and neither is i44's subject.

- The registry took a bug fix: the entry derived its folder name with platform path logic and returned the whole location on POSIX. It is claimed by its own standing spec, and the fix changed one expression.
- The read ceiling in `files.test.ts` rose from 121 to 123, with the reason written beside the number: the two new reads are source, not corpus nodes, so the node door has nothing to give them.

BOTH ARE REPAIRS TO CLAIMED FILES, so neither adds to the unclaimed list.

### The dead-code view

NOTHING WAS RETIRED THIS ITERATION, so no file fell out of a spec's claim.

The one function that moved is `referencedId`, extracted from inside `danglingReferences` in the same file. It is called from the one place it came from.

## follow_up

### For the next design spec in this area

THE SPEC'S `files:` WAS WRITTEN BEFORE THE BUILD and needed no correction afterwards. That is the shape worth repeating: a claim made in advance is a prediction the build either meets or exposes.

### Noted and accepted

DEAD CODE INSIDE A CLAIMED FILE IS INVISIBLE AT THIS GRAIN. The state's own guidance says so. i44 adds one module and one function, both called from the one place they were written for, so the coarse sweep is enough here.

### Not this state's

The prompt-layer projection is still stale and the preflight is red on it. The verb that clears it is illegal in the states walked so far.

## anything_else

