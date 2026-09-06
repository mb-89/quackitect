package main

import "testing"

// HANDING WORK IN IS NOT ASKING FOR MORE.
//
// The guard exists so the main agent does not take more from the queue while the
// hands the queue wants are missing. A submit takes nothing. It gives one token
// back and leaves the agent emptier than it found it.
//
// BUT A SUBMIT IS AN se_pull CALL, and the guard read only the tool name, so it
// refused both. An agent that had finished its work could not record it.
//
// MEASURED ON 2026-09-06. A token was finished, green and written up, and its
// submit answered THE QUEUE WANTS MORE HANDS with 144 tokens open and one worker
// here. On a cloud box that is worse than a delay: the agent is told to spawn two
// agents so that it may file work it has already done, and a box that cannot
// spawn loses the work when it is reclaimed.
//
// BOTH DOORS READ THE SAME RULE. A box with no lane submits through the shell,
// and holding that one would move the deadlock rather than end it.
func TestAShortfallLetsASubmitThrough(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := LoadConfig(r)
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "queue work")
	}

	// A SHORTFALL HAS TO BE STANDING, or every answer below is the same with no
	// work open and this proves nothing.
	if _, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", "", "", ""); !refuse {
		t.Fatal("no shortfall is standing, so nothing here is about the guard")
	}

	// THE LANE DOOR. A pull naming a token and how it ended is a submit.
	for _, tool := range []string{"mcp__quackitect__se_pull", "se_pull"} {
		if why, refuse := AStaffShortfall(r, cfg, "main", tool, "", "wk-1111111111", "done"); refuse {
			t.Errorf("%s naming a token and a disposition was held, so finished work cannot be filed: %s", tool, why)
		}
	}

	// THE SHELL DOOR, which is how a box with no lane files its work.
	if _, refuse := AStaffShortfall(r, cfg, "main", "Bash",
		"./RUNME.sh pull --id wk-1111111111 --disposition done", "", ""); refuse {
		t.Error("a shell submit was held, so a box with no lane cannot file finished work")
	}

	// AND THE GUARD IS NARROWED RATHER THAN TAKEN OFF. A pull that asks for work
	// is still held at both doors.
	if _, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", "", "", ""); !refuse {
		t.Error("a bare pull went through, so the guard is off rather than narrowed")
	}
	if _, refuse := AStaffShortfall(r, cfg, "main", "Bash",
		"./RUNME.sh pull --actor main --role worker", "", ""); !refuse {
		t.Error("a bare shell pull went through, so the guard is off rather than narrowed")
	}

	// A DISPOSITION WITH NO TOKEN IS NOT A SUBMIT, and neither is a token with no
	// disposition. Letting half of one through would be a way round the guard
	// rather than a narrowing of it.
	for _, half := range []struct{ id, disposition string }{
		{"wk-1111111111", ""},
		{"", "done"},
	} {
		if _, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", "",
			half.id, half.disposition); !refuse {
			t.Errorf("a pull with id %q and disposition %q went through, and it is not a submit",
				half.id, half.disposition)
		}
	}
}
