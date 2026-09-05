---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: apply asks identity too
# where the token stands. The process owns these values.
status: open
claimed_by: aeaf7bd9/worker-sibelius
claimed_at: "2026-09-05T14:55:55Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 209edbebe064a61b46f380e5b403c9816ab484cc
---

## detail

Found reviewing wk-120d7c9685, which added identityMaterial and asked it at one door.

identityMaterial is asked from src/engine/hook.go and nowhere else. The engine's own write verb, se apply, holds a write to the voice rules in proseThatReads in src/engine/apply.go and asks nothing about identity. So a datetime written through se apply lands in a tracked file with no refusal, while the same text through the harness Write is refused.

The two halves are a mirrored pair and the rule was taught to one of them. It is the half that matters most: se apply is the write door agents are told to use, and it is the only one working while the guard hook is down.

## proposed action

proseThatReads asks identityMaterial beside voice.Load, with the same answer shape it already returns for a voice break, and skips a write under .se the way the guard does.

## done when

- an se apply of prose carrying an ISO date into doc/work is refused, and the refusal names what it matched
- an se apply of the same prose under .se is taken
- a test in src/engine drives both, run by go test ./src/engine

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the ask is small enough to review whole, or it is split first | one door and one block of seven lines inside proseThatReads, with one test beside it. Nothing else in the write path is touched, so the whole of it reads in a single screen. | `git diff fc27d9b1^ fc27d9b1 -- src/engine/apply.go` |
| [x] | every done-when line is decidable, and names the command where one decides it | all three lines are decided by the one command below. The refusal into doc/work is asserted with the matched text named, the same prose under .se is asserted to land, and both assertions sit in the one test, which is what the third line asks. | `go test ./src/engine -run TestAnApplyRefusesIdentityMaterial` |
| [x] | the basics it stands on exist, or are minted first | identityMaterial, isProse and underPrivate all existed before the ask, and the guard hook already asked all three together. This door copies that arrangement rather than minting anything. | `se find --regex 'func (isProse\|underPrivate)' --path 'src/**/*.go'` |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [x] | the guidance this token names was read and applied | read. Test first, red, then green. | doc/guidance/work-token.md |
| [x] | one test was written first and seen red for the reason expected | on a clean copy, this tree not building. Drop the identity block and it fails at line 25. Hoist it past underPrivate and it fails at line 40. | `go test ./src/engine -run TestAnApplyRefusesIdentityMaterial` |
| [x] | the same test was seen green after the change, and named | TestAnApplyRefusesIdentityMaterial and TestTheIdentityDoorDecidesWrites green, vet clean. | and `go vet ./...` |
| [x] | the change is git diff began..ended, the two hashes the engine wrote on this token | it is not. Snapshot fc27d9b1, an ancestor of began, already carried the block and the test. The diff holds the note alone. The proof above is what this token adds. | `git merge-base --is-ancestor fc27d9b1 209edbeb` |
| [x] | the cleanup the change revealed is in the change, or is a token of its own | none. Both doors ask identityMaterial under the same .se exemption. | — |

