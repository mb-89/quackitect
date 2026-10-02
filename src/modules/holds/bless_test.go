// bless/set runs the ticket verb's desk bless as a person, so the verb writes
// the bless file and its hand rule refuses an agent.
// [[spec/tickets/the-sidebar-writes-through-actions]]
package holds

import (
	"encoding/json"
	"reflect"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

const blessSet = "bless/set"

func TestBlessSetRunsTheDeskVerb(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) {
		q.OutIn(c, "tickets/all", []ticket.Ticket{}, q.Doc("every ticket, as the case seeds it"))
		Registers(c)
	})
	for agent, word := range map[bool]string{true: "--desk=true", false: "--desk=false"} {
		body, _ := json.Marshal(map[string]any{"agent": agent, "person": true})
		input, err := index.Store().Input(blessSet, body)
		if err != nil {
			t.Fatalf("%s takes %s to %v, and wants the agent word and the person mark", blessSet, body, err)
		}
		asked, err := index.Store().Act(blessSet, input)
		if err != nil || len(asked) != 1 {
			t.Fatalf("%s lists %+v, %v, and wants one run", blessSet, asked, err)
		}
		args, _ := json.Marshal(asked[0].Args)
		var said any
		_ = json.Unmarshal(args, &said)
		want := map[string]any{"words": []any{"ticket", "bless", word}, "person": true}
		if asked[0].Module != "node" || asked[0].Verb != "run" || !reflect.DeepEqual(said, want) || asked[0].NoUndo == "" {
			t.Fatalf("%s lists %s %s %s, and wants node run %v as a person", blessSet, asked[0].Module, asked[0].Verb, args, want)
		}
	}
}
