package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE ASK ANSWERS WHY THE WORK IS WORTH DOING.
//
// A note is asked why it is a problem, and not only what happened, and it
// carries evidence for the answer. A tracked token was asked nothing of the
// kind: every ask criterion was about the shape of the work. So the private
// note that costs nothing interrogated value, and the tracked token that
// spends real work did not.
//
// TWO QUESTIONS ARE OWED BEFORE A TRACKED TOKEN EXISTS. What is gained by
// doing it, and what breaks if it is never done. Both are driven through the
// table of tracked processes, because a rule taught to one half of a mirrored
// pair is the same defect again.

// theQuestionsTheAskOwes is the wording every tracked ask is held to, written
// once so the process file and the guidance are read against the same words.
var theQuestionsTheAskOwes = []string{
	"what is gained by doing it",
	"what breaks if it is never done",
}

// theTrackedProcesses are the processes whose ask mints work rather than a
// backlog entry. A note is not here: it already asks why.
var theTrackedProcesses = []string{"standard", "trivial"}

func theAskOf(t *testing.T, r Roots, process string) Activity {
	t.Helper()
	p, err := LoadProcess(r.Method, process)
	if err != nil {
		t.Fatalf("loading the %s process: %v", process, err)
	}
	for _, a := range p.Activities {
		if a.Name == "ask" {
			return a
		}
	}
	t.Fatalf("the %s process has no ask activity", process)
	return Activity{}
}

func TestTheTrackedAskAnswersWhy(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	for _, process := range theTrackedProcesses {
		ask := theAskOf(t, r, process)
		var said []string
		for _, c := range ask.Criteria {
			said = append(said, c.Says)
		}
		for _, owed := range theQuestionsTheAskOwes {
			found := false
			for _, c := range ask.Criteria {
				if !strings.Contains(c.Says, owed) {
					continue
				}
				found = true
				// A TICK HERE WOULD BE AN ASSERTION AND NOTHING MORE, which
				// is what evidence: required exists to stop.
				if !c.NeedsEvidence {
					t.Errorf("the %s ask asks %q and takes a bare tick for it", process, owed)
				}
			}
			if !found {
				t.Errorf("the %s ask carries no criterion saying %q. It says: %s",
					process, owed, strings.Join(said, " / "))
			}
		}
	}
}

// theNoteOnDisk reads the file a minted token was written to, because the
// criterion is about what a person opening the note finds there.
func theNoteOnDisk(t *testing.T, r Roots, id string) string {
	t.Helper()
	for _, dir := range workDirs(r) {
		b, err := os.ReadFile(filepath.Join(dir, id+".md"))
		if err == nil {
			return string(b)
		}
	}
	t.Fatalf("no note on disk for %s", id)
	return ""
}

func TestAMintedTokenCarriesTheWhyRows(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	for _, process := range theTrackedProcesses {
		send := Token{Tracked: tracked(), Process: process, Title: "the door asks why",
			Detail:   "a change that wants an approach first and a verdict after",
			Criteria: []Criterion{{Says: "the check is green: go test -run TestX"}}}
		// THE STANDARD PROCESS WANTS AN APPROACH SECTION, and the trivial one
		// does not carry that section at all.
		if process == "standard" {
			send.Kept = []KeptSection{{Head: "approach", Text: "One function, one test, nothing else moves."}}
		}
		b, err := json.Marshal(send)
		if err != nil {
			t.Fatal(err)
		}
		var out, errs bytes.Buffer
		code := run["work"](&call{ctx: t.Context(), roots: r,
			args: []string{"--stdin", "--by", "worker-one"},
			in:   bytes.NewReader(b), out: &out, err: &errs})
		if code != 0 {
			t.Fatalf("minting a %s token answered %d: %s", process, code, out.String()+errs.String())
		}
		var minted Token
		if err := json.Unmarshal(out.Bytes(), &minted); err != nil {
			t.Fatalf("the door did not answer a token: %v: %s", err, out.String())
		}
		note := theNoteOnDisk(t, r, minted.ID)
		_, after, ok := strings.Cut(note, "## evidence: step 1. ask")
		if !ok {
			t.Fatalf("the %s note minted through the door carries no ask checklist:\n%s", process, note)
		}
		ask, _, _ := strings.Cut(after, "\n## ")
		for _, owed := range theQuestionsTheAskOwes {
			if !strings.Contains(ask, owed) {
				t.Errorf("the %s note minted through the door has no ask row saying %q:\n%s",
					process, owed, ask)
			}
		}
	}
}

// AND THE GUIDANCE NAMES THEM, because the process refuses a token that does
// not answer, and only the guidance says what a good answer looks like.
func TestTheWorkTokenGuidanceNamesTheTwoQuestions(t *testing.T) {
	t.Parallel()
	b, err := os.ReadFile(filepath.Join("..", "..", "doc", "guidance", "work-token.md"))
	if err != nil {
		t.Fatal(err)
	}
	for _, owed := range theQuestionsTheAskOwes {
		if !strings.Contains(string(b), owed) {
			t.Errorf("the work-token guidance does not name %q", owed)
		}
	}
}
