//go:build windows

// A starter launches the door and exits, so the door's parent stands ended and a tree kill from the caller walks past it.
// [[spec/tickets/door-outlives-taskkill-tree]]
package index

import (
	"os"      // level0: OutsideInDoors - the starter reads the shell Windows names, as the door's spawn reads its environment
	"os/exec" // level0: OutsideInDoors - the door's spawn readies the process it starts, as procs.go spawns the ones it places
	"strings"
	"syscall"
)

// The flag that starts the starter with no console window. [[spec/tickets/door-outlives-taskkill-tree]]
const noWindow = 0x08000000

// The command a starter runs, which taskkill /T walks no further than, since its own parent has ended by then. [[spec/tickets/door-outlives-taskkill-tree]]
func detached(run *exec.Cmd) *exec.Cmd {
	shell := os.Getenv("ComSpec")
	if shell == "" {
		shell = "cmd.exe"
	}
	words := []string{syscall.EscapeArg(run.Path)}
	for _, one := range run.Args[1:] {
		words = append(words, syscall.EscapeArg(one))
	}
	starter := exec.Command(shell)
	starter.Dir, starter.Env = run.Dir, run.Env
	starter.Stdin, starter.Stdout, starter.Stderr = run.Stdin, run.Stdout, run.Stderr
	starter.SysProcAttr = &syscall.SysProcAttr{
		CmdLine:       syscall.EscapeArg(shell) + ` /d /s /c "start "" /b ` + strings.Join(words, " ") + `"`,
		HideWindow:    true,
		CreationFlags: noWindow,
	}
	return starter
}
