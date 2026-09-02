package main

import (
	"testing"
)

// THE REVIEWER STAYS. A token that comes back goes to the hand that judged it,
// and a fresh reviewer takes it only when that one is gone.
//
// ABSENT IS StillPulling AND NOTHING ELSE, so every fixture here runs inside a
// real session and moves the queue rather than asking whether somebody was ever
// seen. Arrived never goes false inside a session, and reading absence off it
// would freeze every token whose reviewer arrived, judged and stopped.

// ---- the fixtures ----

// aLaneWithASession is a lane the engine has started in, because absence is
// answered from the session's own pull count and a lane with no session answers
// nothing.
func aLaneWithASession(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()
	if !Named(currentSession(r)) {
		t.Fatal("the fixture has no session, so nothing here can ask whether a reviewer is gone")
	}
	return r
}

// movePast drives the session's pull count past the staleness window with
// somebody else's pulls, which is what makes the queue its own clock.
func movePast(r Roots, stale int) {
	for i := 0; i <= stale+1; i++ {
		Pull(r, "somebody-else", RoleWorker, Payload{})
	}
}
