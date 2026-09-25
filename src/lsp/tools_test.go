// Tools in memory that behave: a Vale, a Biome and a node reading the files a
// case writes, so the panel, the port and the check run the whole road.
// [[spec/design_output/lsp#the-server-runs-the-tools]]
package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"
)

// The words the fake tools find: Vale draws a warning on the first and a past tense row on the second, a file carrying the third breaks Vale, and Biome draws the fourth. [[spec/design_output/doors#a-fake-behaves]]
const (
	spooky   = "Spooky"
	pastWord = "walked"
	breaks   = "BROKEN"
	debugged = "debugger"
	// The line the fake tense reader reads as the present. [[spec/design_output/level0#the-tense-reader]]
	vetoed = "veto"
)

type fakeTools struct {
	root  string
	guard sync.Mutex
	calls [][]string
}

func toolsFor(root string) *fakeTools { return &fakeTools{root: root} }

// An outside over the fake tools, reading the case's own folder. [[spec/design_output/doors#a-fake-behaves]]
func (one *fakeTools) outside() *Outside {
	return &Outside{Root: one.root, Vale: "vale", Biome: "biome", Node: "node", Config: valeOwn, Tense: "file:///tense.js", run: one.run}
}

func (one *fakeTools) asked() [][]string {
	one.guard.Lock()
	defer one.guard.Unlock()
	return append([][]string{}, one.calls...)
}

// The calls whose words hold the one named. [[spec/design_output/doors#a-fake-behaves]]
func (one *fakeTools) naming(name, word string) int {
	count := 0
	for _, call := range one.asked() {
		if call[0] == name && strings.Contains(strings.Join(call, " "), word) {
			count++
		}
	}
	return count
}

func (one *fakeTools) run(dir, input, name string, argv ...string) (string, error) {
	one.guard.Lock()
	one.calls = append(one.calls, append([]string{name}, argv...))
	one.guard.Unlock()
	switch name {
	case "vale":
		return one.vale(input, argv)
	case "biome":
		return one.biome(argv)
	case "node":
		return one.node(input)
	}
	return "", fmt.Errorf("no tool called %s", name)
}

// The files the words name, each a file or a folder under the root. [[spec/design_output/doors#a-fake-behaves]]
func (one *fakeTools) files(argv []string) map[string]string {
	out := map[string]string{}
	for _, arg := range argv {
		if strings.HasPrefix(arg, "-") {
			continue
		}
		at := filepath.Join(one.root, filepath.FromSlash(arg))
		filepath.WalkDir(at, func(where string, entry fs.DirEntry, err error) error {
			if err != nil {
				return nil
			}
			if entry.IsDir() {
				if entry.Name() == ".se" || entry.Name() == ".git" {
					return filepath.SkipDir
				}
				return nil
			}
			rel, _ := filepath.Rel(one.root, where)
			if isDraft(rel) {
				return nil
			}
			text, _ := os.ReadFile(where)
			out[slashed(rel)] = string(text)
			return nil
		})
	}
	return out
}

func (one *fakeTools) vale(input string, argv []string) (string, error) {
	files := map[string]string{}
	for _, arg := range argv {
		if at, held := strings.CutPrefix(arg, "--path="); held {
			files[at] = input
		}
	}
	if len(files) == 0 {
		for path, text := range one.files(argv) {
			if strings.HasSuffix(path, ".md") {
				files[path] = text
			}
		}
	}
	out := map[string][]map[string]any{}
	for path, text := range files {
		if strings.Contains(text, breaks) {
			return `{"Code":"E100","Text":"a rule breaks\nand more"}`, nil
		}
		for i, line := range strings.Split(text, "\n") {
			if at := strings.Index(line, spooky); at >= 0 {
				out[path] = append(out[path], map[string]any{"Check": "VoiceVale.Spooky", "Line": i + 1, "Span": []int{at + 1, at + len(spooky)}, "Match": spooky, "Message": "Spooky stands here.", "Severity": "warning"})
			}
			if at := strings.Index(line, pastWord); at >= 0 {
				out[path] = append(out[path], map[string]any{"Check": "VoiceParagraph.PastTense", "Line": i + 1, "Span": []int{at + 1, at + len(pastWord)}, "Match": pastWord, "Message": "Write the present tense.", "Severity": "warning"})
			}
		}
	}
	said, err := json.Marshal(out)
	return string(said), err
}

func (one *fakeTools) biome(argv []string) (string, error) {
	found := []map[string]any{}
	paths := []string{}
	for path := range one.files(argv) {
		paths = append(paths, path)
	}
	sort.Strings(paths)
	files := one.files(argv)
	for _, path := range paths {
		if !strings.HasSuffix(path, ".js") {
			continue
		}
		for i, line := range strings.Split(files[path], "\n") {
			if strings.Contains(line, debugged) {
				found = append(found, map[string]any{"severity": "error", "category": "lint/suspicious/noDebugger", "location": map[string]any{"path": strings.ReplaceAll(path, "/", "\\"), "start": map[string]int{"line": i + 1}}, "message": "This is an unexpected use of the debugger statement."})
			}
		}
	}
	said, err := json.Marshal(map[string]any{"diagnostics": found})
	return string(said), err
}

func (one *fakeTools) node(input string) (string, error) {
	var said struct {
		Asks []struct {
			Line string `json:"line"`
		} `json:"asks"`
	}
	if err := json.Unmarshal([]byte(input), &said); err != nil {
		return "", err
	}
	past := []bool{}
	for _, ask := range said.Asks {
		past = append(past, !strings.Contains(ask.Line, vetoed))
	}
	out, err := json.Marshal(past)
	return string(out), err
}

// Waits until the panel stands settled, so a case reads what the runs land. [[spec/design_output/lsp#a-port-serves-the-list]]
func settles(t *testing.T, one *server) {
	t.Helper()
	until := time.Now().Add(5 * time.Second)
	for time.Now().Before(until) {
		one.guard.Lock()
		quiet := !one.panel.running && !one.panel.whole && len(one.panel.owed) == 0 && len(one.panel.pending) == 0
		one.guard.Unlock()
		if quiet {
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatal("the runs land nowhere inside the span")
}

// The rows the tools drew on a path, under the guard. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func extraOn(one *server, path string) []Finding {
	one.guard.Lock()
	defer one.guard.Unlock()
	return append([]Finding{}, one.panel.extra[path]...)
}
