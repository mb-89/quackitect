// The tool rows the lsp IO module publishes beside the sweep: the Go rules,
// Biome and the code faults, each under its own source, off a runner a case
// hands in.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"maps"
	"regexp"
	"slices"
	"strings"
	"sync"
	"testing"

	"quackitect/src/proc"
	"quackitect/src/q/qtest"
)

// The fake process door taught biome, and the commands it takes. [[spec/design_output/doors#the-process-door]]
type fakeTools struct {
	proc.FakeRunner
	mu   sync.Mutex
	took []proc.Command
}

// The fake whose biome answers its stdout off says, or a fault off fails with no output. [[spec/design_output/doors#the-process-door]]
func taughtTools(says, fails map[string]string) *fakeTools {
	fake := &fakeTools{}
	answers := func(name string) proc.Program {
		return func(one proc.Command) proc.Said {
			fake.mu.Lock()
			defer fake.mu.Unlock()
			fake.took = append(fake.took, one)
			if why := fails[name]; why != "" {
				return proc.Said{Err: why, Code: 1}
			}
			return proc.Said{Out: says[name]}
		}
	}
	fake.Programs = map[string]proc.Program{"biome": answers("biome")}
	return fake
}

// The commands the fake took. [[spec/design_output/doors#the-process-door]]
func (fake *fakeTools) ran() []proc.Command {
	fake.mu.Lock()
	defer fake.mu.Unlock()
	return slices.Clone(fake.took)
}

// Each command the fake took, as one line. [[spec/design_output/doors#the-process-door]]
func (fake *fakeTools) calls() []string {
	out := []string{}
	for _, one := range fake.ran() {
		out = append(out, strings.Join(one.Argv, " "))
	}
	return out
}

// A tree over the texts git tracks, each buffer an editor holds over its file. [[spec/tickets/lsp-module-draws-the-tools]]
type fakeTree struct {
	texts map[string]string
	held  map[string]string
}

func (one *fakeTree) Holds(path, text string) { one.held[path] = text }

func (one *fakeTree) Held(path string) bool {
	_, ok := one.held[path]
	return ok
}

func (one *fakeTree) Buffers() []string { return sortedKeys(one.held) }

func (one *fakeTree) Read(path string) string {
	if text, ok := one.held[path]; ok {
		return text
	}
	return one.texts[path]
}

func (one *fakeTree) Exists(path string) bool {
	_, ok := one.texts[path]
	return ok
}

func (one *fakeTree) Paths() []string {
	every := map[string]string{}
	maps.Copy(every, one.texts)
	maps.Copy(every, one.held)
	return sortedKeys(every)
}

func sortedKeys(texts map[string]string) []string {
	return slices.Sorted(maps.Keys(texts))
}

// The check module's rules as a case stands them in: a marker naming no reason draws its fault, and no path is a draft. [[spec/tickets/lsp-module-draws-the-tools]]
var fakeCheck = Check{
	Tree: func(texts map[string]string) Tree { return &fakeTree{texts: texts, held: map[string]string{}} },
	Faults: func(tree Tree, path string, function, file int, source string) []Finding {
		if !strings.Contains(tree.Read(path), "= NO -->") {
			return nil
		}
		return []Finding{{File: path, Rule: "ExemptionCarriesAReason", Line: 3, Column: 1, Message: "The marker names no reason.", Severity: severe, Source: source}}
	},
	Draft:    func(string) bool { return false },
	Relative: func(root, path string) string { return strings.TrimPrefix(path, root+"/") },
	Hover:    fakeHover,
	Complete: fakeComplete,
	Links:    fakeLinks,
	Folds:    fakeFolds,
}

var (
	fakeTerm    = regexp.MustCompile(`\{word: ([a-z ]+), means: "([^"]*)"\}`)
	fakeWord    = regexp.MustCompile(`[A-Za-z]+`)
	fakePointer = regexp.MustCompile(`\[\[([^\]#]+)\]\]`)
	fakeKind    = regexp.MustCompile(`^spec/schemas/([a-z]+)\.schema\.yaml$`)
)

// The dictionary's line for the word under the cursor, an ending s cut, off the terms file the tree holds. [[spec/tickets/lsp-module-serves-the-features]]
func fakeHover(tree Tree, path string, line, character int) any {
	rows := strings.Split(tree.Read(path), "\n")
	if line < 0 || line >= len(rows) {
		return nil
	}
	for _, at := range fakeWord.FindAllStringIndex(rows[line], -1) {
		if character < at[0] || character >= at[1] {
			continue
		}
		word := strings.ToLower(rows[line][at[0]:at[1]])
		for _, term := range fakeTerm.FindAllStringSubmatch(tree.Read("spec/vocabulary/terms.yml"), -1) {
			if word == term[1] || strings.TrimSuffix(word, "s") == term[1] {
				return map[string]any{"contents": map[string]any{"kind": "markdown", "value": "**" + term[1] + "**: " + term[2]}}
			}
		}
	}
	return nil
}

// A bare note offers every kind a schema the tree holds names. [[spec/tickets/lsp-module-serves-the-features]]
func fakeComplete(tree Tree, path string, line, character int) any {
	out := []map[string]any{}
	if strings.TrimSpace(tree.Read(path)) != "" {
		return out
	}
	for _, at := range tree.Paths() {
		if kind := fakeKind.FindStringSubmatch(at); kind != nil {
			out = append(out, map[string]any{"label": "kind: [[" + kind[1] + "]]"})
		}
	}
	return out
}

// Every pointer landing on a note the tree holds, opening that note. [[spec/tickets/lsp-module-serves-the-features]]
func fakeLinks(tree Tree, path string, line, character int) any {
	out := []map[string]any{}
	for _, pointer := range fakePointer.FindAllStringSubmatch(tree.Read(path), -1) {
		if tree.Exists(pointer[1] + ".md") {
			out = append(out, map[string]any{"target": "file:///tree/" + pointer[1] + ".md"})
		}
	}
	return out
}

// The frontmatter from its opening fence to its closing one. [[spec/tickets/lsp-module-serves-the-features]]
func fakeFolds(tree Tree, path string, line, character int) any {
	rows := strings.Split(tree.Read(path), "\n")
	out := []map[string]any{}
	if len(rows) == 0 || rows[0] != "---" {
		return out
	}
	for at := 1; at < len(rows); at++ {
		if rows[at] == "---" {
			return append(out, map[string]any{"startLine": 0, "endLine": at, "kind": "region"})
		}
	}
	return out
}

// A server over the files named, whose sweep answers nothing, running the fake tools with no quiet span. [[spec/tickets/lsp-module-draws-the-tools]]
func toolsOver(t *testing.T, files map[string]string, fake *fakeTools) (*Server, *[][]byte) {
	t.Helper()
	return toolsServer(t, files, &Tools{Root: "/tree", Biome: "biome", Run: fake.Run, Check: fakeCheck})
}

// A server over the files named, whose sweep answers nothing, running the tools handed in. [[spec/tickets/lsp-tools-take-the-runner]]
func toolsServer(t *testing.T, files map[string]string, tools *Tools) (*Server, *[][]byte) {
	t.Helper()
	store, as := catalogOf(t)
	server := New(Outside{
		Root: "/tree", Store: store, As: as, Bound: func(local string) string { return local },
		Sweep: func() any { return []Finding{} },
		Tools: tools, Files: func() map[string]string { return files }, Clock: qtest.Wall(),
	})
	var (
		mu     sync.Mutex
		pushed [][]byte
	)
	server.Pushes(func(bodies ...[]byte) {
		mu.Lock()
		defer mu.Unlock()
		pushed = append(pushed, bodies...)
	})
	return server, &pushed
}

// The diagnostics every publish names for the URI, the last publish winning. [[spec/tickets/lsp-module-draws-the-tools]]
func drawnOn(bodies [][]byte, uri string) []diagnostic {
	var out []diagnostic
	for _, body := range bodies {
		var one struct {
			Method string `json:"method"`
			Params struct {
				URI         string       `json:"uri"`
				Diagnostics []diagnostic `json:"diagnostics"`
			} `json:"params"`
		}
		if json.Unmarshal(body, &one) == nil && one.Method == publish && one.Params.URI == uri {
			out = one.Params.Diagnostics
		}
	}
	return out
}

func holds(drawn []diagnostic, source, code string) bool {
	for _, one := range drawn {
		if one.Source == source && one.Code == code {
			return true
		}
	}
	return false
}

// The tools draw the Go rules, an open buffer and a closed file alike. [[spec/tickets/vale-leaves-the-tree]]
func TestTheGoRulesDrawTheirRows(t *testing.T) {
	fake := taughtTools(map[string]string{"biome": "{}"}, nil)
	server, pushed := toolsOver(t, map[string]string{"spec/a.md": "# A\n\nSome text\n", "spec/b.md": "# B\n\nSome text\n"}, fake)
	server.from.Tools.Rules = func(path, text string) []Finding {
		if !strings.Contains(text, "Some") {
			return nil
		}
		return []Finding{{Rule: "Sentence", Line: 2, Column: 1, Message: "A rule speaks.", Severity: "warning"}}
	}
	server.Handle(opened("file:///tree/spec/a.md", "# A\nSome text\n"))
	server.Settle()
	if drawn := drawnOn(*pushed, "file:///tree/spec/a.md"); !holds(drawn, "rules", "Sentence") {
		t.Fatalf("the open file draws %+v, and wants the Go rules' row under the source rules", drawn)
	}
	if drawn := drawnOn(server.SweepTools(), "file:///tree/spec/b.md"); !holds(drawn, "rules", "Sentence") {
		t.Fatalf("the closed file draws %+v, and wants the Go rules' row off the whole run", drawn)
	}
	for _, call := range fake.calls() {
		if strings.HasPrefix(call, "vale ") {
			t.Fatalf("the runs %q ask vale, and the rules run in Go", fake.calls())
		}
	}
}

func TestABiomeRowPublishesUnderItsSource(t *testing.T) {
	biome := `{"diagnostics": [{"severity": "error", "category": "lint/style/useConst", "location": {"path": {"file": "src/a.js"}, "start": {"line": 1}}, "description": "Use const."}]}`
	fake := taughtTools(map[string]string{"biome": biome}, nil)
	server, _ := toolsOver(t, map[string]string{"src/a.js": "let a = 0;\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/src/a.js"); !holds(drawn, "biome", "style/useConst") {
		t.Fatalf("src/a.js draws %+v, and wants the Biome row under the source biome", drawn)
	}
}

func TestACodeFaultPublishesUnderTree(t *testing.T) {
	fake := taughtTools(nil, nil)
	server, _ := toolsOver(t, map[string]string{"spec/a.md": "# A\n\n<!-- vale " + "Voice.Sentence = NO -->\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/spec/a.md"); !holds(drawn, "tree", "ExemptionCarriesAReason") {
		t.Fatalf("spec/a.md draws %+v, and wants the unreasoned marker under the source tree", drawn)
	}
}

// Biome runs through the process door in the root, with no input and the tools' wait. [[spec/tickets/lsp-tools-take-the-runner]]
func TestTheToolsRunThroughTheProcessDoorWithTheirWait(t *testing.T) {
	fake := taughtTools(map[string]string{"biome": `{"diagnostics": []}`}, nil)
	server, _ := toolsOver(t, map[string]string{"spec/a.md": "# A\n", "src/a.js": "let a = 0;\n"}, fake)
	server.Handle(opened("file:///tree/spec/a.md", "# A\nSome text\n"))
	server.Settle()
	server.SweepTools()
	seen := map[string]bool{}
	for _, one := range fake.ran() {
		seen[one.Argv[0]] = true
		if one.Dir != "/tree" || one.Stdin != "" || one.Wait != toolWait {
			t.Errorf("the run %q carries Dir %q, Stdin %q and Wait %v, and wants /tree, no input and %v", one.Argv, one.Dir, one.Stdin, one.Wait, toolWait)
		}
	}
	if !seen["biome"] || len(seen) != 1 {
		t.Fatalf("the door runs %+v, and wants biome alone", fake.ran())
	}
}

// A rules load that fails draws RulesLoad, so a broken rule stands in the panel. [[spec/tickets/vale-leaves-the-tree]]
func TestAFailedRulesLoadDrawsRulesLoad(t *testing.T) {
	fake := taughtTools(nil, nil)
	server, _ := toolsOver(t, map[string]string{"spec/b.md": "# B\n"}, fake)
	server.from.Tools.Rules = func(path, text string) []Finding {
		return []Finding{{Rule: RulesLoad, Line: 1, Column: 1, Message: "The rules load nothing.", Severity: severe}}
	}
	if drawn := drawnOn(server.SweepTools(), "file:///tree/spec/b.md"); !holds(drawn, "rules", RulesLoad) {
		t.Fatalf("the file draws %+v, and wants RulesLoad under the source rules", drawn)
	}
}
