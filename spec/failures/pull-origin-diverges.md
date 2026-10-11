---
kind: [[failure]]
level: error
remedies: ["Commit or stash the edits in the tree, run git pull --rebase origin <branch>, then pull again."]
---

# When

The work branch and its origin each hold commits the other lacks, so the pull reads no current tree.
