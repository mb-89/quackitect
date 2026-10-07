// ticket open turns a draft with an Ask into an open ticket at its first leaf,
// through the voice and the group checks, off the roads
// test/level0/ask-lint.test.js and pull-leaves.test.js cover.
// [[spec/design_output/pull#a-draft-opens]]
package main

import (
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"quackitect/src/modules/git"
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

// The file the fake Vale keeps what it read in. [[spec/design_output/pull#a-draft-opens]]
const openHeard = ".se/vale.stdin"

// A FakeRepo over a folder holding the draft, committed once. [[spec/tickets/quack-repos-meet-fake-git]]
func openTree(t *testing.T, draft string) string {
	t.Helper()
	root, _ := openRepo(t, draft)
	return root
}

// The same tree, and the FakeRepo the verbs reach over it. [[spec/tickets/quack-repos-meet-fake-git]]
func openRepo(t *testing.T, draft string) (string, *git.FakeRepo) {
	t.Helper()
	root := editCaseTree(t)
	repo := standsInRepo(t, root)
	seedsFile(t, root, aThing, draft)
	commitsAll(t, repo, "first")
	return root, repo
}

// Every commit's subject on HEAD, newest first, a line each. [[spec/tickets/quack-repos-meet-fake-git]]
func openLog(root string) string {
	log, _ := standingRepo(root).Log("", "HEAD", false)
	said := ""
	for _, one := range log {
		said += one.Subject + "\n"
	}
	return said
}

// A Vale that keeps what it read and answers one finding of the rule at the line, at the severity. [[spec/design_output/pull#a-draft-opens]]
func openValeSaying(t *testing.T, root, rule string, line int, severity string) {
	t.Helper()
	said := `{"stdin.md":[{"Check":"` + rule + `","Line":` + strconv.Itoa(line) + `,"Span":[17,17],"Message":"It breaks.","Severity":"` + severity + `"}]}`
	fakeVale(t, root, said, filepath.Join(root, filepath.FromSlash(openHeard)))
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
		if log := openLog(root); log != "a-thing: opens\nfirst\n" {
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
	t.Run("a draft naming a closed group refuses the open, and the draft stands", func(t *testing.T) {
		root := openTree(t, strings.Replace(openDraft, "state: draft\n", "state: draft\ngroup: shut\n", 1))
		seedsFile(t, root, "spec/tickets/shut.md", closedGroupTicket)
		code, _, errs := runsApart(t, root, false, "ticket", "open", "a-thing")
		if code != exitFailed || !strings.Contains(errs, "shut stands closed, so it takes no new child.") || openState(t, root, aThing) != "draft" {
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
	t.Run("a commit git refuses leaves the draft standing", func(t *testing.T) {
		root, repo := openRepo(t, openDraft)
		repo.Set("user.useConfigOnly", "true")
		repo.Set("user.email", "")
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
		if log := openLog(root); log != "first\n" {
			t.Fatalf("git logs %q, and wants no commit for a private note", log)
		}
	})
}
