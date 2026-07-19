---
id: ifu0005-reader
type: manifest
mode: deck
kind: ifu
statement: the book. Reading, presenting, and commenting the record.
review-82079:
  completeness: reading, navigating, presenting, commenting, and templating each have a step slide; the coverage slide links every use case this journey exercises
  correctness: the described surfaces exist in the shipped book shell; nothing is aspirational
  conciseness: one reader surface per slide; the book chapter carries the depth
  comprehensibility: the arc runs from a pile of nodes to one book a stakeholder can read and mark up
  minimalism: the base state is referenced from the setup IFU; surface details live once, in the book itself
  accessibility: rides the book shell's slide roles and labels; this deck describes the same a11y shell it uses
  target-group-fit: written for reviewers and stakeholders who consume the record, not for the pair producing it
---
<!-- ai:3 -->
# A graph nobody can read is not a record
<!-- ai:3 -->
The ledger's truth lives in hundreds of nodes. A stakeholder needs ONE readable, self-contained book: chapters, figures, tables, and a way to talk back.
---
<!-- ai:3 -->
# Starting state
<!-- ai:3 -->
The idle state from [the setup IFU](ifu0001-setup), with a workspace worth reading.
---
<!-- ai:3 -->
# Read and navigate
<!-- ai:3 -->
The book renders as one HTML file: contents tree, search with visible hits, deep links to every anchor. Terms explain themselves in the details pane instead of throwing the reader out of the page.
---
<!-- ai:3 -->
# Tables, figures, and models
<!-- ai:3 -->
Registers render as filterable tables. Declared models render through one interactive onion: click to inspect, drill into a layer, zoom like a map. The architecture review rides these same views.
---
<!-- ai:3 -->
# Present and deep-link
<!-- ai:3 -->
A deck opens in present mode straight from the guides table, and every slide carries a stable deep link. An IFU is a book citizen, not an attachment.
---
<!-- ai:3 -->
# Comment and read back
<!-- ai:3 -->
A reviewer marks up a COPY of the book: annotations, discussions, pre-marks. The engine lists the marked copy back as note candidates, roles and quotes intact. Feedback flows in without anyone retyping it.
---
<!-- ai:3 -->
# Template and white-label
<!-- ai:3 -->
A vehicle ships the same book under its own brand: palette, voice, and templates overlay cleanly. The structure is the engine's; the face is yours.
---
<!-- ai:3 -->
# One book, the whole record
<!-- ai:3 -->
Everything the ledger knows arrives as one file anyone can open, read, present, and mark up. That file is the project's public face.
---
<!-- ai:3 -->
# Covered use cases
<!-- ai:3 -->
The reader journey exercises:
[uc-book-read](uc-book-read), [uc-book-navigate](uc-book-navigate), [uc-book-content](uc-book-content), [uc-book-tables](uc-book-tables), [uc-book-present](uc-book-present), [uc-book-agent](uc-book-agent), [uc-model-in-book](uc-model-in-book), [uc-architecture-review](uc-architecture-review), [uc-deck-deep-link](uc-deck-deep-link), [uc-find-ifu](uc-find-ifu), [uc-author-ifu](uc-author-ifu), [uc-ifu-coverage](uc-ifu-coverage), [uc-onboard-newcomer](uc-onboard-newcomer), [uc-comment-annotate](uc-comment-annotate), [uc-comment-discuss](uc-comment-discuss), [uc-comment-premark](uc-comment-premark), [uc-comment-readback](uc-comment-readback), [uc-spec-template](uc-spec-template), [uc-white-label-book](uc-white-label-book).
Note: The coverage slide is deliberately link-dense. It is the coverage index, not the teaching body.
