// The ticket door over a tree the case seeds: what stands in hand, an open
// ticket, a closed one, and one standing nowhere.
// [[spec/tickets/cage-command-rules-port]]
package command

import (
	"strings"
	"testing"
)

// A tree of files by path, as a case seeds it. [[spec/tickets/cage-command-rules-port]]
type seeded map[string]string

func (one seeded) Read(path string) (string, bool) {
	text, ok := one[path]
	return text, ok
}

func (one seeded) List(folder string) []string {
	var out []string
	for path := range one {
		if rest, ok := strings.CutPrefix(path, folder+"/"); ok && !strings.Contains(rest, "/") {
			out = append(out, rest)
		}
	}
	return out
}

const (
	openTicket   = "---\nkind: [[ticket]]\nstate: open\n---\n"
	closedTicket = "---\nkind: [[ticket]]\nstate: [[closed]]\n---\n"
)

func TestTicketFaultReadsTheHand(t *testing.T) {
	tree := seeded{"spec/tickets/a.md": openTicket, ".se/tickets/b.md": openTicket, "spec/tickets/c.md": closedTicket}
	for name, want := range map[string]string{
		"a":                 "",
		"b":                 "",
		"spec/tickets/a.md": "",
		"c":                 "c stands closed. how",
		"d":                 "No ticket named d stands under spec/tickets or .se/tickets. how",
		"":                  "This write names no ticket. how",
	} {
		if got := TicketFault(name, tree, "how"); got != want {
			t.Errorf("TicketFault(%q) says %q, want %q", name, got, want)
		}
	}
	held := seeded{
		"spec/tickets/a.md":        openTicket,
		"spec/tickets/c.md":        closedTicket,
		".se/.runtime/hold/1.json": `{"ticket":"h"}`,
		".se/.runtime/hold/2.json": `{"ticket":"c","path":"spec/tickets/c.md"}`,
		".se/.runtime/plan.json":   `{"working":"a todo"}`,
	}
	for name, want := range map[string]string{
		"h":      "",
		"a todo": "",
		"a":      "a stands outside what is in hand. In hand: h. The working todo: a todo. how",
	} {
		if got := TicketFault(name, held, "how"); got != want {
			t.Errorf("TicketFault(%q) in hand says %q, want %q", name, got, want)
		}
	}
}

func TestTheTicketDoorPassesTheTodoAndTheFreeVerbs(t *testing.T) {
	tree := seeded{".se/.runtime/plan.json": `{"working":"a-todo"}`}
	if said := TicketDoor("ls", "a-todo: list", tree); said != "" {
		t.Fatalf("the todo in hand meets %q", said)
	}
	if said := TicketDoor("./RUNME.sh ticket pull", "", tree); said != "" {
		t.Fatalf("a free verb meets %q", said)
	}
	if said := TicketDoor("ls", "list", tree); !strings.HasPrefix(said, "This write names no ticket. Open the description") {
		t.Fatalf("a description naming no ticket meets %q", said)
	}
}
