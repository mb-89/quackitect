---
minted_in: i1
id: nbr-excalidraw
type: "[[neighbour]]"
statement: Excalidraw, where a person draws a diagram that is then stored in the corpus as a file the drawing tool can reopen.
direction: in
group: supported-products
---

## Interface

A FILE FORMAT CROSSES, and nothing else. There is no call, no protocol and no
process. `spec/UI.excalidraw.svg` is the file standing today: a valid SVG that
carries the editable scene inside it, so the same bytes render for a reader and
reopen for an author.

THE EDITOR IS THE VS CODE EXTENSION, `pomdtr.excalidraw-editor`, published under
the Excalidraw organisation and MIT-licensed. It registers a custom editor for
`.excalidraw`, `.excalidraw.svg` and `.excalidraw.png`, so opening the file in
the editor opens the canvas rather than the markup.

WHAT WOULD BREAK IF IT CHANGED. A format change that stopped embedding the
scene would leave a picture nobody can edit again. The `.svg` and `.png`
variants are the mitigation and the risk at once: they render everywhere,
including where the extension is absent, and only the extension can reopen them.

## What this neighbour is not

NOT A DESIGN TOOL FOR INTERFACES. What it saves is geometry — a rectangle at a
coordinate — with no vocabulary for a button, a field or a list. A drawing made
here tells a reader what a screen looks like and does not tell a builder what
its controls are.

THAT LIMIT IS WHY IT SITS BESIDE THE UI DRAWING AND NOT UNDER IT. `ux.md` rules
that the assistant's visual judgment is not good enough to improvise with, and
a format carrying no control vocabulary is exactly the one that forces
improvising.

NOT REQUIRED. Nothing in the checks reads these files, and a clone with no
Excalidraw is a working clone. It is in `supported-products` rather than
`required-toolchain` for that reason.
