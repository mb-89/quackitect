//go:build !windows

// A run reading none of the caller's streams stands in a group of its own, which its end kills whole, and one on the caller's streams stays in the caller's group.
// [[spec/tickets/the-check-ends-what-it-drops]]
package proc

import (
	"context"
	"os"
	"os/exec"
	"testing"
)

// A command a caller outside the door builds ends whole once Whole readies it. [[spec/tickets/the-check-ends-what-it-drops]]
func TestWholeReadiesACallersCommandToEndItsGroup(t *testing.T) {
	t.Parallel()
	cmd := &exec.Cmd{}
	Whole(cmd)
	if cmd.SysProcAttr == nil || !cmd.SysProcAttr.Setpgid || cmd.Cancel == nil {
		t.Fatal("Whole leaves the command in its caller's group, so its end leaves its children running")
	}
}

// [[spec/tickets/the-check-ends-what-it-drops]]
func TestARunOffTheCallersStreamsEndsWithEveryProcessItStarted(t *testing.T) {
	t.Parallel()
	cmd := command(context.Background(), Command{Argv: []string{"sh", "-c", ":"}})
	if cmd.SysProcAttr == nil || !cmd.SysProcAttr.Setpgid || cmd.Cancel == nil {
		t.Fatal("the run stands in no group of its own, so its end leaves its children running")
	}
}

// [[spec/tickets/the-check-ends-what-it-drops]]
func TestARunOnTheCallersStreamsStaysInTheCallersGroup(t *testing.T) {
	t.Parallel()
	cmd := command(context.Background(), Command{Argv: []string{"sh", "-c", ":"}, Streams: &Streams{In: os.Stdin}})
	if cmd.SysProcAttr != nil && cmd.SysProcAttr.Setpgid {
		t.Fatal("the run on the caller's terminal stands in a group of its own, so its reads stop it")
	}
}
