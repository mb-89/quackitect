// The process door's contract: each case runs against the fake and the real
// runner, which is the one door test of a spawned process.
// [[spec/design_output/doors#the-process-door]]
package proc

import (
	"path/filepath"
	"strings"
	"testing"
)

// The sh the real runner reaches, and the same program taught to the fake, which reads the line it is handed. [[spec/design_output/doors#the-process-door]]
func runners() map[string]Runner {
	fake := &FakeRunner{Programs: map[string]Program{"sh": fakeSh}}
	return map[string]Runner{"real": Real, "fake": fake.Run}
}

// The lines the contract hands sh, each answered as sh answers it. [[spec/design_output/doors#the-process-door]]
func fakeSh(one Command) Said {
	switch one.Argv[2] {
	case "printf out; printf err >&2; exit 3":
		return Said{Out: "out", Err: "err", Code: 3}
	case "cat":
		return Said{Out: one.Stdin}
	case "pwd -P":
		return Said{Out: one.Dir + "\n"}
	case "printf %s \"$PROC_CONTRACT\"":
		for _, pair := range one.Env {
			if value, ok := strings.CutPrefix(pair, "PROC_CONTRACT="); ok {
				return Said{Out: value}
			}
		}
		return Said{}
	}
	return Said{Err: "sh: the fake holds no answer to " + one.Argv[2], Code: 2}
}

func TestARunAnswersItsOutputItsErrorsAndItsExitCode(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		said := run(Command{Argv: []string{"sh", "-c", "printf out; printf err >&2; exit 3"}})
		if said != (Said{Out: "out", Err: "err", Code: 3}) {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}

func TestARunReadsItsInput(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		if said := run(Command{Argv: []string{"sh", "-c", "cat"}, Stdin: "in"}); said.Out != "in" || said.Code != 0 {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}

func TestARunStandsInItsFolder(t *testing.T) {
	t.Parallel()
	folder, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	for name, run := range runners() {
		if said := run(Command{Argv: []string{"sh", "-c", "pwd -P"}, Dir: folder}); said.Out != folder+"\n" || said.Code != 0 {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}

func TestARunReadsTheEnvPastTheBoxs(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		said := run(Command{Argv: []string{"sh", "-c", "printf %s \"$PROC_CONTRACT\""}, Env: []string{"PROC_CONTRACT=held"}})
		if said.Out != "held" {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}

func TestAProgramNobodyTaughtNeverStarts(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		if said := run(Command{Argv: []string{"no-such-program-anywhere"}}); said.Code != NotStarted || said.Err == "" {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}
