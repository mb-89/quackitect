// What the hooks door's command rules read off this box: the words a name
// holds under the root, the cloud flag, and a git read.
// [[spec/tickets/cage-command-rules-port]]
package main

import (
	"context"
	"os"
	"os/exec"
	"strings"
	"time"

	settingsreader "quackitect/src/config"
	"quackitect/src/modules/hooks"
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

// The helper tiers the Agent door reads, off TIERS in src/bridge/agent.js. [[spec/design_output/level0#a-spawn-names-its-tier]]
var helperTiers = []string{"find", "change", "decide"}

// The variables saying the box stands in the cloud, off .claude/skills/level0/lib/cloud.js. [[spec/guidance/cloud/cloud]]
var cloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// The words a name holds under the root, and whether a cloud variable reads true. [[spec/tickets/cage-command-rules-port]]
func commandSettings(root string) hooks.Settings {
	cloud := false
	for _, name := range cloudVariables {
		said := strings.ToLower(strings.TrimSpace(os.Getenv(name)))
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
	}
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
	span, stop := context.WithTimeout(context.Background(), gitReadSpan)
	defer stop()
	run := exec.CommandContext(span, "git", args...)
	run.Dir = root
	said, err := run.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(said))
}
