---
form: find_contradiction
by: agent
signed_off: 2026-08-18T12:06:31.093Z
authors: agent
files:
---

# Evidence form / find_contradiction

## current_situation

FINDER 3 OF 7, and it arrives with the conflicts already visible rather than needing to be hunted.

THE PRIOR-ART FINDER RAN FIRST AND HANDED THIS ONE ITS SUBJECT. Roughly sixty products were read across eight sweeps, and the field's own answer to this iteration's central tension is the same everywhere: hold a reference you cannot edit and receive updates, or hold a copy you own and never receive another.

SO THE CONTRADICTION IS NOT SOMETHING THIS STATE INVENTED. It is what everybody else settled by choosing a side.

SIX CONTRADICTIONS ARE STATED HERE, four in the-bootstrap and two in the-walk. Five dissolved on a separation. One did not, and went to the grid.

## applies

yes

## contradictions

| cluster | contradiction | improving | degrading | separation |
| --- | --- | --- | --- | --- |
| cluster-the-bootstrap | Refusing every write outside the tree in hand makes producing a new tree impossible | 31 Object-generated harmful factors (Side effects / unintended mutations) | 35 Adaptability or versatility (Extensibility / plugin architecture) | IN SPACE |
| cluster-the-bootstrap | Giving the copy complete ownership of an artifact stops upstream's later work on that artifact from reaching it | 35 Adaptability or versatility (Extensibility / plugin architecture) | 24 Loss of information (Information loss / signal degradation) | IN TIME |
| cluster-the-bootstrap | Letting the copy edit any vendored file directly makes an update unable to tell an intended change from a stale one | 33 Ease of operation (User experience / API ergonomics) | 37 Difficulty of detecting and measuring (Testability / observability difficulty) | IN TIME |
| cluster-the-bootstrap | Stripping the source's history so the copy runs standalone removes the common commit an update would merge from | 33 Ease of operation (User experience / API ergonomics) | 35 Adaptability or versatility (Extensibility / plugin architecture) | IN LEVEL |
| cluster-the-walk | Keying an override on the target's identity makes it survive the target moving and makes it die silently when the target is renamed | 27 Reliability (Reliability / uptime SLA) | 37 Difficulty of detecting and measuring (Testability / observability difficulty) | NONE |
| cluster-the-walk | Requiring a driven project to carry none of the method leaves the system nothing in that tree to load its method from | 31 Object-generated harmful factors (Side effects / unintended mutations) | 35 Adaptability or versatility (Extensibility / plugin architecture) | IN SPACE |

## options

- project/spec/trace/option/opt-the-bound-travels-with-the-act.md
- project/spec/trace/option/opt-the-update-arrives-as-a-program.md
- project/spec/trace/option/opt-an-undeclared-change-refuses.md
- project/spec/trace/option/opt-the-override-calls-through-to-what-it-replaced.md
- project/spec/trace/option/opt-an-override-is-recut-rather-than-maintained.md
- project/spec/trace/option/opt-a-pointer-committed-in-the-tree.md
- project/spec/trace/option/opt-the-tree-names-what-not-where.md

## follow_up

IMMEDIATELY: the remaining finders. find_by_analogy, find_without, and the heuristics and transform passes.

THE TRIMMING FINDER HAS ITS TARGET ALREADY. Ask whether a copy needs an overlay AT ALL, given that nothing is sealed and the copy may edit its vendored files directly. Homebrew ships exactly that choice: its `inreplace` is steered as the route for changes that will never go upstream, and it leaves no authorship record whatsoever. That is the null option with its price attached.

ONE ROW WANTS A PROBE BEFORE ANY CANDIDATE RESTS ON IT. The update-arrives-as-a-program option is the only mechanism found in the whole survey that keeps total ownership and a live channel at once, and its own documentation never states what happens when a migration meets a file the copy has restructured. That is the first question a spike should ask, and it is cheap to ask.

AND ONE ROW IS A DECISION RATHER THAN A DESIGN. Row four says the history question comes apart under reading. The owner requirement behind the single-commit export is about what the copy DEPENDS ON, not about what it may carry. Somebody has to decide whether a copy carries a history it never consults, and that belongs at record-adrs with both halves on the table.

THE GRID WAS CONSULTED ONCE and it earned the call. Its answer for row five is a principle that inverts the other options on that cell, and it composes with them rather than replacing them.

## anything_else

### Why five of six dissolved on a separation

THE METHOD PREDICTS THIS. Its own card says the four separations "dissolve more conflicts than [the matrix] does" and are cheaper, and instructs trying them first. Five for six is the card working, not the pass being lazy.

AND THE ONE THAT RESISTED IS THE ONE WORTH THE MOST. Cell 37 against 27 returns principles 27, 40, 28 and 8. Only one transfers to software on the method's own list: 27, cheap short-lived object, many disposable instead of one durable.

THAT INVERTS EVERY OTHER OPTION ON THAT CELL. The rest try to make a single override robust. This says a long-lived override is the wrong artifact, and the engineering goes into making regeneration cheap instead.

AND TWO SHIPPED SYSTEMS ALREADY DO IT. Debian's source format demands patches apply with zero fuzz and errors out otherwise, forcing a re-cut. patch-package's own documentation warns that long-lived patches are costly to maintain where the code beneath them moves.

### The four separations, named against the rows that used them

IN SPACE, TWICE, AND BOTH ARE THE SAME MISTAKE. Rows one and six both assumed two demands named the same tree. The write jail and the producing act name different trees. The method and the driven project name different trees. Neither demand had to weaken.

IN TIME, TWICE, AND THEY ARE DIFFERENT MOMENTS. Row two moves upstream's contribution to update time, as an act rather than as content competing for precedence. Row three moves the capture of intent to edit time, rather than inferring it at merge time.

IN LEVEL, ONCE. Row four separates the RECORDS, which are noise to a receiver and stay home, from the HISTORY, which costs nothing at run time and is what a merge needs.

### One row has a second resolution, and the two are not equal here

ROW TWO DISSOLVES IN LEVEL AS WELL AS IN TIME. In level is the super-call: the copy owns the part it named, upstream keeps the whole it did not. Four systems ship it.

IN TIME IS THE ONE RECORDED because of an owner ruling rather than a technical judgment. Nothing in a copy is sealed and the copy may change anything. A super-call gives partial ownership by construction, since the parts an override can reach are the parts upstream chose to name. A migration keeps ownership total at every moment.

BOTH OPTIONS STAND ON THE CHART. The ruling decides which separation this product records, not which mechanisms a candidate may combine.

### What the field does under these contradictions, since it bears on every row

ALMOST EVERYTHING SURVEYED PICKS A SIDE AND PAYS. Roughly sixty products, and the answer is a reference that updates or a copy that does not.

ONE FAMILY REFUSES THE CHOICE. Codemods push upstream's change into a copy the consumer already owns and has edited, and they buy it by making the upstream author hand-write a migration per breaking change.

AND ONE PRODUCT IS THIS PRODUCT'S OWN SHAPE, DONE THE HARD WAY. SuperClaude was forked into SuperGemini and then SuperQwen, each with its own name, command prefix and package. The renaming was done by hand, and the fork severs the update channel completely — the forked tool's update command fetches the latest fork, never the upstream it came from.

THAT IS THE OUTCOME THIS ITERATION EXISTS TO AVOID, and somebody has already reached it by the obvious route.
