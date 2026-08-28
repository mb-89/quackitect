---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-define-the-ambiguous-case-rather-than-the-reader
type: "[[option]]"
statement: Make callers agree by writing down what a malformed node IS and what every reader must do about it, so agreement comes from one definition rather than from routing everybody through one piece of code.
cluster: the-query
question: how callers come to agree about the corpus
found_by: analogy
source: epidemiology — the case definition, which makes many independent observers count one outbreak the same way by defining the confirmed, probable and suspected cases in advance
---

## Mechanism

THE ABSTRACT PROBLEM. Many independent observers look at the same body of
material and must reach the same count, without being the same observer.

HOW THE DOMAIN SOLVES IT. Not by appointing one counter. By publishing a case
definition that says precisely what counts, INCLUDING the ambiguous middle —
confirmed, probable, suspected — before anybody starts counting. Observers
stay independent and their numbers still add up.

THE INSIGHT THAT TRANSFERS. The agreement problem is not about who reads. It
is about the UNDEFINED CASE. Two readers of a well-formed node already agree;
that was probed and it holds. They diverged on the malformed one, because
nothing said what malformed means or what to do about it.

WHAT IT LOOKS LIKE HERE. One written definition of an unreadable node, and one
named outcome every reader must produce for it. Whether that is a thrown
error, a typed absent value, or a node marked unreadable is the design's
choice — but it is chosen once and every reader is held to it.

WHAT IT BUYS OVER ONE READER. Independence survives. Readers can be added,
specialised or made fast without threading them through a single function, and
nothing becomes a bottleneck.

WHAT BREAKS IN TRANSLATION. A case definition is enforced by people who were
trained on it. Code has no such training, so this option only works with a
check that holds readers to the definition — and without that check it is
weaker than simply having one reader.
