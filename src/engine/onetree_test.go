package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// ONE ENGINE PER TREE, WHATEVER STARTED THE SECOND.
//
// After a container restart the session hook's wake and the lane's se_start
// each looked for an engine, each saw none, and each started one a second
// apart. Nothing in the engine refused the second: the socket code removes
// any socket it finds, so the second took the socket while the first kept the
// hook port, and the lane's calls flipped between them. Measured: engine.json
// named one pid while the record carried the other's session.
func TestASecondStartAttachesToTheFirst(t *testing.T) {
	exe := theEngine(t)
	r := guidanceTree(t)

	start := func() (*exec.Cmd, *bytes.Buffer, chan error) {
		var out bytes.Buffer
		cmd := exec.Command(exe, "--work", r.Work, "--method", r.Method)
		cmd.Stdout, cmd.Stderr = &out, &out
		if err := cmd.Start(); err != nil {
			t.Fatal(err)
		}
		done := make(chan error, 1)
		go func() { done <- cmd.Wait() }()
		return cmd, &out, done
	}
	first, firstOut, firstDone := start()
	second, secondOut, secondDone := start()
	t.Cleanup(func() {
		_ = first.Process.Kill()
		_ = second.Process.Kill()
	})

	// ONE OF THE TWO LEAVES, saying why, and the other stays and is the engine.
	var left, stayed *exec.Cmd
	var leftOut *bytes.Buffer
	select {
	case <-firstDone:
		left, leftOut, stayed = first, firstOut, second
	case <-secondDone:
		left, leftOut, stayed = second, secondOut, first
	case <-time.After(15 * time.Second):
		t.Fatalf("both engines stayed up over one tree.\nfirst said: %s\nsecond said: %s", firstOut.String(), secondOut.String())
	}
	if !strings.Contains(leftOut.String(), "already up") {
		t.Fatalf("the engine that left did not say another was up: %s", leftOut.String())
	}
	_ = left

	// AND THE MARKER NAMES THE ONE THAT STAYED, once it has written it.
	var running Running
	for i := 0; i < 300; i++ {
		if v, up := LoadRunning(r); up && v.Socket != "" {
			running = v
			break
		}
		time.Sleep(50 * time.Millisecond)
	}
	if running.PID != stayed.Process.Pid {
		t.Fatalf("engine.json names pid %d and the engine that stayed is %d", running.PID, stayed.Process.Pid)
	}

	// AND THE RECORD IS THE STAYED ENGINE'S, IN ONE FILE. The measured defect
	// was the two halves out of step: engine.json named one pid while
	// session.jsonl carried the other's session. The pid above is decided by
	// the lock alone, so the record is read here: a leaver that writes its
	// start record before it reads the lock is red here
	// rather than green by construction.
	dir := r.Private("log")
	entries, err := os.ReadDir(dir)
	if err != nil {
		t.Fatal(err)
	}
	var logs []string
	for _, e := range entries {
		if strings.HasPrefix(e.Name(), "session") && strings.HasSuffix(e.Name(), ".jsonl") {
			logs = append(logs, e.Name())
		}
	}
	if len(logs) != 1 || logs[0] != Current {
		t.Fatalf("two starts left %v under %s, and one engine writes one record", logs, dir)
	}
	if got := sessionOf(filepath.Join(dir, Current)); got != running.Session {
		t.Fatalf("the record is session %s and engine.json names %s", got, running.Session)
	}
	b, err := os.ReadFile(filepath.Join(dir, Current))
	if err != nil {
		t.Fatal(err)
	}
	var starts []int
	for _, line := range strings.Split(string(b), "\n") {
		var rec Record
		if json.Unmarshal([]byte(line), &rec) != nil || rec.Kind != "start" || rec.Msg != "engine started" {
			continue
		}
		pid, _ := rec.Data["pid"].(float64)
		starts = append(starts, int(pid))
	}
	if len(starts) != 1 || starts[0] != stayed.Process.Pid {
		t.Fatalf("the record's start records name pids %v, and the engine that stayed is %d", starts, stayed.Process.Pid)
	}
}
