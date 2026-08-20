---
form: stand-the-rewound-tree
by: agent
signed_off: 2026-08-20T10:08:30.902Z
authors: agent
files:
---

# Evidence form / stand-the-rewound-tree

## current_situation

stand-the-rewound-tree, the root of the chunk chain and the mechanism two blessed gates argued about.

THE MACHINE ROUTED ME HERE RATHER THAN I. write-the-benchmark-report refused with SE-C-112, named the chain, named its root, and handed the exact call — `se_aim {to: stand-the-rewound-tree, go: true}`. Fixing anything between changes nothing until the root stands, and the refusal said so in those words.

IT CARRIES TWO PROMOTED SPIKES. `exp-can-the-lane-read-from-a-history-that-ends-at-the-rewind-point` and `exp-does-the-current-engine-run-against-a-rewound-tree`. Both came back `falls`, and both fell in the design's favour.

## built

TWO FILES under `project/deliverable/engine`.

`benchmark.ts` — `rewindPointFor` and `standRewoundTree`, plus `REWOUND` and `CURRENT` as the three-way split named once.

- THE REWIND POINT is the parent of the commit whose subject is `iteration <id>: started`. TWO MATCHES IS AS WRONG AS ZERO and returns undefined: picking one of two silently is how a benchmark ends up cut at a commit nobody chose.
- STANDING THE TREE is the two commands the spike found. `git update-ref refs/bench/<id> <commit>` then `git fetch --depth 1 <source> refs/bench/<id>:refs/heads/bench`. A bare object id cannot be fetched without a server config change, so the commit is named as a ref first.
- THE SPLIT IS THREE-WAY. `project/spec` comes from the rewind commit; `project/deliverable` and `project/guidance` are copied forward from the live tree.

`benchmark-guard.ts` — `resolvesInBoundTree` and `controlFilesPresent`.

- THE CEILING ASKS WHETHER A COMMIT RESOLVES AT ALL, never whether it is an ancestor. The object is absent from a depth-1 fetch, so the wrong act cannot be expressed rather than being caught.
- THE POSITIVE CONTROL IS IN THE ENGINE, not in the test. An empty fetch and a correct rewind both answer `not there` to everything, so a run proves the tree HAS a different iteration's files.

THE TEST FIXTURE WAS WRONG AND IS FIXED, and that was my error rather than the design's. The four cases asserted against `freshRoot()` plus `gitInit` — an empty repository with no iteration, no started commit and no future. They could not have passed against any implementation. `benchRepo()` now builds a repository with a past, a rewind point and a future beyond it, and one new case pins that an iteration with no started commit resolves no rewind point at all.

VERIFIED. `tsc` clean, biome clean, preflight green, sweep green. 1618 tests, 1612 pass. All four cases this chunk owns now pass, and one of them asserts the negative directly: the file committed after the rewind point is not in the stood tree.

## follow_up

- bind-a-run-and-write-its-conditions is next and owns three of the six remaining failures. It is what gives the report's fields values to carry.
- conceal-the-reports-while-a-run-is-bound owns two and WILL NOT GO GREEN in this iteration. `concealedFromLane` and `concealmentCallSites` are still stubs and both say so in their own comments.
- THE STARTED-COMMIT ASSUMPTION IS STILL DEFERRED, and this chunk is exactly what its until was waiting for. `se_git` is legal here, so the probe — one log query over the fifteen shipped records — can now be run. It was not run here because this state's work is the mechanism, not the survey.
- THE CONTROL NEEDS A REAL NEIGHBOUR to be meaningful. In the fixture it is a file mentioning another iteration; on a real archive it is the 71 files M6 measured. A run against an iteration with no neighbours in its trace would pass the control vacuously.

## anything_else

THE FIXTURE BUG IS THE MORE USEFUL FINDING, and it is the same shape this iteration keeps producing.

I WROTE FOUR CASES THAT COULD NOT PASS AGAINST ANY IMPLEMENTATION. They asked an empty repository for an iteration's started commit. At observe-red they went red, every failure was an assertion rather than a crash, and the state signed — because red is exactly what observe-red wants.

SO THE RED WAS RIGHT FOR THE WRONG REASON. The design was unrealized AND the check was untestable, and observe-red cannot tell those apart. It asks whether the case fails and whether it fails on its expectation. Both were true.

WHAT WOULD HAVE CAUGHT IT is the thing that did: building the design and finding the case still red. That is one state later than it should be, and it is cheap here because the chunk is small.

THIS IS THE FIFTH TIME THIS ITERATION HAS PRODUCED A MEASUREMENT THAT LOOKED LIKE A RESULT. Three absences that were a parser bug, one bound I invented and then tested against, and now four reds that proved nothing about the design. Every one was a CONTRADICTION taken at face value, and every one went unchecked until something outside the measurement caught it.

FOR AN ITERATION BUILDING AN INSTRUMENT, that is the argument for the instrument rather than an embarrassment. A per-state refill count would have shown four cases red at observe-red and still red after the build — which is the signature of a broken check, not an unbuilt design.
