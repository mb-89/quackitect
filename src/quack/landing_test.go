// The landing verbs commit, push and rename over a landing repository and a
// fake verb road.
// [[spec/tickets/landing-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"sort"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/edits"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
)

// A landing repository stands under a folder its test's name stays out of, however long the name runs. [[spec/tickets/landing-verbs-windows-green]]
func TestLandingRepoStandsUnderAShortFolder(t *testing.T) {
	t.Parallel()
	t.Run("sentinel, a case named past the Windows path limit "+strings.Repeat("x", 120), func(t *testing.T) {
		at := landingRepo(t).root
		if strings.Contains(at, "sentinel") || len(filepath.Base(filepath.Dir(at))) > 32 {
			t.Fatalf("the repository stands at %s, which carries the test's name", at)
		}
	})
}

// The verb runs the fake records, and what each verb answers by its words. [[spec/tickets/landing-verbs-port-to-go]]
type verbsHeard struct {
	ran     [][]string
	answers map[string]verbAnswer
}

// A verb's exit code and what it says. [[spec/tickets/landing-verbs-port-to-go]]
type verbAnswer struct {
	code int
	said string
}

// Whether the fake ran the verb the words name. [[spec/tickets/landing-verbs-port-to-go]]
func (heard *verbsHeard) reached(words string) bool {
	for _, one := range heard.ran {
		if strings.Join(one, " ") == words {
			return true
		}
	}
	return false
}

// The moment every landing case's clock and commit read. [[spec/tickets/landing-verbs-port-to-go]]
func caseNow() time.Time { return time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC) }

// The doors over a landing repository: its FakeRepo, and fakes for the verbs the road runs, Vale, the log and the clock. The box stands in the cloud, and no claude stands on it. [[spec/tickets/quack-repos-meet-fake-git]]
func fakeLanding(at *landing) (landingDoors, *verbsHeard, *[]map[string]any) {
	record := &verbsHeard{answers: map[string]verbAnswer{}}
	rows := &[]map[string]any{}
	return landingDoors{
		root:  at.root,
		git:   at.repo,
		cloud: true,
		verb: func(words ...string) (int, string) {
			record.ran = append(record.ran, words)
			said := record.answers[strings.Join(words, " ")]
			return said.code, said.said
		},
		voice: func(string) []heard { return nil },
		log:   func(row map[string]any) error { *rows = append(*rows, row); return nil },
		now:   caseNow,
		box:   quietBox(),
	}, record, rows
}

// A landing repository: its folder, the FakeRepo over that folder, and the origin it pushes to, in memory. [[spec/tickets/quack-repos-meet-fake-git]]
type landing struct {
	t      *testing.T
	root   string
	repo   *git.FakeRepo
	origin *git.FakeRepo
}

// The branch a landing repository opens on. [[spec/tickets/quack-repos-meet-fake-git]]
const trunkBranch = "main"

// A repository on main holding an open ticket and a closed one, pushed to an origin. [[spec/tickets/quack-repos-meet-fake-git]]
func landingRepo(t *testing.T) *landing {
	t.Helper()
	origin := git.NewFakeRepo(files.NewFakeDisk(), caseNow)
	at := landingOver(t, func(root string) *git.FakeRepo { return origin.Clone(files.NewDisk(root)) })
	at.origin = origin
	if pushed := at.repo.Push(trunkBranch, true); !pushed.OK {
		t.Fatal(pushed.Err)
	}
	return at
}

// The same repository with no origin, so a push refuses. [[spec/tickets/quack-repos-meet-fake-git]]
func landingAlone(t *testing.T) *landing {
	t.Helper()
	return landingOver(t, func(root string) *git.FakeRepo { return git.NewFakeRepo(files.NewDisk(root), caseNow) })
}

// The landing tree under a short folder, in the repository the maker builds over it, committed once. [[spec/tickets/quack-repos-meet-fake-git]]
func landingOver(t *testing.T, maker func(root string) *git.FakeRepo) *landing {
	t.Helper()
	at := &landing{t: t, root: shortDir(t)}
	at.repo = maker(at.root)
	at.repo.Set("user.name", "a hand")
	at.repo.Set("user.email", "hand@example.invalid")
	seedFile(t, at.root, "spec/tickets/a-ticket.md", "---\nstate: open\n---\n\n# Ask\n")
	seedFile(t, at.root, "spec/tickets/shut.md", "---\nstate: closed\n---\n\n# Ask\n")
	seedFile(t, at.root, "README.md", "a tree\n")
	at.commits("a-ticket: the tree opens")
	return at
}

// Stages every path and commits it, and stops the case where the repository refuses. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) commits(message string) {
	at.t.Helper()
	at.must(at.repo.AddAll())
	_, err := at.repo.Commit(message, nil)
	at.must(err)
}

// Fails the case where a fixture's move answers a fault. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) must(err error) {
	at.t.Helper()
	if err != nil {
		at.t.Fatal(err)
	}
}

// The commit HEAD names. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) head() string {
	said, _ := at.repo.Resolve("HEAD")
	return said
}

// The subject at HEAD. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) subject() string { return subjectOf(at.repo, "HEAD") }

// The subject origin holds on a branch. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) originSubject(branch string) string {
	return subjectOf(at.origin, "refs/heads/"+branch)
}

// The subject of the commit a ref names in a repository, or nothing. [[spec/tickets/quack-repos-meet-fake-git]]
func subjectOf(repo git.Repo, ref string) string {
	log, err := repo.Log("", ref, false)
	if err != nil || len(log) == 0 {
		return ""
	}
	return log[0].Subject
}

// The paths the index stages against HEAD, a move by its new path, one a line. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) staged() string {
	said, _ := at.repo.Staged(nil)
	var out []string
	for _, one := range said {
		out = append(out, one.Path)
	}
	return strings.Join(out, "\n")
}

// What HEAD's commit changes, a status and a path a line, a move read as its deletion and its addition. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) landed() string {
	said, _ := at.repo.Changed("HEAD")
	var out []string
	for _, one := range said {
		if one.From != "" {
			out = append(out, "D\t"+one.From, "A\t"+one.Path)
			continue
		}
		out = append(out, one.Status+"\t"+one.Path)
	}
	return strings.Join(out, "\n")
}

// The paths HEAD's commit changes, one a line. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) landedNames() string {
	said, _ := at.repo.Changed("HEAD")
	var out []string
	for _, one := range said {
		out = append(out, one.Path)
	}
	return strings.Join(out, "\n")
}

// Moves a path on disk and stages both sides, as git mv does. [[spec/tickets/quack-repos-meet-fake-git]]
func (at *landing) moves(from, to string) {
	at.t.Helper()
	at.must(realDisk().rename(filepath.Join(at.root, filepath.FromSlash(from)), filepath.Join(at.root, filepath.FromSlash(to))))
	at.must(at.repo.Add([]string{from, to}))
}

// A fresh folder under a short name. t.TempDir names its folder after the test, and a path under it runs past the Windows path limit. [[spec/tickets/landing-verbs-windows-green]]
func shortDir(t *testing.T) string {
	t.Helper()
	at, err := realDisk().makeTemp("", "land")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = realDisk().removeAll(at) })
	return at
}

// The text of a file under the root, read through the disk door the verb runs on, and whether it stands. [[spec/tickets/test-walks-move-onto-fakes]]
func textAt(d landingDoors, path string) (string, bool) {
	said, err := d.box.disk.read(filepath.Join(d.root, filepath.FromSlash(path)))
	return string(said), err == nil
}

// The doors over a landing repository holding the files laid in its tree. [[spec/tickets/landing-verbs-port-to-go]]
func renamesOver(t *testing.T, files map[string]string) landingDoors {
	t.Helper()
	at := landingRepo(t)
	hq1SeedDisk(t, realDisk(), at.root, files)
	d, _, _ := fakeLanding(at)
	return d
}

// The journal entries the rename leaves under the root, read through the disk door the verb runs on. [[spec/tickets/test-walks-move-onto-fakes]]
func renameEntries(t *testing.T, d landingDoors) []renameEntry {
	t.Helper()
	folder := filepath.Join(d.root, filepath.FromSlash(undoFolder))
	found, _ := d.box.disk.list(folder)
	var out []renameEntry
	for _, one := range found {
		text, err := d.box.disk.read(filepath.Join(folder, one.Name()))
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

func TestRenameReaches(t *testing.T) {
	t.Parallel()
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
}

func TestRenameMoves(t *testing.T) {
	t.Parallel()
	t.Run("the move carries a file of any ending, and a file the reader leaves out stands in the answer", func(t *testing.T) {
		at := landingRepo(t)
		root := at.root
		seedFile(t, root, "pics/a.png", "\x89PNG\x00\x01 pics/a.png")
		seedFile(t, root, "src/a.txt", "see pics/a.png\n")
		d, _, _ := fakeLanding(at)
		code, out, errs := runsTwin(renameVerb(d), "rename", "pics", "art")
		if code != 0 || !strings.HasPrefix(out, "pics stands at art.\n") {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(d, "src/a.txt"); said != "see art/a.png\n" {
			t.Fatalf("src/a.txt reads %q", said)
		}
		if said, ok := textAt(d, "art/a.png"); !ok || !strings.HasSuffix(said, " pics/a.png") {
			t.Fatalf("art/a.png reads %q, and the picture's bytes stand unread", said)
		}
		if !strings.Contains(out, "  the reader reads art/a.png as a picture, so the rewrite leaves it alone") || !strings.Contains(out, "  src/a.txt\n") || !strings.HasSuffix(out, "Run ./RUNME.sh links, then ./RUNME.sh check.\n") {
			t.Fatalf("rename says %q", out)
		}
	})
	t.Run("the move carries the folder whole, a skipped folder in it too, and git reads the move", func(t *testing.T) {
		at := landingRepo(t)
		root := at.root
		seedFile(t, root, "lib/a.js", "export const a = 1;\n")
		seedFile(t, root, "lib/node_modules/x.js", "lib/a.js\n")
		seedFile(t, root, "src/b.js", "import { a } from \"../lib/a.js\";\n")
		at.must(at.repo.Add([]string{"lib/a.js", "src/b.js"}))
		_, err := at.repo.Commit("a-ticket: lib", nil)
		at.must(err)
		d, _, _ := fakeLanding(at)
		if code, out, errs := runsTwin(renameVerb(d), "rename", "lib", "pkg/lib"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if _, ok := textAt(d, "pkg/lib/node_modules/x.js"); !ok {
			t.Fatal("the skipped folder stays behind")
		}
		if said, _ := textAt(d, "src/b.js"); said != "import { a } from \"../pkg/lib/a.js\";\n" {
			t.Fatalf("src/b.js reads %q", said)
		}
		if staged := at.staged(); !strings.Contains(staged, "lib/a.js") || !strings.Contains(staged, "pkg/lib/a.js") {
			t.Fatalf("git stages %q", staged)
		}
	})
	t.Run("a note moves as a file, and both forms of its name rewrite", func(t *testing.T) {
		d := renamesOver(t, map[string]string{"spec/a.md": "# A\n", "spec/b.md": "see [[spec/a]] and spec/a.md\n"})
		if code, out, errs := runsTwin(renameVerb(d), "rename", "spec/a.md", "spec/c.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(d, "spec/b.md"); said != "see [[spec/c]] and spec/c.md\n" {
			t.Fatalf("spec/b.md reads %q", said)
		}
	})
	t.Run("a move under a folder of its own name rewrites every link once, and leaves a closed ticket as it stands", func(t *testing.T) {
		d := renamesOver(t, map[string]string{"spec/a.md": "# A\n", "spec/b.md": "see [[spec/a]]\n", "spec/tickets/shut.md": "---\nstate: closed\n---\n\nsee [[spec/a]]\n"})
		if code, out, errs := runsTwin(renameVerb(d), "rename", "spec/a.md", "spec/a/a.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(d, "spec/b.md"); said != "see [[spec/a/a]]\n" {
			t.Fatalf("spec/b.md reads %q", said)
		}
		if said, _ := textAt(d, "spec/tickets/shut.md"); !strings.Contains(said, "see [[spec/a]]") {
			t.Fatalf("the closed ticket reads %q", said)
		}
	})
	t.Run("a name standing as no path rewrites, and moves nothing", func(t *testing.T) {
		d := renamesOver(t, map[string]string{"src/a.go": "quackitect/src/oldname\n"})
		code, out, errs := runsTwin(renameVerb(d), "rename", "quackitect/src/oldname", "quackitect/src/newname", "--text")
		if code != 0 || !strings.Contains(out, "  src/a.go\n") {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if said, _ := textAt(d, "src/a.go"); said != "quackitect/src/newname\n" {
			t.Fatalf("src/a.go reads %q", said)
		}
		if len(renameEntries(t, d)) != 0 {
			t.Fatal("the text rename writes a journal entry")
		}
	})
}

func TestRenameVerb(t *testing.T) {
	t.Parallel()
	t.Run("a name standing nowhere or a target standing already stops the move, and a call naming no target answers the usage", func(t *testing.T) {
		for _, one := range []struct {
			argv []string
			code int
			errs string
		}{
			{[]string{"nowhere", "somewhere"}, exitFailed, "nowhere stands nowhere under this tree.\n"},
			{[]string{"README.md", "spec/tickets/a-ticket.md"}, exitFailed, "spec/tickets/a-ticket.md stands already, so the move stops.\n"},
			{[]string{"README.md"}, exitUsage, "se rename <from> <to>"},
		} {
			d, _, _ := fakeLanding(landingRepo(t))
			code, _, errs := runsTwin(renameVerb(d), append([]string{"rename"}, one.argv...)...)
			if code != one.code || !strings.Contains(errs, one.errs) || len(renameEntries(t, d)) != 0 {
				t.Fatalf("rename %v answers %d, %q", one.argv, code, errs)
			}
		}
	})
	t.Run("a move writes a journal naming the ticket in hand, each path gone and born, and the move", func(t *testing.T) {
		d := renamesOver(t, map[string]string{".se/.runtime/hold/a.json": `{"ticket":"a-ticket","path":"spec/tickets/a-ticket.md"}`, "src/b.md": "see README.md\n"})
		if code, out, errs := runsTwin(renameVerb(d), "rename", "README.md", "GUIDE.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		entries := renameEntries(t, d)
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
		now := map[string]edits.Held{"README.md": {}, "GUIDE.md": {Exists: true, Text: "a tree\n"}, "src/b.md": {Exists: true, Text: "see GUIDE.md\n"}}
		writes, removes, why := edits.Restores(entry.Entry, now)
		var written []string
		for _, one := range writes {
			written = append(written, one.File)
		}
		sort.Strings(written)
		if why != "" || strings.Join(removes, ",") != "GUIDE.md" || strings.Join(written, ",") != "README.md,src/b.md" {
			t.Fatalf("the undo answers %v, %v, %q", written, removes, why)
		}
		now["README.md"] = edits.Held{Exists: true, Text: "x"}
		if _, _, why := edits.Restores(entry.Entry, now); !strings.Contains(why, "stands again") {
			t.Fatalf("the undo over a path standing again answers %q", why)
		}
	})
	t.Run("a move under two holds names no ticket", func(t *testing.T) {
		d := renamesOver(t, map[string]string{"spec/tickets/b-ticket.md": "---\nstate: open\n---\n", ".se/.runtime/hold/a.json": `{"ticket":"a-ticket","path":"spec/tickets/a-ticket.md"}`, ".se/.runtime/hold/b.json": `{"ticket":"b-ticket","path":"spec/tickets/b-ticket.md"}`})
		if code, out, errs := runsTwin(renameVerb(d), "rename", "README.md", "GUIDE.md"); code != 0 {
			t.Fatalf("rename answers %d, %q, %q", code, out, errs)
		}
		if entries := renameEntries(t, d); len(entries) != 1 || entries[0].Ticket != "" {
			t.Fatalf("the journal holds %+v", entries)
		}
	})
}
