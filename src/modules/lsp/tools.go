// The tools the lsp IO module runs beside the check module's sweep: Vale over
// the prose, Biome over the code, and the code faults, each row under its own
// source, the way the lint runs them.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"

	"quackitect/src/proc"
	"quackitect/src/prose"
)

// The globs, the config folder and the rule names the lint spells. [[spec/design_output/lsp#the-server-runs-the-tools]]
const (
	valeSkips   = "--glob=!{{.se,node_modules,.git,.claude/types,.claude/worktrees}/**,**/_*}"
	biomeConfig = "spec/config"
	pastRule    = "PastTense"
	// The code Vale names a script rule past its cap with, and the runs a sweep spends on it. [[spec/tickets/vale-retries-its-timeout]]
	valeTimedOut = "E201"
	valeTries    = 3
	// The rule a Vale answering a fault draws, so a broken rule stands in the panel. [[spec/design_output/lsp#the-server-runs-the-tools]]
	ValeRuns  = "ValeRuns"
	fromVale  = "vale"
	fromBiome = "biome"
	fromTree  = "tree"
)

// The files the tools read beside the tree, so a change to one runs them over the whole tree again. A name closing on a slash names a folder. [[spec/design_output/lsp#the-panel-follows-the-index]]
var toolInputs = []string{"spec/config/styles/", "spec/config/biome.json", "spec/config/level0.json"}

// The folders Vale skips. [[spec/design_output/lsp#the-server-runs-the-tools]]
var parkedFolders = []string{".se", "node_modules", ".git", ".claude/types", ".claude/worktrees"}

var (
	valeCode  = regexp.MustCompile(`^E\d+$`)
	proseKind = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)
)

// The tools a run takes, where the box holds them, and the ceilings the code faults read. [[spec/tickets/lsp-module-draws-the-tools]]
type Tools struct {
	Root     string
	Vale     string
	Biome    string
	Config   string
	Function int
	File     int
	Run      proc.Runner
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
	ValeIni  string
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
	for _, said := range one.vale(tree, []string{"."}, nil) {
		if said.Rule == ValeRuns || !slices.Contains(held, said.File) {
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
	out := one.vale(tree, disk, held)
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

// The paths no rule reads: a draft, and a folder the lint's Vale skips. [[spec/design_output/lsp#the-server-runs-the-tools]]
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
		if said.Rule == ValeRuns {
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

// A Vale row, and the words it matched, which the tense reader weighs. [[spec/design_output/lsp#the-server-runs-the-tools]]
type valeHeard struct {
	Finding
	said string
}

// Vale over the paths the disk holds and the buffers an editor holds, each row past the tense reader. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) vale(tree Tree, disk, held []string) []Finding {
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

// Vale stops a script rule past its own cap and names it E201, which a loaded box trips on a sound tree, so the run goes again up to valeTries times. [[spec/tickets/vale-retries-its-timeout]]
func (one *Tools) valeRun(input string, argv []string) ([]valeHeard, string) {
	for try := 1; ; try++ {
		said, fault := one.valeOnce(input, argv)
		if !strings.Contains(fault, valeTimedOut) || try >= valeTries {
			return said, fault
		}
	}
}

// One Vale run through the process door, and its rows or its fault. [[spec/tickets/vale-retries-its-timeout]]
func (one *Tools) valeOnce(input string, argv []string) ([]valeHeard, string) {
	out, fault := one.runs(input, one.Vale, argv)
	if fault != "" {
		return nil, fault
	}
	return one.valeRowsOf(out)
}

// One tool run through the process door in the root, up to the wait, and the fault a run answering no output and a nonzero code reads as. [[spec/design_output/doors#the-process-door]]
func (one *Tools) runs(input, name string, argv []string) (string, string) {
	said := one.Run(proc.Command{Argv: append([]string{name}, argv...), Dir: one.Root, Stdin: input, Wait: toolWait})
	if said.Code != 0 && said.Out == "" {
		return "", fmt.Sprintf("exit status %d: %s", said.Code, strings.TrimSpace(said.Err))
	}
	return said.Out, ""
}

func (one *Tools) valeFault(why string) Finding {
	return Finding{File: one.Config, Rule: ValeRuns, Line: 1, Column: 1, Message: "Vale reads no file, so every rule it holds stands unchecked: " + why, Severity: severe, Source: fromVale}
}

// Vale's answer as rows, or the fault it names in place of rows. The shape follows fromJson and faultIn in .claude/skills/level0/lib/vale.js. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Tools) valeRowsOf(stdout string) ([]valeHeard, string) {
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
		path := strings.TrimPrefix(one.Check.Relative(one.Root, file), "./")
		for _, row := range rows {
			said := Finding{File: path, Rule: proseKind.ReplaceAllString(row.Check, ""), Line: max(row.Line, 1), Column: 1, Message: row.Message, Severity: row.Severity, Source: fromVale}
			if len(row.Span) > 0 {
				said.Column = row.Span[0]
			}
			if said.Severity == "" {
				said.Severity = severe
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

// A past tense row stands where the Go tense reader reads the word as the past. [[spec/tickets/go-prose-checks-stand-alone]]
func (one *Tools) vetoes(tree Tree, heard []valeHeard) []Finding {
	texts := map[string][]string{}
	out := []Finding{}
	for _, row := range heard {
		if !strings.HasSuffix(row.Rule, pastRule) {
			out = append(out, row.Finding)
			continue
		}
		if _, read := texts[row.File]; !read {
			texts[row.File] = strings.Split(tree.Read(row.File), "\n")
		}
		line := ""
		if lines := texts[row.File]; row.Line >= 1 && row.Line <= len(lines) {
			line = lines[row.Line-1]
		}
		if prose.ReadsAsPast(line, row.said) {
			out = append(out, row.Finding)
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
	out, fault := one.runs("", one.Biome, argv)
	if fault != "" {
		return nil
	}
	return one.biomeRowsOf(out, where[0])
}

// Biome's answer as rows. [[spec/design_output/lsp#the-server-runs-the-tools]]
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
		if path == one.Check.ValeIni {
			return true
		}
		for _, input := range toolInputs {
			if path == input || (strings.HasSuffix(input, "/") && strings.HasPrefix(path, input)) {
				return true
			}
		}
	}
	return false
}

// Vale's answer as findings, and the fault it names in place of them, which the twin goldens read beside the JavaScript side. [[spec/tickets/the-lsp-server-leaves]]
func (one *Tools) ValeRows(stdout string) ([]Finding, string) {
	heard, fault := one.valeRowsOf(stdout)
	out := make([]Finding, 0, len(heard))
	for _, said := range heard {
		out = append(out, said.Finding)
	}
	return out, fault
}

// Biome's answer as findings, which the twin goldens read beside the JavaScript side. [[spec/tickets/the-lsp-server-leaves]]
func (one *Tools) BiomeRows(stdout, where string) []Finding {
	return one.biomeRowsOf(stdout, where)
}
