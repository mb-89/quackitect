---
id: req-comment-save-fallback
type: requirement
depends_on: []
statement: If in-place saving is unavailable, then the comment layer shall offer the commented copy as a download.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability, reliability]
---
## Rationale (not load-bearing)
Owner decision: Chromium-first with fallback; no browser is locked out of commenting.
