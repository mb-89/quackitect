package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/version"
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
	stop, socket, _ := StartIndexer(t.Context(), r, log, 50*time.Millisecond)
	if socket == "" {
		t.Fatal("the engine did not listen")
	}
	SayRunning(r, Running{PID: os.Getpid(), Socket: socket, Build: version.Build,
		Started: time.Now().UTC().Format(time.RFC3339)})
	t.Cleanup(func() {
		stop()
		StopSaying(r)
		log.Close()
	})
}

// WHY A CLIENT THE TEST DROVE CAME BACK WITH AN ERROR. exec.Command.Output
// keeps the answer stream and hands the reason stream back on the error, so a
// failure reported out of the answer alone is an exit status and nothing
// else. The client refuses on the reason stream, so that is the half a reader
// needs and it is named first; the answer follows where there was one.
func whyTheClientFailed(err error, answer []byte) string {
	said := fmt.Sprintf("%v", err)
	var exited *exec.ExitError
	if errors.As(err, &exited) && len(bytes.TrimSpace(exited.Stderr)) > 0 {
		said += "\nit said: " + strings.TrimRight(string(exited.Stderr), "\n")
	}
	if len(bytes.TrimSpace(answer)) > 0 {
		said += "\nit answered: " + strings.TrimRight(string(answer), "\n")
	}
	return said
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
		t.Fatalf("the client failed: %s", whyTheClientFailed(err, out))
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
		t.Fatalf("the pull failed: %s", whyTheClientFailed(err, out))
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
	cold := aTree(t).apart().Roots
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

// A CLIENT THAT FAILED SAYS WHAT IT WROTE TO THE REASON STREAM. A test drives
// the client with Output, which keeps the answer stream and hands the reason
// stream back on the error, so a failure reported out of the answer alone
// names an exit status and nothing else: the one line saying why is the one
// line dropped. This drives the case a reader meets, a verb with no engine,
// which answers nothing and refuses on the reason stream.
func TestAClientFailureNamesTheReasonStream(t *testing.T) {
	t.Parallel()
	exe := theEngine(t)
	cold := aTree(t).apart().Roots
	verb := []string{"work", "--title", "nobody home", "--work", cold.Work}

	// WHAT THE CLIENT WROTE THERE, read off the stream itself, so the check
	// holds the refusal the client actually wrote rather than a copy of it
	// typed here that a reworded refusal would leave green.
	var reason bytes.Buffer
	watched := exec.Command(exe, verb...)
	watched.Stderr = &reason
	if watched.Run() == nil {
		t.Fatal("a verb with no engine did not fail, so there is no failure to report")
	}
	refusal := strings.TrimSpace(reason.String())
	if refusal == "" {
		t.Fatal("the client refused on no stream, so this test would pass on an empty message")
	}

	// AND THE SAME REFUSAL, DRIVEN THE WAY THE TESTS DRIVE IT: Output keeps
	// the answer, and what the reader is handed has to carry the refusal too.
	answer, err := exec.Command(exe, verb...).Output()
	if err == nil {
		t.Fatalf("a verb with no engine did not fail, and answered %s", answer)
	}
	if said := whyTheClientFailed(err, answer); !strings.Contains(said, refusal) {
		t.Fatalf("the failure says %q, and not what the client wrote to the reason stream: %q", said, refusal)
	}
}
