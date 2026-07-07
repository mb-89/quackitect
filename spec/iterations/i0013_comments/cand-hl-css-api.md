---
id: cand-hl-css-api
type: candidate
axis: highlight-rendering
ratings:
  dom-static: 1
  reader-ux: 0.9
  buildability: 0.8
statement: CSS Custom Highlight API - ranges painted by the browser, no DOM mutation.
class: review
killer: false
---
Pro: dom-static holds by construction; overlapping highlights are free; removal is a registry call. Con: current-generation browsers only (Chromium, Firefox, Safari today); no highlight in legacy browsers.
