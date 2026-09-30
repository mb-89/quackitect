// The tools the lsp IO module runs beside the check module's sweep: Vale over
// the prose, Biome over the code, and the code faults, each row under its own
// source, the way the lint runs them.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"quackitect/src/modules/check"
)

// The names the lint spells in src/bridge/findings.js and .claude/skills/level0/lib/code.js, spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	valeSkips   = "--glob=!{{.se,node_modules,.git,.claude/types,.claude/worktrees}/**,**/_*}"
	biomeConfig = "spec/config"
	pastRule    = "PastTense"
	// The rule a Vale answering a fault draws, so a broken rule stands in the panel. [[spec/design_output/lsp#the-server-runs-the-tools]]
	ValeRuns  = "ValeRuns"
	fromVale  = "vale"
	fromBiome = "biome"
	fromTree  = "tree"
	// The tense reader, asked over each past tense row. It reads its module and its rows off the input, so the call names nothing of the box. [[spec/design_output/lsp#the-server-runs-the-tools]]
	tenseScript = `let s="";process.stdin.on("data",(d)=>{s+=d});process.stdin.on("end",async()=>{const a=JSON.parse(s);const t=await import(a.module);process.stdout.write(JSON.stringify(a.asks.map((x)=>t.readsAsPast(x.line,x.word))))});`
)

// The files the tools read beside the tree, so a change to one runs them over the whole tree again. A name closing on a slash names a folder. [[spec/design_output/lsp#the-panel-follows-the-index]]
var toolInputs = []string{check.ValeIni, "spec/config/styles/", "spec/config/biome.json", "spec/config/level0.json", "src/engine/tense.js"}

// The folders Vale skips, as PARKED in src/bridge/findings.js names them. [[spec/design_output/lsp#the-server-runs-the-tools]]
var parkedFolders = []string{".se", "node_modules", ".git", ".claude/types", ".claude/worktrees"}

var (
	valeCode  = regexp.MustCompile(`^E\d+$`)
	proseKind = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)
)

// A tool run: the folder, the input, the binary and its words. The door runs one, and a case hands in its own. [[spec/tickets/lsp-module-draws-the-tools]]
type Runner func(dir, input, name string, argv ...string) (string, error)

// The tools a run takes, where the box holds them, and the ceilings the code faults read. [[spec/tickets/lsp-module-draws-the-tools]]
type Tools struct {
	Root   string
	Vale   string
	Biome  string
	Node   string
	Config string
	// The tense reader's module as a file address, or nothing where the tree holds none. [[spec/tickets/lsp-module-draws-the-tools]]
	Tense    string
	Function int
	File     int
	Run      Runner
	// Reads the tools and the ceilings again before a whole run, which the door does and a case does not. [[spec/design_output/lsp#the-panel-follows-the-index]]
	Again func(*Tools)
}

// Every row the tools answer over the whole tree. A buffer an editor holds reads as it stands. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) Sweep(tree *check.Tree) []Finding {
	if one.Again != nil {
		one.Again(one)
	}
	held := kept(tree.Buffers())
	out := []Finding{}
	for _, said := range one.vale(tree, []string{"."}, nil) {
		if said.Rule == ValeRuns || !check.Listed(held, said.File) {
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

// The rows the tools answer over the paths named, each a file the tree holds. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) Over(tree *check.Tree, paths []string) []Finding {
	disk, held, every := []string{}, []string{}, []string{}
	for _, at := range paths {
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
	for _, at := range every {
		out = append(out, one.textFaults(tree, at)...)
	}
	// An open file's Biome rows stand with the Biome extension, which draws them while a person types. [[spec/design_output/lsp#the-panel-reads-the-battery]]
	out = append(out, one.biome(disk)...)
	return onTheTree(tree, out)
}

// The code faults and the exemption markers over one file, under the source tree. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) textFaults(tree *check.Tree, path string) []Finding {
	out := []Finding{}
	for _, said := range check.TextFaults(tree, path, one.Function, one.File, fromTree) {
		out = append(out, Finding(said))
	}
	return out
}

// The paths no rule reads: a draft, and a folder the lint's Vale skips. [[spec/design_output/lsp#the-server-runs-the-tools]]
func parked(path string) bool {
	if check.IsDraft(path) {
		return true
	}
	for _, folder := range parkedFolders {
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

// A row on a file the tree holds nowhere goes, so the panel names the files the index names. [[spec/design_output/lsp#the-server-runs-the-tools]]
func onTheTree(tree *check.Tree, found []Finding) []Finding {
	out := []Finding{}
	for _, said := range found {
		if said.Rule == ValeRuns {
			out = append(out, said)
			continue
		}
		if check.IsDraft(said.File) || (!tree.Held(said.File) && !tree.Exists(said.File)) {
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
func (one *Tools) vale(tree *check.Tree, disk, held []string) []Finding {
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

func (one *Tools) valeRun(input string, argv []string) ([]valeHeard, string) {
	out, err := one.Run(one.Root, input, one.Vale, argv...)
	if err != nil {
		return nil, err.Error()
	}
	return valeRowsOf(one.Root, out)
}

func (one *Tools) valeFault(why string) Finding {
	return Finding{File: one.Config, Rule: ValeRuns, Line: 1, Column: 1, Message: "Vale reads no file, so every rule it holds stands unchecked: " + why, Severity: check.SeverityError, Source: fromVale}
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
		path := strings.TrimPrefix(check.RelativeTo(root, check.Slashed(file)), "./")
		for _, row := range rows {
			said := Finding{File: path, Rule: proseKind.ReplaceAllString(row.Check, ""), Line: max(row.Line, 1), Column: 1, Message: row.Message, Severity: row.Severity, Source: fromVale}
			if len(row.Span) > 0 {
				said.Column = row.Span[0]
			}
			if said.Severity == "" {
				said.Severity = check.SeverityError
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
func (one *Tools) vetoes(tree *check.Tree, heard []valeHeard) []Finding {
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
func (one *Tools) pastReads(asks []map[string]string) []bool {
	if len(asks) == 0 || one.Tense == "" || one.Node == "" {
		return nil
	}
	input, err := json.Marshal(map[string]any{"module": one.Tense, "asks": asks})
	if err != nil {
		return nil
	}
	out, err := one.Run(one.Root, string(input), one.Node, "-e", tenseScript)
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
func (one *Tools) biome(where []string) []Finding {
	if one.Biome == "" || len(where) == 0 {
		return nil
	}
	argv := append([]string{"lint", "--config-path=" + biomeConfig, "--reporter=json", "--max-diagnostics=none"}, where...)
	out, err := one.Run(one.Root, "", one.Biome, argv...)
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
		severity := check.SeverityError
		if row.Severity == check.SeverityWarning {
			severity = check.SeverityWarning
		}
		rule := strings.TrimPrefix(row.Category, "lint/")
		if row.Category == "" {
			rule = "biome"
		}
		path := strings.TrimPrefix(check.RelativeTo(root, check.Slashed(file)), "./")
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
