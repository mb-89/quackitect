# cytoscape — vendored graph renderer

- File: cytoscape.min.js
- Version line: cytoscape 3 (jsdelivr dist build)
- Source: https://cdn.jsdelivr.net/npm/cytoscape@3/dist/cytoscape.min.js
- Pulled: 2026-08-18
- License: MIT (cytoscape.js)

WHY IT IS VENDORED. The trace widget fetched this from unpkg on every open,
which is a run-time dependency on somebody else's server. Offline the widget
drew nothing while looking like it was loading.

The rule: pull an asset once, freely — never depend on a server RUNNING our
work. The mirror serves this file at /vendor/cytoscape.min.js.

To update: pull the same URL again and open the trace widget end to end.
