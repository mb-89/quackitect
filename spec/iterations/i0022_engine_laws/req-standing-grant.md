---
id: req-standing-grant
type: requirement
statement: Where the owner records a standing grant, the engine shall accept in-scope agent blesses under it. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The engine shall record a standing grant with a scope, an expiry, and a collection list.
2. While a grant is live, an agent bless inside its scope shall pass and stamp the grant id.
3. If an agent bless names a killer gate and no live grant covers it, then the engine shall refuse the bless and point at the hand-off pager and the grant. A non-killer agent bless stays lawful.
4. If the agent channel opens or closes a grant without an explicit --by user delegation, then the engine shall refuse - a grant is the owner's act.
5. When a grant closes, the engine shall present every bless collected under it for the owner's confirmation.

## Rationale (not load-bearing)
The uninterrupted-work lead (NOTE-20260714-090128). q-grant-honesty holds the
open criterion question. The grant must keep the review honest, not delete it.
