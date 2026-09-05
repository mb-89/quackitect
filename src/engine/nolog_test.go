package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// THE GUARD ANSWERS WHETHER OR NOT A SESSION IS RUNNING.
//
// The hook opens the log and keeps nil when there is none, saying so in its own
// comment: no log means no engine, and the guard still answers, because the
// answer is about a file and not about a session. Every other call in that path
// goes through record(), which checks for nil. This one did not, so a person
// who ran a tool with the editor shut and had said something mid-turn crashed
// the guard rather than being answered.
//
// IT IS REACHED PRECISELY WHEN THERE IS NO LOG. SaidCount reads the record, so
// with no log it answers nought for every message, which is what sends the walk
// down the branch that writes.
func TestTheGuardCopiesWhatWasHeardWithNoSessionRunning(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots

	// A transcript holding one thing a person said mid-turn.
	transcript := filepath.Join(t.TempDir(), "transcript.jsonl")
	line, err := json.Marshal(map[string]any{
		"type": "attachment",
		"attachment": map[string]any{
			"type":   "queued_command",
			"origin": map[string]any{"kind": "human"},
			"prompt": []map[string]any{{"type": "text", "text": "please stop and look at this"}},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(transcript, append(line, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}

	// The first read of a transcript starts at its end, so the message is only
	// reached on the second call. That is the engine's rule, not this test's.
	CopyWhatWasHeard(r, transcript, nil, "main")
	if err := os.WriteFile(transcript, append(append(line, '\n'), append(line, '\n')...), 0o644); err != nil {
		t.Fatal(err)
	}

	// WITH NO LOG THIS MUST ANSWER RATHER THAN DIE. A panic here is the guard
	// taking the tool call down with it.
	got := CopyWhatWasHeard(r, transcript, nil, "main")
	if got < 0 {
		t.Fatalf("it answered %d", got)
	}
}
