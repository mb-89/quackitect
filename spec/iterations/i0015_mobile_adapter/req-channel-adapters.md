---
id: req-channel-adapters
type: requirement
statement: Every device channel shall be a zero-dependency adapter behind the ask seam - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. Where a new channel is added, the engine shall require an adapter behind the ask seam and no change to the ask loop. *(was req-channel-seam)*
2. The engine shall implement the ask loop and every channel adapter with the Go standard library only. *(was req-adapter-zero-dep)*
3. Where the ntfy channel is paired, the engine shall send asks and poll answers over HTTP topics using the minted topic set. *(was req-ntfy-channel)*
4. Where the Slack channel is paired, the engine shall send asks and receive answers without an inbound network endpoint. *(was req-slack-channel)*
