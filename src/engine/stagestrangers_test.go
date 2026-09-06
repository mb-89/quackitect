package main

import (
	"strings"
	"testing"
)

// A STAGE CARRIES ONLY WHAT THIS TOKEN WROTE.
//
// A commit takes whatever the index holds, and every agent on this box shares
// one index. commitpaths.go shut the two wide doors, a commit naming no path
// and a stage of everything, and left the narrow one open: a stage that names
// one path still stages whatever that path holds, and the path may be another
// hand's change or half of one.
//
// MEASURED: of the 174 commits from dd2fed69 to HEAD, 67 import a package under
// src/engine/internal that the same commit does not carry. Each is a stage that
// took one half of another hand's move.
//
// THE RECORD ALREADY SAYS WHOSE WRITE IS WHOSE, in the apply journal an undo
// reads. So the stage is judged against it, and the refusal names the path.
func TestAStageOfAStrangersPathIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "a hand's own work")
	if _, err := TakeUp(r, tok.ID, "worker-stage"); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{{File: "mine.md", Op: "create", New: "# mine\n"}},
		false, tok.ID, "worker-stage"); err != nil {
		t.Fatal(err)
	}

	// THE PATH THE RECORD SAYS THIS TOKEN WROTE GOES THROUGH.
	if why, refused := AStageCarriesStrangers(r, tok.ID, "git add mine.md"); refused {
		t.Errorf("a stage of the file this token wrote was refused:\n%s", why)
	}

	// AND THE PATH IT NEVER WROTE IS REFUSED, BY NAME.
	why, refused := AStageCarriesStrangers(r, tok.ID, "git add theirs.md")
	if !refused {
		t.Fatal("a stage of a file this token never wrote was not refused")
	}
	if !strings.Contains(why, "theirs.md") {
		t.Errorf("the refusal does not name the path it refused:\n%s", why)
	}

	// AND THE RUN VERB IS THE SAME DOOR, because every commit on this branch is
	// made by an agent running git through it.
	said := theVerbSaid(t, r, "run", "", "--on", tok.ID, "--by", "worker-stage",
		"--command", "git add theirs.md")
	if !strings.Contains(said, "theirs.md") || !strings.Contains(said, `"error"`) {
		t.Errorf("the run verb staged a path this token never wrote: %s", said)
	}

	// AND A TOKEN WITH NOTHING ON RECORD IS NOT JUDGED, because an empty
	// journal proves no write rather than proving there was none.
	empty := aLocalToken(t, r, "a token writing nothing")
	if why, refused := AStageCarriesStrangers(r, empty.ID, "git add anything.md"); refused {
		t.Errorf("a token with nothing on record was judged anyway:\n%s", why)
	}
}
