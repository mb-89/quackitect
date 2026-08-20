---
minted_in: i1
id: raid-reload-hides-new-verbs
type: "[[raid]]"
kind: issue
statement: A verb added by a reload stays invisible until the client reconnects, and the headless lane has no way to tell it otherwise.
owner: the driving agent
trigger: whenever a reload adds or removes a tool
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: A verb the engine serves but the client cannot see reads as an unbuilt feature rather than a stale list. An hour goes into re-implementing something that already exists.
source_refs:
  - engine/mcp.ts handleHttp
  - engine/bin/se-mcp.ts notifyToolListChanged
  - note-dc358a9c2c59
---

AN ISSUE, NOT AN ASSUMPTION, and the distinction is the point. It has already
happened, in the present tense, and it has now cost time twice in one day.

It was written down as an assumption first, on 2026-08-07, and corrected the
same day. That mistake is why the hunting card says to check the kind before
the title.

## What happened

se_aim was registered by a reload and could not be called. Later in the same
session it appeared. Then se_reopen and se_amend were built, reloaded, and
were equally invisible — until the owner reconnected the server by hand.

## The cause, corrected

The first diagnosis here was WRONG and is kept so nobody repeats it. It said
the shim sends a notification, the headless path does not, and the fix is to
send one from the child. Sending one is not possible.

THE HEADLESS LANE IS POST-ONLY. `handleHttp` in engine/mcp.ts answers POST and
DELETE; anything else gets 405. There is no GET, so there is no event stream,
so the server has no direction in which to speak first. Nothing is held per
client either — the walk belongs to the process, not to whoever attached.

The shim's `notifyToolListChanged` writes to stdout, and under `--headless`
there is no harness on stdio. It goes nowhere.

So this is not a missing call. It is a transport with no server-to-client
channel, and the client has no reason to look again.

## What it would take

Either the lane grows the Streamable HTTP server stream — a GET that holds
open and carries notifications — or the reload learns to say plainly that new
verbs need a reconnect.

The second is a morning's work and honest. The first is the real fix and
changes the transport contract, so it is a decision rather than a patch.

WHAT TO WATCH EITHER WAY: whether the client HONOURS the notification is a
separate question that only a test answers. Building the channel without
checking the receive would look like a fix and change nothing.
