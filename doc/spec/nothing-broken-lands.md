# Nothing broken lands in git

The owner's question, and the owner's first answer: a hook that refuses a push
while the battery is red. The decision is on [[wk-814acc87a2]].

The goal is right. Two of the three objections this session first raised are
real, and the third was wrong and is struck below.

## Why absolute red is the wrong test

### One. Some pushes must never be gated

A claim is the first of them. A box that cannot publish a claim is invisible to
every other box, and two boxes take the same token, which is the one thing
claims exist to prevent. That is not hypothetical: it is what [[wk-4759d90994]]
was written for, and it happened.

Work tokens and notes are the second. They carry records rather than code. A
cloud box is reclaimed when the session ends, so a record that is not pushed
dies with the box, and gating one loses work to protect a build it cannot
break.

A gate that blocks these is worse than no gate, because it turns a red build
into lost work and a duplicated token.

### Two. Absolute red gates the wrong agent

The battery on this box was red all afternoon, between three and six failures
at a time, and not one of them belonged to the agent that happened to be
pushing. Two were fixtures shaped for another operating system. One was a check
named in the battery that had never existed. One was another hand's file left
unformatted.

A gate on absolute red would have stopped every agent on the box from pushing
anything all day, including the four fixes that made the battery greener. The
agent punished is never the one who broke it.

This is not a property of a bad day. It is what a shared tree does: the battery
reads the whole tree, and the whole tree is everybody's.

### Struck: the argument from time

This session first wrote that two minutes on every push is a tax nobody pays,
and that a rule people work around stops being read.

THE OWNER STRUCK IT AND WAS RIGHT. That is convenience bought with correctness.
In a team with people, pushing something broken to main gets you put on a spike.
Commits stay quick. A push can cost two minutes.

It is recorded struck rather than deleted, because the reasoning that produced
it will come back otherwise.

## What to gate on instead

### A new failure against a baseline, judged by the test verb

The question a gate should ask is not whether the battery is green. It is
whether this change made it worse. That question has a right answer on a shared
tree and the other does not.

The tree already works this way by hand. Half the tokens here carry a criterion
reading that the battery reports no new failure against the run before the
change.

THE PUSH DOES NOT READ A RECORDED RUN, AND IT DOES NOT START A BATTERY. It
calls the test verb, and the verb decides what needs running. That is the
owner's design and it is better than the one this session proposed.

The verb already knows how. It takes a delta and answers which tests reach it.
It already decides when the whole battery is owed, and it already says why. So
nothing substantial changed and the last run still stands means it says so and
the push goes. A delta reaching code the last run did not cover means it runs
what is needed and the push waits. A run that comes back worse than the
baseline means the push is refused, and the refusal names the failure.

This is the same rule the owner gave for the claim gate: one door answers the
question and everybody asks that door. A push that reads a recorded file is a
second place that learns the rules. A push that calls the test verb is not.

It also disposes of staleness without anybody defining it. The verb already
knows whether a recorded run covers this delta, so there is no separate
question about when a run is too old.

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

## What this would have caught, measured

This is not a hypothetical gate. It would have stopped a real landing on this
branch, this session, made by this agent.

df31079a was pushed with plumbing from a tree that predated another hand's
work. The tree it produced did not compile, and src/engine stayed broken for
every agent on every box until a reviewer found it and it was repaired under
[[wk-8d10ed2a9e]].

A push that called the test verb would have refused it outright, because the
pushed tree does not build. A push that read the last recorded battery run
would have let it through, because that run was made against the agent's own
tree rather than the one being pushed. The owner's design catches it and the
one this session proposed does not.

## What is still open, for the owner

- **What else must go through.** The table above is what this session can name.
  There will be more.
- **Whether the gate is advisory first.** A gate that refuses on the day it
  lands, in a tree with standing failures, teaches everyone to route around it.
- **Where it lives.** A git hook is per box and easily absent, and the engine
  already holds every other guard, so the engine is the more likely home. A
  check on the server is a good second net: it cannot see the tree the agent is
  holding, it answers after the fact, and it ties the method to one host.
- **What the verb judges against.** The gate needs a baseline before it can call
  a failure new. Whether that is the last run on this box, the last run on the
  branch, or something recorded per commit is a question the verb does not
  answer yet.
