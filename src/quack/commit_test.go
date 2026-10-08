// The Go commit verb, a case for each road commit-verb.test.js and the commit
// cases of named.test.js covered: the message, the gates, the paths it lands,
// the cold probe, the merge, and the push from a cloud box, each over FakeRepo.
// [[spec/tickets/quack-repos-meet-fake-git]]
package main // level0: InPackageTest - the cases drive the unexported commitVerb over the in-package helper fakeLanding

import (
	"encoding/json"
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

// A landing repository with one file laid in its tree, and the fake doors over it. [[spec/tickets/quack-repos-meet-fake-git]]
func laidLanding(t *testing.T, path, text string) (*landing, landingDoors, *verbsHeard, *[]map[string]any) {
	t.Helper()
	at := landingRepo(t)
	seedFile(t, at.root, path, text)
	d, heard, rows := fakeLanding(at)
	return at, d, heard, rows
}

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
			seedFile(t, at.root, "src/a.go", "package a\n")
			d, heard, _ := fakeLanding(at)
			code, _, errs := runsTwin(commitVerb(d), "commit", message)
			if code != exitUsage || !strings.Contains(errs, "Open the message with <ticket>:") || at.staged() != "" || len(heard.ran) != 0 {
				t.Fatalf("%q answers %d, %q, staged %q, ran %v", message, code, errs, at.staged(), heard.ran)
			}
		}
	})
	t.Run("a clean message lands, runs the check, and pushes on green", func(t *testing.T) {
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || at.originSubject("main") != opens {
			t.Fatalf("commit answers %d, %q, %q, and HEAD reads %q", code, out, errs, at.subject())
		}
		if !heard.reached("test") || !heard.reached("check") || !strings.Contains(out, "main stands pushed.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a message breaking a rule of form names every finding, logs it, and the commit lands", func(t *testing.T) {
		at, d, _, rows := laidLanding(t, "src/a.go", "package a\n")
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
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
		d.voice = voiceSaying("Private")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "The voice rules refuse this message.") || !strings.Contains(errs, "the message:1:4: Private:") || at.staged() != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a red check holds the push back, and names what the check refuses", func(t *testing.T) {
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitFailed || at.subject() != opens || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if !strings.Contains(errs, "The check answers red on this commit, so no push reaches origin.") || !strings.Contains(errs, "src/a.go:1 a rule breaks") {
			t.Fatalf("commit says %q", errs)
		}
	})
	t.Run("the rules and the tests run before the staging, and the check after the commit", func(t *testing.T) {
		at, d, _, _ := laidLanding(t, "src/a.go", "package a\n")
		var seen []string
		d.verb = func(words ...string) (int, string) {
			seen = append(seen, words[0]+" staged="+at.staged()+" head="+at.subject())
			return 0, ""
		}
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		want := []string{"lint staged= head=a-ticket: the tree opens", "test staged= head=a-ticket: the tree opens", "check staged= head=" + opens}
		if strings.Join(seen, "|") != strings.Join(want, "|") {
			t.Fatalf("the verbs ran as %v, and want %v", seen, want)
		}
	})
}

// The commit verb on a desk, under its flags, and where git refuses. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbDesk(t *testing.T) {
	t.Parallel()
	t.Run("a desk lands and checks the commit on main, and pushes nothing", func(t *testing.T) {
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || !heard.reached("check") || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	// The desk refusal raises its node through the failure door. [[spec/tickets/the-twins-leave-whole]]
	t.Run("a desk's commit on a work branch refuses, raises desk-works-on-trunk with its remedy once, and runs no test and stages nothing", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "spec/failures/desk-works-on-trunk.md", "---\nkind: [[failure]]\nlevel: warn\nremedies: [\"Run git switch main, and take a finished cloud branch in with ./RUNME.sh branch merge <name>.\"]\n---\n\n# When\n\nA desk works a work branch.\n")
		at.must(at.repo.Switch("work/a-group", true))
		seedFile(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		d.cloud = false
		code, _, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != exitUsage || !strings.Contains(errs, "A desk works on main alone") || !strings.Contains(errs, "failure desk-works-on-trunk at warn") || strings.Count(errs, "git switch main") != 1 || at.staged() != "" || len(heard.ran) != 0 {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("the no-push flag leaves the branch where it stands", func(t *testing.T) {
		at, d, _, _ := laidLanding(t, "src/a.go", "package a\n")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push")
		if code != 0 || at.subject() != opens || at.originSubject("main") == opens {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a path git cannot stage names what git says, and commits nothing", func(t *testing.T) {
		at, d, _, _ := laidLanding(t, "src/a.go", "package a\n")
		code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/nowhere.go")
		if code != exitFailed || at.subject() == opens || !strings.Contains(errs, "The staging comes back refused") || !strings.Contains(errs, "src/nowhere.go") {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
	})
	t.Run("a commit git refuses lands nothing, and the staging comes back", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "src/a.go", "package a\n")
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
		seedFile(t, at.root, "src/a.go", "package a\n")
		seedFile(t, at.root, "src/b.go", "package b\n")
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
	t.Run("a commit naming a renamed ticket, or a renamed path the rename journal names where git reads no rename, lands the old path's deletion with it", func(t *testing.T) {
		for _, one := range [][3]string{{"spec/tickets/a-ticket.md", "spec/tickets/b-ticket.md", "b-ticket: the ticket moves"}, {"README.md", "GUIDE.md", opens}} {
			at := landingRepo(t)
			at.moves(one[0], one[1])
			if one[0] == "README.md" {
				seedFile(t, at.root, "GUIDE.md", "a text written over whole, so git reads no rename here\n")
				journals(t, at.root, "README.md", "GUIDE.md")
			}
			d, _, _ := fakeLanding(at)
			if code, _, errs := runsTwin(commitVerb(d), "commit", one[2], one[1]); code != 0 {
				t.Fatalf("commit answers %d, %q", code, errs)
			}
			if landed := at.landed(); !strings.Contains(landed, "D\t"+one[0]) || !strings.Contains(landed, "A\t"+one[1]) {
				t.Fatalf("the commit lands %q", landed)
			}
		}
	})
	t.Run("a journaled old path the index still holds stages with the new path", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "GUIDE.md", "a text written over whole\n")
		if err := realDisk().remove(filepath.Join(at.root, "README.md")); err != nil {
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
	t.Run("a journaled old path or folder move standing nowhere stays out of the commit", func(t *testing.T) {
		for _, one := range [][3]string{{"GUIDE.md", "OLD.md", "GUIDE.md"}, {"docs/new/a.md", "docs/old", "docs/new"}} {
			at := landingRepo(t)
			seedFile(t, at.root, one[0], "a note\n")
			journals(t, at.root, one[1], one[2])
			d, _, _ := fakeLanding(at)
			if code, _, errs := runsTwin(commitVerb(d), "commit", opens, one[0]); code != 0 {
				t.Fatalf("commit answers %d, %q", code, errs)
			}
			if landed := at.landedNames(); landed != one[0] {
				t.Fatalf("the commit lands %q", landed)
			}
		}
	})
}

// The commit verb refuses a message whose trailer names a model, before anything runs or lands, and lands a session trailer, since a link names no model. [[spec/tickets/commit-door-refuses-model-trailers]] [[spec/tickets/model-trailer-refuses-in-place]]
func TestCommitVerbReadsItsTrailers(t *testing.T) {
	t.Parallel()
	at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
	line := "Co-Authored-By: Claude Opus 5.5"
	code, _, errs := runsTwin(commitVerb(d), "commit", opens+"\n\n"+line)
	if code != exitUsage || at.subject() == opens || len(heard.ran) != 0 || !strings.Contains(errs, line) {
		t.Fatalf("commit answers %d, %q, HEAD %q, ran %v", code, errs, at.subject(), heard.ran)
	}
	at, d, _, _ = laidLanding(t, "src/a.go", "package a\n")
	if code, _, errs := runsTwin(commitVerb(d), "commit", opens+"\n\nClaude-Session: https://claude.ai/code/session_x"); code != 0 || at.subject() != opens {
		t.Fatalf("commit answers %d, %q, HEAD %q, and wants a session trailer through", code, errs, at.subject())
	}
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
		seedFile(t, at.root, "src/a.go", "package a\n")
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
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
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
		seedFile(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		heard.answers["check"] = verbAnswer{exitFailed, "src/a.go:1 a rule breaks"}
		runsTwin(commitVerb(d), "commit", opens)
		delete(heard.answers, "check")
		seedFile(t, at.root, "src/b.go", "package a\n")
		if code, _, errs := runsTwin(commitVerb(d), "commit", "a-ticket: the fix lands"); code != 0 || at.originHas("rescue/one-group") {
			t.Fatalf("commit answers %d, %q, and the rescue stands: %v", code, errs, at.originHas("rescue/one-group"))
		}
	})
}

// The commit verb at its gates: the cold probe, the paths it names, and the conflict markers. [[spec/tickets/landing-verbs-port-to-go]]
func TestCommitVerbGates(t *testing.T) {
	t.Parallel()
	// The rules answer in seconds, so a refused file stops the commit before the tests and the check. [[spec/tickets/rules-lint-changed-files-first]]
	t.Run("a red test run, a file the rules refuse, a failing cold probe, a cold path with no claude, and a staged marker each land and stage nothing, and name why", func(t *testing.T) {
		for _, one := range []struct {
			path, text, key, said string
			claude                bool
			skips, says           []string
		}{
			{"src/a.go", "package a\n", "test", "--- FAIL: TestA", false, []string{"check"}, []string{"The tests answer red, so nothing stages and nothing lands:", "--- FAIL: TestA"}},
			{"spec/a.md", "a note\n", "lint --strict spec/a.md", "spec/a.md:1:1: Sentence: A sentence holds 25 words.", false, []string{"test", "check"}, []string{"The rules refuse a file this commit stages, so nothing stages and nothing lands:", "spec/a.md:1:1: Sentence"}},
			{"src/quack/a.go", "package main\n", "probe cold", "FAIL hook: no line", true, []string{"check"}, []string{"The cold probe answers FAIL on the staged change, so nothing lands:", "FAIL hook: no line"}},
			{"src/quack/a.go", "package main\n", "", "", false, []string{"probe cold"}, []string{"claude stands nowhere on this box, so src/quack/a.go lands only where the cold probe runs"}},
			{"src/a.go", "<<<<<<< ours\npackage a\n=======\npackage b\n>>>>>>> theirs\n", "", "", false, nil, []string{"src/a.go:1  a conflict marker"}},
		} {
			at, d, heard, _ := laidLanding(t, one.path, one.text)
			heard.answers[one.key] = verbAnswer{exitFailed, one.said}
			if one.claude {
				d.claude = filepath.Join(at.root, "README.md")
			}
			code, _, errs := runsTwin(commitVerb(d), "commit", opens)
			if code != exitFailed || at.subject() == opens || at.staged() != "" || at.originSubject("main") == opens || (one.skips != nil && one.key == "" && strings.Contains(strings.TrimSpace(errs), "\n")) {
				t.Fatalf("commit over %s answers %d, %q, HEAD %q, staged %q", one.path, code, errs, at.subject(), at.staged())
			}
			for _, verb := range one.skips {
				if heard.reached(verb) {
					t.Fatalf("commit over %s ran %v past %s", one.path, heard.ran, verb)
				}
			}
			for _, want := range one.says {
				if !strings.Contains(errs, want) {
					t.Fatalf("commit over %s says %q, and wants %q", one.path, errs, want)
				}
			}
		}
	})
	t.Run("a merge in progress lints the hand's files alone, and a named path lands the whole index, since git takes no partial merge commit", func(t *testing.T) {
		for _, named := range [][]string{nil, {"spec/a.md"}} {
			at := midMerge(t)
			d, heard, _ := fakeLanding(at)
			if code, _, errs := runsTwin(commitVerb(d), append([]string{"commit", opens}, named...)...); code != 0 || at.subject() != opens || !heard.reached("lint --strict spec/a.md") {
				t.Fatalf("commit %v answers %d, %q, HEAD %q, ran %v, and wants the strict lint over spec/a.md alone", named, code, errs, at.subject(), heard.ran)
			}
		}
	})
	t.Run("the rules read the staged files past the tickets", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "spec/a.md", "a note\n")
		seedFile(t, at.root, "spec/tickets/a-ticket.md", "---\nstate: open\n---\n\n# Ask\n\nmore\n")
		d, heard, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 || !heard.reached("lint --strict spec/a.md") {
			t.Fatalf("commit answers %d, %q, ran %v, and wants the strict lint over spec/a.md alone", code, errs, heard.ran)
		}
	})
	t.Run("a staged file on the cold path runs the probe after the tests, and the commit stands on its pass", func(t *testing.T) {
		at, d, heard, _ := laidLanding(t, "src/quack/a.go", "package main\n")
		d.claude = filepath.Join(at.root, "README.md")
		code, out, errs := runsTwin(commitVerb(d), "commit", opens)
		if code != 0 || at.subject() != opens || !heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
		if heard.ran[1][0] != "test" || !strings.Contains(out, "The cold probe passes on the staged change to src/quack/a.go.") {
			t.Fatalf("commit ran %v and said %q", heard.ran, out)
		}
	})
	t.Run("a staged list off the cold path runs no probe", func(t *testing.T) {
		at, d, heard, _ := laidLanding(t, "src/a.go", "package a\n")
		d.claude = filepath.Join(at.root, "README.md")
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
		}
	})
	t.Run("a call naming paths gates on the paths it lands alone", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "src/quack/a.go", "package main\n")
		seedFile(t, at.root, "src/a.go", "package a\n")
		d, heard, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "src/a.go"); code != 0 || heard.reached("probe cold") {
			t.Fatalf("commit answers %d, %q, ran %v", code, errs, heard.ran)
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
		seedFile(t, at.root, "README.md", "a tree, merged\n")
		d, _, _ := fakeLanding(at)
		if code, _, errs := runsTwin(commitVerb(d), "commit", opens, "--no-push"); code != 0 {
			t.Fatalf("commit answers %d, %q", code, errs)
		}
		if _, merged := at.repo.Resolve("HEAD^2"); !merged {
			t.Fatal("the commit carries one parent, and wants a merge")
		}
	})
}

// A repository merging a side branch whose note main already holds, with a note of the hand laid beside it. [[spec/tickets/rules-lint-changed-files-first]]
func midMerge(t *testing.T) *landing {
	t.Helper()
	at := landingRepo(t)
	at.must(at.repo.Switch("side", true))
	seedFile(t, at.root, "spec/trunk.md", "trunk's note\n")
	at.commits("side: trunk's note")
	side := at.head()
	at.must(at.repo.Switch(trunkBranch, false))
	seedFile(t, at.root, "spec/trunk.md", "trunk's note\n")
	seedFile(t, at.root, "spec/a.md", "a note\n")
	at.must(at.repo.UpdateRef(mergeHeadRef, side))
	return at
}

// A repository standing mid-merge, README.md conflicted between main and a side branch. [[spec/tickets/quack-repos-meet-fake-git]]
func conflicted(t *testing.T) *landing {
	t.Helper()
	at := landingRepo(t)
	at.must(at.repo.Switch("side", true))
	seedFile(t, at.root, "README.md", "a tree on the side\n")
	at.commits("a-ticket: the side")
	at.must(at.repo.Switch(trunkBranch, false))
	seedFile(t, at.root, "README.md", "a tree on main\n")
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
	seedFile(t, root, ".se/.runtime/undo/20260102030405000000.json", string(text))
}

// A root where no rules load reads no voice. [[spec/tickets/cage-commit-guards-port]]
// level0: FixtureOutsideHome - the case needs an empty root of its own, where no rules load
func TestCommitVoiceReadsNothingWhereNoRulesLoad(t *testing.T) {
	t.Parallel()
	if rows := commitVoice(quietBox(), t.TempDir(), "a commit message"); rows != nil {
		t.Errorf("commitVoice answers %v under a root where no rules load", rows)
	}
}

// The rules over the message answer the kept findings, and a private shape refuses. [[spec/tickets/cage-commit-guards-port]] [[spec/tickets/vale-leaves-the-tree]]
func TestCommitVoiceRefusesAPrivateShape(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	rows := commitVoice(quietBox(), root, "cage-commit-guards-port: the guard lands\n\nmail somebody at someone"+"@"+"somewhere.net\n")
	for _, one := range rows {
		if one.Rule == "Private" {
			return
		}
	}
	t.Errorf("commitVoice answers %v, and the message carries an address", rows)
}

// A check stamp naming the sha, green and clean. [[spec/tickets/landing-verbs-port-to-go]]
func stampsGreen(t *testing.T, root, sha string) {
	t.Helper()
	seedFile(t, root, ".se/.runtime/check.json", `{"sha":"`+sha+`","ok":true,"clean":true,"at":"2026-01-02T03:04:05.000Z","warnings":0,"files":[]}`)
}

func TestPushVerb(t *testing.T) {
	t.Parallel()
	t.Run("a green stamp on the commit pushes the branch", func(t *testing.T) {
		at := landingRepo(t)
		seedFile(t, at.root, "src/a.go", "package a\n")
		at.commits("a-ticket: one more")
		stampsGreen(t, at.root, at.head())
		d, _, _ := fakeLanding(at)
		code, out, errs := runsTwin(pushVerb(d), "push")
		if code != 0 || out != "main stands pushed.\n" || at.originSubject("main") != "a-ticket: one more" {
			t.Fatalf("push answers %d, %q, %q", code, out, errs)
		}
	})
	t.Run("no stamp, or a stamp on another commit, pushes nothing", func(t *testing.T) {
		for _, stale := range []bool{false, true} {
			at := landingRepo(t)
			if stale {
				stampsGreen(t, at.root, at.head())
			}
			seedFile(t, at.root, "src/a.go", "package a\n")
			at.commits("a-ticket: one more")
			d, _, _ := fakeLanding(at)
			code, _, errs := runsTwin(pushVerb(d), "push")
			if code != exitFailed || at.originSubject("main") == "a-ticket: one more" {
				t.Fatalf("push answers %d, %q", code, errs)
			}
			if !strings.HasPrefix(errs, "The push takes a green check, and ") || !strings.Contains(errs, "Run `./RUNME.sh check` on the commit you stand on, then push again.") {
				t.Fatalf("push says %q", errs)
			}
		}
	})
	t.Run("a push from a repository with no origin names what git says", func(t *testing.T) {
		at := landingAlone(t)
		stampsGreen(t, at.root, at.head())
		d, _, _ := fakeLanding(at)
		code, _, errs := runsTwin(pushVerb(d), "push")
		if code != exitFailed || !strings.HasPrefix(errs, "The push of main comes back refused:\n") || len(strings.Split(strings.TrimSpace(errs), "\n")) < 2 {
			t.Fatalf("push answers %d, %q", code, errs)
		}
	})
}
