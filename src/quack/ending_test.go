//go:build !windows

// The end of a span ends the child and the processes it started, which a pipe they hold proves by reading to its end.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main // level0: InPackageTest - the case calls the unexported endsWhole of the command

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"testing"

	"quackitect/src/index"
)

// The variable that turns the case below into the child that starts a door. [[spec/tickets/the-index-outlives-the-check]]
const doorHelper = "SE_TEST_STARTS_A_DOOR"

// A check gives up on a child that started a door, and the group kill leaves the door standing. [[spec/tickets/the-index-outlives-the-check]]
// level0: FixtureOutsideHome - the case spawns its own child, which starts a door of its own
func TestAServerStandingBeforeTheCheckAnswersAfterIt(t *testing.T) {
	if os.Getenv(doorHelper) == "1" {
		door := index.Detached(exec.Command("tail", "-f", "/dev/null"))
		if err := door.Start(); err != nil {
			os.Exit(1)
		}
		fmt.Println(door.Process.Pid)
		_, _ = io.Copy(io.Discard, os.Stdin)
		os.Exit(0)
	}
	t.Parallel()
	span, stop := context.WithCancel(context.Background())
	defer stop()
	run := endsWhole(exec.CommandContext(span, os.Args[0], "-test.run=^TestAServerStandingBeforeTheCheckAnswersAfterIt$"))
	run.Env = append(os.Environ(), doorHelper+"=1")
	keep, err := run.StdinPipe()
	if err != nil {
		t.Fatal(err)
	}
	defer keep.Close()
	out, err := run.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := run.Start(); err != nil {
		t.Fatal(err)
	}
	line, err := bufio.NewReader(out).ReadString('\n')
	pid, _ := strconv.Atoi(strings.TrimSpace(line))
	if err != nil || pid == 0 {
		t.Fatalf("the child says %q, %v", line, err)
	}
	defer func() { _ = syscall.Kill(pid, syscall.SIGKILL) }()
	if group, _ := syscall.Getpgid(pid); group != pid {
		t.Fatalf("the door stands in group %d, which the check's group kill reaches", group)
	}
	stop()
	_ = run.Wait()
	if err := syscall.Kill(pid, 0); err != nil {
		t.Errorf("the door fell with the child the check gave up on: %v", err)
	}
}

// The child starts a grandchild holding its stdout, so the pipe reads to its end only once both have ended. [[spec/tickets/the-check-ends-what-it-drops]]
// level0: FixtureOutsideHome - the case spawns its own child and grandchild, then ends them
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
