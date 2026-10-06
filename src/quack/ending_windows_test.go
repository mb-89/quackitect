//go:build windows

// The end of a span ends the child and the process it started on Windows, which a pipe they hold proves by reading to its end.
// [[spec/tickets/ending-windows-tree-tested]]
package main

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"testing"
)

// The variable that turns the case below into the child, at 1, or the grandchild, at 2. [[spec/tickets/ending-windows-tree-tested]]
const treeHelper = "SE_TEST_ENDS_A_TREE"

// Blocks on a pipe this process holds both ends of, which no timer and no input ends. [[spec/tickets/ending-windows-tree-tested]]
func holdsForever() {
	read, write, err := os.Pipe()
	if err != nil {
		os.Exit(1)
	}
	defer write.Close()
	_, _ = io.Copy(io.Discard, read)
	os.Exit(0)
}

// The child starts a grandchild holding its stdout, so the pipe reads to its end only once taskkill ends both. [[spec/tickets/ending-windows-tree-tested]]
func TestAChildTheCheckGivesUpOnEndsWithItsTreeOnWindows(t *testing.T) {
	self := "-test.run=^TestAChildTheCheckGivesUpOnEndsWithItsTreeOnWindows$"
	switch os.Getenv(treeHelper) {
	case "1":
		grand := exec.Command(os.Args[0], self)
		grand.Env = append(os.Environ(), treeHelper+"=2")
		grand.Stdout = os.Stdout
		if err := grand.Start(); err != nil {
			os.Exit(1)
		}
		fmt.Println("started")
		holdsForever()
	case "2":
		holdsForever()
	}
	t.Parallel()
	span, stop := context.WithCancel(context.Background())
	defer stop()
	run := endsWhole(exec.CommandContext(span, os.Args[0], self))
	run.Env = append(os.Environ(), treeHelper+"=1")
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
	if line, err := read.ReadString('\n'); err != nil || line != "started\n" && line != "started\r\n" {
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
