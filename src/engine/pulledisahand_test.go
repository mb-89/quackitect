package main

import "testing"

// AN AGENT THAT PULLED IS A HAND, WHETHER OR NOT THE REGISTER HEARD OF IT.
//
// The register is filled by SessionStart and SubagentStart. On a harness where
// SubagentStart never arrives, a spawned agent is never registered, so the
// count read none of them however many pulled. Four workers were spawned, all
// four pulled, and the guard went on answering that two workers are here.
//
// THAT LEFT THE GUARD WITH NO WAY OUT. It holds the main agent's work until
// the hands are here and names spawning as the remedy, and spawning did not
// move the number.
//
// THE ARRIVAL RECORD IS THE OTHER WITNESS, and WhatIsHappening already merges
// it with the register. This is the count reading the same tree the same way.
func TestAPulledAgentIsAHand(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		says    string
		hands   func(r Roots, session string)
		here    int
		refused bool
	}{
		{
			says:  "the session alone",
			hands: func(r Roots, session string) { NoteSession(r, session) },
			here:  1, refused: true,
		},
		{
			says: "the session and a puller the register never heard of",
			hands: func(r Roots, session string) {
				NoteSession(r, session)
				ArrivedAs(r, ArrivalSession(r), "worker-faure", RoleWorker)
			},
			here: 2, refused: false,
		},
		{
			says: "the session and a puller from an earlier run",
			hands: func(r Roots, session string) {
				NoteSession(r, session)
				ArrivedAs(r, "20260101-000000", "worker-faure", RoleWorker)
			},
			here: 1, refused: true,
		},
	} {
		c := c
		t.Run(c.says, func(t *testing.T) {
			t.Parallel()
			r := aTreeWithTheProcesses(t)
			// THE RUN IS NAMED BY THE FIRST LINE OF ITS LOG, and the
			// register holds only this run's agents.
			log, err := OpenLog(r.Private("log"))
			if err != nil {
				t.Fatal(err)
			}
			defer log.Close()
			record(log, "engine", "start", "engine", "engine started", Yes(), nil)

			cfg := TheFloor()
			cfg.ParallelAgents = 2
			for i := 0; i < 4; i++ {
				mintStandard(t, r, "open work")
			}
			c.hands(r, currentSession(r))

			s := StaffingOf(r, cfg)
			if s.WorkersWanted != 2 {
				t.Fatalf("four open tokens under a number of two want %d worker(s): %+v",
					s.WorkersWanted, s)
			}
			if s.WorkersHere != c.here {
				t.Fatalf("%s: %d hand(s) are here and the count says %d: %+v",
					c.says, c.here, s.WorkersHere, s)
			}
			// AND THE GUARD READS THE SAME NUMBER. Its ask is satisfiable
			// only where as many hands as the limit allows lift it.
			why, refused := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_apply", "")
			if refused != c.refused {
				t.Fatalf("%s: the guard refused=%v with %d of %d hand(s) here: %s",
					c.says, refused, s.WorkersHere, s.WorkersWanted, why)
			}
		})
	}
}
