package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// WHERE A TOKEN IS BORN IS SAID AT THE MINT.
//
// A tracked token is in doc/work, which git carries, so another agent on
// another box can claim it. A local one is in .se/work, which nothing else
// reaches. That is the choice, and there is no default to fall back on.
//
// A note is the one exception. It is what nobody has decided yet, so it is
// private by what it is and the minter is not asked.
func TestTheMintSaysWhereATokenIsBorn(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	for _, name := range []string{"note", "standard", "trivial"} {
		writeProcess(t, root, name)
	}
	yes, no := true, false
	for _, c := range []struct {
		process string
		says    string
		tracked *bool
		want    string
	}{
		{"standard", "tracked", &yes, TracedDir(r)},
		{"trivial", "tracked", &yes, TracedDir(r)},
		{"standard", "local", &no, EphemeralDir(r)},
		{"trivial", "local", &no, EphemeralDir(r)},
		{"note", "nothing", nil, EphemeralDir(r)},
	} {
		tok, err := Mint(r, Token{Process: c.process, Title: "a token", Status: "first", Tracked: c.tracked})
		if err != nil {
			t.Fatalf("a %s token saying %s: %v", c.process, c.says, err)
		}
		if got := filepath.Dir(noteAt(r, tok.ID)); got != c.want {
			t.Errorf("a %s token saying %s is in %s, and it belongs in %s", c.process, c.says, got, c.want)
		}
	}
}

// NOTHING IS UNSAID, AND A NOTE IS NOT ASKED.
//
// A standard token is not tracked by default any more than a trivial one is.
// Later the state machine answers this. It does not exist, so the minter
// answers, and a mint that skips the question is refused where the caller can
// still act on it.
func TestAMintThatDoesNotSayWhereIsRefused(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	for _, name := range []string{"note", "standard", "trivial"} {
		writeProcess(t, root, name)
	}
	yes := true
	for _, c := range []struct {
		says  string
		token Token
		wants string
	}{
		{"a standard token saying nothing",
			Token{Process: "standard", Title: "one", Status: "first"}, "tracked"},
		{"a trivial token saying nothing",
			Token{Process: "trivial", Title: "two", Status: "first"}, "tracked"},
		{"a note asking to be tracked",
			Token{Process: "note", Title: "three", Status: "first", Tracked: &yes}, "private"},
	} {
		tok, err := Mint(r, c.token)
		if err == nil {
			t.Errorf("%s was minted, and it is refused", c.says)
			continue
		}
		if !strings.Contains(err.Error(), c.wants) {
			t.Errorf("%s was refused saying %q, which does not say %q", c.says, err, c.wants)
		}
		if tok.ID != "" && noteAt(r, tok.ID) != "" {
			t.Errorf("%s was refused and left a file behind", c.says)
		}
	}
}

// A MOVE STICKS.
//
// The folder is the answer, so a token dragged from one store to the other is
// written back where it now is. A save that read the process instead put it
// straight back, which made a move by hand undo itself.
func TestAHandMovedTokenStaysMoved(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "standard")
	yes := true
	tok, err := Mint(r, Token{Process: "standard", Title: "a token that moves", Status: "first", Tracked: &yes})
	if err != nil {
		t.Fatal(err)
	}
	from := filepath.Join(TracedDir(r), tok.ID+".md")
	to := filepath.Join(EphemeralDir(r), tok.ID+".md")
	if err := os.MkdirAll(EphemeralDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(from, to); err != nil {
		t.Fatal(err)
	}
	r.forget()

	tok.Title = "moved, then saved"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(to); err != nil {
		t.Fatalf("the save did not leave it where it was moved: %v", err)
	}
	if _, err := os.Stat(from); err == nil {
		t.Fatal("it is in both stores, so one id names two files")
	}
	if all := Tokens(r); len(all) != 1 {
		t.Fatalf("the engine reads %d tokens where one was written", len(all))
	}
}

// tracked and local are the two answers a mint gives, so a test says which
// without keeping a variable of its own to point at.
func tracked() *bool { yes := true; return &yes }
func local() *bool   { no := false; return &no }

// writeProcess writes the smallest process a mint will accept.
func writeProcess(t *testing.T, root, name string) {
	t.Helper()
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	body := "name: " + name + "\ndescription: a process for the test\n" +
		"sections:\n  required:\n    - detail\nstates:\n  - name: first\n    description: where it starts\n" +
		"activities:\n  - name: write\n    does: write it\n    to: first\n" +
		"dispositions:\n  - name: done\n    description: it was done\n"
	if err := os.WriteFile(filepath.Join(dir, name+".process.yaml"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

// THE ONE PRIVATE PROCESS IS A PROCESS THIS COPY HAS.
//
// The engine names it, so a rename in src/processes would leave the engine
// asking a question about a process nobody has.
func TestThePrivateProcessExists(t *testing.T) {
	t.Parallel()
	if _, err := LoadProcess("../..", PrivateProcess); err != nil {
		t.Fatalf("the engine keeps %s private and this copy has no such process: %v", PrivateProcess, err)
	}
}
