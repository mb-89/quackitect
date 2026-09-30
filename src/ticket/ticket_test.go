// A ticket reading none of the queue's fields writes none of them, so every
// answer standing before the queue read them keeps its shape.
// [[spec/tickets/the-queue-becomes-a-module]]
package ticket

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestABareTicketWritesNoneOfTheQueuesFields(t *testing.T) {
	text, err := json.Marshal(Ticket{Name: "one"})
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"todo_at", "cloud", "held", "person"} {
		if strings.Contains(string(text), `"`+key+`"`) {
			t.Errorf("a bare ticket writes %s: %s", key, text)
		}
	}
	marked, _ := json.Marshal(Ticket{Name: "one", Cloud: true})
	if !strings.Contains(string(marked), `"cloud":true`) {
		t.Errorf("a marked ticket writes no cloud: %s", marked)
	}
}

// A tip and a branch round-trip through JSON whole, since the index hands them to a reader over the wire. [[spec/tickets/the-index-reads-standing-branches]]
func TestATipAndABranchRoundTripThroughJSON(t *testing.T) {
	tip := Tip{Name: "a-group", Trunk: "trunk's copy", Files: []File{{Path: "spec/tickets/a-group.md", Text: "the tip's copy"}}}
	branch := Branch{Name: "a-group", Merged: true, Ticket: Ticket{Name: "a-group"}, Children: []Ticket{{Name: "a-child", Group: "a-group"}}}
	for _, one := range []any{tip, branch} {
		text, err := json.Marshal(one)
		if err != nil {
			t.Fatal(err)
		}
		back := map[string]any{}
		if err := json.Unmarshal(text, &back); err != nil || back["name"] != "a-group" {
			t.Fatalf("%T writes %s", one, text)
		}
	}
	var read Branch
	text, _ := json.Marshal(branch)
	if err := json.Unmarshal(text, &read); err != nil || !read.Merged || read.Children[0].Group != "a-group" {
		t.Fatalf("the branch reads back %+v", read)
	}
}
