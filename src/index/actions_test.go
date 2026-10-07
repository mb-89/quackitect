// An action answers over /v1 within the wait its request sets: its result
// where it ends in time, and 202 with its handle where the wait runs out.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
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

// The statuses a post over /v1 answers. [[spec/tickets/test-walks-move-onto-fakes]]
const (
	statusOK          = 200
	statusAccepted    = 202
	statusBadRequest  = 400
	statusNotFound    = 404
	statusUnprocessed = 422
)

// A fake manager: its call runs the action through accept, commits the operation under ops/<id> once it ends, and answers within the wait on its clock. The index imports no module, so the real manager's own cases stand beside it. [[spec/design_output/model#the-index-meets-fake-modules]]
func fakeManager(clock q.Clock, ops q.Writer, accept func(q.Request) (any, error)) Manage {
	return func(_ string, store *q.Store, _ OpRows, _ Reads, _ func(func())) (Managed, error) {
		var ids atomic.Int64
		call := func(name string, input any, _ string, wait time.Duration) (Called, error) {
			id, started := strconv.FormatInt(ids.Add(1), 10), clock.Now()
			ended := make(chan Called, 1)
			go func() {
				said, err := store.Deliver(name, input, accept, nil)
				one := Called{Result: said, Handle: id}
				state := "done"
				if err != nil {
					one.Error, state = err.Error(), "failed"
				}
				store.Commit(store.Snapshot().Revision, ops, map[string]any{"ops/" + id: map[string]any{"state": state, "result": said}})
				ended <- one
			}()
			select {
			case one := <-ended:
				one.Gone = clock.Now().Sub(started)
				return one, nil
			case <-clock.After(wait):
				return Called{Running: true, Handle: id, Gone: clock.Now().Sub(started)}, nil
			}
		}
		return Managed{Stop: func() {}, Call: call}, nil
	}
}

// A door with the fake manager over the fake action t/add, whose accept answers once hold closes, and the default wait the case seeds. [[spec/tickets/actions-answer-over-http]]
func standingActions(t *testing.T, wait int, hold <-chan struct{}) Standing {
	t.Helper()
	_, standing := actionsDoor(t, wait, hold)
	return standing
}

// The same door, beside the standing file it writes. [[spec/tickets/test-walks-move-onto-fakes]]
func actionsDoor(t *testing.T, wait int, hold <-chan struct{}) (*door, Standing) {
	t.Helper()
	c := q.New()
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.OutIn(c, WaitName, wait, q.Doc("the default wait, as the case seeds it"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"), q.Answers[addOut]())
	accept := func(asked q.Request) (any, error) {
		<-hold
		in, _ := asked.Args.(addIn)
		if in.A < 0 {
			return nil, errors.New("t adds no negative term")
		}
		return addOut{Sum: in.A + in.B}, nil
	}
	clock := qtest.NewFake(time.Time{})
	return served(t, clock, tree(t), c, fakeManager(clock, ops, accept))
}

// Posts a body to a path over /v1, with the Prefer header where the case sends one. [[spec/tickets/actions-answer-over-http]]
func postV1(t *testing.T, standing Standing, path, prefer, body string) (reply, []byte) {
	t.Helper()
	headers := map[string]string{"Content-Type": "application/json"}
	if prefer != "" {
		headers["Prefer"] = prefer
	}
	said, err := asksDoor("POST", fmt.Sprintf("http://127.0.0.1:%d%s", standing.V1, path), headers, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	return said, said.Body
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
	if said.StatusCode != statusOK {
		t.Fatalf("the post answers %d: %s", said.StatusCode, body)
	}
	out := postedOf(t, body)
	if out.Result == nil || out.Result.Sum != 5 || out.Running || !strings.HasPrefix(out.Handle, "/v1/values/ops/") || out.Gone == nil || *out.Gone >= 5 {
		t.Fatalf("the post answers %s", body)
	}
	if applied := said.Header.Get("Preference-Applied"); applied != "wait=5" {
		t.Fatalf("the post applies the preference %q", applied)
	}
}

func TestAWaitOfNoneAnswersAcceptedWithTheHandle(t *testing.T) {
	hold := make(chan struct{})
	one, standing := actionsDoor(t, 5, hold)
	said, body := postV1(t, standing, "/v1/actions/t/add", "wait=0", `{"a":2,"b":3}`)
	if said.StatusCode != statusAccepted {
		t.Fatalf("the post answers %d: %s", said.StatusCode, body)
	}
	out := postedOf(t, body)
	if !out.Running || out.Result != nil || out.Fraction == nil || out.Gone == nil || !strings.HasPrefix(out.Handle, "/v1/values/ops/") {
		t.Fatalf("the post answers %s", body)
	}
	next := one.nextCommit()
	close(hold)
	for {
		if read, value := getV1(t, standing, out.Handle); read.StatusCode == statusOK && strings.Contains(string(value), `"state":"done"`) {
			return
		}
		<-next
		next = one.nextCommit()
	}
}

func TestNoPreferReadsTheDefaultWaitOffItsKey(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	said, body := postV1(t, standingActions(t, 5, hold), "/v1/actions/t/add", "", `{"a":1,"b":1}`)
	if out := postedOf(t, body); said.StatusCode != statusOK || out.Result == nil || out.Result.Sum != 2 {
		t.Fatalf("a default wait of 5 answers %d: %s", said.StatusCode, body)
	}
	still := make(chan struct{})
	t.Cleanup(func() { close(still) })
	said, body = postV1(t, standingActions(t, 0, still), "/v1/actions/t/add", "", `{"a":1,"b":1}`)
	if said.StatusCode != statusAccepted {
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
	// The time gone by answers seconds, as the wait reads. [[spec/tickets/gone-names-its-unit]]
	if running := string(entry.Responses["202"].Content["application/json"].Schema); !strings.Contains(running, `"description":"the seconds gone by since it started"`) {
		t.Fatalf("the 202 schema reads %s", running)
	}
}

// A body the input type refuses reads 400, and a module refusing a request reads 422 with its reason. [[spec/tickets/action-refusals-meet-cases]]
func TestARefusedPostAnswersItsProblem(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	standing := standingActions(t, 0, hold)
	if said, body := postV1(t, standing, "/v1/actions/t/add", "wait=5", `{"a":"two"}`); said.StatusCode != statusBadRequest {
		t.Fatalf("a body the input refuses answers %d: %s", said.StatusCode, body)
	}
	said, body := postV1(t, standing, "/v1/actions/t/add", "wait=5", `{"a":-1,"b":1}`)
	if said.StatusCode != statusUnprocessed || !strings.Contains(string(body), "t adds no negative term") {
		t.Fatalf("a refusing module answers %d: %s", said.StatusCode, body)
	}
}

// A Prefer header holding two preferences applies the wait among them, per RFC 7240. [[spec/design_output/model#a-caller-sets-its-wait]]
func TestAPreferHeaderAppliesItsWaitAmongOthers(t *testing.T) {
	hold := make(chan struct{})
	close(hold)
	said, body := postV1(t, standingActions(t, 0, hold), "/v1/actions/t/add", "respond-async, wait=5", `{"a":2,"b":2}`)
	if out := postedOf(t, body); said.StatusCode != statusOK || out.Result == nil || out.Result.Sum != 4 {
		t.Fatalf("the post answers %d: %s", said.StatusCode, body)
	}
	if applied := said.Header.Get("Preference-Applied"); applied != "wait=5" {
		t.Fatalf("the post applies the preference %q", applied)
	}
}

// A door with no manager calls nothing, so /v1 serves no action. [[spec/tickets/actions-answer-over-http]]
func TestADoorWithNoManagerServesNoAction(t *testing.T) {
	c := q.New()
	q.ActionIn(c, "t/add", func(in addIn) []q.Request { return nil }, q.Doc("adds two terms"))
	_, standing := served(t, qtest.Wall(), tree(t), c, nil)
	if said, body := postV1(t, standing, "/v1/actions/t/add", "wait=5", `{}`); said.StatusCode != statusNotFound {
		t.Fatalf("a door with no manager answers %d: %s", said.StatusCode, body)
	}
}
