//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

// NO WINDOW OPENS FOR A CHILD PROCESS.
//
// Windows gives a console to a process started from a program that has none,
// and every one of those is a window on somebody's screen. Setup starts several.
//
// Two flags are needed and neither is enough alone. CREATE_NO_WINDOW stops the
// console being made, and HideWindow covers a program that makes its own.
//
// EVERY START GOES THROUGH HERE. A start that skips it is a window, and one
// door is the only way to keep that from coming back.
func Quietly(cmd *exec.Cmd) *exec.Cmd {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
	return cmd
}
