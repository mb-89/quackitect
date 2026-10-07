//go:build windows

// The index door's spawn meets Windows once: a tree kill over the process
// that started a door leaves the door answering, which its exit code proves.
// [[spec/tickets/door-outlives-taskkill-tree]] [[spec/tickets/test-walks-move-onto-fakes]]
package index_test

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

	"quackitect/src/index"
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

// [[spec/tickets/door-outlives-taskkill-tree]]
// level0: FixtureOutsideHome - the contract spawns real processes and a real taskkill, the one case the door's spawn meets Windows
func TestADoorOutlivesATreeKillOverWhatStartedIt(t *testing.T) {
	self := "-test.run=^TestADoorOutlivesATreeKillOverWhatStartedIt$"
	switch os.Getenv(doorRole) {
	case "1":
		door := index.Detached(exec.Command(os.Args[0], self))
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
