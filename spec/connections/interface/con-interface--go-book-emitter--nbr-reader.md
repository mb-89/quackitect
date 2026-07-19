---
id: con-interface--go-book-emitter--nbr-reader
type: connection
kind: interface
src: go-book-emitter
dst: nbr-reader
statement: The reader's browser: one self-contained book file, no further requests.
class: review
killer: false
---
Neighbour: the reader's browser. What flows: the rendered book - one HTML file carrying every figure, script, and style inline - outward; comment-annotated COPIES of that file come back through the readback lane. Direction: out (the book is the system's public face). Channel: a single HTML file opened locally; a strict no-external-request design keeps it portable and archival.
