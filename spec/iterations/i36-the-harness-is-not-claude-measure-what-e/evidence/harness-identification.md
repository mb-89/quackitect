---
form: harness-identification
by: agent
signed_off: 2026-08-19T16:28:34.428Z
authors: agent
files: null
---

# Evidence form / harness-identification

## current_situation

The engine did not know which harness was calling it. Not approximately, at all.

AND IT WAS HANDED THE ANSWER ON EVERY CONNECT AND THREW IT AWAY. MCP's `initialize` carries `clientInfo: {name, version}`. Three things were true together in mcp.ts, as recorded in Part 3 of spec/harness-portability.md:

- `TransportRequestMetadata` and `RequestContext` both declared clientInfo, and the adapter copied it when present.
- The initialize handler never read `msg.params.clientInfo`.
- Both transports called `handle(msg)` with no metadata, so the field was always undefined.

The plumbing existed and was dead end to end.

WHAT IT COST. Every refusal rate, failure rate and slow call in the whole log was pooled across hosts. "It runs worse on Copilot" could not be shown, ranked or closed out, because nothing in the record said which one it was.

## built

project/deliverable/engine/mcp.ts.

INITIALIZE NOW READS clientInfo. The handler takes `msg.params.clientInfo`, keeps `{name, version}` on the server, and ignores anything without a non-empty string name. A malformed or absent clientInfo leaves the host unknown and does not throw.

TWO ACCESSORS. `clientInfo()` returns what the host called itself. `harness()` resolves that through the registry and returns undefined when nothing matches.

EVERY CALL RECORD IS STAMPED. `observe()` adds `client` and `harness` to the record before handing it to the observers. A record from an unidentified host is left UNSTAMPED rather than stamped `unknown`, because a made-up value would pollute every later rate.

TESTS. project/deliverable/tests/harness-identity.test.ts, seven cases, all green:

- the host's own name at initialize is kept
- the name resolves to a registry entry, so limits are reachable
- the name is available before any work state
- a host nobody measured is named but unmatched
- a nameless or malformed clientInfo leaves the host unknown and does not throw
- every call record carries the host it came from
- a record from an unidentified host is unstamped rather than stamped unknown

Run on 2026-08-19 over harness-identity.test.ts and harness.test.ts: 12 passed, 0 failed.

## follow_up

A DEFECT SURFACED UNDERNEATH THIS ONE, and it is now visible because the spill fix cleared what was hiding it.

Nine cases in mcp.test.ts still fail. Their message used to be `spill read failed ... (not found)`. It is now `spill read failed ... SE-C-040`, the narration toll refusing the paging read with "22 calls since the last". So the spill file is found and the read is refused instead.

THE TOLL SHOULD NOT BITE A PAGING READ. walking.md already rules that the reading loop pays nothing, because the machine forced the hop and no judgment happened on it. Continuing a bounded answer through `.se/answers/` is the same shape: it is the lane's own cursor being followed, not work being narrated.

WHERE IT GOES. Chunk bound-ties-to-measured-limit owns the bound and its cursor, and this is the cursor half. It is recorded here rather than fixed here because this chunk is about identification.

THE TRANSPORTS STILL PASS NO METADATA. Part 3 also notes both transports call handle(msg) with no metadata argument. This chunk did not need it, because initialize carries clientInfo in its params. The dead metadata path is still dead and could now be removed or wired.

## anything_else

