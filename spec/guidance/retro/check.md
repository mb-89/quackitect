---
kind: [[guidance]]
scope: ["whoever runs the check step of a retro"]
rationale: [[spec/rationales/verifying]]
---

# Actionables

1. Read every class against the tree as it stands now, before any ticket mints. A ticket off the retro's picture asks for what the tree holds already. *
2. Mark a class whose fix stands already `fixed:` and name where it stands. A fixed class standing open sends a hand to build it again. *
3. Mark a class the tree moves past `past:` and say what moves it. A past class standing open asks for a fix to a thing that stands no more. *
4. Leave the rest `open`, and write each one a ticket name, a gain, a breaks and a done_when. An open class missing one of the four mints a ticket no hand can close. *
5. Write each promotion a ticket name, a gain, a breaks and a done_when, where no ticket names it yet. A promotion short of one stops `retro mint`, and `retro classes` passes it. *
6. Name the check holding a fix in place where the rule for it stands already. A fix with no check drifts back the first time nobody looks. *
7. Run `./RUNME.sh retro mint <retro>`, which mints one ticket a class standing open.
8. Run `./RUNME.sh retro matrix <retro>` again, so the report carries each status and ticket.

# Examples

| the rule | do | do not |
|---|---|---|
| 2 | fixed, with where it stands | a ticket for a standing fix |
