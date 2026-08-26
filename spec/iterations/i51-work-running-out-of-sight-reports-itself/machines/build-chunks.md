---
steps:
  - id: the-table-holds-every-kind
    statement: One operation table replaces the two job tables, and an entry carries its kind, its identity, when it started, the state it belongs to, where its progress is written and the total that progress divides into
    depends_on: []
    realization: code
  - id: a-diff-nothing-answers-for-runs-nothing
    statement: A change that maps to no test starts no test file and names every unanswered part, while a red suite, an unreadable tree, a direct request and the piecemeal threshold all keep running everything
    depends_on: []
    realization: code
  - id: the-account-answers-in-one-call
    statement: One call returns every operation, running and finished alike, so a caller that missed the moment still learns what happened
    depends_on:
      - the-table-holds-every-kind
    realization: code
  - id: the-leaving-judgment-stops-holding-the-call
    statement: The serving path starts a step's leaving judgment and answers without awaiting it, registering the judgment as an operation against the step it belongs to
    depends_on:
      - the-table-holds-every-kind
    realization: code
  - id: the-figure-carries-its-basis
    statement: A duration is computed from the operation's own progress count and returned with what it rests on, and an operation with no measurement carries no figure and says so
    depends_on:
      - the-account-answers-in-one-call
    realization: code
  - id: a-step-stands-in-one-of-three-words
    statement: A step's standing is one word from a closed set of passed, not passed and still deciding, and every reader of green takes the third word distinctly rather than flattened
    depends_on:
      - the-leaving-judgment-stops-holding-the-call
    realization: code
  - id: the-account-rides-every-answer
    statement: The account is attached where the lane composes its reply, beside the answer the caller asked for and never replacing it, and an empty account is an empty list rather than an absent field
    depends_on:
      - the-figure-carries-its-basis
    realization: code
  - id: the-verdict-lands-against-its-step
    statement: A settled judgment writes its verdict where the step's other standings already live, and a judgment whose process is gone settles as failed rather than deciding for ever
    depends_on:
      - a-step-stands-in-one-of-three-words
    realization: code
  - id: a-fresh-session-knows-a-deciding-step
    statement: A session that finds a step still deciding with no live judgment behind it re-runs the judgment rather than trusting a word the repository cannot settle
    depends_on:
      - the-verdict-lands-against-its-step
    realization: code
---

# The build drawing

Nine chunks in three strands. They fan out where nothing connects them, and the
join waits for every one.

## Which lenses shaped the order

TWO, AND THEY DISAGREED ABOUT ONE THING.

RISK FIRST put the handback earliest. It is the load-bearing mechanism, it is
what the record exists for, and [[raid-ar-walk-resumes-from-repo]] is graded
fatal against it.

PARALLEL FLOW put the table earliest instead, because both other strands lean on
it and a strand that waits on three others is a bottleneck drawn in advance.

THE TABLE WON, and risk-first still shapes what follows it. The handback is the
first chunk after the table rather than the last, and the scope strand runs
beside both because nothing connects it to either.

SPINE FIRST WAS CONSIDERED AND DROPPED. A thin end-to-end slice would touch the
table, the handback and the rider in one pass, and the seams between them are
not where the surprise is. The surprise is in what a fresh session sees, which
is the deepest chunk in the deepest strand.

## The three strands

### The table, and the account over it

`the-table-holds-every-kind` → `the-account-answers-in-one-call` →
`the-figure-carries-its-basis` → `the-account-rides-every-answer`.

ONE DEEP CHAIN ON PURPOSE. Each of these is the previous one made honest: a
table, then a listing, then a figure, then a figure that reaches a caller
unasked. Forcing width onto it would only add seams.

### The handback, and its standing

`the-leaving-judgment-stops-holding-the-call` → `a-step-stands-in-one-of-three-words`
→ `the-verdict-lands-against-its-step` → `a-fresh-session-knows-a-deciding-step`.

IT LEANS ON EXACTLY ONE EARLIER LOT. The judgment registers with the table, and
that is the whole of the dependency.

WHAT FLOWS ACROSS THAT EDGE: an operation registration carrying the step's
identity. Without the state field the verdict has nowhere to land, which is
`req-a-pending-verdict-is-recorded-against-its-state` in one sentence.

THE LAST CHUNK IS THE FATAL ONE. It is deepest because it needs everything above
it to exist before there is anything for a fresh session to find.

### Scope honesty

`a-diff-nothing-answers-for-runs-nothing`, alone and connected to nothing.

IT SHARES NO CODE WITH THE OTHER TWO STRANDS. The scope decision reads a diff;
the account reads a table. Drawing an edge between them would be a hallway
assumption.

## What is promoted, and what is not

NOTHING. All three experiments carry `promote: none`, and the throwaway law is
why: the spike scripts are not a head start on the build.

THE FINDINGS DID REACH THE BUILD, as [[dsp-the-work-account]] rather than as
code. Every chunk statement above rests on a sentence in that spec, and every
sentence in that spec rests on a measurement taken at M6.

## The one thing no chunk here settles

WINDOWS AND MACOS. [[raid-asm-a-check-left-running-survives-on-every-platform]]
is measured on one platform of three, and no chunk in this drawing can change
that from this machine.

IT IS NOT A HOLE IN THE PLAN. The assumption keeps its trigger armed, and the
fallback is written down: keep the await and cap what an exit script may do.
