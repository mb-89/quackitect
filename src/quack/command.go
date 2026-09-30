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

// The variables saying the box stands in the cloud, off .claude/skills/level0/lib/cloud.js. [[spec/guidance/cloud/cloud]]
var cloudVariables = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

// The words a name holds under the root, and whether a cloud variable reads true. [[spec/tickets/cage-command-rules-port]]
func commandSettings(root string) hooks.Settings {
	cloud := false
	for _, name := range cloudVariables {
		said := strings.ToLower(strings.TrimSpace(os.Getenv(name)))
		cloud = cloud || (said != "" && said != "0" && said != "false")
	}
	return hooks.Settings{Words: settingsreader.Count(root, nameWordsKey), Cloud: cloud}
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
