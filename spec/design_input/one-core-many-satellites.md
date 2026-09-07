# One core, many satellites

A specification. It says what to build, why, and in which order.
It is not guidance and the engine does not read it.
Work tokens reference it, and it is superseded by what actually ships.

## Motivation

A system's complexity follows its connections, not its parts.
Point-to-point wiring grows as n(n-1)/2, so eight parts want twenty-eight connections.
A star grows as n.
Every system anyone has watched decay decayed by growing connections nobody named.

So the goal is a shape where every part has exactly one interface.
A part talks to the centre and to nothing else.
Adding a part costs one connection, and it costs the centre nothing.

The second goal is that nothing blocks.
A missing part degrades what depends on it and stops nothing else.
A cold clone works in seconds, with whatever has arrived so far.

## What is true today

Each of these was measured on this tree, not reasoned about.

The guard never opens the index.
`hook.go`, `guards.go` and `gate.go` hold no database handle.
Every per-call ruling reads small JSON files under `.se`.
Only `index.go`, `indexwatch.go`, `testmap.go` and `tests.go` touch SQLite.

cgo SQLite is the only reason this tree needs a C compiler.
The manifest says so: the compiler exists because the engine's SQLite is C.
That is why a first build takes minutes and why `zig` is fetched from `ziglang.org`.

A cloud box reaches that host. It was written here once that a cloud box could
not, and that was an inference from the network allowlist and never a
measurement. The record contradicts it: the box of 2026-09-04 held a built ELF
`se-mcp` and answered `RUNME`, so it fetched the compiler and built cgo SQLite.
A first build taking minutes is not a fault, and nobody has asked for it to be
faster.

Four grammars reach the engine: the HTTP hook door, the verb socket, command-line flags, and the lane's tools.
Two of them have already drifted apart once.

The cage that travels carries no event that can refuse a call.
The refusing events live in a file the engine writes as it starts.
So a box with no engine is not guarded and is also not blocked.

Go uses every core in one process.
`GOMAXPROCS` defaults to the CPU count, and the scheduler spreads goroutines across all of them.
A cgroup quota binds the whole container, so more processes do not buy more CPU.

## What this buys

One interface per part, so the connection count stays linear.

A registry, so adding a capability is starting a process rather than recompiling the centre.

Degradation as a property of the shape rather than a branch written in each caller.

A guard that builds in seconds, because it links no C.

## The architecture

The **core** routes and keeps a registry. It holds no rules and modifies no payload.

The **satellites** each own their own state and register what they provide:

- the **guard**: the rules and the process model.
- the **index**: a view over the tree, rebuildable and disposable.
- the **record**: the log, append only.

The **clients** are satellites too, and hold nothing:

- **level 0**, inside the harness.
- **the command line**.
- **the editor extension**.

Four rules hold the shape.

1. Every satellite has one connection, and it is to the core.
2. No satellite talks to another satellite.
3. Bulk never crosses the bus. The index reads files itself, and the viewer tails the log.
4. A capability with nobody registered degrades the call. It never fails it.

The index can never be the centre.
The centre holds what cannot be recomputed.
An index is a materialised view, and a rescan rebuilds it exactly.

## Deployment is not architecture

The star, the one-interface rule and the registry are the architecture.
One process or five is a deployment.
Conflating them is how this design gets argued in circles.

The numbers decide the deployment, and they are wide apart.
A channel send inside one process is about a hundred nanoseconds.
A unix socket round trip is about two microseconds.
A brokered round trip through a bus daemon is about two hundred microseconds.

A ruling has seconds of budget, so all three are free.
So co-locate parts unless there is an isolation reason, and write every seam as a message.
A seam written as a message moves out of process later as a transport change.
A seam written as a function call decides the deployment for ever.

The isolation reasons that could be real here:

- **failure**: a part that crashes should not take another with it.
- **locks**: the SQLite writer must not block a ruling.

Neither has been measured on this tree. Cores are not a reason, because Go
already takes them. Build time is not a reason, because minutes on a first
build is accepted.

## Red team: the case against building this

The strongest argument against is not that the design is wrong.
It is that it is premature, and that the work it displaces is worth more.

**The mesh is hypothetical and the router is real work.**
There are three clients and one authority.
The decay is a prediction about a system that does not exist yet.

**None of the measured failures would have been prevented by it.**
The cloud broke six times, and every time it was the tool lane.
A config naming a build artefact a clone lacks. A build run on the protocol
path. A handshake answered fast with the tool list held behind it, so the
harness took an empty set for the session. Then an agent refusing itself,
because the standing rules name tools it did not hold.
Every one was fixed in a few lines. A bus would have prevented none of them.

**The index has nothing to do with any of it.**
No cloud failure touched the index, the build or the compiler.
Splitting it answers a question nobody asked.

**A registry is a new failure mode.**
A satellite that registers a capability and then wedges is worse than a process that is plainly absent.
Every capability now needs a version, a deadline and a health rule.

**Splitting the index needs no bus.**
It needs one socket and one client.
Building a core to split one part is most of the work for none of the benefit.

**The garbage collection argument is weak.**
Modern Go pauses are sub-millisecond.
Against a budget of seconds that is noise, so heap isolation buys little.

**The discipline is a check, not a topology.**
"No satellite talks to another satellite" is a rule a standing check can enforce today, in one process, in an afternoon.
A check is cheaper than an architecture and it never wedges.

## What survives the red team

The shape survives. The order did not, and neither did the reason given for it.

The red team is right that the index split answers nothing that has failed.
It is right that a check buys the anti-decay discipline without a core.
It is right that a registry before there is anything to register is cost without return.

What has failed, every time, is that the tools were not there when the agent
started, and that a session holding no tools refused itself.

So the first work is the one that ends that class rather than shortening it.
Tools registered inside the harness are present on turn one.
There is no server to spawn, no handshake to answer and no timing to lose.
That is the only change here that makes the failure impossible rather than faster.

The index split has no driver. It stays here as a deferred option.
The measurement that would justify it is written down.
It is not work until that measurement says so.

## Order

1. **Level 0 is a function hook.** The tools are registered inside the harness, so no server is spawned and nothing can be late.
2. **The lane is retired.** Once nothing uses it, the cold stub and its snapshot go with it.
3. **One protocol.** The remaining grammars become one, with many clients.
4. **Every part reaches the engine and nothing else.** A standing check holds the shape.

The first two end the class of failure that has cost six attempts.
The third and fourth are the door reduction and the discipline.

The check comes last of the four on purpose.
Each of the three before it changes which parts exist.
A check that enumerates parts, written first, is written three times.

**The shape does not wait for the technology.** The centre exists today: it is
the engine, and every part already reaches it. So the rule has a subject now,
and it needs no core to be true. `engine-spawns.mjs` is this rule already
written for one part, which is the precedent the check widens.

**Deferred, with its trigger: the core and the registry.** A generic router with
a runtime registry buys one thing, which is adding a capability without touching
the centre. Nothing needs that yet, because the centre is one codebase with one
owner. It becomes work when a capability has to ship separately from the engine.

**Deferred, with its trigger.** Splitting the index out is not work today.
It becomes work when one of two things is measured.
A ruling delayed behind the SQLite writer during a scan.
Or an index crash taking the guard down with it.
Until then it is a shape to keep in mind, not a change to make.

## What this does not do

It does not make the index faster.
It does not get more cores, because Go already takes them.
It does not shorten the first build, and nobody has asked for that.
It does not remove cgo from the tree.

## Proposed tokens

Proposed, not minted. The order above becomes five tokens, and the dependencies
are what make the order binding rather than advisory.

| # | title | process | depends on | what it is |
|---|---|---|---|---|
| 1 | level zero as hook | standard | — | the tools are registered inside the harness, so none can be late |
| 2 | retire the lane | standard | 1 | the stub, its snapshot and the cold check go |
| 3 | one protocol many clients | standard | 2 | the remaining grammars become one |
| 4 | parts reach one centre | standard | 3 | a standing check holds the shape against the parts that exist |

Token 1 is the one that matters. It ends the failure that has cost six
attempts, because a tool registered in the harness cannot arrive late.
Token 2 follows from it and removes what token 1 replaces.
Token 3 collapses the grammars that are left.
Token 4 is last because the three before it change which parts exist.

Two things are not tokens. The core and the registry, and splitting the index.
Both are in the order section as shapes with the measurement that would turn
them into work.

All four are standard, so each carries an approach before any work and a
verdict after it.
