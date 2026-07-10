---
id: req-responsive-status
type: requirement
depends_on: []
statement: When the user runs a status or report command, the engine shall answer within one second on the reference machine.
class: review
killer: false
kind: quality
tags: [architecturally-significant]
phase: [operation]
discipline: [software]
quality: [efficiency, usability]
stimulus_source: the user at the console
stimulus: a status or report command
artifact: the verdict evaluation
environment: warm cache, reference machine
response: the board renders
response_measure: under one second
---
## Rationale (not load-bearing)
seeded quality example (field c26): the six-part scenario grounds the qualities view; realized by the i10 verdict cache

<svg viewBox="0 0 640 90" font-family="system-ui" font-size="12" role="img" aria-label="quality scenario: status responsiveness">
<rect x="5" y="30" width="110" height="30" rx="6" fill="#e8eef7"/><text x="60" y="49" text-anchor="middle">user command</text>
<line x1="115" y1="45" x2="185" y2="45" stroke="#4a6fa5" stroke-width="2"/><text x="150" y="38" text-anchor="middle" fill="#4a6fa5">stimulus</text>
<rect x="185" y="30" width="150" height="30" rx="6" fill="#e8eef7"/><text x="260" y="49" text-anchor="middle">verdict evaluation</text>
<line x1="335" y1="45" x2="405" y2="45" stroke="#4a6fa5" stroke-width="2"/><text x="370" y="38" text-anchor="middle" fill="#4a6fa5">response</text>
<rect x="405" y="30" width="110" height="30" rx="6" fill="#e8eef7"/><text x="460" y="49" text-anchor="middle">board renders</text>
<text x="575" y="49" text-anchor="middle" fill="#2a6a3a">&lt; 1 s</text>
</svg>