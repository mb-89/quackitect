---
id: wt-sending-a-signed-position-back-for-rework-can-leave-it-unrea
type: "[[work]]"
statement: "Sending a signed position back for rework can leave it unreachable, because routes are drawn forward only. The verb that sends it back refuses three things and reachability is not among them, so it succeeds and the walk then has no way to arrive. i63 made the trap tighter rather than looser by minting work at the returned position, which holds it shut. The cheaper of the two repairs is for the sending verb to ask the router whether the target will still be reachable, and refuse or warn."
ready_when: "ready when i52-the-route-can-go-back-a-walk-can-reach-a opens, since that record owns whether a walk can reach a position behind it"
source: "note-4de01247e0d2"
---

## Why it stands

Sending a signed position back for rework can leave it unreachable, because routes are drawn forward only. The verb that sends it back refuses three things and reachability is not among them, so it succeeds and the walk then has no way to arrive. i63 made the trap tighter rather than looser by minting work at the returned position, which holds it shut. The cheaper of the two repairs is for the sending verb to ask the router whether the target will still be reachable, and refuse or warn.

## When it comes back

ready when i52-the-route-can-go-back-a-walk-can-reach-a opens, since that record owns whether a walk can reach a position behind it
