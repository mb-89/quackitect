//go:build !windows

// The index door's spawn meets a real process once: the process it detaches
// leads a session of its own.
// [[spec/tickets/the-index-outlives-the-check]] [[spec/tickets/test-walks-move-onto-fakes]]
package index_test

import (
	"os/exec"
	"syscall"
	"testing"

	"quackitect/src/index"
)

// A merge, a switch or a check ends the command group that starts a door, so the door leads a session of its own. [[spec/tickets/the-index-outlives-the-check]]
// level0: FixtureOutsideHome - the contract spawns a real process through the door's detach, the one case the spawn meets the kernel's sessions
func TestADoorStandsInASessionOfItsOwn(t *testing.T) {
	t.Parallel()
	run := index.Detached(exec.Command("tail", "-f", "/dev/null"))
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
