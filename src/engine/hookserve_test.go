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
	go serveHooks(t.Context(), ln, r, log)

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
	answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
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
	//
	// AND IT IS TWO FILES. The door is a port, and a port is this machine's, so
	// it left the file every clone carries and went to one git does not. Claude
	// Code combines list keys across settings files rather than picking one, so
	// the two are one cage. What this holds is that the split fell where it was
	// meant to: the door on one side, the wake on the other, and neither file
	// carrying the other's half.
	os.MkdirAll(filepath.Join(r.Method, "util", "cage"), 0o755)
	for _, name := range []string{"claude-settings.json", "claude-settings-local.json"} {
		cage, err := os.ReadFile(filepath.Join("..", "..", "util", "cage", name))
		if err != nil {
			t.Fatal(err)
		}
		os.WriteFile(filepath.Join(r.Method, "util", "cage", name), cage, 0o644)
	}
	os.WriteFile(filepath.Join(r.Method, "util", "projections.json"), []byte(`{"projections":[
	  {"name":"claude cage","target":".claude/settings.json","sources":["util/cage/claude-settings.json"],"wrap":"none"},
	  {"name":"claude door","target":".claude/settings.local.json","sources":["util/cage/claude-settings-local.json"],"wrap":"none","local":true}
	]}`), 0o644)
	if _, err := Project(r); err != nil {
		t.Fatal(err)
	}
	travels := caged(t, filepath.Join(r.Work, ".claude", "settings.json"))
	door := caged(t, filepath.Join(r.Work, ".claude", "settings.local.json"))

	if !strings.Contains(door.text, hooksURL(r)) {
		t.Fatalf("the door file does not name the door %s", hooksURL(r))
	}
	// THE ONE THAT TRAVELS NAMES NO PORT AT ALL, which is the whole point of
	// there being two.
	if strings.Contains(travels.text, "127.0.0.1") {
		t.Fatal("the file every clone carries names a port, so it is one box's")
	}
	for _, one := range []cagedFile{travels, door} {
		if strings.Contains(one.text, "{{") {
			t.Fatalf("%s carries an unfilled placeholder", one.path)
		}
	}
	for event, entries := range door.parsed {
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
	for _, e := range travels.parsed["UserPromptSubmit"] {
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

// cagedFile is one projected settings file, as text and as hooks.
type cagedFile struct {
	path   string
	text   string
	parsed map[string][]struct {
		Hooks []map[string]any `json:"hooks"`
	}
}

func caged(t *testing.T, path string) cagedFile {
	t.Helper()
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	one := cagedFile{path: path, text: string(b)}
	var v struct {
		Hooks map[string][]struct {
			Hooks []map[string]any `json:"hooks"`
		} `json:"hooks"`
	}
	if err := json.Unmarshal(b, &v); err != nil {
		t.Fatal(err)
	}
	one.parsed = v.Hooks
	return one
}
