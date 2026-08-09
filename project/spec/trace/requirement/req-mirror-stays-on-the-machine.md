---
id: req-mirror-stays-on-the-machine
type: "[[requirement]]"
statement: While the mirror serves, the engine shall accept connections from the machine it runs on only, refusing 100 % of connections originating off that machine.
kind: quality
characteristic: security
verify_method: test
breaks_if_removed: Everything the product knows — every call, every form, every decision — is readable by anyone sharing the network.
breaks_how_badly: fatal
measure: 0 successful requests from a non-loopback source address, over a run that attempts at least one.
refines:
  - uc-quality-security
source_refs:
  - "engine/mirror.ts: server.listen(o.port) — no host argument, so Node binds every interface"
  - "engine/mirror.ts: access-control-allow-origin is * on the alive endpoint"
  - "guidance/voice.md: people & privacy"
priority: must
---

## Scenario

SOURCE. Anything that can reach the machine's IP address on the mirror's port.

STIMULUS. An HTTP request for any served path — the page, a widget, the log
feed, a form.

ENVIRONMENT. The mirror running normally, on a network the machine shares
with anything else at all: an office LAN, a café, a conference.

ARTIFACT. The mirror's HTTP server.

RESPONSE. The connection is refused because the server is not listening on
anything but the loopback interface.

RESPONSE MEASURE. Zero successful requests from a non-loopback source
address, over a run that attempts at least one.

## Detail

THE DEMAND IS NOT MET TODAY, and that is why this row exists rather than
describing what already works.

`server.listen(o.port)` passes no host, and Node then binds every interface.
The comment three lines above it says "the server never leaves localhost",
which is what somebody believed rather than what the call does.

WHAT IS EXPOSED IF THIS IS WRONG. The mirror serves the whole record: the
call log, every evidence form, every decision, the terminal widget. There is
no authentication anywhere, by design, because the design assumed one
machine.

THIS ROW CAME FROM THE CHECKLIST (owner design 2026-08-07). Nobody wrote a
security quality because nobody thought this product had one. The nine
characteristics of ISO/IEC 25010:2023 are asked in full, so Security had to
be answered, and answering it found this.
