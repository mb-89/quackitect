package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A CHANGE IS TWO HASHES, AND THE PERSON'S HISTORY HOLDS NEITHER.
func TestAChangeIsBracketedByTwoSnapshotsOutsideTheHistory(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	git := func(args ...string) string {
		t.Helper()
		cmd := exec.Command("git", args...)
		cmd.Dir = r.Work
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t",
			"GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t")
		out, err := cmd.CombinedOutput()
		if err != nil {
			t.Fatalf("git %s: %v\n%s", strings.Join(args, " "), err, out)
		}
		return strings.TrimSpace(string(out))
	}
	git("init", "-q")
	os.WriteFile(filepath.Join(r.Work, ".gitignore"), []byte(".se/\n"), 0o644)
	os.WriteFile(filepath.Join(r.Work, "a.md"), []byte("before\n"), 0o644)
	git("add", "-A")
	git("commit", "-q", "-m", "the person's commit")
	head := git("rev-parse", "HEAD")

	tok := mintTask(t, r, "a change", "")
	taken, err := TakeUp(r, tok.ID, "agent")
	if err != nil {
		t.Fatal(err)
	}
	if len(taken.Began) != 1 {
		t.Fatalf("taking the work up wrote %d snapshots, want one", len(taken.Began))
	}
	// THE WORK, then the closing.
	os.WriteFile(filepath.Join(r.Work, "a.md"), []byte("after\n"), 0o644)
	os.WriteFile(filepath.Join(r.Work, "b.md"), []byte("new\n"), 0o644)
	if got := Pull(r, "agent", RoleWorker, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("closing was refused: %+v", got.Findings)
	}
	ended, _ := LoadToken(r, tok.ID)
	if len(ended.Finished) != 1 || ended.Finished[0] == ended.Began[0] {
		t.Fatalf("closing wrote %v against began %v", ended.Finished, ended.Began)
	}
	before, after := ended.Began[0], ended.Finished[0]

	// THE CHANGE IS THE DIFF BETWEEN THE TWO, and it is exactly what was done.
	changed := git("diff", "--name-only", before, after)
	if changed != "a.md\nb.md" {
		t.Fatalf("the diff between the snapshots names %q", changed)
	}
	// THE PERSON'S HISTORY IS UNTOUCHED: same head, one commit, nothing staged
	// by the engine.
	if git("rev-parse", "HEAD") != head {
		t.Fatal("the branch moved")
	}
	if n := git("rev-list", "--count", "HEAD"); n != "1" {
		t.Fatalf("the branch holds %s commits, want the person's one", n)
	}
	if staged := git("diff", "--cached", "--name-only"); staged != "" {
		t.Fatalf("the engine staged %q", staged)
	}
	// AND THE SNAPSHOTS ARE KEPT, under a ref no push carries.
	refs := git("for-each-ref", "--format=%(objectname)", snapshotRefs)
	if !strings.Contains(refs, before) || !strings.Contains(refs, after) {
		t.Fatalf("the snapshots are not under %s: %s", snapshotRefs, refs)
	}

	// A PUT-DOWN AND A TAKE-UP ARE A STRETCH OF THEIR OWN. What another hand
	// did in between is in neither pair.
	again := mintTask(t, r, "another", "")
	if _, err := TakeUp(r, again.ID, "agent"); err != nil {
		t.Fatal(err)
	}
	os.WriteFile(filepath.Join(r.Work, "mine.md"), []byte("first stretch\n"), 0o644)
	if _, err := PutDown(r, again.ID, "agent"); err != nil {
		t.Fatal(err)
	}
	os.WriteFile(filepath.Join(r.Work, "theirs.md"), []byte("another hand\n"), 0o644)
	if _, err := TakeUp(r, again.ID, "agent"); err != nil {
		t.Fatal(err)
	}
	os.WriteFile(filepath.Join(r.Work, "mine.md"), []byte("second stretch\n"), 0o644)
	if got := Pull(r, "agent", RoleWorker, Payload{ID: again.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("closing was refused: %+v", got.Findings)
	}
	stretched, _ := LoadToken(r, again.ID)
	if len(stretched.Began) != 2 || len(stretched.Finished) != 2 {
		t.Fatalf("two stretches wrote %d began and %d ended", len(stretched.Began), len(stretched.Finished))
	}
	for i := range stretched.Began {
		if changed := git("diff", "--name-only", stretched.Began[i], stretched.Finished[i]); changed != "mine.md" {
			t.Fatalf("stretch %d names %q, and another hand's file is in it", i+1, changed)
		}
	}
}

// A FOLDER WITH NO HISTORY HAS NO SNAPSHOT, and the work goes on.
func TestNoRepositoryMeansNoSnapshotAndNoRefusal(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "a change", "")
	taken, err := TakeUp(r, tok.ID, "agent")
	if err != nil || len(taken.Began) != 0 {
		t.Fatalf("take-up outside a repository answered %v %v", taken.Began, err)
	}
	if got := Pull(r, "agent", RoleWorker, Payload{ID: tok.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("closing outside a repository was refused: %+v", got.Findings)
	}
}
