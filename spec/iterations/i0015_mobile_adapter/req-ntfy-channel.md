---
id: req-ntfy-channel
type: requirement
depends_on: []
statement: Where the ntfy channel is paired, the engine shall send asks and poll answers over HTTP topics using the minted topic set.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
The verified NAT-friendly lane: HTTP PUT + since-polling, topic secrecy as the credential (raid-answer-forgery accepted-risk).
