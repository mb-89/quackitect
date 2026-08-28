---
id: wt-make-the-startup-check-tell-the-truth-about-a-server-that-is
type: "[[work]]"
statement: Make the startup check tell the truth about a server that is already up. When a second attempt finds an instance already serving this folder, the second one stops on purpose and prints why. The startup summary reads that stop as a failure and announces the whole thing broken, while the first instance answers normally and the session works. An agent reading its own arrival banner is told the one thing it depends on is dead. The check should ask whether something is answering, not whether this attempt was the one that started it.
ready_when: ready when a round takes the arrival script or its reporting
source: note-301f9ac89b92
---

## Why it stands

Make the startup check tell the truth about a server that is already up. When a second attempt finds an instance already serving this folder, the second one stops on purpose and prints why. The startup summary reads that stop as a failure and announces the whole thing broken, while the first instance answers normally and the session works. An agent reading its own arrival banner is told the one thing it depends on is dead. The check should ask whether something is answering, not whether this attempt was the one that started it.

## When it comes back

ready when a round takes the arrival script or its reporting
