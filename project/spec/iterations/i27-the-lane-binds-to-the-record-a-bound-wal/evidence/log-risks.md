---
form: log-risks
by: agent
signed_off: 2026-08-13T18:44:21.867Z
authors: agent
files:
---

# Evidence form / log-risks

## current_situation

M1 is walking. draft-vision signed at 18:39:15 as an inherit, so the resident vision packet stands untouched and this state opens the register against it.

WHAT THE REGISTER HELD BEFORE THIS STATE. One entry minted at the kickoff gate, when the gate asked for assumptions and this milestone had a real one: the engine runs from trunk's sources while resolving into a bound tree, and the self-hosting carve-out rests on a claim nobody has observed.

WHAT THIS STATE ADDS. Two entries, and both are already-true rather than speculative. A write can land in the wrong tree and report success. And the scope this record carries has grown past the gate that priced it, in six named pieces.

WHY THE COUNT IS THREE AND NOT MORE. The seed is unusually settled — the owner ruled the shape and said the iteration builds rather than re-decides — so the usual crop of design risks is absent by construction. What is left is what a settled design can still get wrong: a silent misroute, an unobserved assumption, and a scope that drifted while nobody was pricing it.

## raid_opened

- project/spec/trace/raid/raid-asm-engine-serves-from-the-bound-tree.md
- project/spec/trace/raid/raid-risk-a-write-lands-in-the-wrong-tree-silently.md
- project/spec/trace/raid/raid-iss-scope-grew-past-the-kickoff-bless.md

## follow_up

THE THREE ENTRIES CARRY THEIR OWN TRIGGERS, so none of them waits on a person to remember it.

THE ASSUMPTION fires at the first reload taken while a record is bound, once the lane root moves. Its probe is one bound record and one reload on a product that does not edit the engine.

THE MISROUTE RISK fires at the first write of each path KIND after the root moves — method, record content, session state, repo-root files. Four rules, four tests, and the bug lives at the seams between them. Its mitigation is a rule the build states should adopt now rather than later: the proof of a write is a READ-BACK from the tree the caller meant, never the write's own verdict.

THE SCOPE ISSUE has already fired. It is owed at write-requirements, which mints a row for each of the six pieces so verification has something to check against.

ONE THING THIS STATE DID NOT DO. It opened no risk against the two items pulled forward, because their design is settled and their failure mode is the misroute risk already logged — a pagination change that serves the wrong chunk is the same silent-wrong-answer shape.

## anything_else

TWO OBSERVATIONS FROM TODAY THAT THE MISROUTE RISK IS BUILT ON, recorded here because they are evidence rather than register content.

A DIAGNOSTIC ANSWERED WRONGLY AND CONVINCINGLY. Asking whether the stop hook was wired, a shell check ran in the BOUND worktree, found no session log there, and reported the hook silently allowing every stop. The hook was fine. Re-run against the real root it blocked correctly and named the walk's position. The reading was taken in the wrong tree and looked exactly like a real finding.

THE HOOK ITSELF WAS GENUINELY UNWIRED, which is the separate finding. The script exists, its tests pass, and the Copilot wiring stands at the repo root. The Claude Code wiring never existed — no file, no history, not ignored. It is written now and takes effect at the next session start, because the host reads its settings once.

ONE MEASUREMENT WORTH KEEPING. The hook read the walk's position from an OLDER record than the newest pull, because the newest pulls carry responses too large to parse back. It still blocked, so it fails safe. But its reason named a stale state, which is the overflow degrading a mechanism two layers away from itself.
