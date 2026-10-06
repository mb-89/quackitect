// What the hooks door's command rules read off this box: the words a name
// holds under the root, the cloud flag, and a git read.
// [[spec/tickets/cage-command-rules-port]]
package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/modules/check"
	"quackitect/src/modules/hooks"
	"quackitect/src/modules/hooks/command"
	"quackitect/src/prose"
)

// The key capping a name's words, and the span a git read takes. [[spec/tickets/cage-command-rules-port]]
const (
	nameWordsKey = "names.words"
	gitReadSpan  = 10 * time.Second
)

// The keys the holds read, and the prefix each helper tier's model stands under. [[spec/tickets/cage-call-holds-port]]
const (
	holdKey         = "stop.hold"
	askKey          = "ask.wanted"
	bindingKey      = "engine.binding"
	finishGraceKey  = "grace.finish"
	updateGraceKey  = "grace.update"
	planEveryKey    = "plan.everyCalls"
	planGraceKey    = "plan.grace"
	planMostOpenKey = "plan.mostOpen"
	helperKey       = "helper."
)

// The keys the stop reads: the hook's switch, the cap on holds in a row, and the fill the handover comes due at. [[spec/tickets/cage-stop-rules-port]]
const (
	stopEnabledKey = "stop.enabled"
	mostInARowKey  = "stop.mostInARow"
	handoverAtKey  = "context.handoverAt"
)

// The helper tiers the Agent door reads, off TIERS in src/bridge/agent.js. [[spec/design_output/level0#a-spawn-names-its-tier]]
var helperTiers = []string{"find", "change", "decide"}

// The variables saying the box stands in the cloud, off .claude/skills/level0/lib/cloud.js. [[spec/guidance/cloud/cloud]]
var cloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// The variables naming the box's user and its home folder, first set first, off boxHere in src/bridge/bash.js. [[spec/tickets/cage-commit-guards-port]]
var (
	userVariables = []string{"USER", "USERNAME", "LOGNAME"}
	homeVariables = []string{"HOME", "USERPROFILE"}
)

// The name Vale reads a commit message under, the configs it takes, the style a prose rule's name drops, and the span it takes, off src/bridge/bash.js and lib/vale.js. [[spec/tickets/cage-commit-guards-port]]
const (
	commitName = "level0-commit.md"
	valeOwn    = ".vale.ini"
	valeBuilt  = ".se/vale/.vale.ini"
	valeSpan   = 30 * time.Second
)

// [[spec/tickets/cage-commit-guards-port]]
var proseStyle = regexp.MustCompile(`^Voice(Vale|Paragraph)\.`)

// The words a name holds under the root, and whether a cloud variable reads true. [[spec/tickets/cage-command-rules-port]]
func commandSettings(box boxDoors, root string) hooks.Settings {
	cloud := false
	for _, name := range cloudVariables {
		said := strings.ToLower(strings.TrimSpace(box.env(name)))
		cloud = cloud || (said != "" && said != "0" && said != "false")
	}
	helpers := map[string]string{}
	for _, tier := range helperTiers {
		if model := textSetting(root, helperKey+tier); model != "" {
			helpers[tier] = model
		}
	}
	return hooks.Settings{
		Words: settingsreader.Count(root, nameWordsKey), Cloud: cloud,
		Hold: textSetting(root, holdKey), Ask: textSetting(root, askKey), Binding: textSetting(root, bindingKey),
		FinishGrace: settingsreader.Count(root, finishGraceKey), UpdateGrace: settingsreader.Count(root, updateGraceKey),
		PlanEvery: settingsreader.Count(root, planEveryKey), PlanGrace: settingsreader.Count(root, planGraceKey),
		PlanMostOpen: settingsreader.Count(root, planMostOpenKey), Helpers: helpers,
		User: firstSet(box, userVariables), Home: firstSet(box, homeVariables),
		StopOff: stopOff(root), MostInARow: settingsreader.Count(root, mostInARowKey),
		HandoverAt: settingsreader.Count(root, handoverAtKey), BindingLayer: layerOf(root, bindingKey),
	}
}

// The stop hook stands off where its switch reads false, as a JSON false or a variable saying so. [[spec/tickets/cage-stop-rules-port]]
func stopOff(root string) bool {
	said, held := settingsreader.Value(root, stopEnabledKey)
	if text, ok := said.(string); ok {
		return held && strings.TrimSpace(strings.ToLower(text)) == "false"
	}
	return held && said == false
}

// The layer a key reads off, which the stop's binding line names. [[spec/design_output/stop#a-refusal-names-the-binding]]
func layerOf(root, key string) string {
	_, layer, _ := settingsreader.Where(root, key)
	return layer
}

// The first variable set, or nothing. [[spec/tickets/cage-commit-guards-port]]
func firstSet(box boxDoors, names []string) string {
	for _, name := range names {
		if said := box.env(name); said != "" {
			return said
		}
	}
	return ""
}

// The findings the voice keeps over a commit message: Vale over it as level0-commit.md, each past the Go prose vetoes. A box with no Vale, or a Vale answering no rows, reads none, as messageFaults does. [[spec/tickets/cage-commit-guards-port]]
func commitVoice(box boxDoors, root, message string) []command.Row {
	var out []command.Row
	for _, one := range heardOver(box, root, commitName, message).rows {
		out = append(out, command.Row{Rule: one.found.Rule, Said: one.found.Said, Message: one.message})
	}
	return out
}

// One row Vale answers past the vetoes, with its message and severity. [[spec/tickets/cage-write-door-port]]
type heard struct {
	found    prose.Finding
	message  string
	severity string
}

// What Vale answers over a text read as the named file: the rows the Go prose vetoes keep, in place order, whether a Vale stands, whether it answered JSON, and why where it did not. [[spec/tickets/cage-write-door-port]] [[spec/tickets/drafts-lint-seam-carries-why]]
type valeHeard struct {
	rows   []heard
	stands bool
	ran    bool
	why    string
}

// The reasons an unread Vale names, worded as lintText in .claude/skills/level0/lib/vale.js words them. [[spec/tickets/drafts-lint-seam-carries-why]]
const (
	noValeWhy    = "no vale stands here"
	valeQuietWhy = "vale answered nothing"
	valeNoJSON   = "vale answered no JSON: "
)

// Why a Vale answer reads as no JSON: its stderr where it exits on one, else the run's fault or its exit, else what it answered. [[spec/tickets/drafts-lint-seam-carries-why]]
func unreadWhy(ran ranResult) string {
	if stderr := strings.TrimSpace(ran.stderr); ran.code != 0 && stderr != "" {
		return stderr
	}
	if ran.fault != "" {
		return ran.fault
	}
	if ran.code != 0 {
		return fmt.Sprintf("exit status %d", ran.code)
	}
	if answer := strings.TrimSpace(ran.stdout); answer != "" {
		return valeNoJSON + answer
	}
	return valeQuietWhy
}

// Vale over a text as the named file, each row past the Go prose vetoes. A box with no Vale reads nothing, as messageFaults and proseFaults do. [[spec/tickets/cage-commit-guards-port]] [[spec/tickets/cage-write-door-port]]
func heardOver(box boxDoors, root, name, text string) valeHeard {
	return heardIn(box, root, name, text, prose.All)
}

// What Vale answers over a text, kept through the Go prose vetoes the mode names. [[spec/tickets/prose-checks-run-in-go]]
func heardIn(box boxDoors, root, name, text, mode string) valeHeard {
	vale := valeAt(box.disk, root)
	if vale == "" {
		return valeHeard{why: noValeWhy}
	}
	config := valeOwn
	if !standsUnder(box.disk, root, valeOwn) && standsUnder(box.disk, root, valeBuilt) {
		config = valeBuilt
	}
	ran := box.run([]string{vale, "--config=" + config, "--path=" + name, "--output=JSON", "--no-exit"}, runOpts{cwd: root, stdin: text, timeout: valeSpan})
	said := []byte(ran.stdout)
	var read map[string][]struct {
		Check    string `json:"Check"`
		Line     int    `json:"Line"`
		Span     []int  `json:"Span"`
		Match    string `json:"Match"`
		Message  string `json:"Message"`
		Severity string `json:"Severity"`
	}
	if json.Unmarshal(said, &read) != nil {
		return valeHeard{stands: true, why: unreadWhy(ran)}
	}
	body := func(path string) string { return box.disk.text(filepath.Join(root, filepath.FromSlash(path))) }
	caps, paths := proseSchema([]byte(body(paragraphSchema)))
	words := prose.Words(body(paths[0]), body(paths[1]), body(paths[2]))
	var all []heard
	for _, rows := range read {
		for _, one := range rows {
			found := prose.Finding{Rule: proseStyle.ReplaceAllString(one.Check, ""), Line: max(one.Line, 1), Column: 1, Said: one.Match}
			if len(one.Span) > 0 {
				found.Column = one.Span[0]
			}
			all = append(all, heard{found, one.Message, one.Severity})
		}
	}
	sort.SliceStable(all, func(a, b int) bool {
		if all[a].found.Line != all[b].found.Line {
			return all[a].found.Line < all[b].found.Line
		}
		return all[a].found.Column < all[b].found.Column
	})
	out := valeHeard{stands: true, ran: true}
	for _, one := range all {
		if len(prose.Kept(text, []prose.Finding{one.found}, caps, words, mode)) > 0 {
			out.rows = append(out.rows, one)
		}
	}
	return out
}

// The Vale the survey names where it stands, else the one in the runtime binary folder, else nothing. [[spec/tickets/cage-commit-guards-port]]
func valeAt(disk diskDoors, root string) string {
	var survey map[string]struct {
		Path string `json:"path"`
	}
	if text, err := disk.read(filepath.Join(root, filepath.FromSlash(check.ToolsAt))); err == nil && json.Unmarshal(text, &survey) == nil {
		if said := survey["vale"].Path; said != "" && standsUnder(disk, "", said) {
			return said
		}
	}
	for _, name := range []string{"vale", "vale.exe"} {
		if guess := filepath.Join(root, filepath.FromSlash(check.Bin), name); standsUnder(disk, "", guess) {
			return guess
		}
	}
	return ""
}

// Whether a file stands at the path, under the root where one names it. [[spec/tickets/cage-commit-guards-port]]
func standsUnder(disk diskDoors, root, path string) bool {
	return disk.stands(filepath.Join(root, filepath.FromSlash(path)))
}

// A text key's value under the root, or nothing where it stands nowhere. [[spec/tickets/cage-call-holds-port]]
func textSetting(root, key string) string {
	said, held := settingsreader.Value(root, key)
	if !held || said == nil {
		return ""
	}
	text, ok := said.(string)
	if !ok {
		return ""
	}
	return strings.TrimSpace(text)
}

// What a git read prints under the root, or nothing where it fails. [[spec/tickets/cage-command-rules-port]]
func gitRead(box boxDoors, root string, args ...string) string {
	ran := box.run(append([]string{"git"}, args...), runOpts{cwd: root, timeout: gitReadSpan})
	if ran.code != 0 || ran.fault != "" {
		return ""
	}
	return strings.TrimSpace(ran.stdout)
}
