// The process door: a command, its folder, its env and its input in, its
// output, its errors and its exit code out. Its file carries the real runner
// and the fake. [[spec/design_output/doors#the-process-door]]
package proc

import (
	"bytes"
	"context"
	"errors"
	"os/exec" // level0: OutsideInDoors - this file is the process door
	"strings"
	"sync"
	"time"
)

// The exit code a run answers where its program never starts, or where the halt or its wait kills it, and the span a killed run's pipes stay open before its wait gives up on them. [[spec/design_output/doors#the-process-door]]
const (
	NotStarted = -1
	pipesClose = time.Second
)

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
	Argv  []string
	Dir   string
	Drop  []string
	Env   []string
	Stdin string
	Wait  time.Duration
}

// What a run answers. [[spec/design_output/doors#the-process-door]]
type Said struct {
	Out  string
	Err  string
	Code int
}

// The door: one run of one command. [[spec/design_output/doors#the-process-door]]
type Runner func(Command) Said

// The real runner, through exec, under a life that never ends. [[spec/design_output/doors#the-process-door]]
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
	cmd := exec.CommandContext(run, one.Argv[0], one.Argv[1:]...)
	cmd.WaitDelay = pipesClose
	cmd.Dir = one.Dir
	cmd.Env = append(cmd.Environ(), one.Env...)
	cmd.Stdin = strings.NewReader(one.Stdin)
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	err := cmd.Run()
	var exit *exec.ExitError
	errors.As(err, &exit)
	switch {
	case life.Err() != nil:
		return Said{Out: out.String(), Err: haltEndsRun, Code: NotStarted}
	case run.Err() != nil:
		return Said{Out: out.String(), Err: pastItsWait, Code: NotStarted}
	case exit != nil:
		return Said{Out: out.String(), Err: errs.String(), Code: exit.ExitCode()}
	case err != nil:
		return Said{Err: err.Error(), Code: NotStarted}
	}
	return Said{Out: out.String(), Err: errs.String()}
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
	if one.Wait <= 0 {
		return fake.unlessHalted(program(one))
	}
	return fake.within(program, one)
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
