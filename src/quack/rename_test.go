// The Go rename verb, a case for each road rename.test.js covered: the reach,
// the edged rewrite, the move of a file, a folder and a note, the closed ticket
// left alone, the text rename, the faults, and the journal entry.
// [[spec/tickets/landing-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The text of a file under the root, and whether it stands. [[spec/tickets/landing-verbs-port-to-go]]
func textAt(root, path string) (string, bool) {
	said, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
	return string(said), err == nil
}

// The journal entries the rename leaves under the root. [[spec/tickets/landing-verbs-port-to-go]]
func renameEntries(t *testing.T, root string) []renameEntry {
	t.Helper()
	folder := filepath.Join(root, filepath.FromSlash(undoFolder))
	found, _ := os.ReadDir(folder)
	var out []renameEntry
	for _, one := range found {
		text, err := os.ReadFile(filepath.Join(folder, one.Name()))
		if err != nil {
			t.Fatal(err)
		}
		var entry renameEntry
		if err := json.Unmarshal(text, &entry); err != nil {
			t.Fatalf("%s reads as no entry: %v", one.Name(), err)
		}
		out = append(out, entry)
	}
	return out
}

func TestRenameVerb(t *testing.T) {
	t.Run("a reach is a line naming the old name, and a longer word is no reach", func(t *testing.T) {
		text := "import a from \"./src/a.js\";\nsee [[src/a.js]]\nsrc/a.jsx stands apart\nmy-src/a.js too\n"
		if got := reachesIn(text, "src/a.js"); len(got) != 2 || got[0].line != 1 || got[1].line != 2 {
			t.Fatalf("reachesIn answers %v", got)
		}
	})
	t.Run("a rewrite answers the old name as the new one, and leaves a longer word alone", func(t *testing.T) {
		got := renamedForms("a.js and a.jsx and b-a.js and (a.js)", formsOf("a.js", "c.js"))
		if got != "c.js and a.jsx and b-a.js and (c.js)" {
			t.Fatalf("renamedForms answers %q", got)
		}
	})
	t.Run("every form of a name rewrites in one pass, the longest first", func(t *testing.T) {
		got := renamedForms("[[spec/a/a]] and spec/a/a.md", formsOf("spec/a/a.md", "spec/a/a/a.md"))
		if got != "[[spec/a/a/a]] and spec/a/a/a.md" {
			t.Fatalf("renamedForms answers %q", got)
		}
	})
	t.Run("the move carries a file of any ending, and a file the reader leaves out stands in the answer", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "pics/a.png", "\x89PNG\x00\x01 pics/a.png")
		lays(t, root, "src/a.txt", "see pics/a.png\n")
		d, _, _ := fakeLanding(root)
		code, out, errs := runsTwin(renameVerb(d), "rename", "pics", "art")
		if code != 0 || !strings.HasPrefix(out, "pics stands at art.\n") {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(root, "src/a.txt"); said != "see art/a.png\n" {
			t.Fatalf("src/a.txt reads %q", said)
		}
		if said, ok := textAt(root, "art/a.png"); !ok || !strings.HasSuffix(said, " pics/a.png") {
			t.Fatalf("art/a.png reads %q, and the picture's bytes stand unread", said)
		}
		if !strings.Contains(out, "  the reader reads art/a.png as a picture, so the rewrite leaves it alone") || !strings.Contains(out, "  src/a.txt\n") || !strings.HasSuffix(out, "Run ./RUNME.sh links, then ./RUNME.sh check.\n") {
			t.Fatalf("rename says %q", out)
		}
	})
	t.Run("the move carries the folder whole, a skipped folder in it too, and git reads the move", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "lib/a.js", "export const a = 1;\n")
		lays(t, root, "lib/node_modules/x.js", "lib/a.js\n")
		lays(t, root, "src/b.js", "import { a } from \"../lib/a.js\";\n")
		gitDoes(t, root, "add", "lib/a.js", "src/b.js")
		gitDoes(t, root, "commit", "-q", "-m", "a-ticket: lib")
		d, _, _ := fakeLanding(root)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "lib", "pkg/lib"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if _, ok := textAt(root, "pkg/lib/node_modules/x.js"); !ok {
			t.Fatal("the skipped folder stays behind")
		}
		if said, _ := textAt(root, "src/b.js"); said != "import { a } from \"../pkg/lib/a.js\";\n" {
			t.Fatalf("src/b.js reads %q", said)
		}
		if staged := stagedNames(t, root); !strings.Contains(staged, "lib/a.js") || !strings.Contains(staged, "pkg/lib/a.js") {
			t.Fatalf("git stages %q", staged)
		}
	})
	t.Run("a note moves as a file, and both forms of its name rewrite", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "spec/a.md", "# A\n")
		lays(t, root, "spec/b.md", "see [[spec/a]] and spec/a.md\n")
		d, _, _ := fakeLanding(root)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "spec/a.md", "spec/c.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(root, "spec/b.md"); said != "see [[spec/c]] and spec/c.md\n" {
			t.Fatalf("spec/b.md reads %q", said)
		}
	})
	t.Run("a move under a folder of its own name rewrites every link once, and leaves a closed ticket as it stands", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "spec/a.md", "# A\n")
		lays(t, root, "spec/b.md", "see [[spec/a]]\n")
		lays(t, root, "spec/tickets/shut.md", "---\nstate: closed\n---\n\nsee [[spec/a]]\n")
		d, _, _ := fakeLanding(root)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "spec/a.md", "spec/a/a.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(root, "spec/b.md"); said != "see [[spec/a/a]]\n" {
			t.Fatalf("spec/b.md reads %q", said)
		}
		if said, _ := textAt(root, "spec/tickets/shut.md"); !strings.Contains(said, "see [[spec/a]]") {
			t.Fatalf("the closed ticket reads %q", said)
		}
	})
	t.Run("a name standing as no path rewrites, and moves nothing", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "src/a.go", "quackitect/src/oldname\n")
		d, _, _ := fakeLanding(root)
		code, out, errs := runsTwin(renameVerb(d), "rename", "quackitect/src/oldname", "quackitect/src/newname", "--text")
		if code != 0 || !strings.Contains(out, "  src/a.go\n") {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(root, "src/a.go"); said != "quackitect/src/newname\n" {
			t.Fatalf("src/a.go reads %q", said)
		}
		if len(renameEntries(t, root)) != 0 {
			t.Fatal("the text rename writes a journal entry")
		}
	})
	t.Run("a name standing nowhere answers a fault, moves nothing, and writes no journal", func(t *testing.T) {
		root, _ := landingRepo(t)
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(renameVerb(d), "rename", "nowhere", "somewhere")
		if code != exitFailed || errs != "nowhere stands nowhere under this tree.\n" || len(renameEntries(t, root)) != 0 {
			t.Fatalf("rename answers %d, %q", code, errs)
		}
	})
	t.Run("a target standing already stops the move", func(t *testing.T) {
		root, _ := landingRepo(t)
		d, _, _ := fakeLanding(root)
		code, _, errs := runsTwin(renameVerb(d), "rename", "README.md", "spec/tickets/a-ticket.md")
		if code != exitFailed || errs != "spec/tickets/a-ticket.md stands already, so the move stops.\n" {
			t.Fatalf("rename answers %d, %q", code, errs)
		}
	})
	t.Run("a call naming no target answers the usage", func(t *testing.T) {
		root, _ := landingRepo(t)
		d, _, _ := fakeLanding(root)
		if code, _, errs := runsTwin(renameVerb(d), "rename", "README.md"); code != exitUsage || !strings.Contains(errs, "se rename <from> <to>") {
			t.Fatalf("rename answers %d, %q", code, errs)
		}
	})
	t.Run("a move writes a journal naming the ticket in hand, each path gone and born, and the move", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, ".se/.runtime/hold/a.json", `{"ticket":"a-ticket","path":"spec/tickets/a-ticket.md"}`)
		lays(t, root, "src/b.md", "see README.md\n")
		d, _, _ := fakeLanding(root)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "README.md", "GUIDE.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		entries := renameEntries(t, root)
		if len(entries) != 1 {
			t.Fatalf("the journal holds %v", entries)
		}
		entry := entries[0]
		if entry.By != renameBy || entry.Ticket != "a-ticket" || entry.Moved.From != "README.md" || entry.Moved.To != "GUIDE.md" || entry.At != "2026-01-02T03:04:05.000Z" {
			t.Fatalf("the entry reads %+v", entry)
		}
		files := map[string]string{}
		for _, one := range entry.Files {
			files[one.File] = one.Was + "|" + one.Made + "|" + map[bool]string{true: "born"}[one.DidNotExist] + map[bool]string{true: "gone"}[one.DidNotStay]
		}
		want := map[string]string{"README.md": "a tree\n||gone", "GUIDE.md": "|a tree\n|born", "src/b.md": "see README.md\n|see GUIDE.md\n|"}
		for file, said := range want {
			if files[file] != said {
				t.Fatalf("the entry holds %q for %s, and wants %q", files[file], file, said)
			}
		}
	})
	t.Run("a move under two holds names no ticket", func(t *testing.T) {
		root, _ := landingRepo(t)
		lays(t, root, "spec/tickets/b-ticket.md", "---\nstate: open\n---\n")
		lays(t, root, ".se/.runtime/hold/a.json", `{"ticket":"a-ticket","path":"spec/tickets/a-ticket.md"}`)
		lays(t, root, ".se/.runtime/hold/b.json", `{"ticket":"b-ticket","path":"spec/tickets/b-ticket.md"}`)
		d, _, _ := fakeLanding(root)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "README.md", "GUIDE.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if entries := renameEntries(t, root); len(entries) != 1 || entries[0].Ticket != "" {
			t.Fatalf("the journal holds %+v", entries)
		}
	})
}
