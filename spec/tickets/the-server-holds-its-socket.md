---
kind: [[ticket]]
state: closed
group: the-bridge-keeps-transport
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
step: do
record:
  - step: do
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 156041771556aae8183d72d0ffddc5df691a9609
    hash_after: 2412de08ec8b97cdef22366719de3ffa938912a3
reason: done
---

# Ask

The server holds a connection open longer than the hook leaves it idle, so a pooled socket stays live between two events.

`wire().listen` builds the server with `createServer(onRequest)` and sets no timeout, so node keeps `keepAliveTimeout` at 5 seconds. The hook's `$.http.fetch` pools its connection and reuses it. Where the gap between two events runs past 5 seconds, the server closes the socket as the client writes on it, and the client reads `The socket connection was closed unexpectedly`.

The session log carries the pattern twice, and both gaps read the same:

| the last good fetch | the failing fetch | the gap |
|---|---|---|
| `09:21:12.621` | `09:21:18.857` | 6.24 s |
| `09:21:21.274` | `09:21:27.510` | 6.24 s |

A fetch that follows a failure stands, because the failed write drops the dead socket and the next one opens a fresh connection. So the hook loses one event per idle stretch, and `down()` writes one warn for each.

Done is a server whose `keepAliveTimeout` runs past the window the hook idles in, and a test holding the number. `the server answers nothing at` then stands for a server that is down, and for that alone.

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

Trunk carries the change and the case, so this step changes no line and reads
the diff against the ask.

| what the ask asks for | where it stands |
|---|---|
| a `keepAliveTimeout` past the window the hook idles in | `IDLE` in `src/doors/wire.js` |
| the header wait above it, which node wants | `HEADERS`, set off `IDLE` and a spare |
| the two set where the server listens | `wire().listen`, which `serve` calls |
| a test holding the number | `test/contract/wire.test.js` |

The case reads the two off the listening server, and reads the header wait
standing above the idle one. So a hand lowering either meets a red case.

**What surprises.** Nothing in the bridge sets a timeout of its own, and the
one place holding both stands behind the door. The server reaches the socket
through `wire` alone, so the numbers move in one file.

The three causes the Discussion sorts stay sorted. `the server answers nothing
at` now stands for a server that is down, and the other two causes carry their
own tickets.

# Discussion

A sweep of every file under `.se/log` turned this up. The line `the server answers nothing at http://127.0.0.1:6510/event` stands six times across the logs, and carries three causes:

| the detail | the count | what stands behind it |
|---|---|---|
| `The socket connection was closed unexpectedly` | 2 | this ticket |
| `Unable to connect. Is the computer able to access the url?` | 2 | the server was down, and [[spec/tickets/the-bridgehead-needs-no-shell]] holds why one of them stayed down |
| `remote-cancel` | 2 | the host cancelled the fetch as the turn ended, and the server was fine |

The same sweep shows the watcher restarting the server five times in 70 seconds while one file took five writes. Each restart stands in the log at info, and the events landing in that window take the restart's gap.

| what trunk carries | where it stands |
|---|---|
| the kept socket and the header wait, off two named spans | `src/doors/wire.js` |
| both spans held against a real socket | `test/contract/wire.test.js` |

The idle span stands past any gap a turn leaves between two events. A hand taking this ticket reads the diff and closes it, or names what it misses.
