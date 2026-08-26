---
form: find_by_heuristic
by: agent
signed_off: 2026-08-23T17:18:48.992Z
authors: agent
files: null
---

# Evidence form / find_by_heuristic

## current_situation

EIGHT RULES, NINE CLUSTERS, and the card asks for all seventy-two cells rather than the interesting ones.

MOST CELLS SAY NOTHING, and that is the point of sweeping the whole catalogue. A partial sweep and a thorough one look identical once only the hits are written down.

## applies

yes — the catalogue is eight rules and the sweep is mechanical, so skipping it would cost more to justify than to run

## sweep

| heuristic | cluster | what_it_suggests |
| --- | --- | --- |
| Group what changes together; separate what changes apart. | cluster-the-account | the widgets and the walk state change together and live apart today, so group them behind one renderer |
| Group what changes together; separate what changes apart. | cluster-the-record-life | the archived read and the live read change together, so one reader taking a ref beats two readers |
| Group what changes together; separate what changes apart. | cluster-the-walk | nothing |
| Group what changes together; separate what changes apart. | cluster-the-arrival | nothing |
| Group what changes together; separate what changes apart. | cluster-the-bootstrap | nothing |
| Group what changes together; separate what changes apart. | cluster-the-disposition | nothing |
| Group what changes together; separate what changes apart. | cluster-the-holding-pen | nothing |
| Group what changes together; separate what changes apart. | cluster-the-query | nothing |
| Group what changes together; separate what changes apart. | cluster-the-sizing | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-account | the common case is looking at the panel, so a page outside the editor earns an adapter and never a second renderer |
| Make the common case cheap; make the rare case possible. | cluster-the-record-life | reading a closed record is rare, so it may cost a checkout rather than a live index kept warm |
| Make the common case cheap; make the rare case possible. | cluster-the-walk | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-arrival | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-bootstrap | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-disposition | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-holding-pen | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-query | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-sizing | nothing |
| One source of truth; everything else derives. | cluster-the-account | the bless repaint is this rule failing, because the surface holds state the engine already knows |
| One source of truth; everything else derives. | cluster-the-walk | the walker ceiling had two sources this session, and the record's own kickoff had to be made the only one |
| One source of truth; everything else derives. | cluster-the-record-life | a record's own status decides whether it is open, and nothing beside it may |
| One source of truth; everything else derives. | cluster-the-arrival | nothing |
| One source of truth; everything else derives. | cluster-the-bootstrap | nothing |
| One source of truth; everything else derives. | cluster-the-disposition | nothing |
| One source of truth; everything else derives. | cluster-the-holding-pen | nothing |
| One source of truth; everything else derives. | cluster-the-query | nothing |
| One source of truth; everything else derives. | cluster-the-sizing | nothing |
| Push decisions to the last responsible moment. | cluster-the-account | which widgets survive the collapse is decided per widget at the move, never as one up-front ruling |
| Push decisions to the last responsible moment. | cluster-the-walk | nothing |
| Push decisions to the last responsible moment. | cluster-the-record-life | nothing |
| Push decisions to the last responsible moment. | cluster-the-arrival | nothing |
| Push decisions to the last responsible moment. | cluster-the-bootstrap | nothing |
| Push decisions to the last responsible moment. | cluster-the-disposition | nothing |
| Push decisions to the last responsible moment. | cluster-the-holding-pen | nothing |
| Push decisions to the last responsible moment. | cluster-the-query | nothing |
| Push decisions to the last responsible moment. | cluster-the-sizing | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-account | a second surface should be unwritable rather than discouraged, which is minted as its own option |
| Make the illegal unrepresentable, not merely checked. | cluster-the-walk | a registered hand with no role is representable today, and that is exactly the defect this round probed false |
| Make the illegal unrepresentable, not merely checked. | cluster-the-record-life | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-arrival | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-bootstrap | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-disposition | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-holding-pen | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-query | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-sizing | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-account | a computed view model is a small interface between a big engine and a big surface, and it is the repeater option's whole cost |
| Small interfaces between big parts beat the reverse. | cluster-the-walk | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-record-life | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-arrival | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-bootstrap | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-disposition | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-holding-pen | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-query | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-sizing | nothing |
| If it must be remembered, it must be recorded. | cluster-the-account | a spawned hand shows on the board only if the spawner records it, and the state gate can refuse the very call that would |
| If it must be remembered, it must be recorded. | cluster-the-walk | nothing |
| If it must be remembered, it must be recorded. | cluster-the-record-life | nothing |
| If it must be remembered, it must be recorded. | cluster-the-arrival | nothing |
| If it must be remembered, it must be recorded. | cluster-the-bootstrap | nothing |
| If it must be remembered, it must be recorded. | cluster-the-disposition | nothing |
| If it must be remembered, it must be recorded. | cluster-the-holding-pen | nothing |
| If it must be remembered, it must be recorded. | cluster-the-query | nothing |
| If it must be remembered, it must be recorded. | cluster-the-sizing | nothing |
| The default should be the safe thing. | cluster-the-walk | an unrecorded hand defaults to the counted kind, and the safe default is the uncounted one |
| The default should be the safe thing. | cluster-the-account | nothing |
| The default should be the safe thing. | cluster-the-record-life | nothing |
| The default should be the safe thing. | cluster-the-arrival | nothing |
| The default should be the safe thing. | cluster-the-bootstrap | nothing |
| The default should be the safe thing. | cluster-the-disposition | nothing |
| The default should be the safe thing. | cluster-the-holding-pen | nothing |
| The default should be the safe thing. | cluster-the-query | nothing |
| The default should be the safe thing. | cluster-the-sizing | nothing |

## options

- opt-a-second-surface-is-made-unrepresentable

## follow_up

TWO CELLS FOUND DEFECTS RATHER THAN OPTIONS, and both are already recorded elsewhere. The roleless hand is an issue with its probe run. The unrecordable spawn is a note against the state gate.

THAT IS THE SWEEP EARNING ITS KEEP. Neither was found by looking for it. Both fell out of holding an old rule against a cluster nobody was thinking about.

## anything_else

