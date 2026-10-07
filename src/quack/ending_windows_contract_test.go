//go:build contract && windows

// The end of a span ends the child and the process it started on Windows,
// which a pipe they hold proves by reading to its end. The case meets a real
// process tree.
// [[spec/tickets/ending-windows-tree-tested]]
package main // level0: InPackageTest - a main package admits no outside test package, and the contract reaches the unexported endsWhole

import (
	"bufio"
	"context"
	"io"
	"os/exec"
	"testing"
)

// The child starts a grandchild holding its stdout, so the pipe reads to its end only once taskkill ends both. [[spec/tickets/ending-windows-tree-tested]]
// level0: FixtureOutsideHome - the contract starts a real cmd child and grandchild, and only a real taskkill proves the tree ends
func TestAChildTheCheckGivesUpOnEndsWithItsTreeOnWindows(t *testing.T) {
	t.Parallel()
	span, stop := context.WithCancel(context.Background())
	defer stop()
	run := endsWhole(exec.CommandContext(span, "cmd", "/c", "start /b waitfor /t 99999 hq1never & echo started & waitfor /t 99999 hq1never"))
	if run.Cancel == nil {
		t.Fatal("the child carries no cancel, so its end leaves the grandchild running")
	}
	out, err := run.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := run.Start(); err != nil {
		t.Fatal(err)
	}
	read := bufio.NewReader(out)
	if line, err := read.ReadString('\n'); err != nil || line != "started\n" && line != "started \r\n" && line != "started\r\n" {
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
