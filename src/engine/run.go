package main

import (
	"fmt"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// A SHELL COMMAND NAMES ITS TOKEN, BECAUSE IT COULD WRITE.
//
// THE OWNER'S WORDS: make the shell thing also route through the server, and a
// shell will just always demand a token because it could write.
//
// THE ENGINE CANNOT READ A COMMAND AND KNOW WHETHER IT WRITES. sed -i, a
// redirection, mv, rm and a script somebody wrote all reach the filesystem, and
// a list of safe programs goes stale the day anybody runs a new one. So the
// question is not asked: every command names the work it belongs to, the same
// way every edit does, and the record says which token each one was run under.
//
// A STANDING HAND WAS THE OTHER ANSWER AND IT LEAKED. Holding a token let every
// shell call through for as long as it was held, so one name bought a session
// of writes and nothing said which of them belonged to what.

// TheOutputCeiling is how much of a command's output comes back.
//
// A COMMAND THAT PRINTS A HUNDRED THOUSAND LINES IS THE THING THAT BLOWS UP A
// TURN. The engine hands this to an agent, so what it hands over is bounded and
// it says when it cut, rather than a number nobody set turning out to be the
// size of a log file.
const TheOutputCeiling = 60 * 1024

// TheRunCeiling is how long a command may take before it is stopped. A command
// that never finishes holds the turn open for ever.
const TheRunCeiling = 10 * time.Minute

// Ran is what a command did, at the width an agent needs to act on it.
type Ran struct {
	On      string `json:"on"`
	Command string `json:"command"`
	Exit    int    `json:"exit"`
	Output  string `json:"output"`

	// Cut says how many bytes were left out, so a reader can tell a short
	// answer from a truncated one.
	Cut int `json:"cut,omitempty"`

	// Timeout says the command was stopped rather than finished, because an
	// exit code alone reads as an ordinary failure.
	Timeout bool `json:"timed_out,omitempty"`
}

// Run runs one command in the folder being worked on and answers what it did.
//
// OUT AND ERR COME BACK AS ONE STREAM, in the order they were written, because
// that is the order a person reads them in and splitting them puts a failure's
// message somewhere other than under the line that caused it.
func Run(r Roots, command string) (Ran, error) {
	command = strings.TrimSpace(command)
	if command == "" {
		return Ran{}, fmt.Errorf("say what to run")
	}
	out := Ran{Command: command}

	cmd := shellCommand(r, command)
	done := make(chan struct{})
	var said []byte
	var err error
	go func() { said, err = cmd.CombinedOutput(); close(done) }()

	select {
	case <-done:
	case <-time.After(TheRunCeiling):
		if cmd.Process != nil {
			_ = cmd.Process.Kill() // it has already finished, which is the only way this fails
		}
		<-done
		out.Timeout = true
	}

	if n := len(said); n > TheOutputCeiling {
		// THE END IS WHAT MATTERS. A failure says why on its last lines, so the
		// tail is kept and the head is what goes.
		out.Cut = n - TheOutputCeiling
		said = said[n-TheOutputCeiling:]
	}
	out.Output = string(said)
	if code := cmd.ProcessState; code != nil {
		out.Exit = code.ExitCode()
	} else if err != nil {
		out.Exit = -1
	}
	return out, nil
}

// shellCommand is the one place a command line becomes a process.
func shellCommand(r Roots, script string) *exec.Cmd {
	name, args := "sh", []string{"-c", script}
	if runtime.GOOS == "windows" {
		name, args = "cmd", []string{"/c", script}
	}
	cmd := TheScriptVerbatim(Quietly(exec.Command(name, args...)), script)
	cmd.Dir = r.Work
	return cmd
}
