---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: opt-the-surface-is-a-dumb-repeater
type: "[[option]]"
statement: the engine computes a complete view model and the surface holds no state and no logic of its own, so a second surface could never disagree because neither decides anything
cluster: the-account
question: where the view is decided
found_by: analogy
source: "air data computers in aviation instrumentation: one computing unit feeds every display, and the displays repeat rather than derive"
---

## The abstract function

ONE TRUTH, MANY PLACES IT MUST APPEAR, AND NO TOLERANCE FOR DISAGREEMENT.
Stated that way the problem is not a rendering problem at all, and several
fields solved it long ago.

## Mechanism

AN AIR DATA COMPUTER TAKES THE RAW SENSES AND COMPUTES THE NUMBERS ONCE.
Altitude, airspeed and vertical speed are derived in one unit. Every display
in the aircraft then REPEATS those numbers.

WHAT MAKES IT WORK IS WHAT THE DISPLAYS ARE FORBIDDEN TO DO. A display holds
no state and derives nothing. Two displays cannot disagree about airspeed,
because neither of them computes airspeed.

REDUNDANCY IS ADDED BY DUPLICATING THE COMPUTER, never by letting a display
think for itself. That is the part usually got backwards.

## The transfer

THE ENGINE COMPUTES THE WHOLE VIEW MODEL. Not the data behind the view: the
view itself, resolved down to what each widget shows, including which control
is grey and why.

THE SURFACE RENDERS AND ROUTES INPUT. It holds no position, derives no state
and decides no colour.

A SECOND SURFACE BECOMES HARMLESS BY CONSTRUCTION. It could not drift, because
it would repeat the same computed model. The reason to have one surface then
becomes cost, not correctness, which is a much weaker reason and an honest one.

## What it buys over the neighbouring options

IT ATTACKS THE CAUSE RATHER THAN THE COUNT. The other two options make one
surface, or one renderer with adapters. This one makes disagreement
impossible, and then the number of surfaces stops mattering.

IT ALSO ANSWERS A FAILURE THAT ALREADY HAPPENED HERE. A change landed in one
surface's header and was invisible in the other, because each built its header
from different parts. A repeater has no parts to build a header from.

## What it costs

THE VIEW MODEL BECOMES AN INTERFACE, and interfaces are expensive. Every
widget's needs must be expressible in it, and a widget that needs something
the model does not carry cannot quietly reach around it.

IT MOVES WORK INTO THE ENGINE, which now owns presentation decisions it does
not own today.

## Not established

WHETHER THE HOST LETS A VIEW BE THAT PASSIVE. An editor view may need to make
its own decisions about layout and theming, and that would leave a seam where
this option promises none.
