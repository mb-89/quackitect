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
	noEngineHere(t, r)
	theParametersSay(t, r, "limits.parallel_agents", 2)
	cfg := LoadConfig(r)
	for i := 0; i < 3; i++ {
		mintStandard(t, r, "open work")
	}
	if s := StaffingOf(r, cfg); s.WorkersWanted == 0 {
		t.Fatal("this tree wants no hands, so there is no shortfall to be caught in")
	}

	// WHAT ALWAYS PASSES: spawning, looking, writing, running, testing,
	// stopping, speaking. Everything but the pull.
	//
	// IT WAS A LIST OF WHAT IS ALLOWED, AND IT DEADLOCKED. Anything nobody
	// thought to name was refused, and an agent could neither work, nor look,
	// nor pull, nor stop. So the deny side is named instead, and it is one
	// verb: see heldDuringShortfall in staffing.go.
	//
	// THE OWNER'S WORDS, quoted there: even if you are bound, I do not want the
	// agent to have to spawn subagents just because I want to talk to him.
	for _, tool := range []string{
		"Task", "Agent", "Read", "Grep", "WebSearch",
		"Write", "Edit", "mcp__quackitect__se_apply",
		"mcp__quackitect__se_run", "mcp__quackitect__se_test",
		"mcp__quackitect__se_stop",
		"mcp__quackitect__se_answer", "mcp__quackitect__se_said", "mcp__quackitect__se_status",
	} {
		if why, refused := AStaffShortfall(r, cfg, "main", tool, "", "", ""); refused {
			t.Errorf("%s was refused during a shortfall, so the agent has one less move: %s", tool, why)
		}
	}

	// WHAT IS HELD: the main agent asking the queue for more work, which is
	// what spawning is instead of.
	for _, tool := range []string{"mcp__quackitect__se_pull", "se_pull"} {
		if _, refused := AStaffShortfall(r, cfg, "main", tool, "", "", ""); !refused {
			t.Errorf("%s went through during a shortfall, so the main agent takes the work itself", tool)
		}
	}

	// AND WITH NO LANE, THE SHELL IS THE LANE. A stop and an answer typed at a
	// shell are the same calls, and both gates have to let them by.
	for _, command := range []string{".bin/se.exe stop --because asked", "se --answer \"on my way\""} {
		if why, refused := AStaffShortfall(r, cfg, "main", "Bash", command, "", ""); refused {
			t.Errorf("the shortfall refused %q, which is the move it is asking for: %s", command, why)
		}
		if why, refused := WriteNeedsAToken(r, "main", "Bash", "", command); refused {
			t.Errorf("the command gate refused %q, and a pull is how you get the id it demands: %s", command, why)
		}
	}

	// A SHELL PULL IS HELD, INCLUDING ONE NAMING ANOTHER HAND, and that last
	// case is a hole rather than a rule. On a box with no lane the main agent
	// types the spawned worker's pull, and the guard reads the caller and holds
	// it. wk-725b3914e7 carries the fix, and this line goes back to the
	// going-through case when it lands.
	for _, command := range []string{"./.bin/se pull --role worker",
		"./.bin/se pull --actor worker-one --role worker"} {
		if _, refused := AStaffShortfall(r, cfg, "main", "Bash", command, "", ""); !refused {
			t.Errorf("%q went through a shortfall, so the shell is a way round the guard", command)
		}
	}

	// AND THE ENGINE'S WORK VERBS AT A SHELL GO THROUGH, the way the lane's do.
	// The shortfall is about the queue and not about writing.
	for _, command := range []string{"./.bin/se run --on wk-1 --by main", "se apply --on wk-1"} {
		if why, refused := AStaffShortfall(r, cfg, "main", "Bash", command, "", ""); refused {
			t.Errorf("the shortfall refused %q, which is not the queue: %s", command, why)
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
		if why, refused := AStaffShortfall(r, cfg, "main", c.tool, c.command, "", ""); refused {
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
