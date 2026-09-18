---
kind: [[design_input]]
---

# Scope

The owner asks that a rule a refactoring hand fixes stops refusing a write and
becomes a warning. The warnings stand in one list on this box. A person reads
that list in the problems panel, over every file. A session whose list grows
past a number spawns a refactoring hand, which works beside it and changes no
meaning. Nothing leaves the box while a warning stands.

The asks, one to a line:

- Keep every rule at error, and move a rule to warning one ruling at a time.
- Move a rule where a refactoring hand fixes it: the tests stay green, and the
  meaning stands.
- Apply the same test to code and to prose.
- Hold the warnings as runtime state, outside git.
- Draw every warning in the problems panel, over every file, open or shut.
- Feed the panel and the hand from one mechanism.
- Spawn the refactoring hand from the stop hook, past a number.
- Give that hand a guidance note of its own, and let it read that note.
- Run the hand beside the session, so the working hand waits for nothing.
- Carry a flag that switches the parallel half off.
- Refuse a push while the list holds a line.
- Show a pointer naming a heading that stands nowhere.

# Every rule starts at error

The default is the tree as it stands: the write door refuses, and the hand fixes
the line before it writes the next one. A move to warning is the owner's
judgment, written down against one rule.

So the first landing moves nothing. The machinery arrives dark, the list stands
empty, and the tree behaves as it behaves today. Each later ruling frees one
rule, and the tree measures what that ruling costs.

# The contract the hand keeps

A refactoring hand changes what a thing costs a reader, and changes nothing
else. The test is the one the tests already answer for code:

| half | what stands after |
|---|---|
| code | every green test stays green, and the behavior stands |
| prose | the meaning stands, and the words move |

The prose half is a judgment where the code half is a run. That is the whole of
the difference, and the guidance note carries it.

# The list is runtime state

The warnings are state this box holds while it works. They travel nowhere, and
the retro reads none of them.

[[spec/design_input/the-runtime-files-stand-apart]] splits the private folder.
The runtime half is where this list lands, where it wants a file at all. A
mechanism answering the panel and the hand out of memory writes no file, and
that answer is better.

# The panel draws every file

Version four fills the problems panel because its server walks the work root
when the editor says `initialized`, diagnoses every note, and publishes each
one. A finding wants no open document, so the document selector governs what
the editor sends, and the server publishes what it likes.

Version five holds that walk already, as the sweep its check verb runs. Its
server calls that sweep nowhere. So the panel holds the file in front of a
person, and nothing besides.

The ask is version four's behavior, over every file a rule reads:

| what | where it lands |
|---|---|
| the walk on `initialized` | the tree's own server |
| what it covers | every file a rule reads, code and prose alike |
| what it leaves | a parked file, and the folders the walk stands outside |
| what an open file answers | the buffer, ahead of the copy on the disk |

# The stop hook spawns it

The stop hook reads what stands at the turn's end and holds the turn open. A
list past its number is work this box owes, so the rule stands on the continue
side and says to spawn the hand.

The number stands in the config, beside the numbers the work verbs read.

# The flag decides who waits

| the flag | what the session does | what blocks it |
|---|---|---|
| on | spawns the hand while it works, and waits for nothing | the push, while a warning stands |
| off | works to the end, and drains the list itself | the push, and nothing besides |

So the flag switches the parallel half off in one move, and the sequential tree
still refuses a dirty push. The owner switches it off where two hands on one
tree cost more than they buy.

# The hand takes settled files

The refactoring hand takes a file nothing touches inside a window, and the
window stands in the config. So the hand works behind the session, over what the
session leaves alone, and the two reach for one file rarely.

# A write meets its hash

Two hands write one tree, and a write built on a stale read drops the other
hand's change with nothing reported. Version three rules it in one line: a write
lands only against the hash of the latest read.

The write door reads a file before it applies an edit already, so it holds that
hash. It refuses the write where the disk moves under it, and the hand reads
again. This asks for no lock, no lease and no file.

# One note holds the guidance

The note stands at `spec/guidance/refactoring`. The refactoring hand reads it,
and the working hand leaves it alone.

Version four holds a note under that name about what a run costs. Two of its
lines carry over, and the rest answers a question this asks nowhere:

- Refactor or change behavior, one to a commit, because a green suite says
  nothing about which one breaks.
- Leave the shape better than the speed, because a fast function nobody reads is
  a defect with a number beside it.

# A pointer names its heading

A link carries a heading after a `#`, and the link checker drops that half
before it resolves the path. So a note losing a heading takes every pointer at
it down, and the tree reports none of it.

The owner asks that such a pointer draw like any other finding.
