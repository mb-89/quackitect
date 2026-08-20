---
form: payload-limit-guard
by: agent
signed_off: 2026-08-19T16:44:36.363Z
authors: agent
files:
---

# Evidence form / payload-limit-guard

## current_situation

Break 1 of harness-portability measured every guidance page on the wire against Copilot CLI's 20 KiB offload threshold and found two over: craft/software.md at 27,130 and refusals.md at 21,675, with method/retro.md at 19,460 one paragraph away.

RE-MEASURED TODAY the numbers are 27,130 and 21,907. refusals.md grew, and walking.md moved from 14,795 to 15,890 because this session edited it.

NOTHING MEASURED ANY OF IT. The corpus could drift over a host limit with nobody being told, which is what break 1 actually said the problem was.

## built

project/deliverable/engine/payload-limit.ts, new.

`onWireBytes(text)` measures what a text costs once serialised into a response, envelope included. ENVELOPE_BYTES is 2,310, measured off a bare pull on 2026-08-18.

`oversizedPayloads(payloads, limit)` returns each breach with its name, its wire cost, the limit it broke and by how much. `worstMargin` reports how close the worst payload sits to the line, because a page one edit from the limit crosses it silently.

THE LIMIT IS PASSED, NEVER DEFAULTED. A default parameter swallows an explicit `undefined`, so a caller saying "nothing is measured" would have silently received the registry's number instead. That was caught by its own test failing, and the signature changed rather than the test. `measuredLimit()` is the convenience for callers that want the registry's answer.

TESTS. project/deliverable/tests/payload-limit.test.ts, six cases, all green. The important one measures the REAL guidance corpus rather than a fixture, and asserts no more pages have crossed the line than the two recorded on 2026-08-18. A third page crossing makes it red.

Run on 2026-08-19: 6 passed, 0 failed.

## follow_up

THE TWO OVERSIZED PAGES ARE NOT A LIVE BREAK, and the reason matters more than the fact. When break 1 was written the answer bound was 60,000, nearly three times Copilot CLI's threshold, so the host acted first and offloaded the document. The bound is now 6,000 and derived, well under 20,480, so a served document is paged by the lane before any host sees it whole.

SO THE PAGES ARE RECORDED, NOT FIXED. Shrinking them would be a content edit to the method itself, and it buys nothing while the bound covers them. The test holds the line at two so a third crossing is caught.

TWO PAYLOAD CLASSES HAVE NO MEASURED LIMIT AT ALL, and this is the honest gap.

- tools/list, which mcp.ts itself calls the one exit the bound cannot cover. harness-portability measured 19,538 bytes of descriptions and 46,101 of schemas.
- The instruction files. AGENTS.md measures 46,539 on the wire.

NEITHER IS COMPARED HERE, deliberately. The 20,480 figure is an OUTPUT threshold from COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES, and a tools/list response is not a tool output. Applying it to them would be a comparison with evidence on one side only. Measuring what those two classes actually face is the work this chunk leaves owed.

## anything_else

