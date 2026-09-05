package main

import (
	"strings"
	"testing"
)

// THE CAGE HAS NO STATE WITH NO LEGAL MOVE.
//
// Three guards composed into one. The shortfall guard refused every tool it had
// not been told to allow, which included the pull its own refusal asks for, the
// read that would have shown an agent the guard refusing it, and the stop the
// stop hook demands a claim through. The command gate refused `se pull` at a
// shell, and a pull is how you get the id that gate demands.
//
// IT ONLY BIT WITH NO MCP LANE, which is why every desktop session walked past
// it. A cloud box clones, and whatever .mcp.json the clone carries is the lane
// for that whole session. It was measured on one, from the main agent and from
// a subagent, and neither could escape.
func TestTheCageHasNoStateWithNoLegalMove(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	theParametersSay(t, r, "limits.parallel_agents", 2)
	cfg := LoadConfig(r)
	for i := 0; i < 3; i++ {
		mintStandard(t, r, "open work")
	}
	if s := StaffingOf(r, cfg); s.WorkersWanted == 0 {
		t.Fatal("this tree wants no hands, so there is no shortfall to be caught in")
	}

	// WHAT ALWAYS PASSES: spawning, looking, pulling, stopping, speaking.
	for _, tool := range []string{
		"Task", "Agent", "Read", "Grep", "WebSearch",
		"mcp__quackitect__se_pull", "mcp__quackitect__se_stop",
		"mcp__quackitect__se_answer", "mcp__quackitect__se_said", "mcp__quackitect__se_status",
	} {
		if why, refused := AStaffShortfall(r, cfg, "main", tool, ""); refused {
			t.Errorf("%s was refused during a shortfall, so the agent has one less move: %s", tool, why)
		}
	}

	// WHAT IS HELD: the work itself, which is what spawning is for.
	for _, tool := range []string{"Bash", "Write", "Edit", "mcp__quackitect__se_apply",
		"mcp__quackitect__se_run", "mcp__quackitect__se_test"} {
		if _, refused := AStaffShortfall(r, cfg, "main", tool, ""); !refused {
			t.Errorf("%s went through during a shortfall, so the main agent does the work itself", tool)
		}
	}

	// AND WITH NO LANE, THE SHELL IS THE LANE. A pull and a stop typed at a
	// shell are the same two calls, and both gates have to let them by.
	for _, command := range []string{"./.bin/se pull --actor worker-one --role worker",
		".bin/se.exe stop --because asked", "se --answer \"on my way\""} {
		if why, refused := AStaffShortfall(r, cfg, "main", "Bash", command); refused {
			t.Errorf("the shortfall refused %q, which is the move it is asking for: %s", command, why)
		}
		if why, refused := WriteNeedsAToken(r, "main", "Bash", "", command); refused {
			t.Errorf("the command gate refused %q, and a pull is how you get the id it demands: %s", command, why)
		}
	}

	// THE ENGINE'S OWN WORK VERBS STAY HELD, so a shortfall is not walked round
	// by typing at a shell what the lane would have refused.
	for _, command := range []string{"./.bin/se run --on wk-1 --by main", "se apply --on wk-1"} {
		if _, refused := AStaffShortfall(r, cfg, "main", "Bash", command); !refused {
			t.Errorf("%q went through a shortfall, so the shell is a way round the guard", command)
		}
	}

	// AND A COMMAND THAT IS MORE THAN THE ENGINE IS A SHELL COMMAND AGAIN.
	for _, command := range []string{"./.bin/se pull; rm -rf src", "se pull && echo x > src/engine/gate.go"} {
		if _, refused := WriteNeedsAToken(r, "main", "Bash", "", command); !refused {
			t.Errorf("%q walked through the command gate on the strength of its first word", command)
		}
	}
}

// A STOP CLAIM SURVIVES EVERY GUARD.
//
// Nothing else in the system can recover from a guard that has gone wrong, so
// this is the one call that has to get through one.
func TestAStopClaimPassesEveryGuard(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	theParametersSay(t, r, "limits.parallel_agents", 2)
	cfg := LoadConfig(r)
	for i := 0; i < 3; i++ {
		mintStandard(t, r, "open work")
	}
	for _, c := range []struct{ tool, command string }{
		{"mcp__quackitect__se_stop", ""},
		{"se_stop", ""},
		{"Bash", "./.bin/se stop --because asked --why \"the person arrived\""},
	} {
		if why, refused := AStaffShortfall(r, cfg, "main", c.tool, c.command); refused {
			t.Errorf("the shortfall refused a stop (%s): %s", c.tool, why)
		}
		if why, refused := WriteNeedsAToken(r, "main", c.tool, "", c.command); refused {
			t.Errorf("the command gate refused a stop (%s): %s", c.tool, why)
		}
	}
	_ = strings.TrimSpace
}

// AN ANSWER DISCHARGES THE PERSON'S PRESS.
//
// The press refuses every tool call and lets an answer through, and nothing
// cleared it. So the agent answered, was refused again, and its only legal move
// was an answer it had already given. A person had to press the button a second
// time to release a session that had done exactly what was asked of it.
//
// THE PANEL FOUND IT FROM THE OTHER SIDE. Its button is down while an update is
// owed, and drive-panel drove the press, the answer, and the button coming back
// up. It never came up.
func TestAnAnswerDischargesThePress(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	if _, err := SetAsked(r, true, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !LoadAsked(r).Owed() {
		t.Fatal("the press raised nothing, so there is nothing here to discharge")
	}
	theVerbSaid(t, r, "answer", "", "--text", "what everybody is working on", "--actor", "main")
	if LoadAsked(r).Owed() {
		t.Error("the answer is in the record and the press still stands, so every " +
			"tool call goes on being refused and the only move left is an answer that " +
			"changes nothing")
	}
}
