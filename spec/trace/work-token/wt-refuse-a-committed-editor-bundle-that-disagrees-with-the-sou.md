---
id: wt-refuse-a-committed-editor-bundle-that-disagrees-with-the-sou
type: "[[work-token]]"
statement: "Refuse a committed editor bundle that disagrees with the source it claims to come from. Nothing rebuilds it and compares, so an edit to the source can sit unshipped while the tests pass and the screen shows the old thing. Twice in one sitting a change was reported as landed and was not, and both times the source was correct. The check is cheap: build into a temporary place and compare bytes."
ready_when: ready when somebody adds a check to the boot scripts, which already run five others
source: note-124e17933a15
---

## Why it stands

Refuse a committed editor bundle that disagrees with the source it claims to come from. Nothing rebuilds it and compares, so an edit to the source can sit unshipped while the tests pass and the screen shows the old thing. Twice in one sitting a change was reported as landed and was not, and both times the source was correct. The check is cheap: build into a temporary place and compare bytes.

## When it comes back

ready when somebody adds a check to the boot scripts, which already run five others
