//go:build !windows

package main

import (
	"os/exec"
	"syscall"
)

// A PROCESS THAT OUTLIVES THE ONE THAT STARTED IT. A new session, so the
// hook's end, and the terminal's, is not the engine's.
func Detached(cmd *exec.Cmd) *exec.Cmd {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setsid: true}
	return cmd
}

// Nothing to hide. A process started here inherits the terminal it was started
// from, and no window is made for it.
func Quietly(cmd *exec.Cmd) *exec.Cmd { return cmd }

// Nothing to do. sh -c already takes the script as one argument, so it reaches
// the shell whole.
func TheScriptVerbatim(cmd *exec.Cmd, script string) *exec.Cmd { return cmd }
