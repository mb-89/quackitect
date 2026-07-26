---
condition: read
---

# read — confirmed reading of the listed documents

Arguments: the documents (root-relative paths) that must be READ before the
state can be left (exit) or entered (entry).

How to satisfy it: actually read every listed document — the lane serves
them, and during boot they ride the packet. Then confirm: the human clicks
confirm in the mirror; the agent ticks with confirm: true. The confirmation
is logged as evidence. Confirming without reading defeats the machine's
whole purpose. (Hashes as proof-of-read: planned.)
