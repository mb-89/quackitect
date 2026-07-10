---
id: guide-mobile-pairing
type: guide
audience: user
statement: Pair a phone, answer gates from anywhere - setup, answering, and the sharp edges.
class: review
killer: false
---
## Pair once

- Run `quack pair ntfy`. One operation mints the topic credential, writes the machine-local pairing config, and prints a QR code.
- Scan the QR **with the ntfy app** (Settings → the + button → scan, or any scanner that hands `ntfy://` links to the app). The app stores the channel.
- A camera scan that opens the BROWSER also works for answering, but stores nothing - use the app for a durable subscription.
- A second device subscribes anytime: `quack pair --show` re-prints the QR without re-minting.

## Safety, read at pairing

- The transit DISCLAIMER: asks travel a third-party relay and are cached there for hours. They carry check ids and questions, never secrets. Self-host ntfy to remove retention.
- The LOCKSCREEN instruction: enable hide-actions-until-unlock. A pocket touch must not answer a gate.
- The topic is the credential. Treat it like a password.

## Answering

- A GATE ask arrives high-priority with ‼ and two buttons: bless (y) / reject (n). A decision ask arrives calm, with up to three option buttons; more options list in the body and you reply `<option-id> <ask-id>`.
- One tap answers. The first answer from ANY lane wins - console or phone; the loser is superseded and a late tap is ignored.
- The tap is final the moment you press it. Deleting the message afterwards changes nothing - but deleting it BEFORE tapping removes the buttons; ask the agent (or run `quack ask <gate>`) to re-send.
- Unanswered asks expire at their timeout and drain later taps harmlessly.

## How the machine listens

- `quack await` holds a live stream open - a tap resumes a waiting walk instantly.
- Every other engine command also drains pending answers - a tap never waits longer than the next command, even with no await running.
- No daemon runs. The machine answers only while it is on.
