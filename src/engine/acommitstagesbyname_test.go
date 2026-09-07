package main

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/engine/internal/sessionlog"
)

// A COMMIT NAMES PATHS, AND THE PATHS ARE JUDGED THE SAME WAY A STAGE'S ARE.
//
// git commit takes a pathspec, and with one it commits those paths and leaves
// the index where it was. So a commit needs no stage at all, and the stranger
// guard walked git add alone. A commit naming another hand's file therefore
// went through the door the stage was refused at.
func TestACommitStagesOnlyWhatTheTurnWrote(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "committing by name")
	if _, err := TakeUp(r, tok.ID, "worker-commit"); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{{File: "mine.md", Op: "create", New: "# mine\n"}},
		false, tok.ID, "worker-commit"); err != nil {
		t.Fatal(err)
	}

	// THE PATH THIS TOKEN WROTE GOES THROUGH.
	mine := `git commit --only -m "mine" mine.md`
	if why, refused := AStageCarriesStrangers(r, tok.ID, "worker-commit", mine); refused {
		t.Errorf("a commit of the file this token wrote was refused:\n%s", why)
	}

	// AND THE PATH IT NEVER WROTE IS REFUSED, BY NAME.
	theirs := `git commit --only -m "theirs" theirs.md`
	why, refused := AStageCarriesStrangers(r, tok.ID, "worker-commit", theirs)
	if !refused {
		t.Fatal("a commit of a file this token never wrote was not refused")
	}
	if !strings.Contains(why, "theirs.md") {
		t.Errorf("the refusal does not name the path it refused:\n%s", why)
	}

	// AND A COMMIT AFTER THE DASHES IS THE SAME COMMIT.
	if _, refused := AStageCarriesStrangers(r, tok.ID, "worker-commit",
		`git commit -m "theirs" -- theirs.md`); !refused {
		t.Error("a commit naming its paths after -- was not judged")
	}

	// AND THE RUN VERB IS THE SAME DOOR.
	said := theVerbSaid(t, r, "run", "", "--on", tok.ID, "--by", "worker-commit",
		"--command", theirs)
	if !strings.Contains(said, "theirs.md") || !strings.Contains(said, `"error"`) {
		t.Errorf("the run verb committed a path this token never wrote: %s", said)
	}
}

// A STAGE OF EVERYTHING IS REFUSED WHATEVER THE RECORD SAYS, because it stages
// what every other hand on this box has touched. The record cannot say yes to
// a command that names no path, so this one is not judged against it at all.
func TestStagingEverythingIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := aLocalToken(t, r, "a hand staging everything")
	if _, err := TakeUp(r, tok.ID, "worker-all"); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{{File: "mine.md", Op: "create", New: "# mine\n"}},
		false, tok.ID, "worker-all"); err != nil {
		t.Fatal(err)
	}

	// AN ASSIGNMENT MAY SIT AFTER A RUNNER AS WELL AS BEFORE ONE. env and sudo
	// are both runners, so the walk had already taken one and the assignment
	// after it read as neither a runner nor a flag. The walk then gave up and
	// found no git at all, which is this hole one word further along.
	for _, command := range []string{
		"git add -A", "git add .", "git add --all", "git add -u", "git add --update",
		`SE_STAGE_ANYWAY="the whole tree" git add -A`,
		"env FOO=1 git add -A", "sudo FOO=1 git add .", "env FOO=1 BAR=2 git add --all",
	} {
		why, refused := ACommitCarriesStrangers(r, command)
		if !refused {
			t.Errorf("%q was not refused", command)
			continue
		}
		if !strings.Contains(why, "A STAGE OF EVERYTHING IS REFUSED") {
			t.Errorf("%q was refused by the wrong guard:\n%s", command, why)
		}
	}

	// THE ESCAPE IS IN THAT LIST BECAUSE IT DOES NOT OPEN THIS ONE. It says
	// which paths a hand means, and a stage of everything names none.
}

// THE ESCAPE IS TYPED ON THE COMMAND AND IT IS RECORDED.
//
// A guard with no way past is a guard people work around, and the way round
// this one is a shell out of the engine's sight. So a hand that means it says
// so on the command, once, and the session log carries what it said.
//
// IT IS AN ASSIGNMENT RATHER THAN A FLAG, because git refuses a flag it does
// not know and the shell hands an assignment through untouched.
func TestTheStagingEscapeIsRecorded(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	l.Close()

	tok := aLocalToken(t, r, "a hand meaning it")
	if _, err := TakeUp(r, tok.ID, "worker-escape"); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{{File: "mine.md", Op: "create", New: "# mine\n"}},
		false, tok.ID, "worker-escape"); err != nil {
		t.Fatal(err)
	}

	// WITHOUT IT, REFUSED.
	if _, refused := AStageCarriesStrangers(r, tok.ID, "worker-escape", "git add theirs.md"); !refused {
		t.Fatal("a stage of a stranger's path was not refused to begin with")
	}

	// WITH IT, THROUGH.
	const reason = "the other half of a move"
	escaped := `SE_STAGE_ANYWAY="` + reason + `" git add theirs.md`
	if why, refused := AStageCarriesStrangers(r, tok.ID, "worker-escape", escaped); refused {
		t.Fatalf("the escape did not open the stage:\n%s", why)
	}

	// AND THE RECORD CARRIES WHO, WHAT AND WHY.
	said := theEscapeRecorded(t, r)
	if said.Actor != "worker-escape" {
		t.Errorf("the record does not name who escaped: %+v", said)
	}
	if !strings.Contains(said.Msg, reason) {
		t.Errorf("the record does not carry the reason: %q", said.Msg)
	}
	if !strings.Contains(said.Msg, "theirs.md") {
		t.Errorf("the record does not name the path: %q", said.Msg)
	}

	// AND IT IS ONCE, NOT A STANDING PERMISSION: the next command without it
	// is refused again.
	if _, refused := AStageCarriesStrangers(r, tok.ID, "worker-escape", "git add theirs.md"); !refused {
		t.Error("the escape stood after the command that carried it")
	}
}

// theEscapeRecorded answers the one session line the escape wrote.
func theEscapeRecorded(t *testing.T, r Roots) sessionlog.Record {
	t.Helper()
	var out []sessionlog.Record
	for _, line := range logLines(t, r) {
		var rec sessionlog.Record
		if json.Unmarshal([]byte(line), &rec) != nil {
			continue
		}
		if rec.Kind == "stage" {
			out = append(out, rec)
		}
	}
	if len(out) != 1 {
		t.Fatalf("the escape wrote %d lines of kind stage, and it writes one", len(out))
	}
	return out[0]
}
