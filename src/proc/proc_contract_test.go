// The process door's contract: each case runs against the fake and the real
// runner, which is the one door test of a spawned process.
// [[spec/design_output/doors#the-process-door]]
package proc // level0: InPackageTest - the contract suite reads the unexported signalled each platform's exit code passes through

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

// The line a run that waits hands sh, the file it leaves once it stands, the span a case gives a run to end, and the wait a case arms. [[spec/tickets/lsp-tools-take-the-runner]]
const (
	waitsLine  = ": > ready; exec sleep 30"
	readyFile  = "ready"
	endsWithin = 5 * time.Second
	shortWait  = 100 * time.Millisecond
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

// The answer, or false where the run outlasts the span. [[spec/tickets/lsp-tools-take-the-runner]]
func endsIn(said <-chan Said) (Said, bool) {
	select {
	case one := <-said:
		return one, true
	case <-time.After(endsWithin):
		return Said{}, false
	}
}

// Whether the run leaves its ready file within the span. [[spec/tickets/lsp-tools-take-the-runner]]
func standsUp(folder string) bool {
	tick := time.NewTicker(10 * time.Millisecond)
	defer tick.Stop()
	giveUp := time.After(endsWithin)
	for {
		if _, err := os.Stat(filepath.Join(folder, readyFile)); err == nil {
			return true
		}
		select {
		case <-tick.C:
		case <-giveUp:
			return false
		}
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

// A run answers its output, its errors and its exit code, reads its input and the env past the box's, answers Signalled where a signal ends it, and NotStarted with its fault where no program starts. [[spec/tickets/quack-spawns-all-take-the-runner]]
func TestARunAnswersWhatItsProgramSays(t *testing.T) {
	t.Parallel()
	sh := func(line string) []string { return []string{"sh", "-c", line} }
	for _, one := range []struct {
		command Command
		want    Said
	}{
		{Command{Argv: sh("printf out; printf err >&2; exit 3")}, Said{Out: "out", Err: "err", Code: 3}},
		{Command{Argv: sh("cat"), Stdin: "in"}, Said{Out: "in"}},
		{Command{Argv: sh("printf %s \"$PROC_CONTRACT\""), Env: []string{"PROC_CONTRACT=held"}}, Said{Out: "held"}},
		{Command{Argv: sh("kill -TERM $$")}, Said{Code: Signalled}},
		{Command{}, Said{Code: NotStarted}},
		{Command{Argv: []string{"no-such-program-anywhere"}}, Said{Code: NotStarted}},
	} {
		for name, run := range runners() {
			said := run(one.command)
			faulted := one.want.Code != NotStarted || said.Err != ""
			if said.Out != one.want.Out || said.Code != one.want.Code || !faulted || (one.want.Err != "" && said.Err != one.want.Err) {
				t.Errorf("the %s runner answers %+v to %q, and wants %+v", name, said, one.command.Argv, one.want)
			}
		}
	}
}

func TestARunStandsInItsFolder(t *testing.T) {
	t.Parallel()
	for name, run := range runners() {
		folder := t.TempDir() // level0: FixtureOutsideHome - each run writes a file into a folder of its own
		if said := run(Command{Argv: []string{"sh", "-c", hereLine}, Dir: folder}); said.Code != 0 {
			t.Errorf("the %s runner answers %+v", name, said)
		}
		if _, err := os.Stat(filepath.Join(folder, hereFile)); err != nil {
			t.Errorf("the %s runner leaves no %s in its folder: %v", name, hereFile, err)
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

// A run on the caller's terminal stays in the caller's process group, so its reads reach the terminal, and a run reading none stands in a group of its own. [[spec/tickets/process-group-run-untested]]
func TestARunOnTheCallersStreamsStaysInTheCallersGroup(t *testing.T) {
	t.Parallel()
	if runtime.GOOS == "windows" {
		t.Skip("a Windows box carries no process groups")
	}
	line := []string{"sh", "-c", "echo $(ps -o pgid= -p $$) $(ps -o pgid= -p $PPID)"}
	var out strings.Builder
	Real(Command{Argv: line, Streams: &Streams{Out: &out, Err: &out}})
	if own, caller, _ := strings.Cut(strings.TrimSpace(out.String()), " "); own != caller {
		t.Errorf("a streamed run stands in group %q, apart from the caller's %q", own, caller)
	}
	if own, caller, _ := strings.Cut(strings.TrimSpace(Real(Command{Argv: line}).Out), " "); own == caller {
		t.Errorf("a run reading no streams shares the caller's group %q", caller)
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

func TestAHaltEndsARunInFlight(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		folder := t.TempDir() // level0: FixtureOutsideHome - each run writes a file into a folder of its own
		said := started(one.run, Command{Argv: []string{"sh", "-c", waitsLine}, Dir: folder})
		if !standsUp(folder) {
			t.Errorf("the %s runner starts no run within %v", name, endsWithin)
			continue
		}
		one.halt()
		answer, ended := endsIn(said)
		if !ended {
			t.Errorf("the %s runner's run outlasts the halt by %v", name, endsWithin)
			continue
		}
		if answer.Code == 0 || answer.Err == "" {
			t.Errorf("the %s runner's halted run answers %+v", name, answer)
		}
	}
}

func TestARunAfterTheHaltNeverStarts(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		one.halt()
		answer, ended := endsIn(started(one.run, Command{Argv: []string{"sh", "-c", "cat"}, Stdin: "in"}))
		if !ended || answer.Code != NotStarted || answer.Err == "" {
			t.Errorf("the %s runner answers %+v after the halt, ended %v", name, answer, ended)
		}
	}
}

func TestARunPastItsWaitEndsWithAFault(t *testing.T) {
	t.Parallel()
	for name, one := range haltingRunners(t) {
		said := started(one.run, Command{Argv: []string{"sh", "-c", waitsLine}, Dir: t.TempDir(), Wait: shortWait}) // level0: FixtureOutsideHome - each run stands in a folder of its own
		answer, ended := endsIn(said)
		if !ended {
			t.Errorf("the %s runner's run outlasts its wait by %v", name, endsWithin)
			continue
		}
		if answer.Code == 0 || answer.Err == "" {
			t.Errorf("the %s runner's run past its wait answers %+v", name, answer)
		}
	}
}
