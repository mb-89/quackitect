---
minted_in: i1
id: nbr-vscode
type: "[[neighbour]]"
statement: VS Code, the host the mirror runs inside — it draws the panels and owns the editor the walk opens files in.
direction: both
group: supported-products
---

## Interface

An extension holding webviews. The pages post messages out to it —
`open` a file, `details` a subject, `download` an export, `busy`, `nav`,
`trace` — and it relays wake events back in.

The extension does NOT recompile with the engine, so it is a separate build
and a separate leg of every surface change. Colours come from the host's own
theme through the palette file; our own hex is the last resort.

## What i9 changes, 2026-08-19

THE EXTENSION BECOMES THE ENTRY POINT. Today the launcher script prepares a
folder and the extension draws surfaces in it. After this iteration, opening a
folder that IS a project is what prepares it: clearing a stale server, the
preflight check, placing the cage, starting the lane.

SO A NEW THING CROSSES THIS BOUNDARY — activation itself, as a trigger rather
than only as a moment when panels appear.

AND THE LINE ABOVE IS WHY THE RESTART MESSAGE EXISTS. This node already
records that the extension does not recompile with the engine and is a
separate build. That is precisely the class of change a running window cannot
pick up, so the host is told to reload rather than left to go quiet.

WHAT DOES NOT CROSS. A folder that is not a project. Nothing is prepared,
nothing is installed and nothing is written there, by the owner's ruling that
the folder open in the editor IS the project and a folder without the
machine-state folder simply is not one.
