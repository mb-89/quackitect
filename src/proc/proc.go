// The process door: a command, its folder, its env and its input in, its
// output, its errors and its exit code out. Its file carries the real runner
// and the fake. [[spec/design_output/doors#the-process-door]]
package proc

import (
	"bytes"
	"errors"
	"os/exec" // level0: OutsideInDoors - this file is the process door
	"strings"
	"time"
)

// The exit code a run answers where its program never starts. [[spec/design_output/doors#the-process-door]]
const NotStarted = -1

// What either runner answers a command naming no program. [[spec/design_output/doors#the-process-door]]
var namesNoProgram = Said{Err: "proc: a command names no program", Code: NotStarted}

// What a run takes. Env carries the pairs past the box's own. [[spec/design_output/doors#the-process-door]]
type Command struct {
	Argv  []string
	Dir   string
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

// The real runner, through exec. [[spec/design_output/doors#the-process-door]]
func Real(one Command) Said {
	if len(one.Argv) == 0 {
		return namesNoProgram
	}
	cmd := exec.Command(one.Argv[0], one.Argv[1:]...)
	cmd.Dir = one.Dir
	cmd.Env = append(cmd.Environ(), one.Env...)
	cmd.Stdin = strings.NewReader(one.Stdin)
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	err := cmd.Run()
	var exit *exec.ExitError
	switch {
	case errors.As(err, &exit):
		return Said{Out: out.String(), Err: errs.String(), Code: exit.ExitCode()}
	case err != nil:
		return Said{Err: err.Error(), Code: NotStarted}
	}
	return Said{Out: out.String(), Err: errs.String()}
}

// A real runner and the halt that ends every run in flight through it. [[spec/tickets/lsp-tools-take-the-runner]]
func Halting() (Runner, func()) {
	return Real, func() {}
}

// A program the fake runs: the command in, the answer out. [[spec/design_output/doors#the-process-door]]
type Program func(Command) Said

// The fake runner: a table from a program's name to what it does. [[spec/design_output/doors#the-process-door]]
type FakeRunner struct {
	Programs map[string]Program
	Halted   bool
	After    func(time.Duration) <-chan time.Time
}

// Ends every run in flight, and every run after answers NotStarted. [[spec/tickets/lsp-tools-take-the-runner]]
func (fake *FakeRunner) Halt() {}

// The channel a taught program that waits reads, closed at the halt. [[spec/tickets/lsp-tools-take-the-runner]]
func (fake *FakeRunner) Ends() <-chan struct{} {
	return nil
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
	return program(one)
}
