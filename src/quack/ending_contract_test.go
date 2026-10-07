//go:build contract && !windows

// The end of a span ends the child and the processes it started, which a pipe
// they hold proves by reading to its end, and a door started apart stands
// outside the group the end reaches. Each case meets a real process.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main

import (
	"bufio"
	"context"
	"io"
	"os/exec"
	"syscall"
	"testing"

	"quackitect/src/index"
)

// A check gives up on a child, and the group kill leaves a door started apart standing. [[spec/tickets/the-index-outlives-the-check]]
func TestAServerStandingBeforeTheCheckAnswersAfterIt(t *testing.T) {
	t.Parallel()
	door := index.Detached(exec.Command("tail", "-f", "/dev/null"))
	if err := door.Start(); err != nil {
		t.Fatal(err)
	}
	pid := door.Process.Pid
	defer func() { _ = syscall.Kill(pid, syscall.SIGKILL); _ = door.Wait() }()
	if group, _ := syscall.Getpgid(pid); group != pid {
		t.Fatalf("the door stands in group %d, which the check's group kill reaches", group)
	}
	span, stop := context.WithCancel(context.Background())
	defer stop()
	run := endsWhole(exec.CommandContext(span, "sh", "-c", "tail -f /dev/null & wait"))
	if err := run.Start(); err != nil {
		t.Fatal(err)
	}
	stop()
	_ = run.Wait()
	if err := syscall.Kill(pid, 0); err != nil {
		t.Errorf("the door fell with the child the check gave up on: %v", err)
	}
}

// The child starts a grandchild holding its stdout, so the pipe reads to its end only once both have ended. [[spec/tickets/the-check-ends-what-it-drops]]
func TestAChildTheCheckGivesUpOnEndsWithEveryProcessItStarted(t *testing.T) {
	t.Parallel()
	span, stop := context.WithCancel(context.Background())
	defer stop()
	run := endsWhole(exec.CommandContext(span, "sh", "-c", "tail -f /dev/null & echo started; wait"))
	if run.SysProcAttr == nil || !run.SysProcAttr.Setpgid || run.Cancel == nil {
		t.Fatal("the child stands in no group of its own, so its end leaves the grandchild running")
	}
	out, err := run.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := run.Start(); err != nil {
		t.Fatal(err)
	}
	read := bufio.NewReader(out)
	if line, err := read.ReadString('\n'); err != nil || line != "started\n" {
		t.Fatalf("the child says %q, %v", line, err)
	}
	stop()
	if _, err := io.ReadAll(read); err != nil {
		t.Fatalf("the pipe reads %v", err)
	}
	if err := run.Wait(); err == nil {
		t.Error("the child ended clean, and the span never cut it")
	}
}
