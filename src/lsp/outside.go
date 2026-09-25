// The rules this server reads through a tool of the box: Vale over the prose
// and the comments, Biome over the code. Each runs the way the lint runs it,
// so the panel, the port and the check read one list.
// [[spec/design_output/lsp#the-server-runs-the-tools]]
package main

import (
	"encoding/json"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"time"
)

// The names the lint spells in src/bridge/findings.js and .claude/skills/level0/lib/code.js, spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	valeSkips   = "--glob=!{{.se,node_modules,.git,.claude/types,.claude/worktrees}/**,**/_*}"
	biomeConfig = "spec/config"
	valeOwn     = ".vale.ini"
	valeBuilt   = ".se/vale/.vale.ini"
	tenseAt     = "src/engine/tense.js"
	pastRule    = "PastTense"
	// The rule a Vale answering a fault draws, so a broken rule stands in the panel. [[spec/design_output/lsp#the-server-runs-the-tools]]
	ValeRuns  = "ValeRuns"
	fromVale  = "vale"
	fromBiome = "biome"
	fromTree  = "tree"
	// The paths one run hands a tool, past which the run sweeps the whole tree, because a command line holds only so much. [[spec/design_output/lsp#the-panel-follows-the-index]]
	mostPaths = 200
	// The longest a tool runs before the server gives up on it. [[spec/design_output/lsp#the-server-runs-the-tools]]
	toolWait = 3 * time.Minute
	// The tense reader, asked over each past tense row. It reads its module and its rows off the input, so the call names nothing of the box. [[spec/design_output/lsp#the-server-runs-the-tools]]
	tenseScript = `let s="";process.stdin.on("data",(d)=>{s+=d});process.stdin.on("end",async()=>{const a=JSON.parse(s);const t=await import(a.module);process.stdout.write(JSON.stringify(a.asks.map((x)=>t.readsAsPast(x.line,x.word))))});`
)

// The files the tools read beside the tree, so a change to one runs them over the whole tree again. A name closing on a slash names a folder. [[spec/design_output/lsp#the-panel-follows-the-index]]
var toolInputs = []string{valeOwn, "spec/config/styles/", "spec/config/biome.json", "spec/config/level0.json", tenseAt}

var (
	valeCode  = regexp.MustCompile(`^E\d+$`)
	proseKind = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)
)

// A tool run: the folder, the input, the binary and its words. The door runs one, and a case hands in its own. [[spec/design_output/lsp#the-server-runs-the-tools]]
type runner func(dir, input, name string, argv ...string) (string, error)

// The tools a run takes, where the box holds them, and the ceilings the code faults read. [[spec/design_output/lsp#the-server-runs-the-tools]]
type Outside struct {
	Root   string
	Vale   string
	Biome  string
	Node   string
	Config string
	// The tense reader's module as a file address, or nothing where the tree holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
	Tense    string
	Function int
	File     int
	run      runner
	// Whether a whole sweep reads the tools and the ceilings again, which the binary does and a case does not. [[spec/design_output/lsp#the-panel-follows-the-index]]
	fresh bool
}

// The tools the box names in its survey, else the runtime binary folder. [[spec/design_output/lsp#the-server-runs-the-tools]]
func outsideAt(root string) *Outside {
	one := &Outside{Root: root, run: runsIn, fresh: true}
	one.reads()
	return one
}

// [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) reads() {
	known := toolsIn(surveyHere(one.Root))
	one.Vale = toolAt(one.Root, known, "vale")
	one.Biome = toolAt(one.Root, known, "biome")
	one.Node = toolAt(one.Root, known, "node")
	if one.Node == "" {
		one.Node = "node"
	}
	one.Config = valeOwn
	if !standsAt(filepath.Join(one.Root, valeOwn)) && standsAt(filepath.Join(one.Root, filepath.FromSlash(valeBuilt))) {
		one.Config = valeBuilt
	}
	one.Tense = ""
	if module := filepath.Join(one.Root, filepath.FromSlash(tenseAt)); standsAt(module) {
		one.Tense = uriOf(module)
	}
	one.Function = countAt(one.Root, "code.functionLines")
	one.File = countAt(one.Root, "code.fileLines")
}

// [[spec/design_output/tools#what-the-survey-writes]]
func toolsIn(survey string) map[string]string {
	var said map[string]struct {
		Path string `json:"path"`
	}
	out := map[string]string{}
	if json.Unmarshal([]byte(survey), &said) != nil {
		return out
	}
	for name, one := range said {
		out[name] = one.Path
	}
	return out
}

// The path the survey names where a file stands there, else the one in the runtime binary folder, else nothing. [[spec/design_output/lsp#the-server-runs-the-tools]]
func toolAt(root string, known map[string]string, name string) string {
	if said := known[name]; said != "" && standsAt(said) {
		return said
	}
	guess := filepath.Join(root, filepath.FromSlash(Bin), name)
	if runtime.GOOS == "windows" {
		guess += ".exe"
	}
	if standsAt(guess) {
		return guess
	}
	return ""
}

// Every row the tools answer over the whole tree. A buffer an editor holds reads as it stands. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) Sweep(tree *Tree) []Finding {
	if one.fresh {
		one.reads()
	}
	held := kept(tree.Buffers())
	out := []Finding{}
	for _, said := range one.vale(tree, []string{"."}, nil) {
		if said.Rule == ValeRuns || !listed(held, said.File) {
			out = append(out, said)
		}
	}
	if len(held) > 0 {
		out = append(out, one.vale(tree, nil, held)...)
	}
	for _, path := range tree.Paths() {
		out = append(out, one.textFaults(tree, path)...)
	}
	out = append(out, one.biome([]string{"."})...)
	return onTheTree(tree, out)
}

// The rows the tools answer over the paths named, each a file or a folder. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) Over(tree *Tree, paths []string) []Finding {
	disk, held, every := []string{}, []string{}, []string{}
	for _, path := range paths {
		at := relativeTo(tree.Root, path)
		if parked(at) {
			continue
		}
		every = append(every, at)
		if tree.Held(at) {
			held = append(held, at)
			continue
		}
		disk = append(disk, at)
	}
	out := one.vale(tree, disk, held)
	for _, path := range pathsUnder(tree, every) {
		out = append(out, one.textFaults(tree, relativeTo(tree.Root, path))...)
	}
	out = append(out, one.biome(every)...)
	return onTheTree(tree, out)
}

// The paths no rule reads: a draft, and a folder the lint's Vale skips. [[spec/design_output/lsp#the-server-runs-the-tools]]
func parked(path string) bool {
	if isDraft(path) {
		return true
	}
	for _, folder := range []string{".se", "node_modules", ".git", ".claude/types", ".claude/worktrees"} {
		if path == folder || strings.HasPrefix(path, folder+"/") {
			return true
		}
	}
	return false
}

func kept(paths []string) []string {
	out := []string{}
	for _, path := range paths {
		if !parked(path) {
			out = append(out, path)
		}
	}
	return out
}

// A row on a file the tree holds nowhere goes, so the panel and the port name the files the index names. [[spec/design_output/lsp#the-server-runs-the-tools]]
func onTheTree(tree *Tree, found []Finding) []Finding {
	out := []Finding{}
	for _, said := range found {
		if said.Rule == ValeRuns {
			out = append(out, said)
			continue
		}
		if isDraft(said.File) || (!tree.Held(said.File) && !tree.Exists(said.File)) {
			continue
		}
		out = append(out, said)
	}
	return out
}

// A Vale row, and the words it matched, which the tense reader weighs. [[spec/design_output/lsp#the-server-runs-the-tools]]
type valeHeard struct {
	Finding
	said string
}

// Vale over the paths the disk holds and the buffers an editor holds, each row past the tense reader. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) vale(tree *Tree, disk, held []string) []Finding {
	if len(disk)+len(held) == 0 {
		return nil
	}
	if one.Vale == "" {
		return []Finding{one.valeFault("Vale stands nowhere here. Run ./RUNME.sh once, and it installs.")}
	}
	base := []string{"--config=" + one.Config, "--output=JSON", "--no-exit"}
	heard := []valeHeard{}
	if len(disk) > 0 {
		argv := append(append(append([]string{}, base...), valeSkips), disk...)
		said, fault := one.valeRun("", argv)
		if fault != "" {
			return []Finding{one.valeFault(fault)}
		}
		heard = append(heard, said...)
	}
	for _, path := range held {
		argv := append(append([]string{}, base...), "--path="+filepath.Join(one.Root, filepath.FromSlash(path)))
		said, fault := one.valeRun(tree.Read(path), argv)
		if fault != "" {
			return []Finding{one.valeFault(fault)}
		}
		for i := range said {
			said[i].File = path
		}
		heard = append(heard, said...)
	}
	return one.vetoes(tree, heard)
}

func (one *Outside) valeRun(input string, argv []string) ([]valeHeard, string) {
	out, err := one.run(one.Root, input, one.Vale, argv...)
	if err != nil {
		return nil, err.Error()
	}
	return valeRowsOf(one.Root, out)
}

func (one *Outside) valeFault(why string) Finding {
	return Finding{File: one.Config, Rule: ValeRuns, Line: 1, Column: 1, Message: "Vale reads no file, so every rule it holds stands unchecked: " + why, Severity: SeverityError, Source: fromVale}
}

// Vale's answer as rows, or the fault it names in place of rows. The shape follows fromJson and faultIn in .claude/skills/level0/lib/vale.js. [[spec/design_output/lsp#the-server-runs-the-tools]]
func valeRowsOf(root, stdout string) ([]valeHeard, string) {
	if strings.TrimSpace(stdout) == "" {
		return nil, ""
	}
	var fault struct {
		Code string `json:"Code"`
		Text string `json:"Text"`
	}
	if json.Unmarshal([]byte(stdout), &fault) == nil && valeCode.MatchString(fault.Code) {
		first, _, _ := strings.Cut(fault.Text, "\n")
		return nil, strings.TrimSpace(fault.Code + " " + strings.TrimSpace(first))
	}
	var read map[string]json.RawMessage
	if json.Unmarshal([]byte(stdout), &read) != nil {
		return nil, "vale answered something other than JSON"
	}
	out := []valeHeard{}
	for file, raw := range read {
		var rows []struct {
			Check    string `json:"Check"`
			Line     int    `json:"Line"`
			Span     []int  `json:"Span"`
			Match    string `json:"Match"`
			Message  string `json:"Message"`
			Severity string `json:"Severity"`
		}
		if json.Unmarshal(raw, &rows) != nil {
			continue
		}
		path := strings.TrimPrefix(relativeTo(root, slashed(file)), "./")
		for _, row := range rows {
			said := Finding{File: path, Rule: proseKind.ReplaceAllString(row.Check, ""), Line: row.Line, Column: 1, Message: row.Message, Severity: row.Severity, Source: fromVale}
			if said.Line == 0 {
				said.Line = 1
			}
			if len(row.Span) > 0 {
				said.Column = row.Span[0]
			}
			if said.Severity == "" {
				said.Severity = SeverityError
			}
			out = append(out, valeHeard{Finding: said, said: row.Match})
		}
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].File != out[b].File {
			return out[a].File < out[b].File
		}
		if out[a].Line != out[b].Line {
			return out[a].Line < out[b].Line
		}
		return out[a].Column < out[b].Column
	})
	return out, ""
}

// A past tense row stands where the tense reader reads the word as the past, the veto withoutFalsePast holds in src/engine/tense.js. [[spec/design_output/level0#the-tense-reader]]
func (one *Outside) vetoes(tree *Tree, heard []valeHeard) []Finding {
	asks := []map[string]string{}
	texts := map[string][]string{}
	for _, row := range heard {
		if !strings.HasSuffix(row.Rule, pastRule) {
			continue
		}
		if _, read := texts[row.File]; !read {
			texts[row.File] = strings.Split(tree.Read(row.File), "\n")
		}
		line := ""
		if lines := texts[row.File]; row.Line >= 1 && row.Line <= len(lines) {
			line = lines[row.Line-1]
		}
		asks = append(asks, map[string]string{"line": line, "word": row.said})
	}
	past := one.pastReads(asks)
	out := []Finding{}
	asked := 0
	for _, row := range heard {
		if strings.HasSuffix(row.Rule, pastRule) {
			keeps := past == nil || past[asked]
			asked++
			if !keeps {
				continue
			}
		}
		out = append(out, row.Finding)
	}
	return out
}

// The tense reader's verdict on each ask, or nothing where no node or no reader answers, so every row stands. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) pastReads(asks []map[string]string) []bool {
	if len(asks) == 0 || one.Tense == "" || one.Node == "" {
		return nil
	}
	input, err := json.Marshal(map[string]any{"module": one.Tense, "asks": asks})
	if err != nil {
		return nil
	}
	out, err := one.run(one.Root, string(input), one.Node, "-e", tenseScript)
	if err != nil {
		return nil
	}
	var past []bool
	if json.Unmarshal([]byte(out), &past) != nil || len(past) != len(asks) {
		return nil
	}
	return past
}

// Biome over the paths named, as the lint runs it. A box carrying no Biome draws no Biome row. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) biome(where []string) []Finding {
	if one.Biome == "" || len(where) == 0 {
		return nil
	}
	argv := append([]string{"lint", "--config-path=" + biomeConfig, "--reporter=json", "--max-diagnostics=none"}, where...)
	out, err := one.run(one.Root, "", one.Biome, argv...)
	if err != nil {
		return nil
	}
	return biomeRowsOf(one.Root, out, where[0])
}

// Biome's answer as rows, the way fromJson in .claude/skills/level0/lib/code.js reads it. [[spec/design_output/lsp#the-server-runs-the-tools]]
func biomeRowsOf(root, stdout, where string) []Finding {
	var read struct {
		Diagnostics []struct {
			Severity string `json:"severity"`
			Category string `json:"category"`
			Location struct {
				Path  any `json:"path"`
				Start *struct {
					Line int `json:"line"`
				} `json:"start"`
				Span       []int  `json:"span"`
				SourceCode string `json:"sourceCode"`
			} `json:"location"`
			Description any `json:"description"`
			Message     any `json:"message"`
		} `json:"diagnostics"`
	}
	out := []Finding{}
	if json.Unmarshal([]byte(stdout), &read) != nil {
		return out
	}
	for _, row := range read.Diagnostics {
		if row.Severity == "information" {
			continue
		}
		file := where
		switch path := row.Location.Path.(type) {
		case string:
			file = path
		case map[string]any:
			if named, ok := path["file"].(string); ok {
				file = named
			}
		}
		line := 1
		if row.Location.Start != nil && row.Location.Start.Line > 0 {
			line = row.Location.Start.Line
		} else if len(row.Location.Span) > 0 && row.Location.Span[0] <= len(row.Location.SourceCode) {
			line = strings.Count(row.Location.SourceCode[:row.Location.Span[0]], "\n") + 1
		}
		message := textOf(row.Description)
		if message == "" {
			message = textOf(row.Message)
		}
		severity := SeverityError
		if row.Severity == SeverityWarning {
			severity = SeverityWarning
		}
		rule := strings.TrimPrefix(row.Category, "lint/")
		if row.Category == "" {
			rule = "biome"
		}
		path := strings.TrimPrefix(relativeTo(root, slashed(file)), "./")
		out = append(out, Finding{File: path, Rule: rule, Line: line, Column: 1, Message: message, Severity: severity, Source: fromBiome})
	}
	return out
}

// A message Biome writes as a string, a list of parts, or a part carrying its content. [[spec/design_output/lsp#the-server-runs-the-tools]]
func textOf(said any) string {
	switch one := said.(type) {
	case string:
		return one
	case []any:
		parts := []string{}
		for _, part := range one {
			parts = append(parts, textOf(part))
		}
		return strings.Join(parts, "")
	case map[string]any:
		if content, held := one["content"]; held && content != nil {
			return textOf(content)
		}
		return textOf(one["text"])
	}
	return ""
}

// Whether a path the index moves is one the tools read beside the tree. [[spec/design_output/lsp#the-panel-follows-the-index]]
func readByTools(paths []string) bool {
	for _, path := range paths {
		for _, input := range toolInputs {
			if path == input || (strings.HasSuffix(input, "/") && strings.HasPrefix(path, input)) {
				return true
			}
		}
	}
	return false
}
