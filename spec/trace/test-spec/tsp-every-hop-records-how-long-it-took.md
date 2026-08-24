---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: tsp-every-hop-records-how-long-it-took
type: "[[test-spec]]"
statement: Every hop the engine walks records its own duration, so a budget can be checked rather than assumed.
method: test
verifies:
  - req-a-hop-of-the-walk-carries-its-own-time-budget
files:
  - deliverable/tests/route.test.ts
---

## Steps

1. Walk a record through several hops in one call.
2. Read the hops that call returned.
3. Assert a duration is recorded for EACH hop walked, not one figure for the
   call that carried them.
4. Assert each recorded duration is a finite number and never negative.
5. Assert the hop durations sum to no more than the call's own duration.

## The oracle

THE COUNT AND THE ARITHMETIC. As many hop durations as hops walked, and their
sum inside the call that contained them. A call reporting one duration for six
hops fails step 3 whatever that duration says.

### Step 4 says finite, and it used to say above zero

ABOVE ZERO IS UNSATISFIABLE HERE. A hop times one expand of the arriving state,
and a warm expand costs about a tenth of a millisecond. A memoized one rounds to
zero, so the strict form would fail on the machine doing the least work.

WHAT THE STEP IS ACTUALLY GUARDING is a duration that was never computed.
`typeof NaN` is `number`, so asserting the type alone leaves that case green.
Finite catches it and zero does not trip it.

### Step 2 reads the answer, and it used to say the trail

THE ANSWER IS WHERE THE FIGURES ARE BORN. The trail carries the same numbers,
and it caps a long response, so a route long enough to be interesting is the
route whose figures the trail may have cut. Reading the answer measures the hop;
reading the trail measures the log.

## Why this spec asserts the RECORDING and not the budget

NO BUDGET IS RATIFIED. A twentieth of a second is under discussion and is not
yet a standing figure, and the requirement takes whatever is set rather than
inventing one.

SO HALF THE ROW IS TESTABLE TODAY AND HALF IS NOT, and the row says so in its
own measure. An earlier draft measured only the threshold, which named a test
nobody could write. A reviewer caught it.

WHEN A BUDGET IS RATIFIED, a second spec asserts the threshold against the
committed yardstick. It is not this one, and this one does not pretend to be
waiting for it.

## What would make this test lie

MEASURING THE CALL AND CALLING IT THE HOP. The whole point of the row is that a
call may hold many hops, so a test that reads the call's stamp and asserts it is
per-hop passes while proving the opposite.

## What this does NOT verify

THE YARDSTICK. The committed record that lets a slowdown be told from a record
growing is separate work, and nothing here needs it. A hop can record its
duration on any record at all.
