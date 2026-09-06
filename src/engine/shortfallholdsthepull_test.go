package main

import "testing"

// A SHORTFALL HOLDS THE QUEUE, NOT THE CONVERSATION.
//
// THE OWNER'S WORDS: even if you are bound, I do not want the agent to have to
// spawn subagents just because I want to talk to him.
//
// The guard held Bash, Write, Edit, MultiEdit, NotebookEdit, se_apply, se_run
// and se_test. That is doing anything at all. The owner asked a question, the
// agent's next call came back as a demand to spawn subagents nobody had asked
// for, and the answer waited behind it. Twice in one session.
//
// The rule it exists for is that the main agent must not take more from the
// queue while the hands the queue wants are missing. That rule is about the
// pull, and refusing a write never made a hand appear.
func TestAShortfallHoldsThePullAndNothingElse(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := LoadConfig(r)

	// A SHORTFALL HAS TO BE STANDING, or this proves nothing at all: every
	// answer below would be the same with no work open.
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "queue work")
	}
	if _, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", ""); !refuse {
		t.Fatal("no shortfall is standing, so nothing here is about the guard")
	}

	// THE PULL IS HELD. It is the one thing that takes from the queue.
	for _, tool := range []string{"mcp__quackitect__se_pull", "se_pull"} {
		if why, refuse := AStaffShortfall(r, cfg, "main", tool, ""); !refuse {
			t.Errorf("%s went through, so the main agent can take queue work with hands missing", tool)
		} else if why == "" {
			t.Errorf("%s was refused with nothing said", tool)
		}
	}

	// AND EVERYTHING ELSE GOES THROUGH. Each of these was held before, and
	// each is a thing a person asking a question needs.
	for _, tool := range []string{
		"Write", "Edit", "MultiEdit", "NotebookEdit", "Read", "Grep", "WebSearch",
		"mcp__quackitect__se_apply", "mcp__quackitect__se_run", "mcp__quackitect__se_test",
		"se_apply", "se_run", "se_test",
	} {
		if _, refuse := AStaffShortfall(r, cfg, "main", tool, ""); refuse {
			t.Errorf("%s was held, so a person cannot talk to a bound agent without it spawning first", tool)
		}
	}
}

// A BOX WITH NO LANE PULLS THROUGH THE SHELL, so that one Bash call is held and
// every other one is not.
func TestOnlyAShellPullIsHeld(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := LoadConfig(r)
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "queue work")
	}

	if _, refuse := AStaffShortfall(r, cfg, "main", "Bash", "./RUNME.sh pull --actor a --role worker"); !refuse {
		t.Error("a shell pull went through, so the shell is a way round the guard")
	}
	for _, command := range []string{
		"git status",
		"curl https://example.com",
		"./RUNME.sh find --words hello",
		"./RUNME.sh stop --because asked --why \"they said so\"",
		"./RUNME.sh apply --on wk-1 --file x",
	} {
		if _, refuse := AStaffShortfall(r, cfg, "main", "Bash", command); refuse {
			t.Errorf("a shell call was held: %s", command)
		}
	}
}

// A SPAWNED HAND IS NEVER HELD, because it is the answer to the shortfall.
func TestOnlyTheMainAgentIsAskedForHands(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := LoadConfig(r)
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "queue work")
	}
	if _, refuse := AStaffShortfall(r, cfg, "worker-ada", "mcp__quackitect__se_pull", ""); refuse {
		t.Error("a spawned hand was refused its pull, which is the escape the refusal names")
	}
}
