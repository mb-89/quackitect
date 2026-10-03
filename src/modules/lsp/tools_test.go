// The tool rows the lsp IO module publishes beside the sweep: Vale, Biome and
// the code faults, each under its own source, off a runner a case hands in.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"errors"
	"maps"
	"regexp"
	"slices"
	"strings"
	"sync"
	"testing"
)

// What a fake binary answers: its stdout by the binary's name, and the calls it takes. [[spec/tickets/lsp-module-draws-the-tools]]
type fakeTools struct {
	mu    sync.Mutex
	says  map[string]string
	fails map[string]error
	calls []string
}

func (one *fakeTools) run(dir, input, name string, argv ...string) (string, error) {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.calls = append(one.calls, name+" "+strings.Join(argv, " "))
	if err := one.fails[name]; err != nil {
		return "", err
	}
	return one.says[name], nil
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
	ValeIni:  ".vale.ini",
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
	store, as := catalogOf(t)
	tools := &Tools{Root: "/tree", Vale: "vale", Biome: "biome", Config: ".vale.ini", Run: fake.run, Check: fakeCheck}
	server := New(Outside{
		Root: "/tree", Store: store, As: as, Bound: func(local string) string { return local },
		Sweep: func() any { return []Finding{} },
		Tools: tools, Files: func() map[string]string { return files },
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

// Vale's answer naming one row of the rule on spec/a.md, as its JSON reporter writes it. [[spec/tickets/lsp-module-draws-the-tools]]
func valeSays(file, check, match string) string {
	return `{"` + file + `": [{"Check": "` + check + `", "Line": 2, "Span": [1, 4], "Match": "` + match + `", "Message": "A rule speaks.", "Severity": "warning"}]}`
}

func TestAValeRowPublishesUnderItsSource(t *testing.T) {
	fake := &fakeTools{says: map[string]string{"vale": valeSays("/tree/spec/a.md", "VoiceVale.Sentence", "Some")}}
	server, pushed := toolsOver(t, map[string]string{"spec/a.md": "# A\n\nSome text\n"}, fake)
	server.Handle(opened("file:///tree/spec/a.md", "# A\nSome text\n"))
	server.Settle()
	if drawn := drawnOn(*pushed, "file:///tree/spec/a.md"); !holds(drawn, "vale", "Sentence") {
		t.Fatalf("the open file draws %+v, and wants the Vale row under the source vale", drawn)
	}
}

func TestABiomeRowPublishesUnderItsSource(t *testing.T) {
	biome := `{"diagnostics": [{"severity": "error", "category": "lint/style/useConst", "location": {"path": {"file": "src/a.js"}, "start": {"line": 1}}, "description": "Use const."}]}`
	fake := &fakeTools{says: map[string]string{"vale": "{}", "biome": biome}}
	server, _ := toolsOver(t, map[string]string{"src/a.js": "let a = 0;\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/src/a.js"); !holds(drawn, "biome", "style/useConst") {
		t.Fatalf("src/a.js draws %+v, and wants the Biome row under the source biome", drawn)
	}
}

func TestACodeFaultPublishesUnderTree(t *testing.T) {
	fake := &fakeTools{says: map[string]string{"vale": "{}"}}
	server, _ := toolsOver(t, map[string]string{"spec/a.md": "# A\n\n<!-- vale " + "Voice.Sentence = NO -->\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/spec/a.md"); !holds(drawn, "tree", "ExemptionCarriesAReason") {
		t.Fatalf("spec/a.md draws %+v, and wants the unreasoned marker under the source tree", drawn)
	}
}

func TestAClosedFileDrawsItsRowsAtTheListen(t *testing.T) {
	fake := &fakeTools{says: map[string]string{"vale": valeSays("/tree/spec/b.md", "VoiceVale.Sentence", "Some")}}
	server, _ := toolsOver(t, map[string]string{"spec/b.md": "# B\n\nSome text\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/spec/b.md"); !holds(drawn, "vale", "Sentence") {
		t.Fatalf("the closed file draws %+v, and wants its Vale row off the whole run", drawn)
	}
}

func TestTheTenseReaderDropsAPastRow(t *testing.T) {
	fake := &fakeTools{says: map[string]string{"vale": valeSays("/tree/spec/b.md", "VoiceVale.PastTense", "read")}}
	server, _ := toolsOver(t, map[string]string{"spec/b.md": "# B\nWe read it\n"}, fake)
	bodies := server.SweepTools()
	if drawn := drawnOn(bodies, "file:///tree/spec/b.md"); holds(drawn, "vale", "PastTense") {
		t.Fatalf("the file draws %+v, and the tense reader reads the word as no past", drawn)
	}
	for _, call := range fake.calls {
		if strings.HasPrefix(call, "node ") {
			t.Fatalf("the runs %q ask node, and the tense reader runs in Go", fake.calls)
		}
	}
}

func TestAValeFaultDrawsValeRuns(t *testing.T) {
	fake := &fakeTools{fails: map[string]error{"vale": errors.New("E100 the config breaks")}}
	server, _ := toolsOver(t, map[string]string{"spec/b.md": "# B\n"}, fake)
	if drawn := drawnOn(server.SweepTools(), "file:///tree/.vale.ini"); !holds(drawn, "vale", "ValeRuns") {
		t.Fatalf("the config draws %+v, and wants ValeRuns in Vale's own words", drawn)
	}
}
