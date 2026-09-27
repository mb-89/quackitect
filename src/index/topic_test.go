// The tickets topic, read through the door, and the writer each topic the
// index registers commits through. The files come from the watch module.
// [[spec/tickets/the-tickets-topic-lands]]
package index

import (
	"path/filepath"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/tickets"
)

const topicPolls = 100

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
	store := q.NewStore(catalog)
	if _, err := store.Commit(0, as.tickets, map[string]any{tickets.AllName: []tickets.Ticket{}}); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Commit(0, as.ops, map[string]any{tickets.AllName: []tickets.Ticket{}}); err == nil {
		t.Fatal("the ops writer commits tickets/all")
	}
}
