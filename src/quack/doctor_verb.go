// The doctor verb: what is installed, and what level zero found, one row a
// thing. [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"quackitect/src/yaml"

	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// The files and folders the doctor reads under the root. The pointer, the port base and the index binary stand in probe_cold.go. [[spec/tickets/box-verbs-port-to-go]]
const (
	editorSettings = ".vscode/settings.json" // the file .claude/skills/level0/lib/servers.js owns, as EDITOR_SETTINGS
	hooksFolder    = ".githooks"             // the folder src/scripts/precommit.js owns, as HOOKS
)

// The three rule folders under spec/config/styles, in the order the vale row names them. [[spec/tickets/box-verbs-port-to-go]]
var ruleFolders = []string{"VoiceVale", "VoiceShape", "VoiceScript"}

func init() { registerBox("doctor", doctorVerb) }

// Prints one row a thing: every tool, the servers, the editor, the sidebar, the browser, the commit hook, the rules, the survey, the server and every hook. [[spec/tickets/box-verbs-port-to-go]]
func doctorVerb(d boxDoors, _ []string) int {
	known := readSurvey(d.root)
	found := known
	if len(found) == 0 {
		found, _ = writeSurvey(d)
	}
	var rows [][2]string
	for _, one := range wantedTools {
		rows = append(rows, [2]string{one.name, standsAt(found[one.name])})
	}
	rows = append(rows,
		[2]string{"biome lsp-proxy", lspProxy(d, whereIs(d.root, "biome", known))},
		// The editor starts quack lsp off the index binary, so the probe starts the same. [[spec/tickets/the-lsp-server-leaves]]
		[2]string{"quack lsp", lspProbe(d, indexBuilt(d.root), d.root)},
		[2]string{"editor", editorRow(d.root)},
		[2]string{"sidebar", sidebarSays(d)},
		[2]string{"browser", browserSays(d)},
		[2]string{"commit hook", hooksSay(d)},
		[2]string{"vale rules", valeRules(d.root)},
		[2]string{"survey", surveyRow(d.root)},
		[2]string{"server", serverLine(d)},
	)
	rows = append(rows, hookRows(d, hooksNamed(d.root, homeOf(d.env)))...)
	for _, row := range rows {
		said := strings.TrimSpace(row[1])
		if said == "" {
			said = "missing"
		}
		fmt.Fprintf(d.out, "%-*s %s\n", toolColumn, row[0], said)
	}
	return 0
}

// Whether the biome the survey names carries a language server proxy. [[spec/tickets/box-verbs-port-to-go]]
func lspProxy(d boxDoors, biome string) string {
	if !stands(biome) {
		return "missing, run ./RUNME.sh"
	}
	if d.run([]string{biome, "lsp-proxy", "--help"}, runOpts{}).code == 0 {
		return "this biome carries one"
	}
	return "this biome carries none"
}

// The index binary where the install built it, and nothing where it stands unbuilt. [[spec/tickets/the-lsp-server-leaves]]
func indexBuilt(root string) string {
	bare := filepath.Join(root, filepath.FromSlash(indexBinary))
	for _, at := range []string{bare, bare + ".exe"} {
		if stands(at) {
			return at
		}
	}
	return ""
}

// The editor's settings, which start both servers. [[spec/tickets/box-verbs-port-to-go]]
func editorRow(root string) string {
	if stands(filepath.Join(root, filepath.FromSlash(editorSettings))) {
		return editorSettings + ", both servers"
	}
	return "missing"
}

// Whether the editor's folder holds the sidebar as a link into this tree, and whether its list names it. [[spec/design_output/extension#a-link-pointing-nowhere]]
func sidebarSays(d boxDoors) string {
	home := homeOf(d.env)
	folder := filepath.Join(home, ".vscode", "extensions")
	if home == "" || !stands(folder) {
		return "no editor folder on this box, so no link"
	}
	manifest := filepath.Join(d.root, filepath.FromSlash(extensionTarget))
	var said struct{ Publisher, Name, Version string }
	text, _ := readText(manifest)
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		return "the manifest at src/extension/package.json reads as no JSON"
	}
	id := said.Publisher + "." + said.Name
	dest := filepath.Join(folder, id+"-"+said.Version)
	switch {
	case editorLinkedAt(dest, filepath.Dir(manifest)):
		if editorRegistered(folder, id) {
			return "linked, and the list names " + id
		}
		return "linked, and the list misses " + id + ": run ./RUNME.sh"
	case isLink(dest) && !stands(dest):
		return "a link pointing nowhere: run ./RUNME.sh"
	case isLink(dest):
		return "a link into another tree: run ./RUNME.sh"
	case stands(dest):
		return "a copy in place of the link: run ./RUNME.sh"
	}
	return "unlinked: run ./RUNME.sh"
}

// The browser the drawing's test drives, with the rung that found it. [[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]]
func browserSays(d boxDoors) string {
	path, from := browserFrom(d.env, d.goos == "darwin")
	if path == "" {
		return "missing, run ./RUNME.sh"
	}
	return path + ", off " + from
}

// Whether both commit hooks stand, and whether git reads their folder. [[spec/design_output/private#both-doors-one-check]]
func hooksSay(d boxDoors) string {
	at := hooksFolder + "/pre-commit"
	push := hooksFolder + "/pre-push"
	if !stands(filepath.Join(d.root, filepath.FromSlash(at))) {
		return at + " stands nowhere"
	}
	if !stands(filepath.Join(d.root, filepath.FromSlash(push))) {
		return push + " stands nowhere"
	}
	said := strings.TrimSpace(d.run([]string{"git", "config", "--get", "core.hooksPath"}, runOpts{cwd: d.root}).stdout)
	if said == hooksFolder {
		return at + " and " + push + ", which git reads"
	}
	if said == "" {
		said = "its own folder"
	}
	return "git reads " + said + ", so run ./RUNME.sh"
}

// How many rules each rule folder holds, or missing where the first stands nowhere. [[spec/tickets/box-verbs-port-to-go]]
func valeRules(root string) string {
	counts := make([]int, len(ruleFolders))
	for at, one := range ruleFolders {
		folder := filepath.Join(root, "spec", "config", "styles", one)
		if !stands(folder) {
			if at == 0 {
				return "missing"
			}
			continue
		}
		listed, _ := os.ReadDir(folder)
		for _, file := range listed {
			if file.Type().IsRegular() && strings.HasSuffix(file.Name(), ".yml") {
				counts[at]++
			}
		}
	}
	var said []string
	for at, one := range ruleFolders {
		said = append(said, strconv.Itoa(counts[at])+" in "+one)
	}
	return strings.Join(said, ", ")
}

// Whether the survey file stands. [[spec/design_output/tools#where-a-caller-looks]]
func surveyRow(root string) string {
	if stands(filepath.Join(root, filepath.FromSlash(toolsFile))) {
		return toolsFile
	}
	return "absent, run ./RUNME.sh tools"
}

// The port the vehicle pointer names, or the base port. [[spec/design_output/level0#the-check-reads-the-server]]
func portHere(root string) int {
	text, _ := readText(filepath.Join(root, filepath.FromSlash(vehiclePointer)))
	var said struct {
		Port any `json:"port"`
	}
	if json.Unmarshal([]byte(text), &said) != nil {
		return portBase
	}
	switch port := said.Port.(type) {
	case float64:
		if port != 0 {
			return int(port)
		}
	case string:
		if number, err := strconv.Atoi(strings.TrimSpace(port)); err == nil && number != 0 {
			return number
		}
	}
	return portBase
}

// The row the doctor prints under `server`, so a person asking after a fall reads it there. [[spec/design_output/level0#the-bridge-says-it-falls]]
func serverLine(d boxDoors) string {
	where := "http://127.0.0.1:" + strconv.Itoa(portHere(d.root)) + "/health"
	body, err := d.get(where, healthWait)
	var said struct {
		OK any `json:"ok"`
	}
	if err == nil && json.Unmarshal([]byte(body), &said) == nil && yaml.Truthy(said.OK) {
		return "stands at " + where
	}
	return "none at " + where
}
