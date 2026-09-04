package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// AN ENGINE THAT LIVES, INSIDE THE TEST. A verb typed at a prompt is run by
// the engine over the folder, so a test that drives a verb through the
// binary needs one. This starts the model in the test's own process, over
// the roots the test made, and publishes it the way the engine does. The
// verb then runs in this process, against this package's code, and the
// binary is only the client it would be for a person.
//
// The record it is given lives outside the work root, so a verb that rotates
// or drains the record is not pulling the rug from under the engine's own
// error lines.
func aLiveEngine(t *testing.T, r Roots) {
	t.Helper()
	if _, up := LoadRunning(r); up {
		return
	}
	log, err := OpenLog(filepath.Join(t.TempDir(), "log"))
	if err != nil {
		t.Fatal(err)
	}
	stop, socket, _ := StartIndexer(r, log, 50*time.Millisecond)
	if socket == "" {
		t.Fatal("the engine did not listen")
	}
	SayRunning(r, Running{PID: os.Getpid(), Socket: socket, Build: Build,
		Started: time.Now().UTC().Format(time.RFC3339)})
	t.Cleanup(func() {
		stop()
		StopSaying(r)
		log.Close()
	})
}

// A VERB TYPED AT A PROMPT RUNS IN THE ENGINE, AND WITHOUT ONE IT SAYS SO.
func TestAVerbRunsInsideTheEngineAndTheClientPrintsIt(t *testing.T) {
	t.Parallel()
	exe := theEngine(t)
	r := aTreeWithOneStep(t)
	aLiveEngine(t, r)

	out, err := exec.Command(exe, "work", "--title", "minted by a client", "--process", "task",
		"--tracked", "true", "--detail", "through the socket", "--work", r.Work).Output()
	if err != nil {
		t.Fatalf("the client failed: %v\n%s", err, out)
	}
	var minted Token
	if json.Unmarshal(out, &minted) != nil || minted.ID == "" {
		t.Fatalf("the client printed something that is not a token: %s", out)
	}
	// THE TOKEN IS IN THE TREE THE ENGINE HOLDS, written by this process.
	if _, err := LoadToken(r, minted.ID); err != nil {
		t.Fatalf("the engine did not mint into its own tree: %v", err)
	}

	// A PAYLOAD ON STANDARD INPUT REACHES THE VERB. A pull with the token's
	// id and a disposition is a submission, and the engine answers it.
	pull := exec.Command(exe, "pull", "--actor", "client", "--work", r.Work)
	pull.Stdin = strings.NewReader(`{"id":"` + minted.ID + `","disposition":"done"}`)
	out, err = pull.Output()
	if err != nil {
		t.Fatalf("the pull failed: %v\n%s", err, out)
	}
	var a Answer
	if json.Unmarshal(out, &a) != nil || a.Pull == "" {
		t.Fatalf("the pull answered %s", out)
	}
	if ended, _ := LoadToken(r, minted.ID); ended.Disposition != Done {
		t.Fatalf("the submission did not end the token: %+v", ended)
	}

	// HELP NEEDS NO ENGINE, AND IT IS NOT AN ANSWER. It goes where the
	// reasons go, so a reader parsing the answer stream as JSON never meets
	// a usage message where a token should be.
	cold := Roots{Method: t.TempDir(), Work: t.TempDir()}
	asked := exec.Command(exe, "work", "--help", "--work", cold.Work)
	var answer, reason bytes.Buffer
	asked.Stdout, asked.Stderr = &answer, &reason
	_ = asked.Run()
	if !strings.Contains(reason.String(), "se work -") {
		t.Fatalf("help without an engine answered %q on the reason stream", reason.String())
	}
	if answer.Len() != 0 {
		t.Fatalf("help put %q on the answer stream", answer.String())
	}

	// AND WITH NO ENGINE THE VERB IS REFUSED, and the answer says how to start one.
	none := exec.Command(exe, "work", "--title", "nobody home", "--work", cold.Work)
	out, err = none.CombinedOutput()
	if err == nil || !strings.Contains(string(out), "se --work") {
		t.Fatalf("a verb with no engine answered %v: %s", err, out)
	}
}
