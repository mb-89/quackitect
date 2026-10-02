// A verb action a person posts hands the node module the mark, so the run
// reads a person's hand whoever started the index.
// [[spec/tickets/the-lens-calls-actions]]
package verbs

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/src/q"
)

func TestAVerbActionCarriesThePersonMark(t *testing.T) {
	c := q.New()
	Topic("ticket", []Verb{{Name: "pull", Doc: "take the next leaf"}})(c)
	store := q.NewStore(c)
	input, err := store.Input("pull", []byte(`{"args": ["one", "--pass"], "person": true}`))
	if err != nil {
		t.Fatal(err)
	}
	asked, err := store.Act("pull", input)
	if err != nil {
		t.Fatal(err)
	}
	body, _ := json.Marshal(asked[0].Args)
	if len(asked) != 1 || !strings.Contains(string(body), `"person":true`) || !strings.Contains(string(body), `["ticket","pull","one","--pass"]`) {
		t.Fatalf("the action hands %s, and wants the words and the person mark", body)
	}
}
