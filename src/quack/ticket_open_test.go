// ticket open turns a draft with an Ask into an open ticket at its first leaf,
// through the voice and the group checks, off the roads
// test/level0/ask-lint.test.js and pull-leaves.test.js cover.
// [[spec/design_output/pull#a-draft-opens]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

// The Ask's own line in openDraft, and a line under the do chapter past it, as the lint names them. [[spec/design_output/pull#a-draft-opens]]
const (
	openAskLine = 10
	openDoLine  = 14
)

// A draft as ask-lint.test.js seeds it, with a plain Ask. [[spec/design_output/pull#a-draft-opens]]
const openDraft = `---
kind: [[ticket]]
state: draft
steps:
  - name: do
---

# Ask

The verb clones the upstream into the folder.

# do

Nothing yet.

# Discussion

Nothing yet.
`

// A child naming a-thing under group, as ask-lint.test.js seeds it. [[spec/design_output/work#a-group-is-a-ticket]]
const openChild = "---\nkind: [[ticket]]\nstate: draft\ngroup: a-thing\n---\n\n# Ask\n\nA part.\n"

// The Vale the fake answers with, and the file it keeps what it read in. [[spec/design_output/pull#a-draft-opens]]
const (
	openVale  = ".se/.runtime/bin/vale"
	openHeard = openVale + ".stdin"
)

// A tree in git holding the draft, git reading no config of this box's own. [[spec/design_output/pull#a-draft-opens]]
func openTree(t *testing.T, draft string) string {
	t.Helper()
	root := editCaseTree(t)
	for _, name := range []string{"GIT_AUTHOR_NAME", "GIT_COMMITTER_NAME"} {
		t.Setenv(name, "t")
	}
	for _, name := range []string{"GIT_AUTHOR_EMAIL", "GIT_COMMITTER_EMAIL"} {
		t.Setenv(name, "t@t")
	}
	t.Setenv("GIT_CONFIG_GLOBAL", os.DevNull)
	t.Setenv("GIT_CONFIG_NOSYSTEM", "1")
	seedsFile(t, root, aThing, draft)
	for _, args := range [][]string{{"init", "-q", "-b", "main"}, {"add", "-A"}, {"commit", "-q", "-m", "first"}} {
		openGit(t, root, args...)
	}
	return root
}

func openGit(t *testing.T, root string, args ...string) string {
	t.Helper()
	run := exec.Command("git", args...)
	run.Dir = root
	said, err := run.CombinedOutput()
	if err != nil {
		t.Fatalf("git %v: %v %s", args, err, said)
	}
	return string(said)
}

// A Vale that keeps what it read and answers one finding of the rule at the line, at the severity. [[spec/design_output/pull#a-draft-opens]]
func openValeSaying(t *testing.T, root, rule string, line int, severity string) {
	t.Helper()
	said := `{"stdin.md":[{"Check":"` + rule + `","Line":` + strconv.Itoa(line) + `,"Span":[17,17],"Message":"It breaks.","Severity":"` + severity + `"}]}`
	seedsFile(t, root, openVale, "#!/bin/sh\ncat > \"$0.stdin\"\nprintf '%s' '"+said+"'\n")
	if err := os.Chmod(filepath.Join(root, filepath.FromSlash(openVale)), 0o755); err != nil {
		t.Fatal(err)
	}
}

func openState(t *testing.T, root, path string) string {
	t.Helper()
	text, _ := readsBack(t, root, path)
	for _, row := range strings.Split(text, "\n") {
		if said, ok := strings.CutPrefix(row, "state: "); ok {
			return said
		}
	}
	return ""
}

func TestTicketOpen(t *testing.T) {
	t.Run("open names no ticket, and asks for one", func(t *testing.T) {
		root := openTree(t, openDraft)
		code, out, errs := runsApart(t, root, false, "ticket", "open")
		if code != exitUsage || out != "" || errs != "ticket open needs a ticket: ./RUNME.sh ticket open slow-lint\n" {
			t.Fatalf("open answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("a name no ticket answers refuses", func(t *testing.T) {
		root := openTree(t, openDraft)
		code, _, errs := runsApart(t, root, false, "ticket", "open", "no-such")
		if code != exitUsage || errs != "no-such names no ticket under .se/tickets or spec/tickets.\n" {
			t.Fatalf("open answers %d, %q", code, errs)
		}
	})
	t.Run("a ticket standing open already stays as it stands", func(t *testing.T) {
		root := openTree(t, editCaseTicket(""))
		code, out, _ := runsApart(t, root, false, "ticket", "open", "a-thing")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != aThing+" stands open already.\n" || got != editCaseTicket("") {
			t.Fatalf("open answers %d, %q, and writes %q", code, out, got)
		}
		seedsFile(t, root, aThing, strings.Replace(openDraft, "state: draft\n", "", 1))
		if code, out, _ := runsApart(t, root, false, "ticket", "open", "a-thing"); code != 0 || out != aThing+" stands with no state already.\n" {
			t.Fatalf("open over no state answers %d, %q", code, out)
		}
	})
	t.Run("an Ask that passes opens the ticket at its first leaf, in one commit naming it", func(t *testing.T) {
		root := openTree(t, openDraft)
		code, out, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != 0 || out != aThing+" stands open at do, and the pull hands it out.\n" || errs != "" {
			t.Fatalf("open answers %d, %q, %q", code, out, errs)
		}
		got, _ := readsBack(t, root, aThing)
		if !strings.Contains(got, "\nstate: open\n") || !strings.Contains(got, "\nstep: do\n") {
			t.Fatalf("the ticket holds %q", got)
		}
		if log := openGit(t, root, "log", "--format=%s"); log != "a-thing: opens\nfirst\n" {
			t.Fatalf("git logs %q, and wants one commit naming the ticket", log)
		}
	})
	t.Run("a draft naming its step opens at that step", func(t *testing.T) {
		root := openTree(t, strings.Replace(openDraft, "state: draft\n", "state: draft\nstep: do\n", 1))
		if code, out, _ := runsApart(t, root, false, "ticket", "open", "a-thing"); code != 0 || out != aThing+" stands open at do, and the pull hands it out.\n" {
			t.Fatalf("open answers %d, %q", code, out)
		}
	})
	t.Run("an empty ask, or one of placeholder comments alone, refuses, and the draft stands", func(t *testing.T) {
		for _, ask := range []string{"", "<!-- gain -->\n"} {
			root := openTree(t, strings.Replace(openDraft, "The verb clones the upstream into the folder.\n", ask, 1))
			code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
			if code != exitFailed || errs != aThing+" holds an empty ask, and open waits for one. Write the ask first.\n" || openState(t, root, aThing) != "draft" {
				t.Fatalf("open over %q answers %d, %q", ask, code, errs)
			}
		}
	})
	t.Run("a group no ticket names refuses the open, and the draft stands", func(t *testing.T) {
		root := openTree(t, strings.Replace(openDraft, "state: draft\n", "state: draft\nprocess: [[spec/processes/group]]\n", 1))
		code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != exitFailed || !strings.Contains(errs, "no ticket names it under group") || openState(t, root, aThing) != "draft" {
			t.Fatalf("open answers %d, %q", code, errs)
		}
	})
	t.Run("a group with a child standing opens", func(t *testing.T) {
		root := openTree(t, strings.Replace(openDraft, "state: draft\n", "state: draft\nprocess: [[spec/processes/group]]\n", 1))
		seedsFile(t, root, "spec/tickets/a-part.md", openChild)
		if code, out, errs := runsApart(t, root, false, "ticket", "open", "a-thing"); code != 0 || openState(t, root, aThing) != "open" {
			t.Fatalf("open answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("an Ask breaking a rule of form opens, naming the rule at the file's line, and Vale reads the whole ticket", func(t *testing.T) {
		root := openTree(t, openDraft)
		openValeSaying(t, root, "VoiceParagraph.Characters", openAskLine, "error")
		code, out, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != 0 || !strings.Contains(errs, "breaks a rule of form, and it lands") || !strings.Contains(errs, "line "+strconv.Itoa(openAskLine)+" breaks Characters") || openState(t, root, aThing) != "open" {
			t.Fatalf("open answers %d, %q, %q", code, out, errs)
		}
		if heard, _ := readsBack(t, root, openHeard); heard != openDraft {
			t.Fatalf("Vale reads %q, and wants the whole ticket", heard)
		}
	})
	t.Run("an Ask carrying a private name refuses the open, and the draft stands", func(t *testing.T) {
		root := openTree(t, openDraft)
		openValeSaying(t, root, "VoiceVale.Private", openAskLine, "error")
		code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != exitFailed || !strings.Contains(errs, "breaks the voice rules") || !strings.Contains(errs, "line "+strconv.Itoa(openAskLine)+" breaks Private") || openState(t, root, aThing) != "draft" {
			t.Fatalf("open answers %d, %q", code, errs)
		}
	})
	t.Run("a warning on the Ask opens with its line named, and a warning past the Ask stays unnamed", func(t *testing.T) {
		root := openTree(t, openDraft)
		openValeSaying(t, root, "VoiceParagraph.Wordy", openAskLine, "warning")
		if code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing"); code != 0 || !strings.Contains(errs, "line "+strconv.Itoa(openAskLine)+" breaks Wordy") {
			t.Fatalf("open answers %d, %q", code, errs)
		}
		root = openTree(t, openDraft)
		openValeSaying(t, root, "VoiceParagraph.Wordy", openDoLine, "warning")
		if code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing"); code != 0 || strings.Contains(errs, "breaks Wordy") {
			t.Fatalf("open answers %d, %q", code, errs)
		}
	})
	t.Run("a hook refusing the commit leaves the draft standing", func(t *testing.T) {
		root := openTree(t, openDraft)
		seedsFile(t, root, ".git/hooks/pre-commit", "#!/bin/sh\necho the hook refuses >&2\nexit 1\n")
		if err := os.Chmod(filepath.Join(root, ".git", "hooks", "pre-commit"), 0o755); err != nil {
			t.Fatal(err)
		}
		code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != exitFailed || !strings.HasPrefix(errs, "the hook refuses the commit, so "+aThing+" stands a draft:\n") || openState(t, root, aThing) != "draft" {
			t.Fatalf("open answers %d, %q", code, errs)
		}
	})
	t.Run("a private note opens with no commit", func(t *testing.T) {
		root := openTree(t, openDraft)
		seedsFile(t, root, slowLint, openDraft)
		if code, out, _ := runsApart(t, root, false, "ticket", "open", "slow-lint"); code != 0 || out != slowLint+" stands open at do, and the pull hands it out.\n" || openState(t, root, slowLint) != "open" {
			t.Fatalf("open answers %d, %q", code, out)
		}
		if log := openGit(t, root, "log", "--format=%s"); log != "first\n" {
			t.Fatalf("git logs %q, and wants no commit for a private note", log)
		}
	})
}
