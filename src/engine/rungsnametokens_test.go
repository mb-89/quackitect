package main

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

// THE DOORS ARE ASSERTED BY THEIR OWN WORDS, NOT BY THE WORD deny. Several
// guards deny, so a test reading only that would pass on somebody else's
// refusal and prove nothing about this rule.
const (
	theWriteDoor = "THE ENGINE WRITES FILES, BECAUSE A WRITE SAYS WHICH WORK IT IS"
	theRunDoor   = "THE ENGINE RUNS COMMANDS, BECAUSE A COMMAND SAYS WHICH WORK IT IS"
)

// EVERY RUNG BUT GOD NAMES ITS TOKEN, AND ONE WRITE DRIVES ALL THREE.
//
// Unbound is the queue off, and it took the token requirement off with it. A
// session then ran with every token left at noted and every submission empty,
// and a reader could not tell the queue being off from the process being
// followed badly. Both look the same on the work surface.
//
// UNBOUND MEANS ONE THING: this agent is not part of the queue. It picks what
// it works on, including a token nobody handed it. It still writes one, and
// every write and every run still names one.
//
// GOD DOES NOT MOVE. Every refusal is off there, this one among them, because
// god is for a broken engine and nothing is said per call.
func TestEveryRungButGodNamesItsToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	say := func(tool string, input map[string]any) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"session_id": "s-1", "tool_name": tool, "tool_input": input})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}

	// ONE WRITE, DRIVEN AT EVERY RUNG. The content breaks no voice rule and the
	// path is no projection, so the rung is the only thing that moves.
	write := func() string {
		return say("Write", map[string]any{"file_path": "doc/x.md",
			"content": "The engine reads the tree.\n"})
	}
	for _, c := range []struct {
		at      TheBinding
		refused bool
	}{
		{Bound, true},
		{Unbound, true},
		{God, false},
	} {
		if _, err := SetBinding(r, c.at, "the owner"); err != nil {
			t.Fatal(err)
		}
		if got := strings.Contains(write(), theWriteDoor); got != c.refused {
			t.Fatalf("at %s a write naming no token was refused=%v, and it should be %v",
				c.at, got, c.refused)
		}
	}

	// AND A RUN IS THE OTHER HALF OF THE SAME RULE. Bash carries no way to name
	// a token, so the queue being off is no licence to run unnamed commands.
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if said := say("Bash", map[string]any{"command": "echo hello"}); !strings.Contains(said, theRunDoor) {
		t.Fatalf("an unbound run naming no token was taken: %s", said)
	}
}
