---
form: draw-context
reopened: "2026-08-23T15:48:06.520Z — spawn-for-inputs was re-signed after it, so draw-context answered older ground"
by: agent
signed_off: 2026-08-23T15:48:32.654Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

M1 is closed and the vision is axiom. This is the cheap place to catch a boundary ripple before the expensive walk.

The boundary does not move for this round. What changes is which neighbours the surface actually reaches.

## boundary

INSIDE THE BOX: the surface that draws a record and the reader that feeds it. The panel, the sub-machine view, the state detail, and the one renderer this round leaves behind. Also inside: the reader that opens a record at a committed ref, because reading history is what the round is for.

OUTSIDE THE BOX: how a record is written, how it is closed, and what the archive stores. The round reads history and never authors it.

ALSO OUTSIDE: the engine's routing. The close guard that let a record ship with ungreen gates is a real defect and it is a router concern, standing as a work token rather than crossing this boundary.

THE LINE THAT MOVED. Nothing. The box is where it was; the round makes an existing edge honest rather than drawing a new one.

## neighbours

- nbr-engineer
- nbr-vscode
- nbr-git

## intended_use

An engineer opens the board to find out what is true, about work that is running and about work that has finished.

THEY USE IT TO READ, and to adjudicate. They open a record, live or closed, and see its states, its gates and the reason any state is not green. They bless a gate and watch the surface answer under their hand.

THE ROUND'S WHOLE INTENT is that the second half of that sentence stops being a lie. Today a closed record shows nothing, a bless needs a reload, and a grey state gives no reason. The machine holds all three answers already.

ONE READER, ONE SURFACE. The controls are drawn once, so what the engineer sees in one place is what they see in every place.

## excluded_use

BINDING, and sharper than M1's non-goals. This system does NOT:

- author or change what a record stores, in the archive or anywhere else
- decide whether a record may close while its gates stand ungreen, which is the router's job
- serve the archived record to anyone but the engineer at their own machine
- render a record from any tree but its own, since looking as it stood at the close is the whole point
- replace the lane as a way of reading the project, because the panel shows state and the lane serves content
- design the coverage dashboard or settle the layout technology, both of which need the owner and live in the UI record
- synthesise or infer a reason for a grey state, since a reason the machine cannot produce is a reason nobody should trust

## follow_up

The boundary did not move, so nothing ripples out of this state.

ONE NEIGHBOUR IS WORTH WATCHING. Reading a record at a committed ref makes git a load-bearing neighbour for a surface that must answer inside a second, and that tension is already on the register with its own trigger.

## anything_else

