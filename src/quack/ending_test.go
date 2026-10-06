//go:build !windows

// The end of a span ends the child and the processes it started, which a pipe they hold proves by reading to its end.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main

import (
	"bufio"
	"context"
	"io"
	"os/exec"
	"testing"
)

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
