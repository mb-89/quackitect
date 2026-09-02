package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"
)

// Watching guidance for a change. A digest is compared rather than a
// modification time, because a file that is written with the same content is
// not a change and must not cost a rewrite of everything that reads it.
//
// A poll is used rather than a file event. This runs once every two seconds
// over a handful of small files, and it cannot miss a change the way an event
// can.
func watchGuidance(methodRoot string) <-chan struct{} {
	out := make(chan struct{}, 1)
	go func() {
		last, _ := GuidanceDigest(methodRoot)
		for range time.Tick(2 * time.Second) {
			now, err := GuidanceDigest(methodRoot)
			if err != nil || now == last {
				continue
			}
			last = now
			select {
			case out <- struct{}{}:
			default:
			}
		}
	}()
	return out
}

// GuidanceDir is where the authored material lives. It is named here so that
// nothing else has to spell it.
func GuidanceDir(methodRoot string) string {
	return filepath.Join(methodRoot, "doc", "guidance")
}

func exists(p string) bool {
	_, err := os.Stat(p)
	return err == nil
}

// WHAT IS RUNNING, ON DISK.
//
// A heartbeat on standard output reaches whoever started the engine, and
// nobody else. An editor window that reloads has no parent any more, so it
// cannot tell a live engine from none and starts a second one. The second one
// rotates the first one's log away, and the record splits in half.
//
// So the engine says on disk that it is here. The file carries what a reader
// needs to attach: which process, which log, which session, and when it last
// said anything.
type Running struct {
	PID     int    `json:"pid"`
	Log     string `json:"log"`
	Session string `json:"session"`
	Started string `json:"started"`
	Beat    string `json:"beat"`
	Build   string `json:"build"`
}

func runningPath(r Roots) string { return r.Private("engine.json") }

func SayRunning(r Roots, v Running) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return
	}
	_ = writeAtomic(runningPath(r), append(b, '\n'), 0o644) // the next engine decides again whether one is running
}

// StopSaying is called when the engine leaves on purpose. A file left behind
// by a process that was killed is what LoadRunning has to survive.
func StopSaying(r Roots) { _ = os.Remove(runningPath(r)) }

// LoadRunning answers what is running, and whether it still is. A file naming
// a process that is gone is not an engine, and saying so is the whole job.
func LoadRunning(r Roots) (Running, bool) {
	var v Running
	b, err := os.ReadFile(runningPath(r))
	if err != nil || json.Unmarshal(b, &v) != nil {
		return v, false
	}
	if v.PID <= 0 || !alive(v.PID) {
		return v, false
	}
	return v, true
}

// ONE ENGINE PER PROJECT, AND THE ENGINE IS WHAT SAYS SO.
//
// A second engine rotates the first one's log away, and the record splits in
// half. The editor already checks before it starts one, and a check that
// lives only in a caller is a check the next caller does not have. A cloud
// session has a caller the editor never knew about.
//
// AlreadyHere answers with the running engine's ready line, because what the
// caller asked for is an engine to watch, and there is one. The line carries
// the same fields a starting engine prints, so a reader needs no second shape.
func AlreadyHere(r Roots) (string, bool) {
	v, yes := LoadRunning(r)
	if !yes {
		return "", false
	}
	line, err := json.Marshal(map[string]any{
		"ready": true, "log": v.Log, "session": v.Session,
		"method_root": r.Method, "work_root": r.Work,
		"attached": true, "pid": v.PID,
	})
	if err != nil {
		return "", false
	}
	return string(line), true
}
