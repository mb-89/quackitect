---
id: test-prose-marks-comments
type: test
statement: A unit whose only unmarked text sits inside a multi-line HTML comment passes the prose-mark check.
class: executed
verify: selftest:prose-marks-comments
killer: false
tests_red: exempt - stripFillComments landed late in i12 (pre-ship; the book could not have emitted otherwise); a true red was never observable in i13; the recorded red reflected a broken fixture, corrected at bs09
---
## Rationale (not load-bearing)
TODO
