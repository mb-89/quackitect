package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// THE BUDGET COUNTS WHAT THE HELPER READ, UNDER EVERY NAME IT IS FILED UNDER.
//
// The budget is a ratio of the bytes a helper read, with a floor so a helper
// given a small job is not held to a ratio of nothing. It asked BytesReadBy for
// the harness id. The read is filed by notePostTool under TheActorOf, which is
// the register's name for a helper and not the id the harness sends.
//
// So for a registered helper the two halves keyed on different names. The reads
// piled up under one, the budget asked about the other, got nothing, and fell
// back to the floor. A helper that read a great deal was held to the floor,
// which is the case the ratio exists to be different from.
//
// THE ROW THAT CATCHES IT IS THE ONE THE FLOOR CANNOT EXPLAIN: an answer over
// the floor and under a tenth of what was read. Correct, it goes through.
// Counting no reads, it is refused.
func TestAHelperBudgetCountsWhatItReadUnderEveryName(t *testing.T) {
	exe := buildEngine(t)
	r := aTreeWithTheProcesses(t)
	Project(r)
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	l.Close()

	cfg := TheFloor()
	const id = "general-purpose-reader"
	NoteAgent(r, id, "general-purpose", "s-1")
	NoteTheNameItPullsWith(r, id, ".bin/se pull --actor worker-reader")

	// IT READS ENOUGH THAT A TENTH OF IT IS WELL OVER THE FLOOR, so the two
	// bounds cannot be confused for one another.
	big := filepath.Join(r.Work, "material.md")
	line := "a line of material the helper read\n"
	body := strings.Repeat(line, (cfg.HelperFloorBytes*cfg.HelperRatio*4)/len(line))
	if err := os.WriteFile(big, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	hookSays(t, exe, r.Method, "PostToolUse", map[string]any{"cwd": r.Work, "tool_name": "Read",
		"agent_id": id, "tool_input": map[string]any{"file_path": big}})

	stop := func(agent, answer string) string {
		return hookSays(t, exe, r.Method, "SubagentStop", map[string]any{"cwd": r.Work,
			"agent_id": agent, "agent_type": "general-purpose", "last_assistant_message": answer})
	}

	// OVER THE FLOOR AND UNDER A TENTH OF WHAT IT READ. The ratio allows it,
	// and a budget that counted no reads does not.
	digest := strings.Repeat("y", cfg.HelperFloorBytes*2)
	if said := stop(id, digest); said != "" {
		d, out := decisionOf(t, said)
		t.Fatalf("a digest of %d bytes was answered %q, and the helper read %d, so a tenth of it is %d: %v",
			len(digest), d, len(body), len(body)/cfg.HelperRatio, out)
	}

	// AND THE FLOOR STILL HOLDS FOR A HELPER THAT READ NOTHING, which is what
	// the floor is for and what this must not spend.
	const idle = "general-purpose-idle"
	NoteAgent(r, idle, "general-purpose", "s-1")
	NoteTheNameItPullsWith(r, idle, ".bin/se pull --actor worker-idle")
	if d, out := decisionOf(t, stop(idle, strings.Repeat("z", cfg.HelperFloorBytes+1))); d != "block" {
		t.Errorf("a helper that read nothing answered past the floor and was allowed: %q %v", d, out)
	}
}
