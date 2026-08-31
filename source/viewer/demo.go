package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"time"
)

// Demo mode writes a plausible log to a temporary file, twice a second, and
// views it. It exists so a person can see the window working before there is
// an engine to fill it. Nothing here is part of the product.
type demoLine struct {
	T       string         `json:"t"`
	Seq     int64          `json:"seq"`
	Session string         `json:"session"`
	Src     string         `json:"src"`
	Kind    string         `json:"kind"`
	Actor   string         `json:"actor"`
	Msg     string         `json:"msg"`
	OK      *bool          `json:"ok,omitempty"`
	Data    map[string]any `json:"data,omitempty"`
}

var (
	demoPaths = []string{
		"scratchpad/level-0-design.md", "engine/log.go", "setup/manifest.json",
		"viewer/ui.go", ".se/notes/2026-08-30.md", "extension/package.json",
		"guidance/method/front-desk.md", "scratchpad/use-cases.md",
	}
	demoTools  = []string{"read", "write", "search", "list", "run", "edit"}
	demoActors = []string{"main", "helper-1", "helper-2"}
)

func demoRecord(seq int64, session string) demoLine {
	yes, no := true, false
	l := demoLine{
		T: time.Now().UTC().Format(time.RFC3339Nano), Seq: seq,
		Session: session, Actor: demoActors[rand.Intn(len(demoActors))],
	}
	path := demoPaths[rand.Intn(len(demoPaths))]
	tool := demoTools[rand.Intn(len(demoTools))]
	switch n := rand.Intn(100); {
	case n < 34:
		l.Src, l.Kind = "agent", "call"
		l.Msg = fmt.Sprintf("%s %s", tool, path)
		l.Data = map[string]any{"tool": tool, "path": path,
			"args": map[string]any{"offset": rand.Intn(400), "limit": 120}}
	case n < 62:
		l.Src, l.Kind, l.OK = "engine", "answer", &yes
		l.Msg = fmt.Sprintf("%s ok, %d bytes", tool, 200+rand.Intn(40000))
		l.Data = map[string]any{"tool": tool, "path": path, "ms": rand.Intn(90) + 1}
	case n < 72:
		l.Src, l.Kind, l.OK = "engine", "refusal", &no
		l.Msg = fmt.Sprintf("write refused: %s is a projection", path)
		l.Data = map[string]any{"rule": "projection-is-output", "path": path,
			"write_instead": "guidance/" + filepath.Base(path)}
	case n < 82:
		l.Src, l.Kind = "agent", "note"
		l.Msg = "the leaving guard read one folder more times than it had to answer one question"
		l.Data = map[string]any{"path": path}
	case n < 90:
		l.Src, l.Kind, l.OK = "engine", "heartbeat", &yes
		l.Msg = "engine alive"
		l.Data = map[string]any{"uptime_s": int(time.Since(demoStart).Seconds())}
	case n < 96:
		l.Src, l.Kind = "user", "prompt"
		l.Msg = "have another look at the invalidation path"
	default:
		l.Src, l.Kind, l.OK = "engine", "error", &no
		l.Msg = "the tool server did not answer in time"
		l.Data = map[string]any{"waited_ms": 5000, "tool": tool}
	}
	return l
}

var demoStart = time.Now()

// runDemo returns the path it is writing to. The writer keeps running for as
// long as the window does, which is the point.
func runDemo() (string, error) {
	path := filepath.Join(os.TempDir(), fmt.Sprintf("se-demo-%d.jsonl", os.Getpid()))
	f, err := os.Create(path)
	if err != nil {
		return "", err
	}
	session := fmt.Sprintf("demo-%d", time.Now().Unix())
	go func() {
		defer f.Close()
		var seq int64
		// A few lines are there before the window opens, so it does not start
		// on an empty screen.
		for ; seq < 12; seq++ {
			writeDemo(f, demoRecord(seq+1, session))
		}
		for t := time.NewTicker(500 * time.Millisecond); ; <-t.C {
			seq++
			writeDemo(f, demoRecord(seq, session))
		}
	}()
	time.Sleep(120 * time.Millisecond)
	return path, nil
}

func writeDemo(f *os.File, l demoLine) {
	b, err := json.Marshal(l)
	if err != nil {
		return
	}
	f.Write(append(b, '\n'))
	f.Sync()
}
