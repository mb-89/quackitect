# mermaid — vendored renderer

- File: mermaid.min.js
- Version line: mermaid 11 (jsdelivr dist build)
- Source: https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js
- Pulled: 2026-08-09
- License: MIT (mermaid-js)

WHY IT IS VENDORED (owner ruling 2026-08-09). A check page that loads its
renderer from a CDN depends on someone else's server every time it opens.
The rule: pull an asset once, freely — never depend on a server RUNNING
our work. mermaid-check inlines this file, so its pages are self-contained
and work offline.

To update: pull the same URL again and rerun a check page end to end.
