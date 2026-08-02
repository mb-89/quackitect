# no_pending_note — the condition

The state refuses while a PENDING note carries one of the condition's
marker phrases. The arguments are the markers; matching is
case-insensitive substring over pending (undrained) notes.

The one live use: start_iteration carries
`entry_no_pending_note: needs retro` — whenever an iteration finishes, or
the owner asks for a retro, a note saying "needs retro" is minted. While
it pends, iterations cannot start. The RETRO's drain dispositions it
(idle → retro → drain), and the gate opens.

How to satisfy it: run the retro. Draining is legal only there.
