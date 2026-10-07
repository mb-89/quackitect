// What the hooks door's command rules read off this box: the words a name
// holds under the root, the cloud flag, and a git read.
// [[spec/tickets/cage-command-rules-port]]
package main

import (
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/modules/hooks"
	"quackitect/src/modules/hooks/command"
	"quackitect/src/proc"
	"quackitect/src/prose"
	"quackitect/src/rules"
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

// The helper tiers the Agent door reads, off Tiers in src/modules/hooks/brief/brief.go. [[spec/design_output/level0#a-spawn-names-its-tier]]
var helperTiers = []string{"find", "change", "decide"}

// The variables saying the box stands in the cloud, off .claude/skills/level0/lib/cloud.js. [[spec/guidance/cloud/cloud]]
var cloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// The variables naming the box's user and its home folder, first set first. [[spec/tickets/cage-commit-guards-port]]
var (
	userVariables = []string{"USER", "USERNAME", "LOGNAME"}
	homeVariables = []string{"HOME", "USERPROFILE"}
)

// The name the rules read a commit message under. [[spec/tickets/cage-commit-guards-port]]
const commitName = "level0-commit.md"

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

// The findings the voice keeps over a commit message: the Go rules over it as level0-commit.md, each past the Go prose vetoes. A root where no rules load, or rules answering no rows, reads none. [[spec/tickets/cage-commit-guards-port]]
func commitVoice(box boxDoors, root, message string) []command.Row {
	var out []command.Row
	for _, one := range heardOver(box, root, commitName, message).rows {
		out = append(out, command.Row{Rule: one.found.Rule, Said: one.found.Said, Message: one.message})
	}
	return out
}

// One row the Go rules answer past the vetoes, with its message and severity. [[spec/tickets/cage-write-door-port]]
type heard struct {
	found    prose.Finding
	message  string
	severity string
}

// What the Go rules answer over a text read as the named file: the rows the Go prose vetoes keep, in place order, whether the rules load and run, and why where they do not. [[spec/tickets/cage-write-door-port]] [[spec/tickets/drafts-lint-seam-carries-why]]
type rulesHeard struct {
	rows   []heard
	stands bool
	ran    bool
	why    string
}

// The Go rules over a text as the named file, each row past every Go prose veto. A root where no rules load reads nothing. [[spec/tickets/cage-commit-guards-port]] [[spec/tickets/cage-write-door-port]]
func heardOver(box boxDoors, root, name, text string) rulesHeard {
	return heardIn(box, root, name, text, prose.All)
}

// The Go rules over a text as the named file, kept through the Go prose vetoes the mode names, and the load error where no rules load. The schema and word lists read through the box's disk. [[spec/tickets/prose-checks-run-in-go]]
func heardIn(box boxDoors, root, name, text, mode string) rulesHeard {
	set, err := rulesAt(root)
	if err != nil {
		return rulesHeard{why: err.Error()}
	}
	read := map[string][]rules.Finding{name: set.Lint(name, text)}
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
	out := rulesHeard{stands: true, ran: true}
	for _, one := range all {
		if len(prose.Kept(text, []prose.Finding{one.found}, caps, words, mode)) > 0 {
			out.rows = append(out.rows, one)
		}
	}
	return out
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
func gitRead(root string, args ...string) string {
	said := proc.Real(proc.Command{Argv: append([]string{"git"}, args...), Dir: root, Wait: gitReadSpan})
	if said.Code != 0 {
		return ""
	}
	return strings.TrimSpace(said.Out)
}
