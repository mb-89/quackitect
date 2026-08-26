---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-an-exemption-without-a-reason-is-refused-at-write-time
type: "[[requirement]]"
statement: When a write adds an exemption entry that carries no reason, the engine shall refuse that write and name the file, the line and the missing reason.
kind: functional
verify_method: test
breaks_if_removed: The exemption list fills with bare paths nobody can question, which is what all six compared systems permit and the one thing this design claims to do differently.
breaks_how_badly: crippling
refines:
  - uc-declare-an-exception-to-a-rule
source_refs:
  - stk-guide
  - stk-reviewing-agent
priority: must
---

## Detail

THE REFUSAL FIRES ON THE EXEMPTION FILE, at the moment it is written. It does
not fire on the exempt module's own call, and it is not deferred to the sweep.

WHAT COUNTS AS AN ENTRY: the module's root-relative path, an em dash, and the
reason. Anything else on the line is not an entry.

WHAT COUNTS AS A REASON, AND THE LIMIT IS STATED RATHER THAN HIDDEN: any
non-empty text after the em dash. Nothing here judges whether the reason is a
good one, and that gap is the design's second kill criterion. The empty case
is caught mechanically; the lazy case is not caught at all.

THE REFUSAL CARRIES FOUR THINGS, matching every other typed refusal in this
lane: the clause, what was expected, what it got, and an executable remedy.

WHY WRITE TIME RATHER THAN SWEEP TIME. The author is present when the write
happens, and one edit closes it. A break found later belongs to whoever reads
the report, which is a different and more expensive conversation.

## Behaviour

    (nothing)     -> refused:  a bare path is written
    refused       -> accepted: the same path is written with a reason
    accepted      -> gone:     a reviewer deletes the entry
    gone          -> refused:  the module writes again and the rule refuses it

THE FIRST LINE IS THE ONE THAT PAYS. An exemption comes into being only by
being written with a reason. There is no path that creates one silently, and
no generated baseline that mints them in bulk — which is exactly how
dependency-cruiser's exception list comes to have no author.
