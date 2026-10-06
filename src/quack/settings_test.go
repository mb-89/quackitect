// The tracked settings deny the merge tool of the GitHub connector, so auto-merge stays the one road to main.
// [[spec/tickets/probe-at-revision-guards-merges]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The roads a session merges a pull request by, one a GitHub connector the box loads and the CLI, which the settings deny, and the auto-merge the work skill turns on, which they leave open. [[spec/tickets/probe-at-revision-guards-merges]] [[spec/tickets/merge-deny-every-connector]]
var (
	mergeRoads = []string{
		"mcp__github__merge_pull_request",
		"mcp__b6be2f0a-1533-41f3-8991-00692028c4db__merge_pull_request",
		"Bash(gh pr merge:*)",
	}
	autoMerge = "enable_pr_auto_merge"
)

func TestTheSettingsDenyTheMergeToolUnderEveryConnectorAndLeaveAutoMergeOpen(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(settingsFile)))
	if err != nil {
		t.Fatal(err)
	}
	var read struct {
		Permissions struct {
			Deny []string `json:"deny"`
		} `json:"permissions"`
	}
	if err := json.Unmarshal(text, &read); err != nil {
		t.Fatal(err)
	}
	for _, road := range mergeRoads {
		if !slices.Contains(read.Permissions.Deny, road) {
			t.Errorf("the settings deny %v, and no %s", read.Permissions.Deny, road)
		}
	}
	for _, one := range read.Permissions.Deny {
		if strings.Contains(one, autoMerge) {
			t.Errorf("the settings deny %s, which the work skill turns auto-merge on with", one)
		}
	}
}
