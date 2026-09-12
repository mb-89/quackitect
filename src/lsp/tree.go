// The tree handed in. Every check reads the disk through this, so a test drives
// the same code over a folder it writes itself, and the editor drives it over
// the buffer a person is typing into.
// [[spec/design_output/tree#the-tree-handed-in]]
package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
)

type Box struct {
	User  string
	Home  string
	Name  string
	Email string
}

type Tree struct {
	Root  string
	Words int
	Node  string
	Box   Box

	guard   sync.Mutex
	overlay map[string]string
	held    []string
}

func treeAt(root string) *Tree {
	return &Tree{Root: root, overlay: map[string]string{}}
}

// Holds parks the text of a buffer the editor owns, so a check reads what a
// person types before the disk carries it.
func (one *Tree) Holds(path, text string) {
	one.guard.Lock()
	defer one.guard.Unlock()
	one.overlay[slashed(path)] = text
	one.held = nil
}

func (one *Tree) Drops(path string) {
	one.guard.Lock()
	defer one.guard.Unlock()
	delete(one.overlay, slashed(path))
	one.held = nil
}

func (one *Tree) Read(path string) string {
	said := slashed(path)
	one.guard.Lock()
	text, open := one.overlay[said]
	one.guard.Unlock()
	if open {
		return text
	}
	read, err := os.ReadFile(filepath.Join(one.Root, filepath.FromSlash(said)))
	if err != nil {
		return ""
	}
	return string(read)
}

func (one *Tree) Exists(path string) bool {
	_, err := os.Stat(filepath.Join(one.Root, filepath.FromSlash(path)))
	return err == nil
}

func (one *Tree) Names(folder, end string) []string {
	found, err := os.ReadDir(filepath.Join(one.Root, filepath.FromSlash(folder)))
	if err != nil {
		return nil
	}
	out := []string{}
	for _, entry := range found {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), end) {
			out = append(out, entry.Name())
		}
	}
	sort.Strings(out)
	return out
}

// [[spec/design_output/tree#the-tree-handed-in]]
func (one *Tree) Paths() []string {
	one.guard.Lock()
	defer one.guard.Unlock()
	if one.held != nil {
		return one.held
	}

	out := gitHolds(one.Root)
	if out == nil {
		out = diskHolds(one.Root)
	}
	one.held = out
	return out
}

// [[spec/design_output/tree#the-tree-handed-in]]
func gitHolds(root string) []string {
	said := exec.Command("git", "ls-files")
	said.Dir = root
	read, err := said.Output()
	if err != nil {
		return nil
	}
	out := []string{}
	for _, line := range splitLines(string(read)) {
		path := strings.TrimSpace(line)
		if path != "" && !isDraft(path) {
			out = append(out, path)
		}
	}
	return out
}

// A clone with no git walks the disk, so every rule still answers.
// [[spec/design_output/tree#the-tree-handed-in]]
func diskHolds(root string) []string {
	out := []string{}
	filepath.WalkDir(root, func(where string, entry os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		name := entry.Name()
		if entry.IsDir() {
			if where != root && (name == ".git" || name == ".se" || name == "node_modules") {
				return filepath.SkipDir
			}
			return nil
		}
		said, err := filepath.Rel(root, where)
		if err != nil || isDraft(said) {
			return nil
		}
		out = append(out, slashed(said))
		return nil
	})
	sort.Strings(out)
	return out
}

// Forgets drops the walk, so the next sweep reads what git holds now.
func (one *Tree) Forgets() {
	one.guard.Lock()
	defer one.guard.Unlock()
	one.held = nil
}

const (
	Install  = "src/scripts/install.sh"
	ValeIni  = ".vale.ini"
	Settings = ".vscode/settings.json"
	Offered  = ".vscode/extensions.json"
	ToolsAt  = ".se/tools.json"
	Bin      = ".se/bin"
)

// [[spec/design_output/editor#what-the-editor-runs]]
var Extensions = []string{"chrischinchilla.vale-vscode", "biomejs.biome"}

// [[spec/design_output/tools#what-the-survey-writes]]
var Wanted = []string{"node", "vale", "biome", "vale-ls", "se-lsp", "go", "git", "claude", "sh", "python"}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
func settingsNameBinaries(tree *Tree) []Finding {
	rule := "SettingsNameBinaries"
	text := tree.Read(Settings)
	said := parsedJSON(text)
	if said == nil {
		return []Finding{unread(rule, Settings)}
	}

	out := []Finding{}
	for _, one := range namesTheBinaries(said) {
		if one.holds {
			continue
		}
		out = append(out, fault(rule, Settings, lineOf(text, one.key), one.key+" names something else. "+one.why))
	}

	installs := installedTools(tree.Read(Install))
	for _, name := range []string{"vale", "biome"} {
		if has(installs, name) {
			continue
		}
		out = append(out, fault(rule, Install, 1,
			Settings+" runs "+Bin+"/"+name+", and this script installs no "+name+"."))
	}
	return out
}

type binaryCheck struct {
	key   string
	why   string
	holds bool
}

func namesTheBinaries(said map[string]any) []binaryCheck {
	biome, holdsBiome := said["biome.lsp.bin"]
	paths := []string{}
	switch one := biome.(type) {
	case string:
		paths = append(paths, one)
	case map[string]any:
		for _, key := range keysOf(one) {
			paths = append(paths, asText(one[key]))
		}
	}
	named := len(paths) > 0
	for _, one := range paths {
		if !strings.HasPrefix(one, Bin+"/biome") {
			named = false
		}
	}
	_ = holdsBiome

	return []binaryCheck{
		{"vale.valeCLI.path", "The editor runs " + Bin + "/vale, which " + Install + " writes.",
			asText(said["vale.valeCLI.path"]) == Bin+"/vale"},
		{"vale.valeCLI.config", "The editor reads " + ValeIni + " at the root.",
			asText(said["vale.valeCLI.config"]) == ValeIni},
		{"vale.valeCLI.installVale", Install + " pins Vale, so the extension installs none of its own.",
			said["vale.valeCLI.installVale"] == false},
		{"biome.lsp.bin", "The editor runs " + Bin + "/biome, which " + Install + " writes.", named},
		{"biome.configurationPath", "Biome reads spec/config/biome.json, which this tree tracks.",
			asText(said["biome.configurationPath"]) == "spec/config/biome.json"},
	}
}

// [[spec/design_output/editor#what-the-editor-runs]]
func editorDrawsWriteRules(tree *Tree) []Finding {
	rule := "EditorDrawsWriteRules"
	text := tree.Read(Settings)
	said := parsedJSON(text)
	if said == nil {
		return []Finding{unread(rule, Settings)}
	}

	out := []Finding{}
	where := asText(said["vale.valeCLI.config"])
	ini := ""
	if where != "" {
		ini = tree.Read(where)
	}
	if ini == "" {
		names := where
		if names == "" {
			names = "nothing"
		}
		return append(out, fault(rule, Settings, lineOf(text, "vale.valeCLI.config"),
			"vale.valeCLI.config names "+names+", and the write door reads "+ValeIni+"."))
	}

	level := valeLevel(ini)
	if asText(said["vale.valeCLI.minAlertLevel"]) != "inherited" {
		drawn := level
		if drawn == "" {
			drawn = "its own level"
		}
		out = append(out, fault(rule, Settings, lineOf(text, "vale.valeCLI.minAlertLevel"),
			where+" draws at "+drawn+". Set vale.valeCLI.minAlertLevel to inherited."))
	}
	if !spellingStyle(ini) && said["vale.enableSpellcheck"] != false {
		out = append(out, fault(rule, Settings, lineOf(text, "vale.enableSpellcheck"),
			where+" names no spelling style. Set vale.enableSpellcheck to false."))
	}
	if said["vale.valeCLI.lintOnChange"] != true {
		out = append(out, fault(rule, Settings, lineOf(text, "vale.valeCLI.lintOnChange"),
			"Set vale.valeCLI.lintOnChange to true, so a rule draws while a person types."))
	}
	return out
}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
func biomeOnWindows(tree *Tree) []Finding {
	rule := "BiomeOnWindows"
	text := tree.Read(Settings)
	said := parsedJSON(text)
	if said == nil {
		return []Finding{unread(rule, Settings)}
	}

	held, named := said["biome.lsp.bin"].(map[string]any)
	if !named {
		return []Finding{fault(rule, Settings, lineOf(text, "biome.lsp.bin"),
			"biome.lsp.bin names one path per platform, under "+Bin+".")}
	}

	out := []Finding{}
	for _, platform := range keysOf(held) {
		path := asText(held[platform])
		wants := Bin + "/biome"
		if strings.HasPrefix(platform, "win32") {
			wants = Bin + "/biome.exe"
		}
		if path == wants {
			continue
		}
		out = append(out, fault(rule, Settings, lineOf(text, platform),
			platform+" runs "+path+", and this tree installs "+wants+" there."))
	}
	return out
}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
func extensionsOnOffer(tree *Tree) []Finding {
	rule := "ExtensionsOnOffer"
	text := tree.Read(Offered)
	said := parsedJSON(text)
	if said == nil {
		return []Finding{unread(rule, Offered)}
	}

	out := []Finding{}
	offered := []string{}
	for _, one := range listOf(said["recommendations"]) {
		offered = append(offered, asText(one))
	}
	where := lineOf(text, "recommendations")
	for _, one := range Extensions {
		if !has(offered, one) {
			out = append(out, fault(rule, Offered, where, "A clone opens without "+one+" on offer."))
		}
	}
	for _, one := range offered {
		if !has(Extensions, one) {
			out = append(out, fault(rule, Offered, where, one+" holds no rule this tree reads."))
		}
	}

	settings := tree.Read(Settings)
	held := parsedJSON(settings)
	for _, key := range keysOf(held) {
		under, nested := held[key].(map[string]any)
		if !nested {
			continue
		}
		formatter := asText(under["editor.defaultFormatter"])
		if formatter == "" || has(offered, formatter) {
			continue
		}
		out = append(out, fault(rule, Settings, lineOf(settings, formatter),
			key+" formats through "+formatter+", and "+Offered+" offers no such extension."))
	}
	return out
}

// [[spec/design_output/log#nothing-here-deletes-a-log]]
func noLogDeleted(tree *Tree) []Finding {
	rule := "NoLogDeleted"
	out := []Finding{}
	for _, path := range tree.Paths() {
		if !sourceFile(path) {
			continue
		}
		for i, line := range splitLines(tree.Read(path)) {
			if !deletesAt.MatchString(line) || !loggedAt.MatchString(line) {
				continue
			}
			out = append(out, fault(rule, path, i+1,
				"This line reaches a log file. The log is the record of what every door does, so nothing here takes one away."))
		}
	}
	return out
}

// [[spec/design_output/level0#a-name-holds-five-words]]
func nameHoldsTheWords(tree *Tree) []Finding {
	rule := "NameHoldsTheWords"
	out := []Finding{}
	if tree.Words == 0 {
		return out
	}
	for _, path := range tree.Paths() {
		part := overLong(path, tree.Words)
		if part == "" {
			continue
		}
		out = append(out, fault(rule, path, 1,
			part+" holds more than "+strconv.Itoa(tree.Words)+" words. Rename it shorter."))
	}
	return out
}

// [[spec/design_output/private#the-box-names-the-owner]]
func nothingPrivateTravels(tree *Tree) []Finding {
	rule := "NothingPrivateTravels"
	home := strings.TrimRight(slashed(tree.Box.Home), "/")
	if !homeNames(home) {
		home = ""
	}

	type wanted struct{ what, said string }
	held := []wanted{}
	for _, one := range []wanted{
		{"the user this box runs as", tree.Box.User},
		{"the home folder on this box", home},
		{"the git name on this box", tree.Box.Name},
		{"the git address on this box", tree.Box.Email},
	} {
		if namesAPerson(one.said) {
			held = append(held, one)
		}
	}
	if len(held) == 0 {
		return nil
	}

	out := []Finding{}
	for _, path := range tree.Paths() {
		if !textFile(path) {
			continue
		}
		for i, line := range splitLines(tree.Read(path)) {
			for _, one := range held {
				if !carriesTheName(line, one.said) {
					continue
				}
				out = append(out, fault(rule, path, i+1,
					"This line carries "+one.what+", and git carries this file everywhere. "+
						"Say what the thing is, in words a reader outside this box acts on."))
			}
		}
	}
	return out
}

// [[spec/design_output/tools#what-the-survey-names]]
func surveyNamesInstalls(tree *Tree) []Finding {
	rule := "SurveyNamesInstalls"
	text := tree.Read(Install)
	installs := installedTools(text)
	if len(installs) == 0 {
		return []Finding{fault(rule, Install, 1, "This script names no tool the survey reads back.")}
	}

	out := []Finding{}
	for _, name := range installs {
		if has(Wanted, name) {
			continue
		}
		out = append(out, fault(rule, Install, lineOf(text, name+")"),
			"The survey names no "+name+", so every caller guesses its path. Add it to WANTED."))
	}
	return out
}

// [[spec/design_output/tools#what-the-survey-writes]]
func surveyFindsNode(tree *Tree) []Finding {
	rule := "SurveyFindsNode"
	text := tree.Read(ToolsAt)
	if text == "" {
		return []Finding{fault(rule, Install, 1,
			ToolsAt+" stands nowhere, so every caller guesses a path. Run ./RUNME.sh tools.")}
	}
	// The sweep names the node that runs it, and no node runs this server.
	if tree.Node == "" {
		return nil
	}

	said := ""
	if node, held := parsedJSON(text)["node"].(map[string]any); held {
		said = asText(node["version"])
	}
	if said == tree.Node {
		return nil
	}
	names := said
	if names == "" {
		names = "nothing"
	}
	return []Finding{fault(rule, ToolsAt, lineOf(text, "version"),
		"The survey names node "+names+", and node "+tree.Node+" runs this sweep. Run ./RUNME.sh tools.")}
}

// [[spec/design_output/tree#what-a-rule-answers]]
var Rules = []func(*Tree) []Finding{
	settingsNameBinaries,
	editorDrawsWriteRules,
	biomeOnWindows,
	extensionsOnOffer,
	noLogDeleted,
	nameHoldsTheWords,
	nothingPrivateTravels,
	surveyNamesInstalls,
	surveyFindsNode,
}

// [[spec/design_output/tree#what-a-rule-answers]]
func treeFaults(tree *Tree) []Finding {
	out := []Finding{}
	for _, rule := range Rules {
		out = append(out, rule(tree)...)
	}
	return out
}

func unread(rule, where string) Finding {
	return fault(rule, where, 1,
		"This file reads as no JSON, so every rule over it stands unchecked.")
}

func parsedJSON(text string) map[string]any {
	if strings.TrimSpace(text) == "" {
		return nil
	}
	var said map[string]any
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		return nil
	}
	return said
}

func keysOf(said map[string]any) []string {
	out := make([]string, 0, len(said))
	for key := range said {
		out = append(out, key)
	}
	sort.Strings(out)
	return out
}

func listOf(said any) []any {
	one, held := said.([]any)
	if !held {
		return nil
	}
	return one
}

func asText(said any) string {
	one, held := said.(string)
	if !held {
		return ""
	}
	return one
}

func itoa(said int) string { return strconv.Itoa(said) }

func has(said []string, one string) bool {
	for _, each := range said {
		if each == one {
			return true
		}
	}
	return false
}

func lineOf(text, needle string) int {
	if needle == "" {
		return 1
	}
	for i, line := range splitLines(text) {
		if strings.Contains(line, needle) {
			return i + 1
		}
	}
	return 1
}
