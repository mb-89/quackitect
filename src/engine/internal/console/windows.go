//go:build windows

package main

import (
	"os"
	"syscall"
)

// The language server lets go of its console when an editor started it.
//
// Quietly covers every child the engine starts. It cannot cover this one: the
// language client owns the process and its ExecutableOptions carry cwd, env,
// detached and shell, with no windowsHide among them. So the console is let go
// from inside instead.
//
// ONLY WHEN STANDARD INPUT IS A PIPE. An editor speaks over pipes, and a person
// at a terminal does not. Freeing the console while the terminal is standard
// input takes the handles away and the conversation stops.
func hideOwnConsole() {
	info, err := os.Stdin.Stat()
	if err != nil || info.Mode()&os.ModeCharDevice != 0 {
		return
	}
	proc := syscall.NewLazyDLL("kernel32.dll").NewProc("FreeConsole")
	proc.Call()
}
