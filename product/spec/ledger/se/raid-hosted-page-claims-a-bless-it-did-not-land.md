---
id: se.raid-hosted-page-claims-a-bless-it-did-not-land
kind: raid
statement: "SHIPPED DEFECT (i8d): the hosted decision page reports success for a bless that bound NOTHING. The page POSTs the answer to the relay and treats a 200 as 'Blessed. You can close this page.' - but a 200 only means the RELAY accepted a message, not that the ENGINE accepted a decision. If the offer was already decided on the board or in chat, or the hash no longer matches, the engine correctly ignores the answer while the owner is told it worked. The page is a static snapshot with live-looking controls, so this happens whenever a gate is decided on any other surface first. Worse than a broken button, because it lies in the reassuring direction - the same silent-success class as se.law-whitelist-guards was minted to kill."
provenance:
  iteration: i12-tool-surface
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: "Open now, shipped in i8d; routed to the next phone iteration. WHITELIST SHAPE: the ONLY success state is 'the engine confirmed this bless' - a relay 200 is not it. Fixes, cheapest first: (c) the page says 'sent - confirm on the board' instead of 'Blessed'; (a) the page polls the answer topic or a status key for confirmation before claiming success (ntfy's since-poll is already CORS-verified, so the page can read as well as write); (b) the engine republishes a 'decided' object to the same KV key on bless or dismiss from ANY channel, so an open page self-invalidates - which is what the owner described as one representation across surfaces that invalidate each other. The same question applies to the ntfy card's two buttons at the floor rung, which stay tappable after the offer is decided."
---


