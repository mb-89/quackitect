---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: uc-declare-an-exception-to-a-rule
type: "[[use-case]]"
kind: interaction
statement: Declare that one module is exempt from a rule, and say why.
actor: stk-guide
trigger: a module genuinely needs to do what the rule forbids
precondition: the rule stands, and the module's own call is being refused by it
guarantee: the exemption stands, the module's call is allowed, and the reason is on record for whoever reads it next
refines:
  - sty-an-exception-without-a-reason-is-refused
priority: must
---

## Main scenario

1. The author's module makes a call the rule forbids, and the call is refused.
2. The author decides the module is a genuine exception rather than a breach.
3. The author adds the module to the rule's hatch, with the reason.
4. The write is accepted and the exemption stands.
5. The module's call is no longer refused.
6. The sweep counts one more exemption against that rule.

## Extensions

2a. IT IS NOT AN EXCEPTION. The author changes the module to go through the
door instead, and nothing is added to the hatch.

3a. THE ENTRY CARRIES NO REASON. The write is refused before it lands, naming
the file and the line, and saying an entry with no reason is not an entry.

3b. THE REASON IS A COPY OF A REASON ALREADY ON THE LIST. Nothing refuses
this, and it is how the hatch decays into boilerplate. The design has no
answer and says so rather than pretending otherwise.

4a. THE HATCH HAS GROWN UNTIL THE EXCEPTION IS THE NORM. The honest response
is a narrower rule rather than a longer list, and that judgment belongs to a
person rather than to the mechanism.

6a. THE EXEMPTION IS NO LONGER NEEDED and nothing says so. Rust and ESLint
both report an exemption that has stopped firing. This design does not, and
the gap is registered rather than hidden.
