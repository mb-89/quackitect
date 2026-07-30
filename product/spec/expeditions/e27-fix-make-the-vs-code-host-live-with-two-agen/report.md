---
form: expedition-leave
status: done
---

# e27 — the VS Code host, live

## What was the goal

Make the VS Code host actually run, with two agents on one engine.

It grew a second half during the day. The owner reshaped the shell by voice, from panes in a side bar into editor windows.

## What was done

- The webview hang, the second-engine race and the CORS gap were fixed earlier in the day.
- Cards became EDITOR WINDOWS. VS Code owns the docking and remembers it per folder.
- A serializer per slot keeps that arrangement across a window reload.
- The sidebar grew three groups: features with labels, controls with the walk's sliders, details at the bottom.
- The duplicate start button left the view title bar.
- The agent terminal is created in the editor area, so the log sits beside it.
- A click inside a card reaches the details group again, now that they are two documents.
- The engine serves its authored scales at `/api/levels`.
- Two contract rules landed: no record opens without the owner's word, and the screen is never captured unasked.

## What settled it

- The suite ran green at 226 tests after every change, preflight included.
- THE SHELL WAS SEEN LIVE. The agent captured the VS Code window itself and read the image. `code serve-web` never surfaced the extension, so this was the first direct look any session has had.
- That capture confirmed three things by eye: the strip runs vertically, the view title bar carries no buttons, and details opens as a real editor tab.
- It also confirmed the two-hands design. A second agent started from the play button and attached to the same engine.

## What was not done

- The sidebar groups and the details relay were NOT seen live. They landed after the last capture, and the engine reload and window reload were still owed when this was written.
- The play-button menu — start a new agent, or reveal one this window already started — is designed and not built.
- `se_file_search` returns zero matches for everything, because ripgrep is absent and the spawn failure is swallowed. Diagnosed and noted, not fixed.
- e26 still stands open for the same VS Code work. Consolidating the two is the owner's call.

## Files

Nothing. The evidence is the commits on trunk and the suite, not a separate document.
