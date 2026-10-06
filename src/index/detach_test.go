//go:build !windows

// [[spec/tickets/the-index-outlives-the-check]]
package index

import (
	"os/exec"
	"syscall"
	"testing"
)

// A merge, a switch or a check ends the command group that starts a door, so the door leads a session of its own. [[spec/tickets/the-index-outlives-the-check]]
func TestADoorStandsInASessionOfItsOwn(t *testing.T) {
	t.Parallel()
	run := Detached(exec.Command("tail", "-f", "/dev/null"))
	if err := run.Start(); err != nil {
		t.Fatal(err)
	}
	defer func() {
		_ = run.Process.Kill()
		_ = run.Wait()
	}()
	if group, err := syscall.Getpgid(run.Process.Pid); err != nil || group != run.Process.Pid {
		t.Fatalf("the door stands in group %d, %v, and leads none of its own", group, err)
	}
}
