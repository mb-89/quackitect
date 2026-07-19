---
id: con-interface--go-binary--nbr-console
type: connection
kind: interface
src: go-binary
dst: nbr-console
statement: The adjudicator's console: typed commands in, the board and verdicts out.
class: review
killer: false
---
Neighbour: the interactive console the adjudicator types at. What flows: commands and flags inward (bless, grant, attest --grant among them); the text board, progress lines, and refusals outward. Direction: in (the person drives; the interactive channel is never gated by its own machinery). Channel: process argv and stdout/stderr of the `quack` launcher.
