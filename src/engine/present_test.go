package main

import (
	"bytes"
	"encoding/json"
	"testing"
)

// THE REGISTER FOLLOWS AN AGENT IN AND OUT, ON THE HARNESS'S OWN EVENTS.
//
// The harness says SessionStart and SubagentStart when an agent arrives, and
// SessionEnd and SubagentStop when it goes. Every one of those already
// reaches this engine, and until now none of them was kept: the panel could
// say what an actor that had pulled was doing, and nothing said who was
// here. So a helper that had not pulled yet was invisible, and one that had
// gone looked like it was still working.
func TestTheRegisterFollowsAgentsInAndOut(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	session := currentSession(r)
	if session == "" {
		t.Fatal("the log did not name a session, so nothing can be keyed to one")
	}

	tell := func(event string, more map[string]any) {
		t.Helper()
		in := map[string]any{"hook_event_name": event, "cwd": r.Work, "session_id": session}
		for k, v := range more {
			in[k] = v
		}
		body, _ := json.Marshal(in)
		var out bytes.Buffer
		answerHook(body, []string{"--method", r.Method}, &out, log)
	}
	here := func() []Doing { return AgentsPresent(r) }
	named := func(want ...string) {
		t.Helper()
		got := []string{}
		for _, d := range here() {
			got = append(got, d.Actor)
		}
		if len(got) != len(want) {
			t.Fatalf("the register holds %v, want %v", got, want)
		}
		for i := range want {
			if got[i] != want[i] {
				t.Fatalf("the register holds %v, want %v", got, want)
			}
		}
	}

	// NOBODY IS HERE UNTIL SOMEBODY ARRIVES.
	named()

	// THE SESSION IS AN AGENT. It is the one the person is talking to.
	tell("SessionStart", map[string]any{"source": "startup"})
	named("main")
	if kind := here()[0].Kind; kind != "session" {
		t.Fatalf("the session is registered as %q", kind)
	}

	// A HELPER ARRIVES UNDER THE NAME THE RECORD GIVES IT, not its hash.
	tell("SubagentStart", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer"})
	named("main", "reviewer-1")

	// AND A SECOND ONE IS A SECOND ROW, because there is no such thing as
	// the agent.
	tell("SubagentStart", map[string]any{"agent_id": "9ab2", "agent_type": "reviewer"})
	named("main", "reviewer-1", "reviewer-2")

	// WHAT IT HOLDS IS READ OFF THE TOKENS, and a helper holding nothing is
	// still here, which is the whole point of a register.
	if got := here()[1].Holding; got != NothingInHand {
		t.Fatalf("a helper that holds nothing says %q", got)
	}

	// ONE GOES, AND ONLY THAT ONE.
	tell("SubagentStop", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer"})
	named("main", "reviewer-2")

	// AND THE SESSION ENDING TAKES EVERY AGENT OF IT, including a helper
	// whose own stop never arrived.
	tell("SessionEnd", map[string]any{"reason": "clear"})
	named()
}

// AN AGENT THAT CALLS AFTER THE ENGINE RESTARTED IS HERE AGAIN, without a
// second SessionStart, which the harness never sends. The battery restarts
// the engine on every run and the person's session goes on across it; the
// owner watched the table say nobody was here while one agent was working.
func TestAnAgentSeenAfterARestartIsHereAgain(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	tell := func(event string, more map[string]any) {
		t.Helper()
		in := map[string]any{"hook_event_name": event, "cwd": r.Work, "session_id": "s-1"}
		for k, v := range more {
			in[k] = v
		}
		body, _ := json.Marshal(in)
		var out bytes.Buffer
		answerHook(body, []string{"--method", r.Method}, &out, log)
	}
	tell("SessionStart", map[string]any{"source": "startup"})
	tell("SubagentStart", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer"})

	// THE ENGINE RESTARTS: the register was filled under another run.
	stale := LoadEvidence(r)
	for id, a := range stale.Agents {
		a.Run = "the-run-before-the-restart"
		stale.Agents[id] = a
	}
	if err := SaveEvidence(r, stale); err != nil {
		t.Fatal(err)
	}
	if got := AgentsPresent(r); len(got) != 0 {
		t.Fatalf("the old run's register is drawn as here: %+v", got)
	}

	// THE SESSION CALLS, AND IT IS HERE. Its helper calls, and it is here
	// under the name it already had, not a new one.
	tell("Notification", nil)
	tell("PreToolUse", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer", "tool_name": "WebSearch",
		"tool_input": map[string]any{"query": "x"}})
	got := AgentsPresent(r)
	if len(got) != 2 || got[0].Actor != "main" || got[1].Actor != "reviewer-1" {
		t.Fatalf("after the restart the register holds %+v", got)
	}

	// A HELPER THAT PULLS THROUGH THE LANE IS DRAWN UNDER THE NAME IT PULLS
	// WITH, the way the header draws it.
	tell("PreToolUse", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer", "tool_name": "mcp__quackitect__se_pull",
		"tool_input": map[string]any{"actor": "worker-one"}})
	if got := AgentsPresent(r); len(got) != 2 || got[1].Actor != "worker-one" || got[1].Kind != "reviewer" {
		t.Fatalf("after a lane pull the register holds %+v", got)
	}

	// THE SESSION'S NEXT PROMPT TAKES ITS HELPERS OUT, because a turn that
	// was interrupted says nothing at all, and a helper is a thing of one
	// turn. The session stays. A helper that calls again is back.
	tell("UserPromptSubmit", map[string]any{"prompt": "and now this"})
	if got := AgentsPresent(r); len(got) != 1 || got[0].Actor != "main" {
		t.Fatalf("after the next prompt the register holds %+v", got)
	}
	tell("PreToolUse", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer", "tool_name": "WebSearch",
		"tool_input": map[string]any{"query": "still here"}})
	if got := AgentsPresent(r); len(got) != 2 {
		t.Fatalf("a helper calling after the prompt is not back: %+v", got)
	}

	// AND ONE THAT ENDS IS STILL TAKEN OUT, not registered by its own stop.
	tell("SubagentStop", map[string]any{"agent_id": "1f4c", "agent_type": "reviewer"})
	if got := AgentsPresent(r); len(got) != 1 || got[0].Actor != "main" {
		t.Fatalf("after the helper stopped the register holds %+v", got)
	}
}

// AN AGENT OF ANOTHER SESSION IS NOT HERE. A register left behind by a
// session that ended without saying so would otherwise draw agents that are
// gone, and the panel would show a crowd that is not there.
func TestTheRegisterHoldsThisSessionOnly(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()

	NoteSession(r, "a-session-that-ended")
	NoteAgent(r, "5c1d", "reviewer", "a-session-that-ended")
	stale := LoadEvidence(r)
	for id, a := range stale.Agents {
		a.Run = "a-run-that-ended"
		stale.Agents[id] = a
	}
	if err := SaveEvidence(r, stale); err != nil {
		t.Fatal(err)
	}
	if got := AgentsPresent(r); len(got) != 0 {
		t.Fatalf("another session's agents are drawn as here: %+v", got)
	}
}
