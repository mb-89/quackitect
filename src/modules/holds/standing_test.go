// The standing holds: one row a hold file, marked where a person holds it,
// and a hold whose ticket stands closed drops out.
// [[spec/tickets/the-lens-reads-v1]]
package holds

import (
	"encoding/json"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

const standingName = "holds/standing"

type standingRow struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Hand   string `json:"hand"`
	Person bool   `json:"person"`
}

// The rows holds/standing answers over the hold files and the tickets a case seeds, keyed by ticket. [[spec/tickets/the-lens-reads-v1]]
func standingOver(t *testing.T, holds map[string]string, tickets []ticket.Ticket) map[string]standingRow {
	t.Helper()
	var all q.Writer
	index := qtest.New(t, func(c *q.Catalog) {
		all = q.OutIn(c, "tickets/all", []ticket.Ticket{}, q.Doc("every ticket, as the case seeds it"))
		Registers(c)
	})
	index.SeedAs(all, map[string]any{"tickets/all": tickets})
	files := map[string]any{}
	for path, text := range holds {
		files["files/"+path] = q.Content{Hash: path, Text: text}
	}
	index.Seed(files)
	if err := index.Store().Run(standingName); err != nil {
		t.Fatalf("%s runs to %v, where it answers the standing holds", standingName, err)
	}
	body, err := json.Marshal(index.Read(standingName))
	if err != nil {
		t.Fatal(err)
	}
	var rows []standingRow
	if err := json.Unmarshal(body, &rows); err != nil {
		t.Fatalf("%s reads %s, which holds no rows: %v", standingName, body, err)
	}
	out := map[string]standingRow{}
	for _, one := range rows {
		out[one.Ticket] = one
	}
	return out
}

// A hold whose ticket stands closed drops out, and a hold whose ticket stands open keeps its row. [[spec/tickets/the-lens-reads-v1]]
func TestStandingDropsAClosedTicketsHold(t *testing.T) {
	rows := standingOver(t, map[string]string{
		".se/.runtime/hold/one.json": `{"ticket": "open-one", "path": "spec/tickets/open-one.md", "step": "design/draft", "hand": "agent"}`,
		".se/.runtime/hold/two.json": `{"ticket": "closed-one", "path": "spec/tickets/closed-one.md", "step": "design/draft", "hand": "agent"}`,
	}, []ticket.Ticket{
		{Name: "open-one", Path: "spec/tickets/open-one.md", State: "open"},
		{Name: "closed-one", Path: "spec/tickets/closed-one.md", State: "closed"},
	})
	if _, kept := rows["closed-one"]; kept || len(rows) != 1 {
		t.Fatalf("%s reads %+v, and wants the closed ticket's hold dropped", standingName, rows)
	}
	if one := rows["open-one"]; one.Path != "spec/tickets/open-one.md" || one.Step != "design/draft" || one.Hand != "agent" || one.Person {
		t.Fatalf("the open ticket's hold reads %+v", one)
	}
}

// A hold whose hand is person, or starts with person and a space, reads as the person's, and an agent's reads as none. [[spec/tickets/the-lens-reads-v1]]
func TestStandingMarksThePersonsHold(t *testing.T) {
	rows := standingOver(t, map[string]string{
		".se/.runtime/hold/a.json": `{"ticket": "bare", "path": "spec/tickets/bare.md", "step": "view/seen", "hand": "person"}`,
		".se/.runtime/hold/b.json": `{"ticket": "named", "path": "spec/tickets/named.md", "step": "view/seen", "hand": "person desk"}`,
		".se/.runtime/hold/c.json": `{"ticket": "agent", "path": "spec/tickets/agent.md", "step": "view/seen", "hand": "personal agent"}`,
	}, []ticket.Ticket{
		{Name: "bare", Path: "spec/tickets/bare.md", State: "open"},
		{Name: "named", Path: "spec/tickets/named.md", State: "open"},
		{Name: "agent", Path: "spec/tickets/agent.md", State: "open"},
	})
	if len(rows) != 3 || !rows["bare"].Person || !rows["named"].Person || rows["agent"].Person {
		t.Fatalf("%s reads %+v, and wants person and person desk marked, and personal agent unmarked", standingName, rows)
	}
	if rows["named"].Hand != "person desk" {
		t.Fatalf("the named hold reads the hand %q", rows["named"].Hand)
	}
}
