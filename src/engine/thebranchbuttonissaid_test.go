package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"strings"
	"testing"
)

// PRESSING THE BRANCH BUTTON IS SAID, ON BOTH SURFACES A PERSON READS.
//
// MEASURED. The owner pressed it and read nothing at all: no toast, and no line
// in the log naming a branch. The verb printed one line of prose to standard
// output and wrote nothing else, and the editor parses what a verb answers as
// JSON, so the sentence reached neither surface.
//
// A REFUSAL IS SAID THE SAME WAY, and this drives one. A bucket holding no open
// token is refused before git is touched, so nothing is cut and nothing is
// pushed, and the two things being decided here are exactly the two that broke:
// the shape of the answer, and whether the record holds it.
func TestPressingBranchIsSaidInJSONAndInTheLog(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)

	out, err := exec.Command(theEngine(t), "--branch-group", "there-is-no-such-bucket",
		"--work", r.Work).Output()
	if err != nil {
		t.Fatalf("the verb did not run: %v", err)
	}

	// THE EDITOR PARSES THIS, so prose here is a button that does nothing.
	var said struct {
		On   string `json:"on"`
		Says string `json:"says"`
	}
	if err := json.Unmarshal(out, &said); err != nil {
		t.Fatalf("the answer is not JSON, which is what the editor reads: %q", string(out))
	}
	if said.Says == "" {
		t.Error("the answer says nothing, and a person pressed a button to be told something")
	}
	if said.On != "" {
		t.Errorf("a bucket holding no token was cut anyway, onto %q", said.On)
	}

	// AND THE LOG HOLDS IT, which is the surface the owner said they look at.
	raw, err := os.ReadFile(SessionLog(r))
	if err != nil {
		t.Fatalf("no log was written: %v", err)
	}
	if !strings.Contains(string(raw), `"kind":"branch"`) {
		t.Errorf("the log holds no branch record, so the press left no trace: %s", raw)
	}
}
