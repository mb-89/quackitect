# Field report — render coupling and cache invalidation

**Read this first.** This is a *field report*, not a spec and not a ruling. It records
what was read in the code on one day, by one agent. It will go stale like every
other piece of prose in this repo.

| | |
|---|---|
| Written | 2026-08-29 |
| Verified against | branch `v3`, commit `c6aebb0` |
| Method | reading source only. No profiling, no instrumentation, no running system. |
| Trigger | owner report: "things that happen in the backend trigger a drawing of the frontend and that slows everything down" |

**Before acting on anything below, re-check the cited `file:line` against the current
tree**. Every claim carries its evidence so that it can be falsified cheaply. Claims
without a snippet are marked UNVERIFIED and should be treated as guesses.

The system is working today. Nothing here is a defect report against a broken system.
It is a description of where the cost sits.

---

## 1. What was checked, and what was not

CHECKED (source read end to end or in relevant part): `trace.ts`, `traceschema.ts`,
`traceup.ts`, `notes.ts`, `signals.ts`, `model-fs.ts`, `sessionlive.ts`, `mirror.ts`,
`renderclient-walk.ts`, `renderclient-live.ts`, `machine.ts` (cone only),
`sessionclaims.ts` (claims/verdict path only), `workstore.ts` (one function).

NOT CHECKED: `session.ts` (259 KB), `render.ts` beyond entry points, `tools*.ts`,
the VS Code extension, anything under `spec/`. **All markdown prose in the repo was
deliberately ignored**, including comments that make claims about behaviour. The
exception is where a comment records a measurement — those are quoted as claims, not as
facts.

NOT MEASURED, and this is the important gap: **how long a `renderMirror` actually
takes**. Everything in section 3 is a mechanism, not a magnitude. Section 6 gives the
one measurement that would settle it.

---

## 2. Two hypotheses that were tested and FAILED

Recorded so the next agent does not re-tread them.

**FAILED — "the write path blocks on rendering."** It does not.
`notifyChange` is never awaited anywhere in the tree. Every call site is a bare
statement. `renderMirror` (`render.ts:932`) is invoked only from a GET handler
(`mirror.ts:1237`), never from the change path. The fan-out contract is explicit:

```ts
// signals.ts:7
// FIRING DOES NOT WAIT. A slot that needs to do real work schedules it.
```

**FAILED — "a slow or absent client applies backpressure."** It cannot.
`res.write(...)` at `mirror.ts:1160` is not awaited and its `false` return is ignored.
There is no `drain` handling. A disconnect sets `open = false` (`mirror.ts:1151`) and
the loop exits within one `waitForChange` cycle (≤ 2 s).

---

## 3. What the change→render path actually does — CONFIRMED

One state change or file write produces, per connected client, a **full server-side
page render**. There is no server-side diff.

1. **Signal.** `Session.notifyChange()` → `Liveness.notifyChange()`
   (`sessionlive.ts:322-332`) → `wake()` (`sessionlive.ts:336-340`) drains an array of
   resolvers. ~40 call sites, mostly in `session.ts`. `session.ts:5394` is the state
   transition. Filesystem writes arrive via `model-fs.ts:11-14 publish()` →
   `emitModelMutations` (`signals.ts:34-36`), subscribed at `mirror.ts:216-222`.

2. **Transport is SSE**, the only one in the repo. `mirror.ts:1144-1166`,
   `"content-type": "text/event-stream"`. Client at `renderclient-live.ts:394`
   `new EventSource("/events")`. `/api/alive` (`mirror.ts:1176`) is a pull fallback for
   embedded cards.

3. **Payload is a whole JSON blob, not a diff.** `aliveState()` (`mirror.ts:237-269`),
   serialised whole and string-compared against the previous
   (`mirror.ts:1157-1160`). Each tick also does `statSync(o.log.path)`
   (`mirror.ts:255`) and `allWorkSignal(state.root)` (`mirror.ts:259` →
   `workstore.ts:416`, which walks every work home).

4. **The client responds by re-fetching the entire page** (`renderclient-walk.ts:333-340`):

```ts
const r = await fetch(url);
const doc = new DOMParser().parseFromString(await r.text(), "text/html");
morph(document.body, doc.body);
```

   `renderclient-*.ts` is not an alternative renderer. It is the shell that decides
   *when* to re-request server-rendered HTML and morphs it in. The diff is computed
   client-side, after the whole page has been rebuilt server-side.

5. **That render loads the trace corpus.** `render.ts:31` imports `traceCard`.
   `traceui.ts:367` calls `loadTrace(root)` on every trace-widget GET.

**No debounce exists.** No `debounce`, `throttle`, `setImmediate` or `queueMicrotask`
in `mirror.ts`, `vault.ts`, `signals.ts`, `sessionlive.ts`, `model-fs.ts` or
`render.ts`. Coalescing is incidental: `wake()` absorbs changes fired while the loop is
off-wait, and `refreshInFlight` (`renderclient-walk.ts:330`) *drops* overlapping client
refreshes. N spaced changes → up to N renders per connected client. There is also a
**2 s poll floor**: `await state.session.waitForChange(2000)` (`mirror.ts:1162`). Every
connected client recomputes `aliveState()` at least every 2 s regardless of whether
anything changed.

### Why this costs the agent latency even though nothing is awaited

Node has one event loop. The render is not awaited by the writer, but it runs on the
same thread as lane dispatch. The agent's next tool call queues behind it. **The
coupling is the shared thread, not an await.** This is the mechanism that matches the
owner's report.

---

## 4. The caching layer is structurally defeated — CONFIRMED

The note cache is well built. Inside a pass, `noteOf` (`notes.ts:271`) is a map lookup
against a module-level `HELD` map — zero stats, zero parses:

```ts
// notes.ts:184
if (hit !== undefined && DEPTH > 0 && hit.epoch === EPOCH)
```

Outside a pass it re-stats and compares
`stamp = ${s.size}:${s.mtimeMs}:${s.ctimeMs}` (`notes.ts:193`). Entries written
< 25 ms ago are `provisional` and never hit (`notes.ts:212`). Per-process, unbounded,
no eviction.

**Two things throw the warm model away:**

**(a) Every HTTP request invalidates everything derived.** `beginPass()` bumps both
counters unconditionally, and `mirror.ts:1291` calls `beginPass()` on every request.

```ts
// notes.ts:123-126
EPOCH += 1; DERIVED += 1;
```

Since `passEpoch()` returns `DERIVED`, `loadTrace`'s fast path misses on *every request*
(`trace.ts:542`). It falls through to a full `corpusStamp()` sweep — a `stat` of every
corpus file. Parsed nodes are reused only if the stamp then matches (`trace.ts:546-549`).

**(b) Every write invalidates everything derived, corpus-wide**. `forgetPath` does
`DERIVED += 1` (`notes.ts:80`), and the code comment names the consequence: *"one write
moves them all."*

**The corpus stamp is metadata, not content**, and it is one hash for the whole corpus:

```ts
// trace.ts:490-499
for (const f of files) parts.push(`${f}:${nodeStamp(f)}`);
return contentHash(parts.join("\n"));
```

`nodeStamp` is `size:mtimeMs:ctimeMs`. Consequences: touching a file without changing
it invalidates. A `git checkout` or permission change invalidates (via `ctimeMs`). Any
one file changing invalidates everything.

`corpusVersion` has exactly two callers, both in `sessionclaims.ts` (579, 755). They
feed the verdict memo key (`sessionclaims.ts:603`) against a static `VERDICTS` map
(`sessionclaims.ts:142`). When the stamp changes, **every** key changes at once and all
claims re-run.

One leak: `trace.ts:296-298 itemTemplate` still calls `statSync` directly, bypassing
the door.

The code's own comments record two measurements. One is *"870 reads of one file to
enter a record"*. The other is *"714 reads and 714 parses of files the corpus had
already read"* (`traceschema.ts`). Both appear to be **already fixed**. Those call sites
now route through `noteOf` (`traceschema.ts:27`, `traceschema.ts:81`). Treat the
comments as historical.

---

## 5. The trace graph — CONFIRMED

Reported here because it interacts with section 4, not because it is the slowness.

**Edge kinds exist in the schema and are erased at load.** `traceschema.ts` declares
seven kinds (`refines, satisfies, implements, carries, verifies, demonstrates,
realizes`), read from `deliverable/machines/trace-schema.md`. The loader collapses them:

```ts
// trace.ts:572
refines: [...asList(fm.refines), ...asList(fm.satisfies), ...asList(fm.implements),
          ...asList(fm.verifies), ...asList(fm.realizes)],
```

The declared type is `refines: string[]` (`trace.ts:56`). The schema therefore functions
as a **write-time validation table** (`edgeProblems`) and the kind is discarded for
every consumer.

- **`carries` and `demonstrates` are not in that list at all** — those edges are
  invisible to the entire corpus. Likely a straight bug.
- **`traceup.ts:20 UPWARD` is a second, hardcoded map that disagrees with the schema
  file** (it has `carries`/`demonstrates`, and it omits `element: satisfies` and
  `interface: implements|satisfies`). Two sources of truth, one lossy.
- Keys are free strings (`typeof e.key === "string"`, `traceschema.ts:31`) — the set is
  closed by data, never by a TS union.

**There is no impact/suspect/staleness traversal on the trace graph.** Not partial —
absent. What exists is reachability: `descendantsOf` (`trace.ts:608`), `rootsOf` (624),
`rootsAllOf` (645), `upwardFrom` (`traceup.ts:107`). None branch on edge kind. They
cannot, because the kind is gone.

**Typed, terminating propagation is already implemented — on the machine graph.**

```ts
// machine.ts:16
export type EdgeRole = "normal" | "alternative" | "fallback" | "recovery" | "approval" | "error";
// machine.ts:430  downstreamCone(m, stateIds)
// machine.ts:470  if (e.role !== "normal" && e.role !== "approval") continue;
```

Consumed at `sessionclaims.ts:804`. **The pattern the trace graph needs is written,
working, and applied to workflow states.**

**Suspicion is derived, not stored — this is already correct**. `stripSuspect`
(`forms.ts:280`) removed the old written marker. `suspectStates`
(`sessionclaims.ts:797`) recomputes per look. `iterationDrift` (`iterations.ts:515`)
*"IT WRITES NOTHING, on purpose"*. No suspect/stale/dirty field is written onto any
trace node.

**Reverse traversal is rebuilt per call, never indexed**. The `kids` map is built
inside `descendantsOf` (`trace.ts:609`), so "what points at this" is O(corpus) per
query. The orphan detector is `uncoveredOf` (`trace.ts:525-527`), surfaced by
`se_coverage` (`tools-desk.ts:271`).

**Nothing distinguishes event-like records from live claims for traversal**. Gate and
iteration records live outside `traceDir(root)` entirely, reached by filename hunt
(`trace.ts:597`). No immutability, recency or event predicate exists in code. The v1
mass-suspect hypothesis (gate records wrongly joining the cone) **cannot be tested in
v3**, because there is no propagation to test it against.

---

## 6. The measurement that settles the open question

Everything in section 3 is mechanism. The magnitude is unknown.

**Measure the wall-clock gap between a lane call arriving and being dispatched. Sample
with the Mirror open versus with no client connected.**

- Gap collapses with no client connected → the render coupling is the slowness, and
  section 7 is the work list.
- Gap unchanged → the cost is elsewhere. Section 7 items 1 and 4 are still worth
  doing on their own merits, but the diagnosis is wrong.

Do this before any structural work.

---

## 7. Work list, cheapest first

Each item names what it is load-bearing for.

| # | Change | Load-bearing for | Confidence |
|---|---|---|---|
| 1 | Stop bumping `DERIVED` unconditionally in `beginPass` (`notes.ts:123`). Invalidate from actual file changes | kills the per-request corpus stat sweep | high — mechanism confirmed |
| 2 | Debounce the SSE loop (~60–100 ms) | turns bursts into one render | high |
| 3 | Make `refresh()` scoped — fetch the changed fragment, not the whole page (`renderclient-walk.ts:333`) | removes full page render per change per client | high |
| 4 | Per-path invalidation instead of a global counter in `forgetPath` (`notes.ts:80`) | ends "one write moves them all" | high |
| 5 | Content hashes instead of `size:mtimeMs:ctimeMs` (`notes.ts:193`, `trace.ts:490`) | stops `git checkout` and no-op touches invalidating | high |
| 6 | Index the reverse edge map instead of rebuilding it per call (`trace.ts:609`) | O(1) "what points at this" | medium |
| 7 | Stop collapsing edge kinds at `trace.ts:572`. Keep `key` on the edge | precondition for any typed propagation | high |
| 8 | Add `carries`/`demonstrates` to the loader. Reconcile `traceup.ts:20 UPWARD` with the schema file | two edge kinds currently invisible | high |
| 9 | Port `downstreamCone` (`machine.ts:430`) to the trace graph once 7 lands | change-impact queries | medium |
| 10 | `aliveState` walking every work home per tick (`mirror.ts:259`) | per-tick cost, ≥ every 2 s per client | medium |
| 11 | `itemTemplate` `statSync` bypass (`trace.ts:296-298`) | last known door leak | low |

Items 1–3 are small and independent of any language question. Do them first: they are
cheap, and they convert the open question in section 6 into a measured answer.

---

## 8. What this report does NOT establish

- That a rewrite is warranted. Nothing here was measured.
- That the trace graph's incompleteness caused the slowness. It did not. It is a
  separate, cheaper gap (items 7–9).

- That items 1–5 are sufficient. They remove algorithmic waste. They do **not** provide
  the structural guarantee that rendering can never occupy the thread the agent is
  waiting on. In a single-loop runtime there is nowhere to schedule that work to.
  Whether that guarantee is worth its cost is an owner decision, not a finding.
