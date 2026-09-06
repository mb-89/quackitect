package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// AN ARCHIVE THAT ONLY A TAG CARRIES IS AN ARCHIVE ONE BOX HOLDS.
//
// Archiving wrote refs/tags/archive/<id>, pushed it, and then deleted the note
// from doc/work. A cloud box cannot push that namespace: refs/tags answers HTTP
// 403 from the session's git proxy. The push result was discarded with a bare
// assignment, so the tag was written locally, the push was refused in silence,
// the file left the tree, and the next branch commit took it off the branch.
// The content then stood in a local tag on a machine about to be destroyed.
//
// THE BRANCH ALREADY CARRIES IT. The note was a file somebody committed, so its
// blob is reachable from the branch's history whatever happens to the tag. What
// was missing was a name for it that travels, and the archive list travels.

// gitAt runs git in a folder and fails the test where git does.
//
// IT ANSWERS WHAT GIT PRINTED AND NOT WHAT IT SAID ALONGSIDE. A hint on the
// error stream folded into the answer would come back as part of an object
// name, so the two are kept apart and the noise is shown only on a failure.
func gitAt(t *testing.T, dir string, args ...string) string {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		said := ""
		if ee, ok := err.(*exec.ExitError); ok {
			said = string(ee.Stderr)
		}
		t.Fatalf("git %s in %s: %v\n%s", strings.Join(args, " "), dir, err, said)
	}
	return strings.TrimSpace(string(out))
}

// A CLOSED TOKEN IS READ BACK FROM THE BRANCH ALONE.
//
// The clone takes no tags, which is every box that was never handed the tag and
// every box the tag could not be pushed to. What it has is the branch, and the
// branch is what has to answer.
func TestAnArchivedTokenTravelsOnTheBranch(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "a token that travels",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	// THE NOTE IS ON THE BRANCH BEFORE IT CLOSES, which is what a tracked token
	// is: a file somebody committed.
	gitAt(t, r.Work, "add", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")

	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}

	// NO REF WAS WRITTEN. A ref has to be pushed to leave the box, and this is
	// the namespace the proxy refuses.
	if said := gitAt(t, r.Work, "for-each-ref", archiveRefs); said != "" {
		t.Errorf("the archive wrote a ref, which is what cannot travel: %s", said)
	}

	// THE CLOSE IS COMMITTED: the note has left the branch and the list naming
	// its blob is on it.
	gitAt(t, r.Work, "add", "--all", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the close")

	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)
	if said := gitAt(t, clone, "for-each-ref", "refs/tags/"); said != "" {
		t.Fatalf("the clone carries tags, so nothing below is about the branch alone: %s", said)
	}

	elsewhere := Roots{Method: clone, Work: clone}
	said, err := ReadArchived(elsewhere, tok.ID)
	if err != nil {
		t.Fatalf("a clone of the branch cannot read %s back: %v", tok.ID, err)
	}
	if !strings.Contains(said, "gooseberry") {
		t.Errorf("what came back does not carry the token body: %q", said)
	}
	// AND THE LIST THERE NAMES IT, because the list is what a reader opens.
	rows, err := TheArchive(elsewhere)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ID != tok.ID || rows[0].Blob == "" {
		t.Fatalf("the list in the clone does not name the token and its blob: %+v", rows)
	}
}

// WHAT THE OLDER ARCHIVE TAGGED IS READ THROUGH THE LIST.
//
// A hundred and twenty-two of these tags stand on this branch. They are not
// deleted and they are not pushed anywhere: the list takes the blob each one
// holds, which is the object the branch already carries, and the tag stops
// being the only way to the content.
func TestATaggedArchiveIsFoldedIntoTheList(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "an older archive kept",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	at := noteAt(r, tok.ID)
	if at == "" {
		t.Fatal("the token was minted onto no disk")
	}
	gitAt(t, r.Work, "add", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	note, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}

	// THE STATE THE OLDER ARCHIVE LEFT: a tag over a tree holding the note, and
	// a list line naming that tag and no blob.
	root := filepath.Join(r.Work, tok.ID+".md")
	if err := os.WriteFile(root, note, 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--", tok.ID+".md")
	row := Archived{ID: tok.ID, Title: tok.Title, Process: tok.Process,
		Disposition: "done", Tag: archiveRefs + tok.ID}
	line, err := json.Marshal(row)
	if err != nil {
		t.Fatal(err)
	}
	commit := gitAt(t, r.Work, "commit-tree", gitAt(t, r.Work, "write-tree"), "-m", string(line))
	gitAt(t, r.Work, "update-ref", row.Tag, commit)
	for _, gone := range []string{root, at} {
		if err := os.Remove(gone); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(ArchiveList(r), append(line, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}

	// THE LIST IS WRITTEN, AND THE ROW TAKES THE BLOB THE TAG HELD.
	if err := WriteArchiveList(r); err != nil {
		t.Fatal(err)
	}
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ID != tok.ID {
		t.Fatalf("the list does not hold the one tagged token: %+v", rows)
	}
	onTheBranch := gitAt(t, r.Work, "rev-parse", "HEAD:doc/work/"+tok.ID+".md")
	if rows[0].Blob != onTheBranch {
		t.Fatalf("the row names blob %q and the branch carries %q", rows[0].Blob, onTheBranch)
	}

	// AND THE TAG IS NO LONGER THE WAY TO IT, which is what a box that never
	// received the tag has always had.
	gitAt(t, r.Work, "update-ref", "-d", row.Tag)
	got, err := ReadArchived(r, tok.ID)
	if err != nil {
		t.Fatalf("the folded token cannot be read once its tag has gone: %v", err)
	}
	if !strings.Contains(got, "gooseberry") {
		t.Errorf("what came back does not carry the token body: %q", got)
	}
}

// A BOX THAT CANNOT HAVE THE TAG NAMESPACE STILL ARCHIVES.
//
// The stub is the git a cloud box has: the archive namespace is refused, both
// to write and to push, and everything else answers. Nothing the archive does
// may depend on either.
func TestAnArchiveNeedsNoRefItCannotWrite(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("the stub is a shell script, and this is about the proxy a cloud box runs behind")
	}
	real, err := exec.LookPath("git")
	if err != nil {
		t.Skip("no git on this box")
	}
	stub := t.TempDir()
	said := "#!/bin/sh\n" +
		"case \"$1 $2\" in\n" +
		"  'update-ref " + archiveRefs + "'*) echo 'error: refusing " + archiveRefs + "' >&2; exit 1 ;;\n" +
		"esac\n" +
		"case \"$1\" in\n" +
		"  push) echo 'error: RPC failed; HTTP 403' >&2; exit 1 ;;\n" +
		"esac\n" +
		"exec " + real + " \"$@\"\n"
	if err := os.WriteFile(filepath.Join(stub, "git"), []byte(said), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", stub+string(os.PathListSeparator)+os.Getenv("PATH"))

	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "a cloud box closes",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("the close was refused by a git that will not have the tag: %v", err)
	}
	if at := noteAt(r, tok.ID); at != "" {
		t.Errorf("the token is still on the disk at %s, so the archive did not stand", at)
	}
	got, err := ReadArchived(r, tok.ID)
	if err != nil {
		t.Fatalf("the archived token cannot be read back: %v", err)
	}
	if !strings.Contains(got, "gooseberry") {
		t.Errorf("what came back does not carry the token body: %q", got)
	}
}

// A FAILURE THAT WOULD LOSE THE CONTENT LEAVES THE FILE ON THE DISK.
//
// The archive keeps the content and then deletes the note. Where the keeping
// fails, the deleting must not happen: the note on the disk is then the only
// copy there is, and a close that takes it away has thrown the work out.
func TestAnArchiveThatCannotKeepTheContentKeepsTheFile(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("the stub is a shell script")
	}
	real, err := exec.LookPath("git")
	if err != nil {
		t.Skip("no git on this box")
	}
	stub := t.TempDir()
	said := "#!/bin/sh\n" +
		"case \"$1\" in\n" +
		"  hash-object) echo 'error: the object store will not take it' >&2; exit 1 ;;\n" +
		"esac\n" +
		"exec " + real + " \"$@\"\n"
	if err := os.WriteFile(filepath.Join(stub, "git"), []byte(said), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", stub+string(os.PathListSeparator)+os.Getenv("PATH"))

	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "git will not keep",
		Status: "first", Tracked: tracked()})
	if err != nil {
		t.Fatal(err)
	}
	tok.Disposition = Done
	tok.Status = "closed"
	err = SaveToken(r, tok)
	if err != nil && !TheCloseStood(err) {
		t.Fatalf("the close did not stand: %v", err)
	}
	if at := noteAt(r, tok.ID); at == "" {
		t.Fatal("the note was deleted after the archive could not keep its content, so the work is gone")
	}
}
