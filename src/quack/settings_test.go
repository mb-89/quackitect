// The tracked settings deny the merge tool of the GitHub connector, so auto-merge stays the one road to main.
// [[spec/tickets/probe-at-revision-guards-merges]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"testing"
)

// The tool a session merges a pull request with, which the settings deny. [[spec/tickets/probe-at-revision-guards-merges]]
const mergeTool = "mcp__github__merge_pull_request"

func TestTheSettingsDenyTheMergeTool(t *testing.T) {
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
	if !slices.Contains(read.Permissions.Deny, mergeTool) {
		t.Errorf("the settings deny %v, and no %s", read.Permissions.Deny, mergeTool)
	}
}
