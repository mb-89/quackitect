// The files/ topic, read through the door: a write under the watcher reaches
// the value, and a removed file reads the default.
// [[spec/tickets/files-topic-reads-the-rows]]
package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/tickets"
)

const topicPolls = 100

func readsFile(t *testing.T, standing Standing, rel string) map[string]any {
	t.Helper()
	said, err := posts(standing, []string{"call", "read", `{"name":"files/` + rel + `"}`})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error != "" {
		t.Fatalf("read answered %q", said.Error)
	}
	held, _ := said.Result.(map[string]any)
	return held
}

func waitsFor(t *testing.T, standing Standing, rel, text string) {
	t.Helper()
	var held map[string]any
	for range topicPolls {
		if held = readsFile(t, standing, rel); held["text"] == text {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("files/%s reads %#v, never %q", rel, held, text)
}

func TestAChangedFileReadsItsNewContentsUnderFiles(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}

	first := readsFile(t, standing, "src/plain.js")
	if first["text"] != "// a line the search finds\nconst said = 1;\n" || first["hash"] == "" {
		t.Fatalf("files/src/plain.js reads %#v", first)
	}
	write(t, root, "src/plain.js", "const said = 2;\n")
	waitsFor(t, standing, "src/plain.js", "const said = 2;\n")
}

func TestARemovedFileReadsTheDefaultUnderFiles(t *testing.T) {
	root := tree(t)
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}

	waitsFor(t, standing, "spec/two.md", "---\nkind: note\nid: two\n---\n\nThe second note names [[nobody]] at all.\n")
	if err := os.Remove(filepath.Join(root, "spec", "two.md")); err != nil {
		t.Fatal(err)
	}
	waitsFor(t, standing, "spec/two.md", "")
	if held := readsFile(t, standing, "spec/two.md"); held["hash"] != "" {
		t.Fatalf("a removed file reads %#v", held)
	}
}

// A ticket, tracked or private, reaches tickets/all in the commit that carries its file. [[spec/tickets/the-tickets-topic-lands]]
func TestPublishesTickets(t *testing.T) {
	root := tree(t)
	write(t, root, "spec/tickets/grows.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nIt grows.\n")
	write(t, root, ".se/tickets/parked.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nLater.\n")
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), q.New())
	if err != nil {
		t.Fatal(err)
	}
	defer stop()
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}

	var said []any
	for range topicPolls {
		read, err := posts(standing, []string{"call", "read", `{"name":"tickets/all"}`})
		if err != nil {
			t.Fatal(err)
		}
		said, _ = read.Result.([]any)
		names := map[string]string{}
		for _, one := range said {
			row, _ := one.(map[string]any)
			name, _ := row["name"].(string)
			says, _ := row["says"].(string)
			names[name] = says
		}
		if names["grows"] == "It grows." && names["parked"] == "Later." {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("tickets/all reads %#v", said)
}

// Each topic the index registers commits through its own writer, and through no other. [[spec/tickets/commits-name-their-writer]]
func TestTheTopicsCommitThroughTheirOwnWriters(t *testing.T) {
	catalog := q.New()
	as := registersTopics(catalog)
	store := q.NewStore(catalog, nil)
	both := map[string]any{filesPrefix + "a.md": q.Content{Text: "a"}, tickets.AllName: []tickets.Ticket{}}
	if _, err := store.Commit(0, q.Join(as.files, as.tickets), both); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Commit(0, as.ops, map[string]any{filesPrefix + "a.md": q.Content{}}); err == nil {
		t.Fatal("the ops writer commits a file")
	}
}
