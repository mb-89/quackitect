// The Go commit verb, a case for each road commit-verb.test.js and the commit
// cases of named.test.js covered: the message, the gates, the paths it lands,
// the cold probe, the merge, and the push from a cloud box.
// [[spec/tickets/landing-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/prose"
)

// What a commit leaves: the subject at HEAD, the names staged, and the subject origin holds on the branch. [[spec/tickets/landing-verbs-port-to-go]]
func headSubject(t *testing.T, root string) string {
	t.Helper()
	return gitDoes(t, root, "log", "-1", "--format=%s")
}

func stagedNames(t *testing.T, root string) string {
	t.Helper()
	return gitDoes(t, root, "diff", "--cached", "--name-only")
}

func originSubject(t *testing.T, origin, branch string) string {
	t.Helper()
	return gitDoes(t, "", "--git-dir="+origin, "log", "-1", "--format=%s", branch)
}

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
		root, _ := landingRepo(t)
		d, heard, _ := fakeLanding(root)
		code, out, _ := runsTwin(commitVerb(d), "commit")
		if code != exitUsage || !strings.Contains(out, "Usage: ./RUNME.sh commit") || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, out, heard.ran)
		}
	})
	t.Run("a message opening with no ticket, an unknown one or a closed one stages nothing", func(t *testing.T) {
		for _, message := range []string{"the change lands", "nobody: the change lands", "shut: the change lands"} {
			root, _ := landingRepo(t)
			lays(t, root, "src/a.go", "package a\n")
			d, heard, _ := fakeLanding(root)
			code, _, errs := runsTwin(commitVerb(d), "commit", message)
			if code != exitUsage || !strings.Contains(errs, "Open the message with <ticket>:") || stagedNames(t, root) != "" || len(heard.ran) != 0 {
				t.Fatalf("%q answers %d, %q, staged %q, ran %v", message, code, errs, stagedNames(t, root), heard.ran)
			}
		}
	})
	t.Run("a clean message lands, runs the check, and pushes on green", func(t *testing.T) {
		root, origin := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || headSubject(t, root) != opens || originSubject(t, origin, "main") != opens {
			t.Fatalf("commit answers %d, %q, %q, and HEAD reads %q", code, out, errs, headSubject(t, root))
		}
		if !heard.reached("test") || !heard.reached("check") || !strings.Contains(out, "main stands pushed.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a message breaking a rule of form names every finding, logs it, and the commit lands", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, _, rows := fakeLanding(root)
		d.voice = voiceSaying("Sentence")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || headSubject(t, root) != opens || !strings.Contains(errs, "the message:1 Sentence: the rule Sentence names this") {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if len(*rows) != 1 || (*rows)[0]["level"] != "warn" || (*rows)[0]["kind"] != "commit" || (*rows)[0]["rule"] != "Sentence" {
			t.Fatalf("the log holds %v", *rows)
		}
	})
	t.Run("a message carrying a private name is refused, and stages nothing", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		d.voice = voiceSaying("Private")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "The voice rules refuse this message.") || !strings.Contains(errs, "the message:1:4: Private:") || stagedNames(t, root) != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a red check holds the push back, and names what the check refuses", func(t *testing.T) {
		root, origin := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) != opens || originSubject(t, origin, "main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if !strings.Contains(errs, "The check answers red on this commit, so no push reaches origin.") || !strings.Contains(errs, "src/a.go:1 a rule breaks") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a red test run commits nothing, stages nothing, and names what the run says", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		heard.answers["test"] = verbAnswer{exitFailed, "--- FAIL: TestA"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || stagedNames(t, root) != "" || heard.reached("check") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if !strings.Contains(errs, "The tests answer red, so nothing stages and nothing lands:") || !strings.Contains(errs, "--- FAIL: TestA") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("the tests run before the staging, and the check after the commit", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, _, _ := fakeLanding(root)
		var seen []string
		d.verb = func(words ...string) (int, string) {
			seen = append(seen, words[0]+" staged="+stagedNames(t, root)+" head="+headSubject(t, root))
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
		root, origin := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || headSubject(t, root) != opens || !heard.reached("check") || originSubject(t, origin, "main") == opens {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a desk's commit on a work branch refuses, names main, and runs no test and stages nothing", func(t *testing.T) {
		root, _ := landingRepo(t)
		gitDoes(t, root, "switch", "-q", "-c", "work/a-group")
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "A desk works on main alone") || stagedNames(t, root) != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("the no-push flag leaves the branch where it stands", func(t *testing.T) {
		root, origin := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push")
		if code != 0 || headSubject(t, root) != opens || originSubject(t, origin, "main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a staging git refuses names what git says, and commits nothing", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		lays(t, root, ".git/index.lock", "")
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || !strings.Contains(errs, "index.lock") {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a commit git refuses lands nothing, and the staging comes back", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		lays(t, root, ".git/hooks/pre-commit", "#!/bin/sh\necho the hook refuses >&2\nexit 1\n")
		if err := os.Chmod(filepath.Join(root, ".git", "hooks", "pre-commit"), 0o755); err != nil {
			t.Fatal(err)
		}
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || stagedNames(t, root) != "" || !strings.Contains(errs, "The commit comes back refused, so nothing lands:") {
			t.Fatalf("commit answers %d, %q, staged %q", code, errs, stagedNames(t, root))
		}
	})
	t.Run("a call naming paths lands those paths alone", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		lays(t, root, "src/b.go", "package b\n")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/a.go"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := gitDoes(t, root, "show", "--name-only", "--format=", "HEAD"); landed != "src/a.go" {
			t.Fatalf("the commit lands %q", landed)
		}
		if left := gitDoes(t, root, "status", "--porcelain"); !strings.Contains(left, "src/") {
			t.Fatalf("src/b.go leaves the tree: %q", left)
		}
	})
}

// The commit verb over a moved path, which the rename journal names. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbMoves(t *testing.T) {
	t.Parallel()
	t.Run("a commit naming a renamed ticket lands the old path's deletion with it", func(t *testing.T) {
		root, _ := landingRepo(t)
		gitDoes(t, root, "mv", "spec/tickets/a-ticket.md", "spec/tickets/b-ticket.md")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", "b-ticket: the ticket moves", "spec/tickets/b-ticket.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		landed := gitDoes(t, root, "show", "--name-status", "--no-renames", "--format=", "HEAD")
		if !strings.Contains(landed, "D\tspec/tickets/a-ticket.md") || !strings.Contains(landed, "A\tspec/tickets/b-ticket.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a commit naming a renamed path lands the old path the rename journal names, where git reads no rename", func(t *testing.T) {
		root, _ := landingRepo(t)
		gitDoes(t, root, "mv", "README.md", "GUIDE.md")
		lays(t, root, "GUIDE.md", "a text written over whole, so git reads no rename here\n")
		journals(t, root, "README.md", "GUIDE.md")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		landed := gitDoes(t, root, "show", "--name-status", "--no-renames", "--format=", "HEAD")
		if !strings.Contains(landed, "D\tREADME.md") || !strings.Contains(landed, "A\tGUIDE.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a journaled old path the index still holds stages with the new path", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "GUIDE.md", "a text written over whole\n")
		if err := os.Remove(filepath.Join(root, "README.md")); err != nil {
			t.Fatal(err)
		}
		journals(t, root, "README.md", "GUIDE.md")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		landed := gitDoes(t, root, "show", "--name-status", "--no-renames", "--format=", "HEAD")
		if !strings.Contains(landed, "D\tREADME.md") {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a journaled old path standing nowhere stays out of the commit", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "GUIDE.md", "a guide\n")
		journals(t, root, "OLD.md", "GUIDE.md")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "GUIDE.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := gitDoes(t, root, "show", "--name-only", "--format=", "HEAD"); landed != "GUIDE.md" {
			t.Fatalf("the commit lands %q", landed)
		}
	})
	t.Run("a path under a journaled folder move standing nowhere stays out of the commit", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "docs/new/a.md", "a note\n")
		journals(t, root, "docs/old", "docs/new")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "docs/new/a.md"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if landed := gitDoes(t, root, "show", "--name-only", "--format=", "HEAD"); landed != "docs/new/a.md" {
			t.Fatalf("the commit lands %q", landed)
		}
	})
}

// Whether the origin carries the branch. [[spec/tickets/takeover-rescues-unpushed-commits]]
func originHas(t *testing.T, origin, branch string) bool {
	t.Helper()
	return gitDoes(t, "", "--git-dir="+origin, "branch", "--list", branch) != ""
}

// A repository standing on work/one-group, pushed. [[spec/tickets/takeover-rescues-unpushed-commits]]
func onWorkBranch(t *testing.T) (string, string) {
	t.Helper()
	root, origin := landingRepo(t)
	gitDoes(t, root, "switch", "-q", "-c", "work/one-group")
	gitDoes(t, root, "push", "-q", "origin", "work/one-group")
	return root, origin
}

// A red cloud commit on a work branch still reaches origin on its rescue branch, and a green push drops the rescue. [[spec/tickets/takeover-rescues-unpushed-commits]]
func TestCommitVerbRescue(t *testing.T) {
	t.Parallel()
	t.Run("a red cloud commit lands on rescue/<group> on origin, and the work branch there moves nowhere", func(t *testing.T) {
		root, origin := onWorkBranch(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || originSubject(t, origin, "work/one-group") == opens {
			t.Fatalf("commit answers %d, %q, and the work branch on origin reads %q", code, errs, originSubject(t, origin, "work/one-group"))
		}
		if !originHas(t, origin, "rescue/one-group") || originSubject(t, origin, "rescue/one-group") != opens || !strings.Contains(errs, "rescue/one-group") {
			t.Fatalf("the red commit reaches no rescue branch: %q", errs)
		}
	})
	t.Run("a red commit off a work branch writes no rescue", func(t *testing.T) {
		root, origin := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != exitFailed || gitDoes(t, "", "--git-dir="+origin, "branch", "--list", "rescue/*") != "" {
			t.Fatalf("commit answers %d, %q, and origin holds a rescue", code, errs)
		}
	})
	t.Run("a green push on the work branch drops the rescue it carries", func(t *testing.T) {
		root, origin := onWorkBranch(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		runsTwin(commitVerb(d), "commit", opens)
		delete(heard.answers, "check")
		lays(t, root, "src/b.go", "package a\n")
		if code, _, errs := runsTwin(commitVerb(d), "commit", "a-ticket: the fix lands"); code != 0 || originHas(t, origin, "rescue/one-group") {
			t.Fatalf("commit answers %d, %q, and the rescue stands: %v", code, errs, originHas(t, origin, "rescue/one-group"))
		}
	})
}

// The commit verb at its gates: the cold probe, the paths it names, and the conflict markers. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbGates(t *testing.T) {
	t.Parallel()
	t.Run("a staged file on the cold path runs the probe after the tests, and the commit stands on its pass", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(root)
		d.claude = filepath.Join(root, "README.md")
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || headSubject(t, root) != opens || !heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if heard.ran[0][0] != "test" || !strings.Contains(out, "The cold probe passes on the staged change to src/quack/a.go.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a staged list off the cold path runs no probe", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		d.claude = filepath.Join(root, "README.md")
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a failing cold probe refuses the commit, prints its lines, and unstages", func(t *testing.T) {
		root, origin := landingRepo(t)
		lays(t, root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(root)
		d.claude = filepath.Join(root, "README.md")
		heard.answers["probe cold"] = verbAnswer{exitFailed, "FAIL hook: no line"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || stagedNames(t, root) != "" || heard.reached("check") || originSubject(t, origin, "main") == opens {
			t.Fatalf("commit answers %d, %q, HEAD %q, staged %q, ran %v", code, errs, headSubject(t, root), stagedNames(t, root), heard.ran)
		}
		if !strings.Contains(errs, "The cold probe answers FAIL on the staged change, so nothing lands:") || !strings.Contains(errs, "FAIL hook: no line") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a cold-path commit on a box holding no claude refuses in one line", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/quack/a.go", "package main\n")
		d, heard, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || stagedNames(t, root) != "" || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if lines := strings.Split(strings.TrimSpace(errs), "\n"); len(lines) != 1 || !strings.HasPrefix(lines[0], "claude stands nowhere on this box, so src/quack/a.go lands only where the cold probe runs") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("a call naming paths gates on the paths it lands alone", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/quack/a.go", "package main\n")
		lays(t, root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/a.go"); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a staged conflict marker refuses the commit, and the staging comes back", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "<<<<<<< ours\npackage a\n=======\npackage b\n>>>>>>> theirs\n")
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || headSubject(t, root) == opens || stagedNames(t, root) != "" || !strings.Contains(errs, "src/a.go:1  a conflict marker") {
			t.Fatalf("commit answers %d, %q, staged %q", code, errs, stagedNames(t, root))
		}
	})
	t.Run("an unmerged file still carrying a marker refuses the commit and stages nothing", func(t *testing.T) {
		root := conflicted(t)
		d, heard, _ := fakeLanding(root)
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || !strings.Contains(errs, "A merge stands unresolved, so no commit lands:") || !strings.Contains(errs, "README.md:1  a conflict marker") || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("an unmerged file written clean lands the merge through the verb", func(t *testing.T) {
		root := conflicted(t)
		lays(t, root, "README.md", "a tree, merged\n")
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if parents := strings.Fields(gitDoes(t, root, "log", "-1", "--format=%P")); len(parents) != 2 {
			t.Fatalf("the commit carries %v as parents, and wants a merge", parents)
		}
	})
}

// A repository standing mid-merge, README.md conflicted between main and a side branch. [[spec/tickets/landing-verbs-port-to-go]]
func conflicted(t *testing.T) string {
	t.Helper()
	root, _ := landingRepo(t)
	gitDoes(t, root, "switch", "-q", "-c", "side")
	lays(t, root, "README.md", "a tree on the side\n")
	gitDoes(t, root, "commit", "-q", "-am", "a-ticket: the side")
	gitDoes(t, root, "switch", "-q", "main")
	lays(t, root, "README.md", "a tree on main\n")
	gitDoes(t, root, "commit", "-q", "-am", "a-ticket: the main")
	merge := exec.Command("git", "merge", "side")
	merge.Dir = root
	if merge.Run() == nil {
		t.Fatal("the merge lands clean, and wants a conflict")
	}
	return root
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
