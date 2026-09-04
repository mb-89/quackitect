package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

// EVERY FORBIDDEN CONSTRUCT, ONCE PER QUOTING, AND WHICH SIDE IT FALLS ON.
//
// THE EXCEPTION HAS NOW LEAKED THREE TIMES IN THE SAME PLACE. Round 1: any word
// being the engine. Round 2: a redirection, which writes and runs nothing.
// Round 3, found in review: a command
// substitution inside DOUBLE quotes, which the stripper removed and bash
// expands. Round 4, found by rev-25: an apostrophe in ordinary English opening
// a span for the scan that hunted substitutions.
//
// SO THE CASES ARE WRITTEN AS A TABLE OVER THE QUOTING RATHER THAN AS THE
// SHAPES SOMEBODY HAPPENED TO TRY. The earlier rounds each added the one
// spelling that had just been found, and the next spelling was found by the
// next reviewer.
//
// AND ONE CONSTRUCT PER ROW IS NOT ENOUGH, which round 4 proved. A defect
// needing TWO quotings in one command is invisible to a table that varies one
// construct at a time, however complete it is over constructs. The pairs are
// in TestBashDecidesWhichCommandsLeaveTheException below.
//
// THE RULE THE TABLE ENCODES. A semicolon, an ampersand, a pipe, an angle
// bracket and a newline are LITERAL inside either kind of quote, so a command
// carrying one inside quotes is still only the engine. A command substitution
// and a backtick pair are LITERAL inside single quotes and LIVE inside double
// quotes, so the quoting decides.
func TestTheEngineExceptionReadsEachQuotingTheWayBashDoes(t *testing.T) {
	t.Parallel()
	const lead = ".bin/se pull --actor x "
	for _, one := range []struct {
		what  string
		arg   string
		allow bool
	}{
		// A SUBSTITUTION RUNS ANOTHER PROGRAM, so it is out of the exception
		// wherever bash would run it.
		{"a bare substitution", `$(python -c "print(1)")`, false},
		{"a substitution in double quotes", `"$(python -c 'print(1)')"`, false},
		{"a substitution in single quotes", `'$(python -c "print(1)")'`, true},

		// AND SO DOES A BACKTICK PAIR, which is the same construct spelled the
		// older way, and it obeys the same quoting rule.
		{"a bare backtick pair", "`python -c 'print(1)'`", false},
		{"backticks in double quotes", "\"`python -c 'print(1)'`\"", false},
		{"backticks in single quotes", "'`python -c \"print(1)\"`'", true},

		// A SEPARATOR IS LITERAL IN EITHER QUOTING, and this is the half that
		// stops the fix being a widening. An agent with nothing in hand has to
		// be able to write a sentence with punctuation in it.
		{"a semicolon in double quotes", `"a sentence; with punctuation"`, true},
		{"a semicolon in single quotes", `'a sentence; with punctuation'`, true},
		{"a bare semicolon", `; rm -rf src`, false},
		{"an ampersand pair in double quotes", `"read this && that"`, true},
		{"a bare ampersand pair", `&& rm -rf src`, false},
		{"a redirection in double quotes", `"a > b"`, true},
		{"a bare redirection", `> src/engine/gate.go`, false},
	} {
		got := runsTheEngine(lead + one.arg)
		if got != one.allow {
			was, want := "refused", "allowed"
			if got {
				was, want = "allowed", "refused"
			}
			t.Errorf("%s was %s by the engine exception and bash %s it, so a write "+
				"through this command %s the gate: %s", one.what, was,
				map[bool]string{true: "runs nothing else in", false: "runs another program in"}[one.allow],
				map[bool]string{true: "skips", false: "would have skipped"}[got],
				lead+one.arg)
			_ = want
		}
	}
}

// BASH DECIDES WHICH ROWS LEAVE THE EXCEPTION, and this machine has bash.
//
// The table above is a model of bash written in Go. This one asks the shell.
// Every row carries a payload that TOUCHES A FILE the engine was never handed,
// so the oracle is one question with no interpretation in it: did the command
// reach the filesystem. The guard must refuse exactly the rows where it did.
//
// AND THE ROWS COME IN PAIRS, which is the half a one-construct-per-row table
// cannot hold. A defect needing TWO quotings in one command is invisible to a
// table that varies one construct at a time, however complete it is over
// constructs. The pairs are why rev-25 found the third leak still open.
func TestBashDecidesWhichCommandsLeaveTheException(t *testing.T) {
	t.Parallel()
	shell := theShellThisMachineHas(t)
	const lead = ".bin/se work --detail "
	for _, one := range []struct{ what, arg string }{
		{"a bare substitution", "$(touch M)"},
		{"a substitution in double quotes", `"$(touch M)"`},
		{"a substitution in single quotes", `'$(touch M)'`},
		{"a bare backtick pair", "`touch M`"},
		{"backticks in double quotes", "\"`touch M`\""},
		{"backticks in single quotes", "'`touch M`'"},

		// AN APOSTROPHE IN ORDINARY ENGLISH, inside a double-quoted argument.
		{"an apostrophe before a substitution", `"it's $(touch M) here"`},
		{"an apostrophe before backticks", "\"it's `touch M` here\""},
		{"a closed apostrophe argument, then a bare substitution", `"it's fine" $(touch M)`},
		{"a closed apostrophe argument, then a separator", `"it's fine" ; touch M`},

		// AND THE OTHER QUOTING ROUND, which keeps the fix from widening.
		{"a double quote inside a single-quoted argument", `'he said "hi" $(touch M)'`},
		{"an apostrophe alone", `"it's fine"`},
		{"a double quote alone", `'he said "hi"'`},
		{"a closed double-quote argument, then a separator", `"he said 'hi'" ; touch M`},
		{"a closed double-quote argument, then a substitution", `'he said "hi"' $(touch M)`},

		{"a separator in double quotes", `"a sentence; with punctuation"`},
		{"a redirection in double quotes", `"a > b"`},
		{"a bare redirection", "> M"},
	} {
		dir := t.TempDir()
		twin := exec.Command(shell, "-c", ": "+one.arg)
		twin.Dir = dir
		if out, err := twin.CombinedOutput(); err != nil {
			t.Fatalf("bash refused the twin for %s: %v: %s", one.what, err, out)
		}
		_, err := os.Stat(filepath.Join(dir, "M"))
		reached := err == nil
		if got := runsTheEngine(lead + one.arg); got == reached {
			t.Errorf("%s: bash %s a file the engine was never handed, and the exception %s "+
				"the command, so a write through it %s the gate: %s",
				one.what,
				map[bool]string{true: "wrote", false: "wrote no"}[reached],
				map[bool]string{true: "took", false: "refused"}[got],
				map[bool]string{true: "skips", false: "meets"}[got],
				lead+one.arg)
		}
	}
}

// theShellThisMachineHas is the shell the engine itself would run a command in,
// and it is the oracle above rather than the bare name bash.
//
// A NAME THAT RESOLVES IS NOT A SHELL THAT RUNS. Windows ships bash.exe in the
// system folder whether or not WSL is installed, and LookPath answers it ahead
// of the sh Git left off PATH. Handed a script it exits 1 saying the Windows
// Subsystem for Linux is required, so the table above was judged against a
// launcher rather than against a shell. That is red on the box it was written
// on, and quietly worse on a box that does have WSL, where the oracle would be
// a different shell answering about a different filesystem.
//
// SO IT ASKS THE LOOKUP THE ENGINE ASKS. posixShell passes the launcher over and
// finds the shell beside git, which is the shell se_run hands a command to, so
// the guard is held against the thing it guards.
//
// AND A MACHINE WITH NO SHELL SKIPS, saying where it looked. A fatal there reads
// as this check being broken, when what is true is that this box cannot run it.
func theShellThisMachineHas(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	// THE PROBE IS HOW THE LOOKUP FINDS GIT, and a machine without git leaves it
	// empty rather than writing a path nothing is at.
	if git, err := exec.LookPath("git"); err == nil {
		writeProbe(r, Probe{Session: "s", Found: []Tool{{Name: "git", Path: git}}})
	}
	sh, looked := posixShell(r)
	if sh == "" {
		t.Skipf("no POSIX shell on this machine, so this check cannot ask one. Looked in: %v", looked)
	}
	return sh
}
