---
kind: [[funnel]]
about: a verb the retro calls, which reads the trace, the design text and the code, and writes a note for each structure it finds wanting
---

# Scope

The views of [[spec/funnel/the-editor-draws-the-trace]] show the structure,
and a reader finds a fault there by looking. A verb computes the same faults
from the index, the imports and the git history, the same way on every run.
Nothing in it reads a language model.

A hint asks for a design change, so it stands outside the lint: a lint rule
holds form. The retro calls the verb, and the verb writes one private note a
hint, the way `./RUNME.sh ticket note` writes one. The retro then collects
those notes beside every other note. For details, see
[[spec/guidance/retro/collect]].

Every rule fires in full on its first run, with no baseline holding old faults
back. One cleanup round follows. An architecture discussion calls the same verb
later.

# The rules on offer

| rule | layer | what it computes | what the note tells the reader |
|---|---|---|---|
| a section with no code or no test | trace | a section with no pointer from code or from a test, past scope and parent headings | point code at it, or fold it into its parent |
| a design output refining nothing | trace | an empty `refines` | name the design input it refines |
| a design output cycle the notes leave unstated | code against design | the code of two design outputs imports both ways, and no link joins the notes | link the notes, or cut the import |
| a scattered file | code against design | a code file pointing at sections of many design outputs | split it by design output |
| a file import cycle | code | a strongly connected group of files, ranked by size times changes | cut the edge closing it |
| a hidden dependency | history | files of two design outputs changing together with no import between them | name the dependency, or merge the files |
| a long section | design text | a section far longer than its siblings | split it |
| a misplaced file | matrix | a file with more import edges to another design output than to its own | move the file, or its pointer |
| a coupled pair | matrix | two design outputs sharing more edges than either holds inside | merge the notes, or cut an interface between them |
| a loose cluster | matrix | a design output whose files share few edges inside, read on the edges going out | split it, or name it a library |

These rules wait, since they fire across most of this tree:

| rule | why it waits |
|---|---|
| an import between design outputs whose notes carry no link | the coupled pair holds the precise form |
| a hub file | the fakes take the most imports by design |
| a file outside its cluster by Leiden | Leiden draws one big group here |
| a suspect pointer | a typo fix in a section marks every file pointing at it |

# Where the data stands

| data | where it comes from |
|---|---|
| sections, pointers and `refines` | the index, once it holds pointers in code comments, headings and block-list frontmatter |
| the trace rules | views in the index, which the trace graph reads too |
| imports between files | the prototype reads them today, and the index takes them over |
| coupling inside one Go package | the call graph, since files of one package share no import |
| changes together | `git log` up to the head, past merge commits and past commits touching many files |

# Before it

| source | what it lends |
|---|---|
| Mancoridis et al. (1998), Bunch | the cluster factor: edges inside a cluster against edges leaving it |
| Newman (2006) | Q, the share of edges inside groups against chance |
| Thebeau (2001) | the cost of a clustering in a structure matrix |
| MacCormack, Rusnak and Baldwin (2006) | propagation cost, and cycles as a core |
| Arcelli Fontana et al. (2017), Arcan | cycle, hub and unstable dependency, with definitions to copy |
| Gall, Hajek and Jazayeri (1998), Wong et al. (2011) | files changing together where the structure keeps them apart |
| OpenFastTrace | a status for each item: `covered`, `uncovered`, `shallow`, `orphaned` |
| Sadowski et al. (2018) | a rule readers leave standing costs more than it finds |

# What stands open

| the question | what hangs on it |
|---|---|
| the verb's name, and its home in Go on the index door | the retro route names it as a step |
| which retro step calls it | the notes land before the collect reads them |
| how a note names its hint, so a second run writes no second note | a fingerprint of rule, subject and target |
| the threshold of each rule | the tree's own spread with a floor under it, both in config |
| the waiting rules | they join after the cleanup round, where they prove quiet |
| an architecture discussion calling the verb | the notes land in the discussion, not in the retro |
