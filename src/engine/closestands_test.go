package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A CLOSE THAT CANNOT REACH GIT IS STILL A CLOSE.
//
// SaveToken writes the note, marks it closed and records the move, and only
// then archives it. Git failing at that point came back as a save failure, so
// the pull refused the submission with "the record ... a writable .se/work",
// which names neither git nor the archive, and the agent was told a close that
// had happened had not.
//
// THE RETRY MADE IT PERMANENT. The second save sees a token that has already
// ended, takes the arm for a repair rather than for a close, and returns
// without archiving. The token was then closed, on the disk, and nothing would
// archive it again except a sweep nobody knew to run.
//
// The archive is a consequence of the close and not a condition of it. It is
// the shape snapshotFor already uses for a tree it cannot snapshot, and
// keepInGit for a push it cannot make: said out loud, and the work goes on.

// gitCannotWrite leaves a work tree that looks like a repository and is not,
// so every git call the engine makes fails the way an unreachable git fails.
//
// The folder has to be there. An archive skips a tree with no history at all,
// which is a different path and not the one this is about.
func gitCannotWrite(t *testing.T, r Roots) {
	t.Helper()
	dotGit := filepath.Join(r.Work, ".git")
	if err := os.RemoveAll(dotGit); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(dotGit, 0o755); err != nil {
		t.Fatal(err)
	}
}

func TestACloseStandsWhenTheArchiveCannotBeWritten(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	gitCannotWrite(t, r)
	tok := mintTask(t, r, "close git cannot keep", "")

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})

	// THE CLOSE ANSWERS.
	if got.Pull == AnswerRefused {
		t.Fatalf("the close was refused for an archive it could not write: %+v", got.Findings)
	}
	closed, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatalf("the token that was closed cannot be read back: %v", err)
	}
	if !closed.Ended() {
		t.Fatalf("the token did not end: status %q, disposition %q", closed.Status, closed.Disposition)
	}

	// AND THE ANSWER SAYS WHAT COULD NOT BE ARCHIVED.
	if strings.Contains(got.Notice, ".se/work") {
		t.Errorf("the answer reads as an unwritable .se/work, which is not what happened: %q", got.Notice)
	}
	for _, said := range []string{tok.ID, "archive", "se archive --sweep"} {
		if !strings.Contains(got.Notice, said) {
			t.Errorf("the answer does not name %q, so nobody can act on it: %q", said, got.Notice)
		}
	}

	// AND IT IS STILL ARCHIVABLE. Git comes back, and the sweep puts it away.
	// This is the half the retry took away: a token that closed and reported a
	// failure was never offered to the archive again.
	withHistory(t, r.Work)
	kept, _, err := SweepClosed(r)
	if err != nil {
		t.Fatalf("the sweep: %v", err)
	}
	if kept != 1 {
		t.Errorf("the sweep archived %d tokens, want the one that closed", kept)
	}
	if at := noteAt(r, tok.ID); at != "" {
		t.Errorf("it is still on the disk at %s", at)
	}
	said, err := ReadArchived(r, tok.ID)
	if err != nil {
		t.Fatalf("it cannot be read back from its tag: %v", err)
	}
	if !strings.Contains(said, "close git cannot keep") {
		t.Errorf("what came back is not the token: %q", said)
	}
}

// AND THE OTHER DOOR THAT ENDS A TOKEN ANSWERS THE SAME WAY. se stop ends one
// through the same save, so a rule taught only to the pull would leave the
// mirrored half reporting a stop that did not happen.
func TestAStopStandsWhenTheArchiveCannotBeWritten(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	gitCannotWrite(t, r)
	tok := mintTask(t, r, "stop git cannot keep", "")

	stopped, err := Abort(r, Aborting{ID: tok.ID, By: "worker-a", Why: "it is a duplicate"})
	if err != nil {
		t.Fatalf("the stop failed for an archive it could not write: %v", err)
	}
	if !stopped.Ended() {
		t.Fatalf("the token did not end: status %q, disposition %q", stopped.Status, stopped.Disposition)
	}

	withHistory(t, r.Work)
	if _, _, err := SweepClosed(r); err != nil {
		t.Fatalf("the sweep: %v", err)
	}
	if _, err := ReadArchived(r, tok.ID); err != nil {
		t.Errorf("the stopped token cannot be read back from its tag: %v", err)
	}
}
