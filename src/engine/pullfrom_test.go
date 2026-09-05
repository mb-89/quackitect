package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A SUBMISSION COMES FROM THE SCRATCHPAD TOO, BECAUSE IT IS THE ONLY DOOR SOME
// SESSIONS HAVE.
//
// se pull read its payload from standard input and from nowhere else, and its
// usage printed that door as a pipe. The Bash guard refuses a pipe, so a
// session whose tool lane never came up could ask for work and never put any
// down. Its tokens then sit held by an agent that cannot let go.
//
// run and apply met this first, and --from is the answer they landed on: a file
// under .se/scratchpad, which is the one path a write with nothing in hand may
// reach. See payloadfrom.go.
func TestAPullSubmitsAPayloadFromTheScratchpad(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "submitted from a file")
	if got := Pull(r, "worker-from", RoleWorker, Payload{}); got.Pull != AnswerWork || got.Token.ID != tok.ID {
		t.Fatalf("the worker was not handed the token: %s %s", got.Pull, got.Notice)
	}
	ticked(t, r, tok.ID)

	pad := r.Private("scratchpad")
	if err := os.MkdirAll(pad, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(pad, "submit.json"),
		[]byte(`{"id":"`+tok.ID+`"}`), 0o644); err != nil {
		t.Fatal(err)
	}

	said := theVerbSaid(t, r, "pull", "", "--actor", "worker-from",
		"--from", ".se/scratchpad/submit.json")
	done, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if done.Status != "done" {
		t.Fatalf("the submission in the file did not move the token, which reads %q: %s", done.Status, said)
	}

	// AND THE USAGE PRINTS THE DOOR THIS SESSION HAS. A pipe in the usage is a
	// call the guard refuses, printed to the one agent that cannot make it.
	usage := theVerbSaid(t, r, "pull", "", "--help")
	if strings.Contains(usage, "|") {
		t.Errorf("the usage still prints a pipe, which is the call the guard refuses: %s", usage)
	}
	if !strings.Contains(usage, "--from") {
		t.Errorf("the usage names no door for a session with no lane: %s", usage)
	}

	// A PATH THAT CLIMBS OUT OF THE SCRATCHPAD IS REFUSED, AND SAYS WHERE THE
	// PAYLOAD BELONGS.
	said = theVerbSaid(t, r, "pull", "", "--actor", "worker-from",
		"--from", ".se/scratchpad/../../outside.json")
	if !strings.Contains(said, "scratchpad") {
		t.Errorf("a payload from outside the scratchpad was not refused naming it: %s", said)
	}

	// AND TWO PAYLOADS ARE ANSWERED, NEVER GUESSED BETWEEN, which is the rule
	// run and apply already hold.
	said = theVerbSaid(t, r, "pull", `{"id":"`+tok.ID+`"}`, "--actor", "worker-from",
		"--from", ".se/scratchpad/submit.json")
	if !strings.Contains(said, "name one") {
		t.Errorf("a pull carrying two payloads was not refused: %s", said)
	}
}
