//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

// NO WINDOW OPENS FOR A CHILD PROCESS.
//
// Windows gives a console to a process started from a program that has none,
// and every one of those is a window that appears on somebody's screen. Booting
// probes for a dozen tools, so booting flashed a dozen windows.
//
// Two flags are needed and neither is enough alone. CREATE_NO_WINDOW stops the
// console being made, and HideWindow covers a program that makes its own.
//
// EVERY START GOES THROUGH HERE. A start that skips it is a window, and the
// only way to keep that from coming back is to have one door.
func Quietly(cmd *exec.Cmd) *exec.Cmd {
	cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
	return cmd
}

// THE SCRIPT REACHES cmd VERBATIM, so the quotes an author typed are the quotes
// the shell sees. Go rebuilds a command line from the argument list and escapes
// the inner quotes, so rg was handed each word of a pattern as a separate path
// and every quoted criterion was unrunnable.
//
// IT SETS THE FIELD ON THE STRUCT Quietly MADE. A fresh SysProcAttr written over
// that one drops HideWindow and CreationFlags for every child the engine starts,
// which is why the write lives here rather than at the call site.
func TheScriptVerbatim(cmd *exec.Cmd, script string) *exec.Cmd {
	if cmd.SysProcAttr == nil {
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true, CreationFlags: 0x08000000}
	}
	cmd.SysProcAttr.CmdLine = "/c " + script
	return cmd
}
