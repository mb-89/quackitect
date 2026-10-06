// The Copilot registrations: they equal the files git tracks, a repeated setup
// writes nothing, a file a person owns stands, and auto waits on Copilot.
// [[spec/design_output/copilot#setup-and-discovery]]
package main

import (
	"path/filepath"
	"slices"
	"testing"
)

func TestTheRegistrationsEqualTheTrackedFiles(t *testing.T) {
	t.Parallel()
	for _, one := range copilotRegistrations() {
		tracked, ok := readText(filepath.Join("..", "..", filepath.FromSlash(one.name)))
		if !ok {
			t.Errorf("%s stands untracked", one.name)
			continue
		}
		if tracked != one.content {
			t.Errorf("%s reads\n%s\nand the setup writes\n%s", one.name, tracked, one.content)
		}
	}
}

func TestTheSetupWritesOnceAndLeavesTheClaudeSettings(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	seedTree(t, d.root, map[string]string{".claude/settings.json": "original"})
	written, err := copilotSetup(d, "vscode")
	if err != nil || len(written) != 2 {
		t.Fatalf("the setup writes %v, %v", written, err)
	}
	if again, err := copilotSetup(d, "vscode"); err != nil || len(again) != 0 {
		t.Errorf("a second setup writes %v, %v", again, err)
	}
	if text, _ := readText(filepath.Join(d.root, ".claude", "settings.json")); text != "original" {
		t.Error("the Claude settings moved")
	}
}

func TestTheSetupRefusesAFileAPersonOwns(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	seedTree(t, d.root, map[string]string{".github/workflows/copilot-setup-steps.yml": "user workflow"})
	if _, err := copilotSetup(d, "vscode"); err == nil || err.Error() != "Keep .github/workflows/copilot-setup-steps.yml: it belongs to you. Merge the generated registration manually." {
		t.Errorf("the setup answers %v", err)
	}
	if text, _ := readText(filepath.Join(d.root, ".github", "workflows", "copilot-setup-steps.yml")); text != "user workflow" {
		t.Error("the person's workflow moved")
	}
	if stands(filepath.Join(d.root, ".github", "hooks", "level0.json")) {
		t.Error("the refusal still wrote the hooks")
	}
	if _, err := copilotSetup(d, "desk"); err == nil {
		t.Error("an unknown target reads as one")
	}
}

func TestAutoWaitsOnCopilotAndCloudWritesItsMark(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	if written, err := copilotSetup(d, "auto"); err != nil || len(written) != 0 {
		t.Errorf("auto with no Copilot writes %v, %v", written, err)
	}
	if !slices.ContainsFunc(runner.ran, func(argv []string) bool { return slices.Equal(argv, []string{"code-insiders", "--list-extensions"}) }) {
		t.Errorf("auto asks no editor: %v", runner.ran)
	}
	if written, err := copilotSetup(d, "cloud"); err != nil || len(written) != 2 {
		t.Errorf("cloud writes %v, %v", written, err)
	}
	if text, _ := readText(filepath.Join(d.root, filepath.FromSlash(copilotCloudMark))); text != "cloud\n" {
		t.Errorf("the mark reads %q", text)
	}
}

func TestAnEditorListingCopilotOrTheEditorsTerminalTurnsAutoOn(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	runner.answers["code --list-extensions"] = ranResult{stdout: "GitHub.copilot-chat\n"}
	if !copilotDetected(d) {
		t.Error("an editor listing Copilot reads as none")
	}
	d, _, _, _ = fakeBoxDoors(t)
	d.env = func(key string) string { return map[string]string{"TERM_PROGRAM": "vscode"}[key] }
	if !copilotDetected(d) {
		t.Error("the editor's terminal reads as no Copilot")
	}
	d.env = func(key string) string {
		return map[string]string{"GITHUB_COPILOT_GIT_TOKEN": "t", "COPILOT_AGENT_PROMPT": "p"}[key]
	}
	if !copilotCloud(d) {
		t.Error("the cloud agent's variables read as no cloud")
	}
	d, runner, _, _ = fakeBoxDoors(t)
	d.goos = "windows"
	copilotDetected(d)
	if len(runner.ran) == 0 || runner.ran[0][0] != "cmd" {
		t.Errorf("Windows asks the editor past cmd: %v", runner.ran)
	}
}
