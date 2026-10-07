//go:build !windows

// [[spec/tickets/the-index-outlives-the-check]] [[spec/tickets/platform-draft-names-checkdoors]]
package index // level0: InPackageTest - the case reads the unexported exitEnds the door's wait reads

import (
	"os/exec"
	"syscall"
	"testing"
)

// A merge, a switch or a check ends the command group that starts a door, so the door leads a session of its own. [[spec/tickets/the-index-outlives-the-check]]
func TestADoorStandsInASessionOfItsOwn(t *testing.T) {
	t.Parallel()
	run := Detached(exec.Command("tail", "-f", "/dev/null")) // level0: FixtureOutsideHome - the case detaches a real process of its own and ends it
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

// The detached process is the door, so a start reads its clean exit as the door's end. [[spec/tickets/the-doors-pr-goes-green]]
func TestADoorsCleanExitEndsIt(t *testing.T) {
	t.Parallel()
	if !exitEnds(nil) || !exitEnds(exec.ErrNotFound) {
		t.Fatal("an exit of the door itself reads as no end")
	}
}
