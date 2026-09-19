---
kind: [[guidance]]
scope: ["whoever runs the verify step of a retro"]
rationale: [[spec/rationales/verifying]]
---

# Actionables

1. Read every class against the tree as it stands now, before any ticket mints. *
2. Mark a class whose fix stands already `fixed:` and name where it stands. *
3. Mark a class the tree moves past `past:` and say what moves it. *
4. Leave the rest `open`, and write each one a ticket name, a gain, a breaks and a done_when. *
5. Name the check holding a fix in place where the rule for it stands already. *
6. Run `./RUNME.sh retro mint <retro>`, which mints one ticket a class standing open.
7. Run `./RUNME.sh retro matrix <retro>` again, so the report carries each status and ticket.
