// An action answers over /v1 within the wait its request sets: its result
// where it ends in time, and 202 with its handle where the wait runs out.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"testing"
	"time"

	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The input of the fake action t/add. [[spec/tickets/actions-answer-over-http]]
type addIn struct {
	A int `json:"a" doc:"the first term"`
	B int `json:"b" doc:"the second term"`
}

// What t/add answers. [[spec/tickets/actions-answer-over-http]]
type addOut struct {
	Sum int `json:"sum" label:"Sum" doc:"the two terms added"`
}

// The body an action posted over /v1 answers. [[spec/tickets/actions-answer-over-http]]
type postedOut struct {
	Result   *addOut  `json:"result"`
	Running  bool     `json:"running"`
	Handle   string   `json:"handle"`
	Fraction *float64 `json:"fraction"`
	Gone     *float64 `json:"gone"`
}

// The op table in memory, read as the manager's rows. [[spec/design_output/model#an-operation-outlives-callers]]
type heldRows struct{ table OpRows }

func (one heldRows) Save(id string, body []byte) error { return one.table.Save(id, body) }
func (one heldRows) Drop(id string) error              { return one.table.Drop(id) }

func (one heldRows) All() ([]manager.Row, error) {
	all, err := one.table.All()
	out := make([]manager.Row, 0, len(all))
	for _, row := range all {
		out = append(out, manager.Row{ID: row.ID, Body: row.Body})
	}
	return out, err
}

// A door with the manager over the fake action t/add, whose accept answers once hold closes, and the default wait the case seeds. [[spec/tickets/actions-answer-over-http]]
func standingActions(t *testing.T, wait int, hold <-chan struct{}) Standing {
	t.Helper()
	root := tree(t)
	c := q.New()
	as := manager.Registers(c)
	q.OutIn(c, WaitName, wait, q.Doc("the default wait, as the case seeds it"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"), q.Answers[addOut]())
	accept := func(asked q.Request) (any, error) {
		<-hold
		in, _ := asked.Args.(addIn)
		return addOut{Sum: in.A + in.B}, nil
	}
	manage := func(root string, store *q.Store, rows OpRows, steps func(func())) (Managed, error) {
		stop, call, err := manager.Serves(manager.Outside{
			Root: root, Store: store, As: as, Rows: heldRows{rows}, Steps: steps, Now: time.Now, Accept: accept,
			Every: func(time.Duration, func(time.Time)) func() { return func() {} },
		})
		return Managed{Stop: stop, Call: func(name string, input any, caller string, wait time.Duration) (Called, error) {
			said, err := call(name, input, caller, wait)
			return Called(said), err
		}}, err
	}
	_, stop, _, err := opens(root, filepath.Join(t.TempDir(), "index.db"), c, manage)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	return standing
}

// Posts a body to a path over /v1, with the Prefer header where the case sends one. [[spec/tickets/actions-answer-over-http]]
func postV1(t *testing.T, standing Standing, path, prefer, body string) (*http.Response, []byte) {
	t.Helper()
	asked, err := http.NewRequest(http.MethodPost, fmt.Sprintf("http://127.0.0.1:%d%s", standing.V1, path), strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	asked.Header.Set("Content-Type", "application/json")
	if prefer != "" {
		asked.Header.Set("Prefer", prefer)
	}
	said, err := http.DefaultClient.Do(asked)
	if err != nil {
		t.Fatal(err)
	}
	defer said.Body.Close()
	read, err := io.ReadAll(said.Body)
	if err != nil {
		t.Fatal(err)
	}
	return said, read
}

func postedOf(t *testing.T, body []byte) postedOut {
	t.Helper()
	var out postedOut
	if err := json.Unmarshal(body, &out); err != nil {
		t.Fatalf("the answer reads no JSON: %v: %s", err, body)
	}
	return out
}

func TestAnActionAnswersItsResultWithinTheWait(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	said, body := postV1(t, standingActions(t, 0, hold), "/v1/actions/t/add", "wait=5", `{"a":2,"b":3}`)
	if said.StatusCode != http.StatusOK {
		t.Fatalf("the post answers %d: %s", said.StatusCode, body)
	}
	out := postedOf(t, body)
	if out.Result == nil || out.Result.Sum != 5 || out.Running || !strings.HasPrefix(out.Handle, "/v1/values/ops/") {
		t.Fatalf("the post answers %s", body)
	}
	if applied := said.Header.Get("Preference-Applied"); applied != "wait=5" {
		t.Fatalf("the post applies the preference %q", applied)
	}
}

func TestAWaitOfNoneAnswersAcceptedWithTheHandle(t *testing.T) {
	hold := make(chan struct{})
	standing := standingActions(t, 5, hold)
	said, body := postV1(t, standing, "/v1/actions/t/add", "wait=0", `{"a":2,"b":3}`)
	close(hold)
	if said.StatusCode != http.StatusAccepted {
		t.Fatalf("the post answers %d: %s", said.StatusCode, body)
	}
	out := postedOf(t, body)
	if !out.Running || out.Result != nil || out.Fraction == nil || out.Gone == nil || !strings.HasPrefix(out.Handle, "/v1/values/ops/") {
		t.Fatalf("the post answers %s", body)
	}
	for range topicPolls {
		if read, value := getV1(t, standing, out.Handle); read.StatusCode == http.StatusOK && strings.Contains(string(value), `"state":"done"`) {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("the handle %s reads no operation done", out.Handle)
}

func TestNoPreferReadsTheDefaultWaitOffItsKey(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	said, body := postV1(t, standingActions(t, 5, hold), "/v1/actions/t/add", "", `{"a":1,"b":1}`)
	if out := postedOf(t, body); said.StatusCode != http.StatusOK || out.Result == nil || out.Result.Sum != 2 {
		t.Fatalf("a default wait of 5 answers %d: %s", said.StatusCode, body)
	}
	still := make(chan struct{})
	t.Cleanup(func() { close(still) })
	said, body = postV1(t, standingActions(t, 0, still), "/v1/actions/t/add", "", `{"a":1,"b":1}`)
	if said.StatusCode != http.StatusAccepted {
		t.Fatalf("a default wait of none answers %d: %s", said.StatusCode, body)
	}
}

func TestTheOpenAPIEntryReadsTheAnswerFields(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	_, body := getV1(t, standingActions(t, 0, hold), "/v1/openapi.json")
	var doc struct {
		Paths map[string]map[string]struct {
			Responses map[string]struct {
				Content map[string]struct {
					Schema json.RawMessage `json:"schema"`
				} `json:"content"`
			} `json:"responses"`
		} `json:"paths"`
	}
	if err := json.Unmarshal(body, &doc); err != nil {
		t.Fatal(err)
	}
	entry, ok := doc.Paths["/actions/t/add"]["post"]
	if !ok {
		t.Fatalf("the document holds no post of /actions/t/add: %.300s", body)
	}
	schema := string(entry.Responses["200"].Content["application/json"].Schema)
	if !strings.Contains(schema, `"title":"Sum"`) || !strings.Contains(schema, `"description":"the two terms added"`) {
		t.Fatalf("the 200 schema reads %s", schema)
	}
}
