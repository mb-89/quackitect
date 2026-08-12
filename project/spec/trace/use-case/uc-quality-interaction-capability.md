---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-quality-interaction-capability
type: "[[use-case]]"
statement: Understand the machine well enough to drive it
actor: stk-newcomer
kind: quality-area
trigger: Somebody meets the system with no context and has to get something done.
precondition: The system is installed and running.
guarantee: The front door speaks plainly, every refusal says what to do instead, and the newcomer can say what the product is before their first session ends.
refines:
  - sty-what-a-quality-is
priority: must
---

## What this characteristic covers

INTERACTION CAPABILITY, from ISO/IEC 25010:2023. The degree to which a system
can be interacted with by specified users to exchange information through the
user interface. It replaced `usability` in the 2023 revision.

Its sub-characteristics, so nobody has to open the standard to use this:

- APPROPRIATENESS RECOGNIZABILITY. Users can recognise whether it is
  appropriate for what they need.
- LEARNABILITY. It can be learnt to a stated level of proficiency within a
  stated time.
- OPERABILITY. It has attributes that make it easy to operate and control.
- USER ERROR PROTECTION. It prevents users making errors, or lets them
  recover from them.
- USER ENGAGEMENT. It presents functions and information in an inviting and
  motivating way, encouraging continued use.
- INCLUSIVITY. It can be used by people of various backgrounds — ages,
  abilities, cultures, languages, economic situations. Added in the 2023
  revision.
- USER ASSISTANCE. It can be used by people with the widest range of needs
  with the support it provides.
- SELF-DESCRIPTIVENESS. It presents the information a user needs to make its
  capabilities and use immediately obvious, without them having to go to
  documentation, a help desk, or another person. Added in the 2023 revision.

## Main scenario

1. A newcomer opens the project with no briefing and no prior session.
2. The front door greets them in plain words and offers a tour.
3. They ask for something in their own words rather than the system's.
4. The desk routes them, naming what it recommends and why.
5. They hit a refusal, and the refusal names the exact call to make instead.
6. Before the session ends they can say what the product is and what it is for.

## Extensions

- 2a. The front door uses method jargon a stranger has not met: the entry-document rule is broken and the wording is the defect.
- 3a. The words do not map to anything the system offers: the desk says so and offers what it does have, rather than guessing.
- 5a. A refusal carries no remedy: the refusal is incomplete, and an incomplete refusal is a defect rather than a hard message.
- 6a. The tour points at a part that is not built: the tour says it is absent instead of describing it as though it exists.
