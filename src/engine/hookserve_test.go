package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE GUARD OVER HTTP IS THE GUARD. The same event posted to the engine's
// door answers the same decision the command form prints, and the record
// the engine holds carries the call.
func TestTheGuardAnswersTheSameOverHTTP(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	Project(r)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	ln, err := listenHooks(r)
	if err != nil {
		t.Skipf("the derived port is taken on this machine: %v", err)
	}
	defer ln.Close()
	go serveHooks(ln, r, log)

	// A write to a projection is the one refusal with no override, so it is
	// the decision that proves the door.
	target := filepath.Join(r.Work, ".claude", "output-styles", "quackitect.md")
	event := map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work, "tool_name": "Write",
		"agent_id": "helper-1", "tool_input": map[string]any{"file_path": target, "content": "x"}}
	body, _ := json.Marshal(event)

	resp, err := http.Post(hooksURL(r), "application/json", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	said, _ := io.ReadAll(resp.Body)
	var out bytes.Buffer
	answerHook(body, []string{"--method", r.Method}, &out, log)
	if strings.TrimSpace(string(said)) != strings.TrimSpace(out.String()) {
		t.Fatalf("the door answered\n%s\nand the guard answered\n%s", said, out.String())
	}
	if !strings.Contains(string(said), "projection") {
		t.Fatalf("the projection write was not refused: %s", said)
	}

	// AN EVENT WITH NOTHING TO SAY IS AN EMPTY OBJECT, not an empty body.
	quiet, _ := json.Marshal(map[string]any{"hook_event_name": "Notification", "cwd": r.Work})
	resp, err = http.Post(hooksURL(r), "application/json", bytes.NewReader(quiet))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	said, _ = io.ReadAll(resp.Body)
	if strings.TrimSpace(string(said)) != "{}" {
		t.Fatalf("a quiet event answered %q", said)
	}
}

// THE CAGE NAMES THE DOOR, and a command only where the door cannot be.
func TestTheCageSendsCallsToTheDoorAndWakesTheEngine(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	// THE CAGE UNDER TEST IS THE PRODUCT'S, copied into the fixture's method,
	// because what is checked is what the product projects.
	cage, err := os.ReadFile(filepath.Join("..", "..", "util", "cage", "claude-settings.json"))
	if err != nil {
		t.Fatal(err)
	}
	os.MkdirAll(filepath.Join(r.Method, "util", "cage"), 0o755)
	os.WriteFile(filepath.Join(r.Method, "util", "cage", "claude-settings.json"), cage, 0o644)
	os.WriteFile(filepath.Join(r.Method, "util", "projections.json"), []byte(`{"projections":[
	  {"name":"claude cage","target":".claude/settings.json","sources":["util/cage/claude-settings.json"],"wrap":"none"}
	]}`), 0o644)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, ".claude", "settings.json"))
	if err != nil {
		t.Fatal(err)
	}
	text := string(b)
	if !strings.Contains(text, hooksURL(r)) {
		t.Fatalf("the cage does not name the door %s", hooksURL(r))
	}
	if strings.Contains(text, "{{") {
		t.Fatal("the cage carries an unfilled placeholder")
	}
	var v struct {
		Hooks map[string][]struct {
			Hooks []map[string]any `json:"hooks"`
		} `json:"hooks"`
	}
	if err := json.Unmarshal(b, &v); err != nil {
		t.Fatal(err)
	}
	for event, entries := range v.Hooks {
		for _, e := range entries {
			for _, h := range e.Hooks {
				if h["type"] == "http" {
					if _, isNumber := h["timeout"].(float64); !isNumber {
						t.Fatalf("%s carries a timeout that is not a number: %v", event, h["timeout"])
					}
				}
			}
		}
	}
	wakes := 0
	for _, e := range v.Hooks["UserPromptSubmit"] {
		for _, h := range e.Hooks {
			if cmd, _ := h["command"].(string); strings.Contains(cmd, "--wake") {
				wakes++
			}
		}
	}
	if wakes != 1 {
		t.Fatalf("the prompt event carries %d wake hooks, want one", wakes)
	}
}
