---
minted_in: i1
id: nbr-vscode
type: "[[neighbour]]"
statement: VS Code, the host the mirror runs inside — it draws the panels and owns the editor the walk opens files in.
direction: both
---

## Interface

An extension holding webviews. The pages post messages out to it —
`open` a file, `details` a subject, `download` an export, `busy`, `nav`,
`trace` — and it relays wake events back in.

The extension does NOT recompile with the engine, so it is a separate build
and a separate leg of every surface change. Colours come from the host's own
theme through the palette file; our own hex is the last resort.
