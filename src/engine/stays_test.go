package main

// THE REVIEWER STAYS. A token that comes back goes to the hand that judged it,
// and a fresh reviewer takes it only when that one is gone.
//
// ABSENT IS HasGone AND NOTHING ELSE, so every fixture here runs inside a real
// session with a record in it rather than asking whether somebody was ever seen.
// Arrived never goes false inside a session, and reading absence off it would
// freeze every token whose reviewer arrived, judged and stopped.

// ---- the fixtures ----

// movePast drives the session's pull count past the staleness window with
// somebody else's pulls, which is what makes the queue its own clock.
func movePast(r Roots, stale int) {
	for i := 0; i <= stale+1; i++ {
		Pull(r, "somebody-else", RoleWorker, Payload{})
	}
}
