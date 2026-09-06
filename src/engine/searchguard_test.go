package main

import (
	"bytes"
	"encoding/json"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// A SEARCH OVER THE TREE IS REFUSED AND TOLD THE INDEX. ONE OUTSIDE IT IS NOT.
//
// THE OWNER'S WORDS: everything that's inside the system should be routed
// there. If the agent wants to do something outside of our system, you can
// still use the other tools.
func TestASearchOverTheTreeGoesThroughTheIndex(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	elsewhere := filepath.Join(t.TempDir(), "another-tree")

	decide := func(tool string, input map[string]any) string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
			"tool_name": tool, "tool_input": input, "agent_id": "helper-1"})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	refused := func(said string) bool { return strings.Contains(said, "se_find") }

	cases := []struct {
		name  string
		tool  string
		input map[string]any
		want  bool
	}{
		{"Grep with no path searches where it stands", "Grep", map[string]any{"pattern": "LoadConfig"}, true},
		{"Grep inside the tree", "Grep", map[string]any{"pattern": "x", "path": filepath.Join(r.Work, "src")}, true},
		{"Grep outside the tree", "Grep", map[string]any{"pattern": "x", "path": elsewhere}, false},
		{"Glob inside the tree", "Glob", map[string]any{"pattern": "**/*.go"}, true},
		{"Glob outside the tree", "Glob", map[string]any{"pattern": "*.go", "path": elsewhere}, false},
		{"rg with no path", "Bash", map[string]any{"command": "rg LoadConfig"}, true},
		{"rg over a folder here", "Bash", map[string]any{"command": "rg -n LoadConfig src/engine"}, true},
		{"rg over a folder elsewhere", "Bash", map[string]any{"command": "rg -n LoadConfig " + elsewhere}, false},
		// A QUOTED PATTERN IS ONE WORD, AND THE WORDS INSIDE IT NAME NOTHING ON
		// THE DISK. Split on spaces, the pattern's second word reads as a
		// relative path, which is inside the tree, so a search whose only real
		// path is outside was refused by a message promising it would not be.
		{"a quoted pattern and a path elsewhere", "Bash", map[string]any{"command": `rg -n "agent proxy" ` + elsewhere}, false},
		{"a single-quoted pattern and a path under /root", "Bash", map[string]any{"command": `rg -n 'agent proxy' /root/.ccr/README.md`}, false},
		{"a quoted pattern and a folder here", "Bash", map[string]any{"command": `rg -n "agent proxy" src/engine`}, true},
		{"grep -r here", "Bash", map[string]any{"command": "grep -rn LoadConfig src"}, true},
		{"grep behind a pipe reads its input", "Bash", map[string]any{"command": "go test ./... 2>&1 | grep FAIL"}, false},
		{"grep with no path reads its input", "Bash", map[string]any{"command": "grep FAIL"}, false},
		{"a search after a semicolon", "Bash", map[string]any{"command": "cd src; rg -e LoadConfig ."}, true},
		{"rg with a type flag and no path", "Bash", map[string]any{"command": "rg -t go LoadConfig"}, true},
		{"a read is not a search", "Read", map[string]any{"file_path": filepath.Join(r.Work, "README.md")}, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			said := decide(c.tool, c.input)
			if got := refused(said); got != c.want {
				t.Fatalf("refused=%v, want %v. The guard said: %s", got, c.want, said)
			}
		})
	}
}
