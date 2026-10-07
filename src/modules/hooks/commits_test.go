// The commit guards against the bridge: one case table, written off the
// bridge's own answers over taught git reads, which the door answers alike.
// [[spec/tickets/cage-commit-guards-port]]
package hooks

import (
	"encoding/json"
	"os"
	"strings"
	"testing"

	"quackitect/src/modules/hooks/command"
)

// The case table the bridge's own answers wrote. [[spec/tickets/cage-commit-guards-port]]
const commitCases = cageLogs + "/commit-guards-cases.json"

type voiced struct {
	Rule    string `json:"rule"`
	Said    string `json:"said"`
	Message string `json:"message"`
}

type commitCase struct {
	Name        string            `json:"name"`
	Command     string            `json:"command"`
	Description string            `json:"description"`
	Cloud       bool              `json:"cloud"`
	Env         map[string]string `json:"env"`
	Files       map[string]string `json:"files"`
	Git         map[string]string `json:"git"`
	Voice       []voiced          `json:"voice"`
	Decision    string            `json:"decision"`
	Text        string            `json:"text"`
}

type commitTable struct {
	Masks map[string]string `json:"masks"`
	Tree  map[string]string `json:"tree"`
	Cases []commitCase      `json:"cases"`
}

// The table masks each private shape, so its own commit meets the private delta clean. [[spec/tickets/cage-commit-guards-port]]
func commitTableOf(t *testing.T) commitTable {
	t.Helper()
	body, err := os.ReadFile(commitCases)
	if err != nil {
		t.Fatal(err)
	}
	var masked commitTable
	if err := json.Unmarshal(body, &masked); err != nil {
		t.Fatal(err)
	}
	text := string(body)
	for mask, raw := range masked.Masks {
		if mask != raw {
			text = strings.ReplaceAll(text, mask, raw)
		}
	}
	var table commitTable
	if err := json.Unmarshal([]byte(text), &table); err != nil {
		t.Fatal(err)
	}
	return table
}

// A git read answering each read the case teaches, and every other read empty, as the bridge's git reads a failing run. [[spec/tickets/cage-commit-guards-port]]
func taughtGit(answers map[string]string) func(string, ...string) string {
	return func(_ string, args ...string) string { return answers[strings.Join(args, " ")] }
}

// The voice answers the case's kept findings, and a case naming none reads no voice, as the bridge's box with no Vale. [[spec/tickets/cage-commit-guards-port]]
func taughtVoice(found []voiced) func(string, string) []command.Row {
	if found == nil {
		return nil
	}
	return func(string, string) []command.Row {
		out := make([]command.Row, 0, len(found))
		for _, one := range found {
			out = append(out, command.Row{Rule: one.Rule, Said: one.Said, Message: one.Message})
		}
		return out
	}
}

// Every commit and push the bridge refuses, the door refuses with the same text, and every one it passes the door passes. [[spec/tickets/cage-commit-guards-port]]
func TestTheCommitGuardsRefuseWhatTheBridgeRefuses(t *testing.T) {
	table := commitTableOf(t)
	for _, one := range table.Cases {
		t.Run(one.Name, func(t *testing.T) {
			files := table.Tree
			for path, text := range one.Files {
				files = with(files, path, text)
			}
			door := doorOver(t, &calls{}, &book{}).door
			settings := Settings{Words: nameWords, Cloud: one.Cloud, User: one.Env["USER"], Home: one.Env["HOME"]}
			door.from.Config = func(string) Settings { return settings }
			door.from.Git = taughtGit(one.Git)
			door.from.Voice = taughtVoice(one.Voice)
			e := map[string]any{"tool": bashTool, "command": one.Command, "description": one.Description, "session_id": "s1"}
			post := Post{Event: toolEvent, E: e, Root: treeOf(t, files, "")}
			said, err := door.Hook(post)
			if err != nil {
				t.Fatal(err)
			}
			if got := NewDecisionOf(post, said); got != one.Decision {
				t.Fatalf("the door reads %s where the bridge reads %s, answering %+v", got, one.Decision, said)
			}
			if got := refusalOf(said); got != one.Text {
				t.Fatalf("the door says\n%s\nwhere the bridge says\n%s", got, one.Text)
			}
		})
	}
}

// A desk refuses a landing on a work branch alone, and a cloud box lands there, off the cases test/level0/cloud-desk.test.js held over lib/cloud.js. [[spec/tickets/cage-libs-leave]]
func TestTheDeskGuardRefusesAWorkBranchOffTheCloudAlone(t *testing.T) {
	for _, one := range []struct {
		cloud   bool
		branch  string
		refuses bool
	}{
		{false, "work/one-group", true},
		{false, "main", false},
		{false, "claude/a-thing", false},
		{true, "work/one-group", false},
	} {
		d := &Door{}
		d.from.Git = taughtGit(map[string]string{"rev-parse --abbrev-ref HEAD": one.branch})
		said := d.deskGuard("git commit -m x", t.TempDir(), Settings{Cloud: one.cloud})
		if refused := strings.Contains(said, "lands nowhere on "+one.branch); refused != one.refuses {
			t.Errorf("the desk guard over %s, cloud %v, says %q, and wants a refusal %v", one.branch, one.cloud, said, one.refuses)
		}
	}
}

// A door reaching no git and no voice reads neither, and its guards pass a commit. [[spec/tickets/cage-commit-guards-port]]
func TestADoorWithNoGitOrVoiceReadsNeither(t *testing.T) {
	root := t.TempDir()
	d := &Door{}
	if got := d.git(root, "status"); got != "" {
		t.Errorf("a door with no git reads %q", got)
	}
	if rows := d.commitVoice(`git commit -m "a message"`, root, disk{root}); rows != nil {
		t.Errorf("a door with no voice reads %v", rows)
	}
	if said := d.commitGuards(`git commit -m "a message"`, root, Settings{}, disk{root}); said != "" {
		t.Errorf("a door with no git refuses a commit: %s", said)
	}
}
