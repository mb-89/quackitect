package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
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

// RationaleDir is where the arguments live, one note per decision. Guidance
// and a schema say what to do; a rationale says why it is that, and the thing
// it explains names it by link. It is spelled here so nothing else spells it.
func RationaleDir(methodRoot string) string {
	return filepath.Join(methodRoot, "doc", "rationale")
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
	// Socket is where the model answers, and empty while it does not.
	Socket string `json:"socket,omitempty"`
	// Hooks is where the guard answers events over HTTP, and empty while
	// the port could not be bound.
	Hooks string `json:"hooks,omitempty"`
	// Run is this engine run's own identity, minted at start. A PID number
	// comes back around and this does not, so it is what tells the engine
	// that wrote the record from a process that inherited its number.
	Run string `json:"run,omitempty"`
}

// runIdentity mints the name of one engine run.
func runIdentity() string {
	b := make([]byte, 5)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("%010x", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func runningPath(r Roots) string { return r.Private("engine.json") }

// TheRunNow is the engine process that is running over this tree, as an
// identity that changes every time one starts.
//
// IT IS NOT THE LOG SESSION. A swap hands over to a successor that continues
// the same session, so the session stopped saying which process wrote a thing
// the day that landed. With no engine at all the session is the best answer
// there is, which is what it was before.
func TheRunNow(r Roots) string {
	if v, up := LoadRunning(r); up && v.Run != "" {
		return v.Run
	}
	return currentSession(r)
}

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
	v, why := loadRunning(r)
	return v, why == ""
}

// loadRunning answers the record and why it is not an engine, empty when it
// is. The reason names the field that failed, so a reader can say what it saw.
func loadRunning(r Roots) (Running, string) {
	var v Running
	// THE FILE IS REPLACED ON EVERY BEAT, and on Windows a reader can meet
	// the instant between the old one going and the new one landing. A miss
	// is read again before it is believed, because a guard that believed it
	// went cold for one call in the middle of a session.
	var b []byte
	var err error
	for try := 0; try < 20; try++ {
		if b, err = os.ReadFile(runningPath(r)); err == nil {
			break
		}
		time.Sleep(25 * time.Millisecond)
	}
	if err != nil || json.Unmarshal(b, &v) != nil {
		return v, "record: no readable engine.json"
	}
	if v.PID <= 0 || !alive(v.PID) {
		return v, fmt.Sprintf("pid: %d is not a running process", v.PID)
	}
	// A PID NUMBER COMES BACK AROUND, and any process holding it answers
	// signal zero. The beat is the tell: an engine that stopped writing
	// beats stopped, whatever now owns its number. A record carrying no time
	// at all keeps its old meaning, which is what the fixtures write.
	last, field := v.Beat, "beat"
	if last == "" {
		last, field = v.Started, "started"
	}
	if last != "" {
		if at, err := time.Parse(time.RFC3339, last); err == nil {
			beat := LoadConfig(r).HeartbeatSeconds
			if beat <= 0 {
				beat = 5
			}
			limit := 3 * time.Duration(beat) * time.Second
			if age := time.Since(at); age > limit {
				return v, fmt.Sprintf("%s: last written %s ago, over %s, so the engine stopped",
					field, age.Round(time.Second), limit)
			}
		}
	}
	return v, ""
}

// SameRun answers whether the engine on disk is the run this identity names.
// A reused PID answers alive; a run identity is never reused, so a mismatch
// is refused.
func SameRun(r Roots, run string) bool {
	v, ok := LoadRunning(r)
	return ok && run != "" && v.Run == run
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
