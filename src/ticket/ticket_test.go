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
