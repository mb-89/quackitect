package main

import (
	"bytes"
	"context"
	"os/exec"
	"runtime"
	"time"
)

func isWindows() bool { return runtime.GOOS == "windows" }

// The engine is asked as a program, with an argument list. Never a command
// line for a shell to parse.
func runWithTimeout(exe string, args []string, d time.Duration) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), d)
	defer cancel()
	cmd := Quietly(exec.CommandContext(ctx, exe, args...))
	var out bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &out
	err := cmd.Run()
	return out.String(), err
}

// Some subcommands take a payload rather than arguments, because the payload
// is a document. It goes on standard input, the way the guard's event does.
func runWithInput(exe string, args []string, in []byte, d time.Duration) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), d)
	defer cancel()
	cmd := Quietly(exec.CommandContext(ctx, exe, args...))
	if in != nil {
		cmd.Stdin = bytes.NewReader(in)
	}
	var out bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &out
	err := cmd.Run()
	return out.String(), err
}
