---
id: req-ask-loop
type: requirement
statement: The engine shall run the ask loop - each ask rendered, dispatched, distinctly gated, resolved exactly once, and recorded with its actor - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall render an ask as one question, one to three answer options with stable option ids, and a unique correlation id. *(was req-ask-format)*
2. When a gate ask or decision ask awaits adjudication and a device is paired, the engine shall send the ask to the paired device over every paired channel. *(was req-ask-dispatch)*
3. When an ask reaches its timeout unanswered, the engine shall expire the ask and clear or supersede its device notification. *(was req-ask-timeout)*
4. When a well-formed answer carrying a pending correlation id arrives on a paired channel, the engine shall record the answer as the adjudication and mark the ask resolved. *(was req-answer-apply)*
5. If an answer arrives for a resolved or expired ask, then the engine shall ignore it and keep the first resolution. *(was req-answer-idempotent)*
6. While several asks are pending, the engine shall keep each ask independently answerable by its correlation id. *(was req-multi-ask)*
7. While an ask is pending, the engine shall accept the first answer from any lane and resolve the ask for every other lane, and a combined hand-off shall travel as one ask whose answer adjudicates every member. *(was req-first-wins-lanes)*
8. The engine shall render a gate ask visibly distinct from a decision ask on the device. *(was req-gate-distinct)*
9. When a mobile answer resolves a gate ask, the engine shall record the bless with actor user and the answering channel in the record. *(was req-mobile-actor)*
