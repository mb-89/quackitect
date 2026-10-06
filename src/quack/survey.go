// The survey: where each tool stands on this box, written to the file every
// caller reads in place of a guess.
// [[spec/design_output/tools#what-the-survey-writes]]
package main

import (
	"bytes"
	"encoding/json"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// The runtime folder, the survey file and the binaries under it, and the span a version ask takes. [[spec/design_output/tools#what-the-survey-writes]]
const (
	runFolder  = ".se/.runtime" // the folder .claude/skills/level0/lib/folders.js owns, as RUN
	toolsFile  = runFolder + "/tools.json"
	binFolder  = runFolder + "/bin"
	askingWait = 10 * time.Second
)

// One tool the survey looks for: the words that ask its version, and the names it answers to. [[spec/design_output/tools#what-the-survey-writes]]
type wantedTool struct {
	name  string
	asks  []string
	calls []string
}

// The tools, in the order the survey writes them. [[spec/design_output/tools#what-the-survey-writes]]
var wantedTools = []wantedTool{
	{name: "node", asks: []string{"--version"}},
	{name: "vale", asks: []string{"--version"}},
	{name: "biome", asks: []string{"--version"}},
	{name: "vale-ls", asks: []string{"--version"}},
	{name: "go", asks: []string{"version"}},
	{name: "git", asks: []string{"--version"}},
	{name: "claude", asks: []string{"--version"}},
	{name: "sh"},
	{name: "python", asks: []string{"--version"}, calls: []string{"python3", "python"}},
}

// Where one tool stands, and the version it says. [[spec/design_output/tools#what-the-survey-writes]]
type toolAt struct {
	Path    string  `json:"path"`
	Version *string `json:"version,omitempty"`
}

var versionPattern = regexp.MustCompile(`\d+\.\d+(?:\.\d+)?`)

// The first version a tool's answer names on its first line. [[spec/design_output/tools#what-the-survey-writes]]
func versionOf(said string) string {
	first, _, _ := strings.Cut(said, "\n")
	return versionPattern.FindString(first)
}

// The places a call stands in: the tree's own binaries first, then each PATH folder, under each ending PATHEXT names. [[spec/design_output/tools#reading-the-path-variable]]
func placesFor(call string, env func(string) string, bin string) []string {
	said := env("PATH")
	if said == "" {
		said = env("Path")
	}
	split := ":"
	if env("PATHEXT") != "" {
		split = ";"
	}
	endings := []string{""}
	for _, one := range strings.Split(env("PATHEXT"), ";") {
		if one = strings.ToLower(strings.TrimSpace(one)); one != "" {
			endings = append(endings, one)
		}
	}
	var out []string
	for _, folder := range append([]string{bin}, strings.Split(said, split)...) {
		if folder == "" {
			continue
		}
		for _, ending := range endings {
			out = append(out, folder+"/"+call+ending)
		}
	}
	return out
}

// Where every wanted tool stands, nil where none does. [[spec/design_output/tools#what-the-survey-writes]]
func survey(d boxDoors) map[string]*toolAt {
	found := map[string]*toolAt{}
	for _, one := range wantedTools {
		found[one.name] = standing(d, one)
	}
	return found
}

func standing(d boxDoors, one wantedTool) *toolAt {
	calls := one.calls
	if len(calls) == 0 {
		calls = []string{one.name}
	}
	for _, call := range calls {
		for _, place := range placesFor(call, d.env, d.root+"/"+binFolder) {
			if !stands(place) {
				continue
			}
			if len(one.asks) == 0 {
				return &toolAt{Path: place}
			}
			ran := d.run(append([]string{place}, one.asks...), runOpts{timeout: askingWait})
			said := ran.stdout
			if said == "" {
				said = ran.stderr
			}
			version := versionOf(said)
			return &toolAt{Path: place, Version: &version}
		}
	}
	return nil
}

// The survey as JSON.stringify writes it with two spaces, the tools in their order. [[spec/design_output/tools#what-the-survey-writes]]
func surveyText(found map[string]*toolAt) string {
	var said strings.Builder
	said.WriteString("{")
	for at, one := range wantedTools {
		if at > 0 {
			said.WriteString(",")
		}
		said.WriteString("\n  " + jsonString(one.name) + ": ")
		if found[one.name] == nil {
			said.WriteString("null")
			continue
		}
		var entry bytes.Buffer
		writes := json.NewEncoder(&entry)
		writes.SetEscapeHTML(false)
		writes.SetIndent("  ", "  ")
		_ = writes.Encode(found[one.name])
		said.WriteString(strings.TrimRight(entry.String(), "\n"))
	}
	said.WriteString("\n}\n")
	return said.String()
}

// The modes the survey's folder and file take. [[spec/design_output/tools#what-the-survey-writes]]
const (
	surveyFolderMode = 0o755
	surveyFileMode   = 0o644
)

// Surveys the box and writes the file whole, so a caller reading it mid-write reads the old survey or the new one whole. [[spec/design_output/tools#what-the-survey-writes]]
func writeSurvey(d boxDoors) (map[string]*toolAt, error) {
	found := survey(d)
	at := filepath.Join(d.root, filepath.FromSlash(toolsFile))
	if err := d.disk.makeAll(filepath.Dir(at), surveyFolderMode); err != nil {
		return found, err
	}
	if err := d.disk.write(at+".part", []byte(surveyText(found)), surveyFileMode); err != nil {
		return found, err
	}
	return found, d.disk.rename(at+".part", at)
}

// The survey the file holds, empty where it stands nowhere or reads as no object. [[spec/design_output/tools#where-a-caller-looks]]
func readSurvey(root string) map[string]*toolAt {
	found := map[string]*toolAt{}
	text, ok := readText(filepath.Join(root, filepath.FromSlash(toolsFile)))
	if !ok || json.Unmarshal([]byte(text), &found) != nil {
		return map[string]*toolAt{}
	}
	return found
}

// Where a tool stands: the survey's path where it stands, the tree's own binary, or its bare name. [[spec/design_output/tools#where-a-caller-looks]]
func whereIs(root, name string, known map[string]*toolAt) string {
	if one := known[name]; one != nil && one.Path != "" && stands(one.Path) {
		return one.Path
	}
	for _, guess := range []string{name + ".exe", name} {
		if at := root + "/" + binFolder + "/" + guess; stands(at) {
			return at
		}
	}
	return name
}

// What one survey row says: the version and the path, or how to bring the tool. [[spec/design_output/tools#where-a-caller-looks]]
func standsAt(one *toolAt) string {
	if one == nil {
		return "missing, run ./RUNME.sh"
	}
	var parts []string
	if one.Version != nil && *one.Version != "" {
		parts = append(parts, *one.Version)
	}
	if one.Path != "" {
		parts = append(parts, one.Path)
	}
	return strings.Join(parts, "  ")
}
