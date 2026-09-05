# Nothing broken lands in git

The owner's question, and the owner's first answer: a hook that refuses a push
while the battery is red. The decision is on [[wk-814acc87a2]].

The first answer is right about the goal and wrong about the mechanism, for
three reasons measured on a cloud box in September 2026.

## Why absolute red is the wrong test

### One. Some pushes must never be gated

A claim is the first of them. A box that cannot publish a claim is invisible to
every other box, and two boxes take the same token, which is the one thing
claims exist to prevent. That failure is not hypothetical: it is what
[[wk-4759d90994]] was written for, and it happened.

Work tokens and notes are the second. They carry records rather than code. A
cloud box is reclaimed when the session ends, so a record that is not pushed
dies with the box, and gating one loses work to protect a build it cannot
break.

A gate that blocks these is worse than no gate, because it turns a red build
into lost work and a duplicated token.

### Two. Absolute red gates the wrong agent

The battery on this box was red all afternoon, between three and six failures
at a time, and not one of them belonged to the agent that happened to be
pushing. Two were fixtures shaped for another operating system. One was a
check named in the battery that had never existed. One was another hand's file
left unformatted.

A gate on absolute red would have stopped every agent on the box from pushing
anything all day, including the four fixes that made the battery greener. The
agent punished is never the one who broke it.

This is not a property of a bad day. It is what a shared tree does: the battery
reads the whole tree, and the whole tree is everybody's.

### Three. The battery takes two minutes

Running it on the push path taxes every push for a build the pusher usually did
not break. A rule people work around stops being read, and the way round this
one is a flag.

## What to gate on instead

### A new failure against a recorded baseline

The question a gate should ask is not "is the battery green" but "did this
change make it worse". That question has a right answer on a shared tree and
the other does not.

The tree already works this way by hand. Half the tokens here carry a criterion
reading "the battery reports no new failure against the run before the change",
and this session answered it four times by comparing two recorded runs. The
gate would do what the agents already do.

It also fails safe in the direction that matters. A change that adds a failure
is refused and the refusal names the failure. A change landing into a tree that
is already red goes through, and the standing failures stay somebody's problem
rather than everybody's wall.

### Exempt by path, not by flag

An exemption an agent can type is an exemption an agent will type. The refs and
paths that carry records rather than code are known, so the gate reads what is
being pushed:

| what | why it goes through |
|---|---|
| the claims ref | a box that cannot publish a claim is invisible, and two boxes take one token |
| `doc/work/**` | tokens are the record of what was decided, and a cloud box loses them |
| notes | the same, and they are the input to every later decision |
| `doc/spec/**`, `doc/guidance/**` | prose cannot break a build |

Anything carrying `src/**` or `util/checks/**` is code and is gated.

### Read the last run, do not start one

The gate reads the newest recorded battery run rather than running the battery.
That keeps the push path fast, and it is honest about what it knows: a run that
is stale says so, and a stale run is a weaker claim than a fresh one rather
than a reason to block.

## What is still open, for the owner

- **What else must go through.** The table above is what this session can name.
  There will be more.
- **What a stale baseline means.** If the newest run predates the change, does
  the gate refuse, warn, or pass? This session would pass and say so, on the
  grounds that a gate which blocks on missing information gets disabled.
- **Whether the gate is advisory first.** A gate that refuses on the day it
  lands, in a tree with standing failures, teaches everyone to route around it.
- **Where it lives.** A git hook is per box and easily absent, and the engine
  already holds every other guard. The engine is the more likely home.
