// The process door: a command, its folder, its env and its input in, its
// output, its errors and its exit code out. Its file carries the real runner
// and the fake. [[spec/design_output/doors#the-process-door]]
package proc

import (
	"bytes"
	"context"
	"errors"
	"io"
	"os/exec" // level0: OutsideInDoors - this file is the process door
	"runtime"
	"slices"
	"strings"
	"sync"
	"time"
)

// The exit code a run answers where its program fails to start, or where the halt or its wait kills it, and the span a killed run's pipes stay open before its wait gives up on them. [[spec/design_output/doors#the-process-door]]
const (
	NotStarted = -1
	pipesClose = time.Second
)

// The exit code a run answers where a signal ends it, apart from NotStarted. [[spec/tickets/quack-spawns-all-take-the-runner]]
const Signalled = -2

// The faults a run answers where the halt stands before it, the halt ends it, or it passes its wait. [[spec/design_output/doors#the-process-door]]
const (
	haltedBefore = "proc: the halt stands, so the run never starts"
	haltEndsRun  = "proc: the halt ends the run"
	pastItsWait  = "proc: the run passes its wait"
)

// What either runner answers a command naming no program. [[spec/design_output/doors#the-process-door]]
var namesNoProgram = Said{Err: "proc: a command names no program", Code: NotStarted}

// What a run takes. Drop names the box's variables a run leaves behind, Env carries the pairs past the box's own, and a Wait past zero ends the run with a fault. [[spec/design_output/doors#the-process-door]]
type Command struct {
	Argv    []string
	Dir     string
	Drop    []string
	Env     []string
	Stdin   string
	Wait    time.Duration
	Streams *Streams
}

// The caller's streams a run reads and writes in place of Stdin and the buffers Said answers, a nil one reading or writing nothing. [[spec/design_output/doors#the-process-door]]
type Streams struct {
	In       io.Reader
	Out, Err io.Writer
}

// What a run answers. [[spec/design_output/doors#the-process-door]]
type Said struct {
	Out  string
	Err  string
	Code int
}

// The door: one run of one command. [[spec/design_output/doors#the-process-door]]
type Runner func(Command) Said

// The real runner, through exec, under the background life the whole process holds. [[spec/design_output/doors#the-process-door]]
func Real(one Command) Said {
	return runUnder(context.Background(), one)
}

// A real runner and the halt that ends every run in flight through it. [[spec/design_output/doors#the-process-door]]
func Halting() (Runner, func()) {
	life, halt := context.WithCancel(context.Background())
	return func(one Command) Said { return runUnder(life, one) }, halt
}

// One run through exec, which the life's end or the command's wait kills. [[spec/design_output/doors#the-process-door]]
func runUnder(life context.Context, one Command) Said {
	if len(one.Argv) == 0 {
		return namesNoProgram
	}
	if life.Err() != nil {
		return Said{Err: haltedBefore, Code: NotStarted}
	}
	run, cancel := context.WithCancel(life)
	if one.Wait > 0 {
		run, cancel = context.WithTimeout(life, one.Wait)
	}
	defer cancel()
	cmd := command(run, one)
	var out, errs bytes.Buffer
	cmd.Stdin, cmd.Stdout, cmd.Stderr = strings.NewReader(one.Stdin), &out, &errs
	if through := one.Streams; through != nil {
		cmd.Stdin, cmd.Stdout, cmd.Stderr = through.In, through.Out, through.Err
	}
	err := cmd.Run()
	var exit *exec.ExitError
	errors.As(err, &exit)
	switch {
	case life.Err() != nil:
		return Said{Out: out.String(), Err: haltEndsRun, Code: NotStarted}
	case run.Err() != nil:
		return Said{Out: out.String(), Err: pastItsWait, Code: NotStarted}
	case exit != nil && signalled(runtime.GOOS, exit.ExitCode()):
		return Said{Out: out.String(), Err: errs.String(), Code: Signalled}
	case exit != nil:
		return Said{Out: out.String(), Err: errs.String(), Code: exit.ExitCode()}
	case err != nil:
		return Said{Err: err.Error(), Code: NotStarted}
	}
	return Said{Out: out.String(), Err: errs.String()}
}

// The run's process in its folder and env, which the end of the life ends whole with every process it started, where it reads none of the caller's streams. A run on the caller's terminal stays in the caller's group, so its reads reach the terminal. [[spec/tickets/the-check-ends-what-it-drops]]
func command(life context.Context, one Command) *exec.Cmd {
	cmd := exec.CommandContext(life, one.Argv[0], one.Argv[1:]...)
	cmd.WaitDelay = pipesClose
	cmd.Dir = one.Dir
	cmd.Env = append(without(cmd.Environ(), one.Drop), one.Env...)
	if one.Streams == nil {
		whole(cmd)
	}
	return cmd
}

// Whether an exit code reads as a signal's end. Go answers below zero where a signal ends a run on a POSIX box. Windows carries no signals, and the MSYS sh Git for Windows ships ends on one with the signal's number in the high byte and none in the low. [[spec/tickets/the-doors-pr-goes-green]]
func signalled(goos string, code int) bool {
	if code < 0 {
		return true
	}
	signal := code >> signalShift
	return goos == "windows" && code&0xff == 0 && signal >= 1 && signal <= maxSignal
}

// The highest signal number MSYS writes into an exit code, and the shift that reads it from the high byte. [[spec/tickets/the-doors-pr-goes-green]]
const (
	maxSignal   = 64
	signalShift = 8
)

// The pairs of an environment whose names the drop leaves out. [[spec/design_output/doors#the-process-door]]
func without(env, drop []string) []string {
	if len(drop) == 0 {
		return env
	}
	kept := make([]string, 0, len(env))
	for _, pair := range env {
		name, _, _ := strings.Cut(pair, "=")
		if !slices.Contains(drop, name) {
			kept = append(kept, pair)
		}
	}
	return kept
}

// A program the fake runs: the command in, the answer out. [[spec/design_output/doors#the-process-door]]
type Program func(Command) Said

// The fake runner: a table from a program's name to what it does, the halt its own Halt sets, and the timer a wait arms through. [[spec/design_output/doors#the-process-door]]
type FakeRunner struct {
	Programs map[string]Program
	Halted   bool
	After    func(time.Duration) <-chan time.Time
	mu       sync.Mutex
	ends     chan struct{}
}

// Ends every run in flight, and every run after answers NotStarted. [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) Halt() {
	fake.Ends()
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if !fake.Halted {
		fake.Halted = true
		close(fake.ends)
	}
}

// The one channel a taught program that waits reads, which the halt closes. [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) Ends() <-chan struct{} {
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.ends == nil {
		fake.ends = make(chan struct{})
	}
	return fake.ends
}

// Whether the fake's own Halt stands. [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) halted() bool {
	fake.mu.Lock()
	defer fake.mu.Unlock()
	return fake.Halted
}

// [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) Run(one Command) Said {
	if len(one.Argv) == 0 {
		return namesNoProgram
	}
	program, ok := fake.Programs[one.Argv[0]]
	if !ok {
		return Said{Err: "proc: the fake runner knows no program " + one.Argv[0], Code: NotStarted}
	}
	if fake.halted() {
		return Said{Err: haltedBefore, Code: NotStarted}
	}
	if one.Streams != nil {
		one, program = throughStreams(one, program)
	}
	if one.Wait <= 0 {
		return fake.unlessHalted(program(one))
	}
	return fake.within(program, one)
}

// The command with its input read off the streams, and the program writing its output and errors to them, answering both buffers empty as the real runner does. [[spec/design_output/doors#the-process-door]]
func throughStreams(one Command, program Program) (Command, Program) {
	through := one.Streams
	if through.In != nil {
		read, _ := io.ReadAll(through.In)
		one.Stdin = string(read)
	}
	return one, func(asked Command) Said {
		said := program(asked)
		for _, pair := range [][2]any{{through.Out, said.Out}, {through.Err, said.Err}} {
			if to, ok := pair[0].(io.Writer); ok && to != nil {
				_, _ = io.WriteString(to, pair[1].(string))
			}
		}
		return Said{Code: said.Code}
	}
}

// The program's answer, or the fault its wait answers through After, which leaves Ends open for every other run. [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) within(program Program, one Command) Said {
	after := fake.After
	if after == nil {
		after = time.After
	}
	said := make(chan Said, 1)
	go func() { said <- program(one) }()
	select {
	case answer := <-said:
		return fake.unlessHalted(answer)
	case <-fake.Ends():
		return Said{Err: haltEndsRun, Code: NotStarted}
	case <-after(one.Wait):
		return Said{Err: pastItsWait, Code: NotStarted}
	}
}

// The answer a run gives, or the halt's fault where the halt ends it. [[spec/design_output/doors#the-process-door]]
func (fake *FakeRunner) unlessHalted(said Said) Said {
	if fake.halted() {
		return Said{Out: said.Out, Err: haltEndsRun, Code: NotStarted}
	}
	return said
}
