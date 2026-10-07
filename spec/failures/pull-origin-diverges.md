---
kind: [[failure]]
level: error
remedies: ["Run git pull --rebase origin <branch>, then pull again."]
---

# When

The work branch and its origin each hold commits the other lacks, so the pull reads no current tree.
