package main

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// withHistory gives a work tree somewhere to keep what closes.
//
// A tracked token that closes goes into git and comes off the disk. A fixture
// with no history keeps its tokens instead, which is a different path, so a
// test about closing wants one of these.
func withHistory(t *testing.T, root string) {
	t.Helper()
	for _, args := range [][]string{
		{"init", "--quiet"},
		{"config", "user.name", "a test"},
		{"config", "user.email", "test@example"},
	} {
		cmd := exec.Command("git", args...)
		cmd.Dir = root
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %s: %v\n%s", args[0], err, out)
		}
	}
}

// aTreeWithHistory is a work tree git will write into.
func aTreeWithHistory(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	for _, name := range []string{"note", "standard", "trivial"} {
		writeProcess(t, root, name)
	}
	withHistory(t, root)
	return r
}

// A CLOSED TOKEN COMES OFF THE DISK, AND THE FOLDER SAYS WHERE IT GOES.
//
// A token is the work rather than the record of it. Kept after it closes it is
// material nobody walks, and the tree grows without bound.
//
// Tracked goes into git and can be read back. Local is deleted, because there
// is nothing holding it and that is what local means.
func TestAClosedTokenComesOffTheDisk(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)

	tracked, err := Mint(r, Token{Process: "standard", Title: "a token that travels",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	local, err := Mint(r, Token{Process: "trivial", Title: "a token that stays",
		Status: "first", Tracked: local()})
	if err != nil {
		t.Fatal(err)
	}

	// THE SAVE THAT ENDS IT IS THE MOMENT. Nothing here names an archive
	// command, because no agent has one to name.
	for _, tok := range []Token{tracked, local} {
		tok.Disposition = Done
		tok.Status = "closed"
		if err := SaveToken(r, tok); err != nil {
			t.Fatalf("closing %s: %v", tok.ID, err)
		}
	}

	if at := noteAt(r, tracked.ID); at != "" {
		t.Errorf("the tracked token is still on the disk at %s", at)
	}
	// A LOCAL ONE STAYS UNTIL A RETRO HAS READ IT. Deleting it at the close
	// left the next retro with nothing to read about what happened.
	if at := noteAt(r, local.ID); at == "" {
		t.Error("the local token was removed at the close, so a retro can never read it")
	}

	// THE TRACKED ONE IS READABLE FROM THE OBJECT THE LIST NAMES.
	said, err := ReadArchived(r, tracked.ID)
	if err != nil {
		t.Fatalf("reading %s back: %v", tracked.ID, err)
	}
	if !strings.Contains(said, "gooseberry") {
		t.Errorf("what came back does not carry the token body: %q", said)
	}

	// THE LOCAL ONE IS IN NO ARCHIVE. Git does not carry the folder it is in,
	// so there is nothing to read it back from and nothing pretends there is.
	if _, err := ReadArchived(r, local.ID); err == nil {
		t.Errorf("the local token was archived, and a local token is not")
	}

	// THE LIST CARRIES THE TRACKED ONE AND NOT THE LOCAL ONE.
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 {
		t.Fatalf("the archive holds %d rows, want the one that travels: %v", len(rows), rows)
	}
	if rows[0].ID != tracked.ID || rows[0].Title != "a token that travels" ||
		rows[0].Disposition != "done" || rows[0].Process != "standard" {
		t.Errorf("the row does not say what it should: %+v", rows[0])
	}
	// AND IT NAMES A BLOB AND NO REF. A ref has to be pushed to leave the box,
	// and the namespace a cloud box would push it to is refused.
	if rows[0].Blob == "" {
		t.Errorf("the row names no blob, so nothing on the branch points at the content: %+v", rows[0])
	}
	if rows[0].Tag != "" {
		t.Errorf("the row names tag %q, and nothing writes one now", rows[0].Tag)
	}
}

// CLOSED WORK STILL ANSWERS A SEARCH.
//
// Without this the archive is write-only. A token comes off the disk and out
// of the index, so every search stops seeing it, and work nobody can find is
// work nobody has.
func TestTheArchiveAnswersASearch(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "a token to find",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	// NOTHING IS ARCHIVED YET, so the archive answers nothing.
	if got, err := FindArchived(r, FindParams{Regex: "gooseberry"}); err != nil || got.Count != 0 {
		t.Fatalf("an empty archive answered %d hits: %v", got.Count, err)
	}

	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}

	got, err := FindArchived(r, FindParams{Regex: "gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	if got.Count != 1 || len(got.Hits) != 1 {
		t.Fatalf("the archive answered %d hits for a word in a token it holds", got.Count)
	}
	// THE HIT NAMES THE OBJECT, so a reader can open what answered.
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 {
		t.Fatalf("the archive holds %d rows and one token was closed", len(rows))
	}
	// THE PREDICTION ASKS THE READER, and it used to state the precedence over
	// again. A row may name a blob, a copy on the branch and a tag, and which one
	// answers is what readArchived worked out by trying them. A second statement
	// of that order can disagree with it, and then the test passes on a
	// prediction that is wrong.
	_, at, err := readArchived(r, rows[0])
	if err != nil {
		t.Fatal(err)
	}
	if got.Hits[0].Path != at {
		t.Errorf("the hit names %q and the object that answered is %q", got.Hits[0].Path, at)
	}
	if !strings.Contains(got.Hits[0].Text, "gooseberry") {
		t.Errorf("the hit carries %q", got.Hits[0].Text)
	}
	// AND THE TREE ITSELF NO LONGER HAS IT.
	if at := noteAt(r, tok.ID); at != "" {
		t.Errorf("the token is still on the disk at %s", at)
	}
}

// A NARROWED SEARCH NEVER ANSWERS UNNARROWED.
//
// The verb built its archive search from three of the four fields it was
// handed and left the path on the floor, so se find --archive --path
// anything-at-all answered exactly what the same search with no --path
// answered. The flag was declared, documented as a glob over paths, and taken.
//
// THE DAMAGE IS THE READING, not the missing filter. A reader who asks for one
// folder and is handed the whole archive believes the hits came from that
// folder, which is worse than being told the flag does not apply.
//
// THIS DRIVES THE VERB. The defect was the verb dropping a field on its way to
// the function, so a test of the function alone stays green while the verb
// goes on dropping it.
func TestTheArchiveWillNotTakeAPathItCannotRead(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "a token to find",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}

	// THE SAME SEARCH TWICE, ONE OF THEM NARROWED TO NOTHING. The unnarrowed
	// one says the archive really does hold the word, so the narrowed one
	// answering it is the defect rather than an empty archive.
	find := func(args ...string) (string, int) {
		var out, errs bytes.Buffer
		code := run["find"](&call{ctx: t.Context(), roots: r, args: args,
			in: strings.NewReader(""), out: &out, err: &errs})
		return out.String() + errs.String(), code
	}
	if said, code := find("--archive", "--regex", "gooseberry"); code != 0 ||
		!strings.Contains(said, "gooseberry") {
		t.Fatalf("the archive does not answer the word unnarrowed, so nothing below means anything: %d %s", code, said)
	}

	said, code := find("--archive", "--regex", "gooseberry", "--path", "nothing/at/all/*")
	if code == 0 && strings.Contains(said, "gooseberry") {
		t.Fatalf("a search narrowed to nothing answered the hit anyway, so --path was taken and dropped: %s", said)
	}
	if !strings.Contains(said, "--path") {
		t.Errorf("the refusal does not name the flag it refuses: %s", said)
	}

	// AND THE FUNCTION REFUSES IT TOO, because the verb is not the only caller
	// and a field the second half ignores is refused rather than accepted.
	if _, err := FindArchived(r, FindParams{Regex: "gooseberry", Path: "nothing/at/all/*"}); err == nil {
		t.Errorf("FindArchived took a path it cannot read")
	}
}

// THE LIST IS THE ARCHIVE, AND WRITING IT AGAIN CHANGES NOTHING.
//
// It was a rendering of the tags, and the tags were the archive. A tag cannot
// be pushed from a cloud box, so an archive kept in one was an archive one
// machine held. The list travels, so the list is the record, and what has to
// hold instead is that writing it out again is a no-op: a record that rewrites
// itself differently every time is a record that drifts.
func TestTheArchiveListIsWrittenTheSameTwice(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	for _, title := range []string{"the first to close", "the second to close"} {
		tok, err := Mint(r, Token{Process: "standard", Title: title, Status: "first", Tracked: tracked()})
		if err != nil {
			t.Fatal(err)
		}
		tok.Disposition = Done
		tok.Status = "closed"
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
	}
	path := ArchiveList(r)
	was, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("no archive list was written: %v", err)
	}
	if n := strings.Count(strings.TrimSpace(string(was)), "\n") + 1; n != 2 {
		t.Fatalf("the list holds %d lines, want one per closed token", n)
	}

	if err := WriteArchiveList(r); err != nil {
		t.Fatal(err)
	}
	now, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("it did not survive being written again: %v", err)
	}
	if string(now) != string(was) {
		t.Fatalf("it was written differently the second time:\nwas %q\nnow %q", was, now)
	}
}

// A TREE WITH NO HISTORY KEEPS ITS TOKENS.
//
// The design accepts a folder handed to somebody rather than cloned. Deleting
// a tracked token there would lose it with nowhere to read it back from.
func TestATreeWithNoHistoryKeepsItsTokens(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "standard")
	tok, err := Mint(r, Token{Process: "standard", Title: "nowhere to keep it",
		Status: "first", Tracked: tracked()})
	if err != nil {
		t.Fatal(err)
	}
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(TrackedDir(r), tok.ID+".md")); err != nil {
		t.Fatalf("it was taken off a tree that has nowhere to keep it: %v", err)
	}
}
