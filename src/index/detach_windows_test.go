//go:build windows

// A tree kill over the process that started a door leaves the door answering, which its exit code proves.
// [[spec/tickets/door-outlives-taskkill-tree]]
package index

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"testing"
)

// The variable that turns the case below into the starter's caller, at 1, or the door, at 2. [[spec/tickets/door-outlives-taskkill-tree]]
const doorRole = "SE_TEST_DOOR_ROLE"

// The exit code Windows answers for a process that still runs. [[spec/tickets/door-outlives-taskkill-tree]]
const stillActive = 259

// Blocks on a pipe this process holds both ends of, which no timer and no input ends. [[spec/tickets/door-outlives-taskkill-tree]]
func holdsForever() {
	read, write, err := os.Pipe()
	if err != nil {
		os.Exit(1)
	}
	defer write.Close()
	_, _ = io.Copy(io.Discard, read)
	os.Exit(0)
}

// The starter exits clean once it launches the door, so a start waits on the door past that exit, and a failed starter ends the start. [[spec/tickets/the-doors-pr-goes-green]]
func TestAStartersCleanExitLeavesTheDoorStanding(t *testing.T) {
	t.Parallel()
	if exitEnds(nil) {
		t.Error("the starter's clean exit reads as the door's end")
	}
	if !exitEnds(exec.ErrNotFound) {
		t.Error("a failed starter reads as no end")
	}
}

// [[spec/tickets/door-outlives-taskkill-tree]]
func TestADoorOutlivesATreeKillOverWhatStartedIt(t *testing.T) {
	self := "-test.run=^TestADoorOutlivesATreeKillOverWhatStartedIt$"
	switch os.Getenv(doorRole) {
	case "1":
		door := Detached(exec.Command(os.Args[0], self))
		door.Env = append(os.Environ(), doorRole+"=2")
		door.Stdout = os.Stdout
		if err := door.Run(); err != nil {
			os.Exit(1)
		}
		holdsForever()
	case "2":
		fmt.Println(os.Getpid())
		holdsForever()
	}
	t.Parallel()
	caller := exec.Command(os.Args[0], self)
	caller.Env = append(os.Environ(), doorRole+"=1")
	out, err := caller.StdoutPipe()
	if err != nil {
		t.Fatal(err)
	}
	if err := caller.Start(); err != nil {
		t.Fatal(err)
	}
	line, err := bufio.NewReader(out).ReadString('\n')
	pid, _ := strconv.Atoi(strings.TrimSpace(line))
	if err != nil || pid == 0 {
		t.Fatalf("the door says %q, %v", line, err)
	}
	door, err := syscall.OpenProcess(syscall.PROCESS_QUERY_INFORMATION|syscall.PROCESS_TERMINATE|syscall.SYNCHRONIZE, false, uint32(pid))
	if err != nil {
		t.Fatalf("the door %d stands nowhere: %v", pid, err)
	}
	defer func() {
		_ = syscall.TerminateProcess(door, 1)
		_ = syscall.CloseHandle(door)
	}()
	if err := exec.Command("taskkill", "/T", "/F", "/PID", strconv.Itoa(caller.Process.Pid)).Run(); err != nil {
		t.Fatalf("taskkill fails over the caller: %v", err)
	}
	_ = caller.Wait()
	var code uint32
	if err := syscall.GetExitCodeProcess(door, &code); err != nil || code != stillActive {
		t.Errorf("the door fell with the tree that started it: exit %d, %v", code, err)
	}
}
