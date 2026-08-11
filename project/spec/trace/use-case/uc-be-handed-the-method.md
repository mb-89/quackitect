---
id: uc-be-handed-the-method
type: "[[use-case]]"
statement: Receive everything a step demands be read, and prove it arrived whole.
actor: stk-agent
trigger: the walk reaches a state that owes reading, or a context is compacted
precondition: none
guarantee: every owed document has been delivered whole and proven, and the state opens
refines:
  - sty-the-agent-proves-it-read
priority: must
---

## Main scenario

1. The reader asks the machine what to do.
2. The machine answers with ONE document, whole, inside the reply.
3. It names the proof: the words following a phrase near the document's end.
4. The reader reads and answers with those words.
5. The machine credits the document and hands over the next, until none is owed.
6. The state opens.

## Extensions

- 2a. The host truncates large replies. One document at a time means a single reply is small enough to survive, and the end-of-document proof catches it if not.
- 4a. The answer is wrong. Nothing is credited and the same document comes back.
- 4b. The reader is a person rather than an agent. They tick the document as read on the surface, and the tick unticks itself if the document is edited afterwards.
- 5a. The context is compacted, so what was read is gone from the reader's head. The machine knows, and the loop hands it all back.
- 6a. The state also demands a document nobody has written. The walk stops and names the missing document, rather than opening without it.
