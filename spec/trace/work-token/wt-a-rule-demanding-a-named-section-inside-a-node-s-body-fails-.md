---
id: wt-a-rule-demanding-a-named-section-inside-a-node-s-body-fails-
type: "[[work-token]]"
statement: |-
  A rule demanding a named section inside a node's body fails whenever that section opens the body, immediately under the frontmatter.

  Two files carrying the section were rejected at a checkpoint. A short script ran the checker's own logic over the same files, read fresh from disk, and every one passed. The files are correct; what the engine sees is not.

  Two causes are worth testing, in this order. The frontmatter split may eat the first line beneath it. Or a cached copy may answer where a disk read was expected, since both files had been created minutes earlier in the same session.

  WHY IT IS WORSE THAN A FALSE ALARM. It points the author at the wrong half. The only way to satisfy the check is to move a heading that was already where it belongs.

  NOBODY HAS TRIED IT FROM A COLD ENGINE, and that is the first experiment.
place: i69-the-method-checks-what-it-claims-to-chec
ready_when: ready when a building milestone pulls hygiene work
source: note-43ab71b58eb8
---

## Why it stands

A rule demanding a named section inside a node's body fails whenever that section opens the body, immediately under the frontmatter.

Two files carrying the section were rejected at a checkpoint. A short script ran the checker's own logic over the same files, read fresh from disk, and every one passed. The files are correct; what the engine sees is not.

Two causes are worth testing, in this order. The frontmatter split may eat the first line beneath it. Or a cached copy may answer where a disk read was expected, since both files had been created minutes earlier in the same session.

WHY IT IS WORSE THAN A FALSE ALARM. It points the author at the wrong half. The only way to satisfy the check is to move a heading that was already where it belongs.

NOBODY HAS TRIED IT FROM A COLD ENGINE, and that is the first experiment.

## When it comes back

ready when the node parser or its in-memory store is next opened
