---
kind: [[rationale]]
---

# Why

The migration decided this in its specs, and the owner read the call at the
merge. The index and its processes spoke NATS, with the server running inside
the index. An agent reads this note before it asks again.

## 1. What it weighed

| the option | what it gave | what it cost |
|---|---|---|
| streams over `gRPC` | typed calls and streams, deadlines on each call, no broker | a schema file and a code generator in the build on both platforms, and a table of peers in the index |
| NATS inside the index | names as subjects, request, reply and watch built in, a new process with no table of peers | a library in the index, delivery at most once, and types riding on top |

## 2. Why NATS won

Every peer inside was Go, in one module, so the `q` package already gave both
ends one type. A `gRPC` schema over an open catalog would have carried each
value as bytes. So its typing bought little, and its generator cost a tool on
every box. A subject mapped onto a name, and a wildcard watched a topic. The
server ran inside the index, in pure Go, over loopback TCP on Linux and Windows.

## 3. What it gave up

A push could go missing. Each value carried its revision, and a subscriber
seeing a gap read the name again, so a loss cost one round trip. The wire
checked no type, so the index refused a peer built from another commit. The
library grew the binary.

## 4. What would make it wrong

A peer inside that was not Go, which then needed a schema the `q` package could
not give. Or losses frequent enough that the reads again cost more than a
stream. Either one reopened the choice, and `gRPC` stood as the fallback.
