---
minted_in: i1
id: nbr-quickmock
type: "[[neighbour]]"
statement: QuickMock, where a person draws a user interface by hand and saves it as a file that names each control by what it IS rather than by where it sits.
direction: in
group: supported-products
---

## Interface

A FILE FORMAT CROSSES. A `.qm` is JSON, and every shape in it carries a `type`
from a closed vocabulary of about seventy-five real controls — button, input,
combobox, checkbox, textarea, datepickerinput, modalDialog, table, tabsBar,
appBar, slider, breadcrumb, heading1 through heading3, paragraph. Beside the
type it carries `text` for the label, `x`, `y`, `width`, `height`, and an
`otherProps` bag holding `checked`, `disabled`, `isPlaceholder`, `isPassword`
and `textAlignment`.

THE EDITOR IS A VS CODE EXTENSION, `Lemoncoders.quickmock`, MIT-licensed. It
registers a custom editor for `.qm`, so opening the file opens the canvas.

THE FILE IS SAVED MINIFIED, and that is the one thing to know before reading
one. The serializer calls `JSON.stringify` with no indent argument, so a saved
`.qm` is a single line. `se_file_read` truncates a single long line and says so
in one phrase with no cursor, which means the plain read of a real wireframe
would hand back a cut file that looks whole. Read one with `char_offset` and
`char_limit`, which is the documented way to read a generated file that is one
long line.

WHAT WOULD BREAK IF IT CHANGED. The control vocabulary is the whole value. A
format change that dropped `type` would leave rectangles, and rectangles are
what the tools below already give.

## What this neighbour is not

NOT OFFLINE BY DEFAULT. The setting `quickmock.appUrl` points at
`https://quickmock.net/editor.html`, and the editor webview loads from there.
The setting is a plain URI and the application is open source, so self-hosting
is possible and nobody here has proved it.

NOT A LAYOUT ENGINE. The shape list is flat. No shape names a parent, so a
button inside a modal is two overlapping rectangles that happen to know their
own types, and nesting is still read off coordinates.

NOT REQUIRED, AND NOT THE ONLY OPTION. [[nbr-excalidraw]] sits in the same
group and saves geometry with no control vocabulary at all. That is the
difference between the two, and it is why a UI draft belongs here rather than
there.
