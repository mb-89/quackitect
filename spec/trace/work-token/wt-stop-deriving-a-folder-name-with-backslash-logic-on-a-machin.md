---
id: wt-stop-deriving-a-folder-name-with-backslash-logic-on-a-machin
type: "[[work]]"
statement: "Stop deriving a folder name with backslash logic on a machine that uses forward slashes. One writer builds the name of the folder it registers by splitting a path on the separator Windows uses. Anywhere else that split finds nothing, so the whole path becomes the name and the entry it writes is wrong. Splitting on either separator, or using the platform-neutral helper the rest of the engine uses, fixes it in one line."
ready_when: "ready when a round touches the editor registration, or sooner if the entry is found wrong on a non-Windows machine"
source: "note-dcc998504b71"
---

## Why it stands

Stop deriving a folder name with backslash logic on a machine that uses forward slashes. One writer builds the name of the folder it registers by splitting a path on the separator Windows uses. Anywhere else that split finds nothing, so the whole path becomes the name and the entry it writes is wrong. Splitting on either separator, or using the platform-neutral helper the rest of the engine uses, fixes it in one line.

## When it comes back

ready when a round touches the editor registration, or sooner if the entry is found wrong on a non-Windows machine
