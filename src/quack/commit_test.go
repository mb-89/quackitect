// The Go commit verb, a case for each road commit-verb.test.js and the commit
// cases of named.test.js covered: the message, the gates, the paths it lands,
// the cold probe, the merge, and the push from a cloud box, each over FakeRepo.
// [[spec/tickets/quack-repos-meet-fake-git]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/prose"
)

// A finding Vale answers over the message, by its rule. [[spec/tickets/landing-verbs-port-to-go]]
func voiceSaying(rule string) func(string) []heard {
	return func(string) []heard {
		return []heard{{found: prose.Finding{Rule: rule, Line: 1, Column: 4}, message: "the rule " + rule + " names this", severity: "warning"}}
	}
}

// The message the commit cases open with, naming the open ticket a-ticket. [[spec/tickets/landing-verbs-port-to-go]]
const opens = "a-ticket: the change lands"

// The commit verb over its message, its check and its tests. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerb(t *testing.T) {
	t.Parallel()
	t.Run("a call with no message prints the usage, and lands nothing", func(t *testing.T) {
		at := landingRepo(t)
		d, heard, _ := fakeLanding(at)
		code, out, _ := runsTwin(commitVerb(d), "commit")
		if code != exitUsage || !strings.Contains(out, "Usage: ./RUNME.sh commit") || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, out, heard.ran)
		}
	})
	t.Run("a message opening with no ticket, an unknown one or a closed one stages nothing", func(t *testing.T) {
		for _, message := range []string{"the change lands", "nobody: the change lands", "shut: the change lands"} {
			at := landingRepo(t)
			lays(t, at.root, "src/a.go", "package a\n")
			d, heard, _ := fakeLanding(at)
			code, _, errs := runsTwin(commitVerb(d), "commit", message)
			if code != exitUsage || !strings.Contains(errs, "Open the message with <ticket>:") || at.staged() != "" || len(heard.ran) != 0 {
				t.Fatalf("%q answers %d, %q, staged %q, ran %v", message, code, errs, at.staged(), heard.ran)
			}
		}
	})
	t.Run("a clean message lands, runs the check, and pushes on green", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || at.originSubject("main") != opens {
			t.Fatalf("commit answers %d, %q, %q, and HEAD reads %q", code, out, errs, at.subject())
		}
		if !heard.reached("test") || !heard.reached("check") || !strings.Contains(out, "main stands pushed.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a message breaking a rule of form names every finding, logs it, and the commit lands", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, _, rows := fakeLanding(at)
		d.voice = voiceSaying("Sentence")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || !strings.Contains(errs, "the message:1 Sentence: the rule Sentence names this") {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if len(*rows) != 1 || (*rows)[0]["level"] != "warn" || (*rows)[0]["kind"] != "commit" || (*rows)[0]["rule"] != "Sentence" {
			t.Fatalf("the log holds %v", *rows)
		}
	})
	t.Run("a message carrying a private name is refused, and stages nothing", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		d.voice = voiceSaying("Private")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "The voice rules refuse this message.") || !strings.Contains(errs, "the message:1:4: Private:") || at.staged() != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a red check holds the push back, and names what the check refuses", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() != opens || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if !strings.Contains(errs, "The check answers red on this commit, so no push reaches origin.") || !strings.Contains(errs, "src/a.go:1 a rule breaks") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a red test run commits nothing, stages nothing, and names what the run says", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["test"] = verbAnswer{exitFailed, "--- FAIL: TestA"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() == opens || at.staged() != "" || heard.reached("check") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if !strings.Contains(errs, "The tests answer red, so nothing stages and nothing lands:") || !strings.Contains(errs, "--- FAIL: TestA") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("the tests run before the staging, and the check after the commit", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, _, _ := fakeLanding(at)
		var seen []string
		d.verb = func(words ...string) (int, string) {
			seen = append(seen, words[0]+" staged="+at.staged()+" head="+at.subject())
			return 0, ""
		}
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		want := []string{"test staged= head=a-ticket: the tree opens", "check staged= head=" + opens}
		if strings.Join(seen, "|") != strings.Join(want, "|") {
			t.Fatalf("the verbs ran as %v, and want %v", seen, want)
		}
	})
}

// The commit verb on a desk, under its flags, and where git refuses. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbDesk(t *testing.T) {
	t.Parallel()
	t.Run("a desk lands and checks the commit on main, and pushes nothing", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || !heard.reached("check") || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a desk's commit on a work branch refuses, names main, and runs no test and stages nothing", func(t *testing.T) {
		at := landingRepo(t)
		at.must(at.repo.Switch("work/a-group", true))
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "A desk works on main alone") || at.staged() != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("the no-push flag leaves the branch where it stands", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push")
		if code != 0 || at.subject() != opens || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a path git cannot stage names what git says, and commits nothing", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/nowhere.go")
		if code != exitFailed || at.subject() == opens || !strings.Contains(errs, "The staging comes back refused") || !strings.Contains(errs, "src/nowhere.go") {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a commit git refuses lands nothing, and the staging comes back", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		at.repo.Set("user.useConfigOnly", "true")
		at.repo.Set("user.email", "")
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() == opens || at.staged() != "" || !strings.Contains(errs, "The commit comes back refused, so nothing lands:") {
			t.Fatalf("commit answers %d, %q, staged %q", code, errs, at.staged())
		}
	})
	t.Run("a call naming paths lands those paths alone", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		lays(t, at.root, "src/b.go", "package b\n")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/a.go"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := at.landedNames(); landed != "src/a.go" {
			t.Fatalf("the commit lands %q", landed)
		}
		left, _ := at.repo.Status(true)
		if len(left) != 1 || left[0].Path != "src/b.go" {
			t.Fatalf("src/b.go leaves the tree: %v", left)
		}
	})
}

// The commit verb over a moved path, which the rename journal names. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbMoves(t *testing.T) {
	t.Parallel()
	t.Run("a commit naming a renamed ticket lands the old path's deletion with it", func(t *testing.T) {
		at := landingRepo(t)
		at.moves("spec/tickets/a-ticket.md", "spec/tickets/b-ticket.md")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", "b-ticket: the ticket moves", "spec/tickets/b-ticket.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		landed := at.landed()
		if !strings.Contains(landed, "D\tspec/tickets/a-ticket.md") || !strings.Contains(landed, "A\tspec/tickets/b-ticket.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a commit naming a renamed path lands the old path the rename journal names, where git reads no rename", func(t *testing.T) {
		at := landingRepo(t)
		at.moves("README.md", "GUIDE.md")
		lays(t, at.root, "GUIDE.md", "a text written over whole, so git reads no rename here\n")
		journals(t, at.root, "README.md", "GUIDE.md")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		landed := at.landed()
		if !strings.Contains(landed, "D\tREADME.md") || !strings.Contains(landed, "A\tGUIDE.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a journaled old path the index still holds stages with the new path", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "GUIDE.md", "a text written over whole\n")
		if err := os.Remove(filepath.Join(at.root, "README.md")); err != nil {
			t.Fatal(err)
		}
		journals(t, at.root, "README.md", "GUIDE.md")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := at.landed(); !strings.Contains(landed, "D\tREADME.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a journaled old path standing nowhere stays out of the commit", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "GUIDE.md", "a guide\n")
		journals(t, at.root, "OLD.md", "GUIDE.md")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := at.landedNames(); landed != "GUIDE.md" {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a path under a journaled folder move standing nowhere stays out of the commit", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "docs/new/a.md", "a note\n")
		journals(t, at.root, "docs/old", "docs/new")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "docs/new/a.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := at.landedNames(); landed != "docs/new/a.md" {
			t.Fatalf("the commit lands %q", landed)
		}
	})
}

// Whether origin carries the branch. [[spec/tickets/takeover-rescues-unpushed-commits]]
func (at *landing) originHas(branch string) bool {
	_, ok := at.origin.Resolve("refs/heads/" + branch)
	return ok
}

// A repository standing on work/one-group, pushed. [[spec/tickets/takeover-rescues-unpushed-commits]]
func onWorkBranch(t *testing.T) *landing {
	t.Helper()
	at := landingRepo(t)
	if err := at.repo.Switch("work/one-group", true); err != nil {
		t.Fatal(err)
	}
	if pushed := at.repo.Push("work/one-group", false); !pushed.OK {
		t.Fatal(pushed.Err)
	}
	return at
}

// A red cloud commit on a work branch still reaches origin on its rescue branch, and a green push drops the rescue. [[spec/tickets/takeover-rescues-unpushed-commits]]
func TestCommitVerbRescue(t *testing.T) {
	t.Parallel()
	t.Run("a red cloud commit lands on rescue/<group> on origin, and the work branch there moves nowhere", func(t *testing.T) {
		at := onWorkBranch(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.originSubject("work/one-group") == opens {
			t.Fatalf("commit answers %d, %q, and the work branch on origin reads %q", code, errs, at.originSubject("work/one-group"))
		}
		if !at.originHas("rescue/one-group") || at.originSubject("rescue/one-group") != opens || !strings.Contains(errs, "rescue/one-group") {
			t.Fatalf("the red commit reaches no rescue branch: %q", errs)
		}
	})
	t.Run("a red commit off a work branch writes no rescue", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != exitFailed {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if rescues, _ := at.origin.Refs("refs/heads/rescue/"); len(rescues) != 0 {
			t.Fatalf("origin holds a rescue: %v", rescues)
		}
	})
	t.Run("a green push on the work branch drops the rescue it carries", func(t *testing.T) {
		at := onWorkBranch(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		runsTwin(commitVerb(d), "commit", opens)
		delete(heard.answers, "check")
		lays(t, at.root, "src/b.go", "package a\n")
		if code, _, errs := runsTwin(commitVerb(d), "commit", "a-ticket: the fix lands"); code != 0 || at.originHas("rescue/one-group") {
			t.Fatalf("commit answers %d, %q, and the rescue stands: %v", code, errs, at.originHas("rescue/one-group"))
		}
	})
}

// The commit verb at its gates: the cold probe, the paths it names, and the conflict markers. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbGates(t *testing.T) {
	t.Parallel()
	t.Run("a staged file on the cold path runs the probe after the tests, and the commit stands on its pass", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(at)
		d.claude = filepath.Join(at.root, "README.md")
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || !heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if heard.ran[0][0] != "test" || !strings.Contains(out, "The cold probe passes on the staged change to src/quack/a.go.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a staged list off the cold path runs no probe", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		d.claude = filepath.Join(at.root, "README.md")
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a failing cold probe refuses the commit, prints its lines, and unstages", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(at)
		d.claude = filepath.Join(at.root, "README.md")
		heard.answers["probe cold"] = verbAnswer{exitFailed, "FAIL hook: no line"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() == opens || at.staged() != "" || heard.reached("check") || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q, HEAD %q, staged %q, ran %v", code, errs, at.subject(), at.staged(), heard.ran)
		}
		if !strings.Contains(errs, "The cold probe answers FAIL on the staged change, so nothing lands:") || !strings.Contains(errs, "FAIL hook: no line") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a cold-path commit on a box holding no claude refuses in one line", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() == opens || at.staged() != "" || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if lines := strings.Split(strings.TrimSpace(errs), "\n"); len(lines) != 1 || !strings.HasPrefix(lines[0], "claude stands nowhere on this box, so src/quack/a.go lands only where the cold probe runs") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a call naming paths gates on the paths it lands alone", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/quack/a.go", "package main\n")
		lays(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/a.go"); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a staged conflict marker refuses the commit, and the staging comes back", func(t *testing.T) {
		at := landingRepo(t)
		lays(t, at.root, "src/a.go", "<<<<<<< ours\npackage a\n=======\npackage b\n>>>>>>> theirs\n")
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() == opens || at.staged() != "" || !strings.Contains(errs, "src/a.go:1  a conflict marker") {
			t.Fatalf("commit answers %d, %q, staged %q", code, errs, at.staged())
		}
	})
	t.Run("an unmerged file still carrying a marker refuses the commit and stages nothing", func(t *testing.T) {
		at := conflicted(t)
		d, heard, _ := fakeLanding(at)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || !strings.Contains(errs, "A merge stands unresolved, so no commit lands:") || !strings.Contains(errs, "README.md:1  a conflict marker") || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("an unmerged file written clean lands the merge through the verb", func(t *testing.T) {
		at := conflicted(t)
		lays(t, at.root, "README.md", "a tree, merged\n")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if _, merged := at.repo.Resolve("HEAD^2"); !merged {
			t.Fatal("the commit carries one parent, and wants a merge")
		}
	})
}

// A repository standing mid-merge, README.md conflicted between main and a side branch. [[spec/tickets/quack-repos-meet-fake-git]]
func conflicted(t *testing.T) *landing {
	t.Helper()
	at := landingRepo(t)
	at.must(at.repo.Switch("side", true))
	lays(t, at.root, "README.md", "a tree on the side\n")
	at.commits("a-ticket: the side")
	at.must(at.repo.Switch(trunkBranch, false))
	lays(t, at.root, "README.md", "a tree on main\n")
	at.commits("a-ticket: the main")
	if conflicts, _ := at.repo.Merge("side", "", false); len(conflicts) == 0 {
		t.Fatal("the merge lands clean, and wants a conflict")
	}
	return at
}

// Writes a rename journal entry under the root naming the move. [[spec/tickets/landing-verbs-port-to-go]]
func journals(t *testing.T, root, from, to string) {
	t.Helper()
	text, err := json.Marshal(map[string]any{"by": renameBy, "at": "2026-01-02T03:04:05.000Z", "files": []any{}, "moved": map[string]string{"from": from, "to": to}})
	if err != nil {
		t.Fatal(err)
	}
	lays(t, root, ".se/.runtime/undo/20260102030405000000.json", string(text))
}
