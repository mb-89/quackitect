---
id: wt-a-commit-that-lands-a-source-file-and-leaves-behind-the-file
type: "[[work]]"
statement: A commit that lands a source file and leaves behind the files made from it turns the next opening red. One such commit changed a rule page and dropped all three of its generated twins; the two commits before it had carried both halves together. The opening check compares those twins against what the generator would produce, so the mismatch shows up hours afterwards, to whoever opens next rather than to whoever caused it. Four calls went on getting from that red check back to a green one. Two answers exist and they point opposite ways. Regenerate as part of committing, so the twins stay under version control and a new clone needs no build step. Or keep them out of version control entirely and produce them at startup, which kills the class outright at the cost of a build on every cold start.
place: i46-one-home-per-idea-the-copies-that-could-
ready_when: ready when the committing path is next opened, or the moment another opening goes red on a stale copy
source: note-b760108d193d
---

## Why it stands

A commit that lands a source file and leaves behind the files made from it turns the next opening red. One such commit changed a rule page and dropped all three of its generated twins; the two commits before it had carried both halves together. The opening check compares those twins against what the generator would produce, so the mismatch shows up hours afterwards, to whoever opens next rather than to whoever caused it. Four calls went on getting from that red check back to a green one. Two answers exist and they point opposite ways. Regenerate as part of committing, so the twins stay under version control and a new clone needs no build step. Or keep them out of version control entirely and produce them at startup, which kills the class outright at the cost of a build on every cold start.

## When it comes back

ready when the committing path is next opened, or the moment another opening goes red on a stale copy
