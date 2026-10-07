// The process door's contract: each case runs against the fake and the real
// runner, which is the one door test of a spawned process.
// [[spec/design_output/doors#the-process-door]]
package proc

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q/qtest"
)

// The line a run that waits hands sh, the file it leaves once it stands, the span between two looks for it, and the wait a case arms. [[spec/tickets/test-walks-move-onto-fakes]]
const (
	waitsLine = ": > ready; exec sleep 30"
	readyFile = "ready"
	looks     = 10 * time.Millisecond
	shortWait = 100 * time.Millisecond
)

// The line a run that marks its folder hands sh, and the file it leaves there by a relative name, so the case reads the folder on the disk and not in the path form a shell prints, which MSYS sh writes as /c/... on Windows. [[spec/tickets/the-doors-pr-goes-green]]
const (
	hereLine = ": > here"
	hereFile = "here"
)

// A runner and the halt that ends its runs. [[spec/tickets/lsp-tools-take-the-runner]]
type halting struct {
	run  Runner
	halt func()
}

// The real runner under its own life, and the fake whose sh waits on its ends, whose timer fires at once. [[spec/tickets/lsp-tools-take-the-runner]]
func haltingRunners(t *testing.T) map[string]halting {
	fake := &FakeRunner{After: firesAtOnce}
	fake.Programs = map[string]Program{"sh": func(one Command) Said {
		if one.Argv[2] != waitsLine {
			return fakeSh(one)
		}
		if err := os.WriteFile(filepath.Join(one.Dir, readyFile), nil, 0o644); err != nil {
			return Said{Err: err.Error(), Code: 1}
		}
		<-fake.Ends()
		return Said{}
	}}
	run, halt := Halting()
	t.Cleanup(halt)
	t.Cleanup(fake.Halt)
	return map[string]halting{"real": {run, halt}, "fake": {fake.Run, fake.Halt}}
}

func firesAtOnce(time.Duration) <-chan time.Time {
	fired := make(chan time.Time, 1)
	fired <- time.Time{}
	return fired
}

// The run started beside the case, its answer on the channel once it ends. [[spec/tickets/lsp-tools-take-the-runner]]
func started(run Runner, one Command) <-chan Said {
	said := make(chan Said, 1)
	go func() { said <- run(one) }()
	return said
}

// Returns once the run leaves its ready file, looking through the wall's clock; go test's timeout bounds a run that never stands. [[spec/tickets/test-walks-move-onto-fakes]]
func standsUp(folder string) {
	for {
		if _, err := os.Stat(filepath.Join(folder, readyFile)); err == nil {
			return
		}
		<-qtest.Wall().After(looks)
	}
}

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
	case "kill -TERM $$":
		return Said{Code: Signalled}
	case hereLine:
		if err := os.WriteFile(filepath.Join(one.Dir, hereFile), nil, 0o644); err != nil {
			return Said{Err: err.Error(), Code: 1}
		}
		return Said{}
	case "printf %s \"$PROC_CONTRACT\"":
		for _, pair := range one.Env {
			if value, ok := strings.CutPrefix(pair, "PROC_CONTRACT="); ok {
				return Said{Out: value}
			}
		}
		return Said{}
	case "printf %s \"$PROC_CONTRACT$PROC_CONTRACT_KEPT\"":
		var said strings.Builder
		seen := append(without(os.Environ(), one.Drop), one.Env...)
		for _, name := range []string{"PROC_CONTRACT=", "PROC_CONTRACT_KEPT="} {
			for _, pair := range seen {
				if value, ok := strings.CutPrefix(pair, name); ok {
					said.WriteString(value)
				}
			}
		}
		return Said{Out: said.String()}
	}
	return Said{Err: "sh: the fake holds no answer to " + one.Argv[2], Code: 2}
}

// The exit codes each box answers, read as a signal's end or as a plain exit, so the Windows reading runs on every box. [[spec/tickets/the-doors-pr-goes-green]]
func TestAnExitCodeReadsAsASignalWhereTheBoxWritesOne(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		goos string
		code int
		want bool
	}{
		{"linux", -1, true},
		{"linux", 3840, false},
		{"windows", 15 << 8, true},
		{"windows", 9 << 8, true},
		{"windows", 3, false},
		{"windows", 15<<8 | 1, false},
		{"windows", 0xC000013A, false},
	} {
		if said := signalled(one.goos, one.code); said != one.want {
			t.Errorf("on %s the code %d reads signalled %v, and wants %v", one.goos, one.code, said, one.want)
		}
	}
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
	for name, run := range runners() {
		folder := t.TempDir()
		if said := run(Command{Argv: []string{"sh", "-c", hereLine}, Dir: folder}); said.Code != 0 {
			t.Errorf("the %s runner answers %+v", name, said)
		}
		if _, err := os.Stat(filepath.Join(folder, hereFile)); err != nil {
			t.Errorf("the %s runner leaves no %s in its folder: %v", name, hereFile, err)
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

// The box holds the variable, so a run reads it unless the command drops it, and a pair in Env stands past the drop. [[spec/tickets/quack-spawns-meet-fake-process]]
func TestARunDropsTheVariablesItNames(t *testing.T) {
	t.Setenv("PROC_CONTRACT", "box")
	for name, run := range runners() {
		line := []string{"sh", "-c", "printf %s \"$PROC_CONTRACT\""}
		if said := run(Command{Argv: line, Drop: []string{"PROC_CONTRACT"}}); said.Out != "" || said.Code != 0 {
			t.Errorf("the %s runner answers %+v, and wants the box's variable dropped", name, said)
		}
		if said := run(Command{Argv: line, Drop: []string{"PROC_CONTRACT"}, Env: []string{"PROC_CONTRACT=held"}}); said.Out != "held" || said.Code != 0 {
			t.Errorf("the %s runner answers %+v, and wants the pair in Env past the drop", name, said)
		}
	}
}

// A drop names a variable whole, so a variable whose name runs longer stays. [[spec/design_output/doors#the-process-door]]
func TestADropKeepsAVariableWhoseNameRunsLonger(t *testing.T) {
	t.Setenv("PROC_CONTRACT", "box")
	t.Setenv("PROC_CONTRACT_KEPT", "kept")
	for name, run := range runners() {
		line := []string{"sh", "-c", "printf %s \"$PROC_CONTRACT$PROC_CONTRACT_KEPT\""}
		if said := run(Command{Argv: line, Drop: []string{"PROC_CONTRACT"}}); said.Out != "kept" || said.Code != 0 {
			t.Errorf("the %s runner answers %+v, and wants PROC_CONTRACT dropped and PROC_CONTRACT_KEPT read", name, said)
		}
	}
}

// A command carrying streams reads its input off them and writes its output and errors there, and answers both buffers empty. [[spec/tickets/quack-spawns-all-take-the-runner]]
func TestARunWithStreamsHandsThemItsInputAndOutput(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		var out, errs strings.Builder
		said := run(Command{Argv: []string{"sh", "-c", "cat"}, Streams: &Streams{In: strings.NewReader("in"), Out: &out, Err: &errs}})
		if said != (Said{}) || out.String() != "in" {
			t.Errorf("the %s runner answers %+v and writes %q, and wants the input written through", name, said, out.String())
		}
		out.Reset()
		said = run(Command{Argv: []string{"sh", "-c", "printf out; printf err >&2; exit 3"}, Streams: &Streams{Out: &out, Err: &errs}})
		if said != (Said{Code: 3}) || out.String() != "out" || errs.String() != "err" {
			t.Errorf("the %s runner answers %+v and writes %q, %q, and wants both streams written through", name, said, out.String(), errs.String())
		}
		if said := run(Command{Argv: []string{"/proc/contract/none"}, Streams: &Streams{Out: &out, Err: &errs}}); said.Code != NotStarted || said.Err == "" {
			t.Errorf("the %s runner answers %+v, and wants a streamed program that never starts read as NotStarted with its fault", name, said)
		}
	}
}

// A run a signal ends answers Signalled, apart from a program that never starts. [[spec/tickets/quack-spawns-all-take-the-runner]]
func TestARunASignalEndsAnswersSignalled(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		if said := run(Command{Argv: []string{"sh", "-c", "kill -TERM $$"}}); said.Code != Signalled {
			t.Errorf("the %s runner answers %+v, and wants Signalled", name, said)
		}
	}
}

func TestACommandNamingNoProgramAnswersNotStarted(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		if said := run(Command{}); said.Code != NotStarted || said.Err == "" {
			t.Errorf("the %s runner answers %+v", name, said)
		}
	}
}

func TestAHaltEndsARunInFlight(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		folder := t.TempDir()
		said := started(one.run, Command{Argv: []string{"sh", "-c", waitsLine}, Dir: folder})
		standsUp(folder)
		one.halt()
		if answer := <-said; answer.Code == 0 || answer.Err == "" {
			t.Errorf("the %s runner's halted run answers %+v", name, answer)
		}
	}
}

func TestARunAfterTheHaltNeverStarts(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		one.halt()
		if answer := one.run(Command{Argv: []string{"sh", "-c", "cat"}, Stdin: "in"}); answer.Code != NotStarted || answer.Err == "" {
			t.Errorf("the %s runner answers %+v after the halt", name, answer)
		}
	}
}

func TestARunPastItsWaitEndsWithAFault(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		if answer := one.run(Command{Argv: []string{"sh", "-c", waitsLine}, Dir: t.TempDir(), Wait: shortWait}); answer.Code == 0 || answer.Err == "" {
			t.Errorf("the %s runner's run past its wait answers %+v", name, answer)
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
