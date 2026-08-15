---
minted_in: i1
id: opt-token-block-with-staff-and-ticket
type: "[[option]]"
statement: let a walker enter a section only while holding its token, and issue written tickets against a held token when several must follow one after another
cluster: cluster-the-walk
found_by: analogy
source: "railway single-line working — token block, and the staff-and-ticket variant"
---

## Mechanism

THE ABSTRACT PROBLEM. Let an untrusted operator move through a network one
interlocked section at a time, where two operators in one section is the
accident.

HOW THE RAILWAY SOLVES IT. A single-line section has exactly one physical
token. A train may enter only while holding it, and hands it over at the far
end. One token, one train, enforced by an object rather than by a rule.

THE VARIANT THAT MATTERS HERE is staff and ticket. When several trains must
follow one another in the same direction, the staff stays at the entry and
each train but the last is given a written TICKET authorising it against the
staff that is still held. The last train carries the staff itself and clears
the section.

WHAT TRANSFERS. This engine already has the token. It does not have the
ticket, and the ticket is exactly the shape of the fan problem: several legs
must be walked in one direction before the join is cleared, and the walk
currently has one token to do it with.

WHAT BREAKS IN TRANSLATION. The railway's tickets are ordered and the last
one is distinguished, because a section is cleared by the final train. A fan
has no natural last leg, so something must decide which leg carries the
staff — or the join must accept the tickets alone.

The green-branch rule built today is a different answer to the same problem:
it lets the join count a section nobody needs to traverse. The ticket keeps
the traversal and makes it cheap. They are rival cells, not the same one.
