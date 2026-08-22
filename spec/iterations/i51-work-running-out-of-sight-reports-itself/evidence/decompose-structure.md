---
form: decompose-structure
amended: "2026-08-21T10:19:09.851Z by agent — the allocation section did not record the two standing crossings the matrix demanded, nor the stale boundary claim that fixing them caught"
by: agent
signed_off: 2026-08-21T10:16:28.930Z
authors: agent
files:
---

# Evidence form / decompose-structure

## current_situation

Twenty-six elements stood before this state, and the element matrix named two functions with no implementer.

Both came from this iteration. One hands back a step whose leaving judgment is still running. The other accounts for work the caller cannot see.

One new element closes the second. `el-work-registry` holds every piece of long work in one place, whatever kind it is. That is the winner's grafted pick made structural.

The first needed no new element. Its flows are `serve-a-step`'s own flows, and `el-walk-engine` already implements that function.

Three interfaces are minted. Two are demanded by flow crossings the matrix computes. The third carries the account out through the door it rides on.

One standing flow was wrong and is corrected. `flow-work-under-way` carried `crosses: out` and had no producer, so nothing said where the work came from.

## elements

- [[el-work-registry]]
- [[el-walk-engine]]
- [[el-test-runner]]
- [[el-record-store]]
- [[el-account]]
- [[el-mirror]]
- [[el-front-desk]]
- [[el-entrypoint]]
- [[el-arrival]]
- [[el-corpus-reader]]
- [[el-query-evaluator]]
- [[el-state-declaration]]
- [[el-method-compiler]]
- [[el-resolution-seam]]
- [[el-engine-delta]]
- [[el-sizing]]
- [[el-preflight]]
- [[el-bootstrap]]
- [[el-holding-pen]]
- [[el-coupling-disposer]]
- [[el-change-reporter]]
- [[el-update-runner]]
- [[el-project-producer]]
- [[el-vehicle-producer]]
- [[el-benchmark-binding]]
- [[el-benchmark-guard]]
- [[el-benchmark-report]]

## allocation

NO FUNCTION IS SPREAD. Each of this iteration's two functions lands in exactly one element, so there is no multi-implementer split to argue. What follows is why each landed where it did, and why one crossing exists that no flow demands.

### The handback lands on el-walk-engine, and mints nothing on the instruction side

THE FLOWS DECIDE IT. `hand-back-a-step-still-deciding` consumes and produces `flow-instruction`, which is `serve-a-step`'s own flow. `el-walk-engine` already implements `serve-a-step`, so no boundary is crossed and no interface is owed.

THIS IS THE SAME REASONING AS THE i11 DELETION WARNING, recorded in that element's own body. Allocating a function to an element that does not already own its flows mints interfaces, and minting interfaces is the architecture moving.

THE THIRD STANDING IS THE PART ONLY THIS ELEMENT CAN KEEP. A step is passed, not passed, or still deciding. The thing that started the judgment is the only thing that knows the third value exists.

### Two standing crossings opened anyway, and neither is new behaviour

THE MATRIX REFUSED THE FIRST SUBMIT and named both. Both are exchanges that have always happened and that no function in this tree consumed until now.

- `el-record-store → el-walk-engine` carries `flow-worktree`. The handback needs the tree its judgment runs against. The contract already existed for `flow-position`, so the tree JOINED it rather than minting a node: [[if-record-store-to-walk-engine]].
- `el-sizing → el-walk-engine` carries `flow-instruction`. The sizing element has always returned the instruction with its rung named. [[if-sizing-to-walk-engine]] is the node that says so.

THE SECOND ONE CAUGHT A STANDING ERROR. `el-sizing`'s body claimed "two interfaces and no more" and named the walk engine as where the compiled step arrives from. Both were already false: the inbound contract is two nodes, and neither is the walk engine. The element is corrected.

THAT IS WHAT THE MATRIX IS FOR. A crossing nobody consumed was a crossing nobody had to name, and the prose drifted unchallenged until a new consumer appeared.

### The account is a new element, not el-account and not el-test-runner

THE WINNER'S GRAFTED PICK IS THE REASON. `opt-one-operation-object-serves-every-kind-of-long-work` says one object serves every kind. An element that serves every kind cannot be the runner of one kind.

EL-TEST-RUNNER WAS THE CHEAP ANSWER AND IS WRONG. Its sentence is answering one question with the narrowest scope that settles it. Accounting for shell jobs and leaving judgments is not that sentence, and putting it there rebuilds today's defect in a new place.

EL-ACCOUNT WAS THE OTHER CANDIDATE AND IS ALSO WRONG. That element keeps the record of what was called and who answered. A live list of unfinished work is a different object with a different lifetime: it dies with the session, and the record does not.

### The correction that made the crossings computable

`flow-work-under-way` CARRIED `crosses: out` AND HAD NO PRODUCER FUNCTION. Read literally that says the world takes it, which contradicts the flow's own body: it is what the session holds.

WITH NO PRODUCER, THE MATRIX COULD COMPUTE NO CROSSING for it, and the design would have said where the timings come from while saying nothing about where the work comes from.

THE CORRECTION IS TWO EDITS. The flow is internal, so `crosses` is gone. Its producers are the two functions that start long work: `answer-with-tests` and `hand-back-a-step-still-deciding`.

THE THIRD PRODUCER IS NOT A FUNCTION. A background shell command is a lane verb, and the job table it already writes lives inside `el-work-registry` itself. Nothing crosses a boundary there.

### The one interface no flow crossing demands

[[if-work-registry-to-walk-engine]] CARRIES `flow-work-account`, WHICH LEAVES THE SYSTEM. Its consumer is the caller, so the matrix cannot compute a cell for it and will flag the node as undemanded.

IT IS MINTED ANYWAY BECAUSE THE DOOR IS REAL. `raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it` puts the account on the lane's own answer. A builder needs to know where it is attached, and no other node says.

THE ALTERNATIVE WAS WORSE. Adding `flow-work-account` as an input of `serve-a-step` would edit a function signed in i1 to record a fact about this design, which is the mechanism leaking into the solution-neutral layer.

## follow_up

EVALUATE-ARCHITECTURE IS NEXT, and it scores this structure against the criteria.

TWO FINDINGS FROM THE RE-SCORING PASS RIDE INTO THE BUILD. Both are answered in the nodes written here, and both need a test.

- An absent rider must be distinguishable from a rider never emitted. [[if-work-registry-to-walk-engine]] settles it: an empty account is an empty list, never an absent field.
- The rider's per-caller bookkeeping is unpriced. `el-work-registry` answers it by holding the list already, so composing the account is a read.

TWO OWNER NOTES ARE PARKED, both design work for a later record.

- Aiming at the front desk should escape the sub-machine rather than route through it (`note-d23288fc7020`).
- Walking back to a state you came from should always be legal, and rewind is a different act from stepping back (`note-f892c3d75735`).

## anything_else

THREE HOLES IN THE STANDING MATRIX ARE NOT THIS ITERATION'S, and they are left standing rather than swept.

- `el-arrival` implements nothing. The matrix lists it as idle.
- `if-arrival-to-walk-engine`, `if-walk-engine-to-coupling-disposer` and `if-walk-engine-to-query-evaluator` are flagged undemanded — interfaces on pairs no flow crossing asks for.

EACH PREDATES i51 AND NONE BLOCKS THIS DESIGN. Fixing them would be an unasked refactor, and contract rule 2 forbids improving what the state did not name.

THEY ARE WORTH A RECORD OF THEIR OWN. Four flagged cells is the matrix telling the truth and nobody reading it.
