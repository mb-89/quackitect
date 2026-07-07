---
id: cand-store-dom
type: candidate
axis: comment-storage
ratings:
  single-file: 1
  agent-readability: 0.4
  dom-static: 0.1
statement: Comments as hidden DOM elements beside their anchors (the OOXML school - markers in the document).
class: review
killer: false
---
Pro: anchor and comment sit together; no separate serialization. Con: violates req-comment-dom-static; read-back becomes DOM scraping; idempotent save gets hard; the i12 book-dom-static rule breaks.
