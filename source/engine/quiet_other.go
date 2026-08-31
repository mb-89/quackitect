//go:build !windows

package main

import "os/exec"

// Nothing to hide. A process started here inherits the terminal it was started
// from, and no window is made for it.
func Quietly(cmd *exec.Cmd) *exec.Cmd { return cmd }
