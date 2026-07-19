---
id: con-interface--go-truth-in-spec--nbr-git
type: connection
kind: interface
src: go-truth-in-spec
dst: nbr-git
statement: The shared workspace files: git versions the same spec/ tree the ledger serializes.
class: review
killer: false
---
Neighbour: git. What flows: the workspace's committed truth - spec nodes, connections, evidence docs - outward into history; merged collaboration edits back in. Direction: out (git consumes the files the ledger writes; the engine never calls git and works without it). Channel: the filesystem - the repository IS the medium; caches and verdicts stay outside it in the data home.
