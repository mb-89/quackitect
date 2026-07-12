---
id: req-vehicle-white-label
type: requirement
statement: While rendering from a vehicle, the book shall present the vehicle's identity and credit the engine - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. While rendering from a vehicle workspace, the book shall take its title, wordmark, and brand assets from the vehicle's brand layer, never from the engine's.
2. While rendering from a vehicle workspace, the book's self-referential voice shall name the vehicle - the engine's name appears as credit and reference, never as the document's own identity.
3. The book rendered from a vehicle shall credit the engine by name in its appendix or colophon, so the engine is referenced honestly rather than hidden.
4. When a vehicle's book presents the engine's name as its own identity (title or wordmark), the white-label selftest shall fail naming the leak.

## Rationale (not load-bearing)
Owner (field, pre-vehicle-build): the org gets the VEHICLE, never quackitect bare. Mentions are
fine - the bar is IDENTITY, not occurrences (NOTE-20260712-113841). The brand-asset half is
proven (placeholder seeds at start init, zero duck leakage - probed 2026-07-12); this closes
the book lane on top of req-vendor-workspace.4's binary-name branding.
