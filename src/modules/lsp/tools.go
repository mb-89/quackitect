// The tools the lsp IO module runs beside the check module's sweep: the Go
// rules over the prose, Biome over the code, and the code faults, each row
// under its own source, the way the lint runs them.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"regexp"
	"slices"
	"strings"
)

// The names the tools draw under, and the Biome config .claude/skills/level0/lib/code.js names, spelled again here because a Go module imports no JavaScript. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	biomeConfig = "spec/config"
	// The rule a rules load that fails draws, so a broken rule stands in the panel. [[spec/tickets/vale-leaves-the-tree]]
	RulesLoad = "RulesLoad"
	fromRules = "rules"
	fromBiome = "biome"
	fromTree  = "tree"
)

// The files the tools read beside the tree, so a change to one runs them over the whole tree again. A name closing on a slash names a folder. [[spec/design_output/lsp#the-panel-follows-the-index]]
var toolInputs = []string{"spec/config/styles/", "spec/config/biome.json", "spec/config/level0.json"}

// The folders the rules skip, as PARKED in src/bridge/findings.js names them. [[spec/design_output/lsp#the-server-runs-the-tools]]
var parkedFolders = []string{".se", "node_modules", ".git", ".claude/types", ".claude/worktrees"}

var proseKind = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)

// A tool run: the folder, the input, the binary and its words. The door runs one, and a case hands in its own. [[spec/tickets/lsp-module-draws-the-tools]]
type Runner func(dir, input, name string, argv ...string) (string, error)

// The tools a run takes, where the box holds them, and the ceilings the code faults read. [[spec/tickets/lsp-module-draws-the-tools]]
type Tools struct {
	Root string
	// The Go rules over one text read as the file at the path, which the wiring hands in. [[spec/tickets/go-rules-replace-vale]]
	Rules    func(path, text string) []Finding
	Biome    string
	Function int
	File     int
	Run      Runner
	// Ends every run the door started, which the listen's stop calls. [[spec/tickets/the-index-stops-its-tools]]
	Halt func()
	// Reads the tools and the ceilings again before a whole run, which the door does and a case does not. [[spec/design_output/lsp#the-panel-follows-the-index]]
	Again func(*Tools)
	// [[spec/tickets/lsp-module-draws-the-tools]]
	Check Check
}

// The tree a run of the tools reads: the files git tracks, each buffer an editor holds over its file. [[spec/tickets/lsp-module-draws-the-tools]]
type Tree interface {
	Holds(path, text string)
	Held(path string) bool
	Buffers() []string
	Read(path string) string
	Exists(path string) bool
	Paths() []string
}

// What the check module lends the tools, which the wiring hands in: its tree over the texts, its code faults, its draft test, its path under the root, and the files the door reads. [[spec/tickets/lsp-module-draws-the-tools]]
type Check struct {
	Tree     func(texts map[string]string) Tree
	Faults   func(tree Tree, path string, function, file int, source string) []Finding
	Draft    func(path string) bool
	Relative func(root, path string) string
	Survey   string
	Bin      string
	// The features the check module reads over the tree: the hover, the completion, the links and the folds, each answering a value the reply marshals whole. Links and folds read no position. [[spec/tickets/lsp-module-serves-the-features]]
	Hover    Feature
	Complete Feature
	Links    Feature
	Folds    Feature
}

// One feature's read: the tree, the path under the root, and the cursor. [[spec/tickets/lsp-module-serves-the-features]]
type Feature func(tree Tree, path string, line, character int) any

// Every row the tools answer over the whole tree. A buffer an editor holds reads as it stands. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) Sweep(tree Tree) []Finding {
	if one.Again != nil {
		one.Again(one)
	}
	held := one.kept(tree.Buffers())
	out := []Finding{}
	for _, said := range one.prose(tree, []string{"."}, nil) {
		if said.Rule == RulesLoad || !slices.Contains(held, said.File) {
			out = append(out, said)
		}
	}
	if len(held) > 0 {
		out = append(out, one.prose(tree, nil, held)...)
	}
	for _, path := range tree.Paths() {
		out = append(out, one.textFaults(tree, path)...)
	}
	out = append(out, one.biome([]string{"."})...)
	return one.onTheTree(tree, out)
}

// The rows the tools answer over the paths named, each a file the tree holds. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) Over(tree Tree, paths []string) []Finding {
	disk, held, every := []string{}, []string{}, []string{}
	for _, at := range paths {
		if one.parked(at) {
			continue
		}
		every = append(every, at)
		if tree.Held(at) {
			held = append(held, at)
			continue
		}
		disk = append(disk, at)
	}
	out := one.prose(tree, disk, held)
	for _, at := range every {
		out = append(out, one.textFaults(tree, at)...)
	}
	// An open file's Biome rows stand with the Biome extension, which draws them while a person types. [[spec/design_output/lsp#the-panel-reads-the-battery]]
	out = append(out, one.biome(disk)...)
	return one.onTheTree(tree, out)
}

// The code faults and the exemption markers over one file, under the source tree. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) textFaults(tree Tree, path string) []Finding {
	return one.Check.Faults(tree, path, one.Function, one.File, fromTree)
}

// The paths no rule reads: a draft, and a folder the rules skip. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) parked(path string) bool {
	if one.Check.Draft(path) {
		return true
	}
	for _, folder := range parkedFolders {
		if path == folder || strings.HasPrefix(path, folder+"/") {
			return true
		}
	}
	return false
}

func (one *Tools) kept(paths []string) []string {
	out := []string{}
	for _, path := range paths {
		if !one.parked(path) {
			out = append(out, path)
		}
	}
	return out
}

// A row on a file the tree holds nowhere goes, so the panel names the files the index names. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) onTheTree(tree Tree, found []Finding) []Finding {
	out := []Finding{}
	for _, said := range found {
		if said.Rule == RulesLoad {
			out = append(out, said)
			continue
		}
		if one.Check.Draft(said.File) || (!tree.Held(said.File) && !tree.Exists(said.File)) {
			continue
		}
		out = append(out, said)
	}
	return out
}

// The rule a check id names, its style left off where the style is the voice's own. [[spec/design_output/lsp#the-server-runs-the-tools]]
func RuleOf(check string) string {
	return proseKind.ReplaceAllString(check, "")
}

// The prose rows over the paths named, off the Go rules the wiring hands in. A dot names every path the tree holds. [[spec/tickets/go-rules-replace-vale]]
func (one *Tools) prose(tree Tree, disk, held []string) []Finding {
	if one.Rules == nil {
		return nil
	}
	out := []Finding{}
	for _, at := range append(append([]string{}, disk...), held...) {
		paths := []string{at}
		if at == "." {
			paths = one.kept(tree.Paths())
		}
		for _, path := range paths {
			for _, said := range one.Rules(path, tree.Read(path)) {
				said.File, said.Source = path, fromRules
				out = append(out, said)
			}
		}
	}
	return out
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
	return one.biomeRowsOf(out, where[0])
}

// Biome's answer as rows, the way fromJson in .claude/skills/level0/lib/code.js reads it. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) biomeRowsOf(stdout, where string) []Finding {
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
		severity := severe
		if row.Severity == warning {
			severity = warning
		}
		rule := strings.TrimPrefix(row.Category, "lint/")
		if row.Category == "" {
			rule = "biome"
		}
		path := strings.TrimPrefix(one.Check.Relative(one.Root, file), "./")
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
func (one *Tools) readByTools(paths []string) bool {
	for _, path := range paths {
		for _, input := range toolInputs {
			if path == input || (strings.HasSuffix(input, "/") && strings.HasPrefix(path, input)) {
				return true
			}
		}
	}
	return false
}

// Biome's answer as findings, which the twin goldens read beside the JavaScript side. [[spec/tickets/the-lsp-server-leaves]]
func (one *Tools) BiomeRows(stdout, where string) []Finding {
	return one.biomeRowsOf(stdout, where)
}
