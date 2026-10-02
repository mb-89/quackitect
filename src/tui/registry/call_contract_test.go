// The caller's contract: one suite of cases, run against the fake and against
// the /v1 door over a server taking the same actions.
// [[spec/design_output/model#the-fake-keeps-a-contract]]

package registry

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

var suiteResults = map[string]any{"t/add": 5}

// A call answers the result its action ends on, and an action the index lacks answers an error naming it. [[spec/tickets/the-work-keys-call-actions]]
func callsKeepTheContract(t *testing.T, c Caller) {
	t.Helper()
	said, err := c.Call("t/add", map[string]int{"a": 2, "b": 3})
	if err != nil || string(said.Result) != "5" || said.Running {
		t.Fatalf("a call of t/add answers %+v and %v, and wants the result 5", said, err)
	}
	if _, err := c.Call("t/nowhere", struct{}{}); err == nil || !strings.Contains(err.Error(), "t/nowhere") {
		t.Fatalf("a call of an action the index lacks answers %v, and wants an error naming it", err)
	}
}

// The /v1 answer for one post, as the index gives it. [[spec/design_output/model#a-caller-sets-its-wait]]
func takes(results map[string]any) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(r.URL.Path, "/v1/actions/")
		result, found := results[name]
		if r.Method != http.MethodPost || !found {
			w.Header().Set("content-type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]any{"detail": "no action answers " + name})
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"result": result, "running": false, "handle": "/v1/values/ops/h1"})
	}
}

// [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestTheFakeCallerKeepsTheContract(t *testing.T) {
	t.Parallel()
	callsKeepTheContract(t, Fake{Results: suiteResults})
}

// [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestTheV1CallerKeepsTheContract(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(takes(suiteResults))
	defer server.Close()
	callsKeepTheContract(t, V1{Base: server.URL + "/v1"})
}

// [[spec/tickets/the-work-keys-call-actions]]
func TestTheFakeKeepsEveryPostItTakes(t *testing.T) {
	t.Parallel()
	posted := &[]Posted{}
	fake := Fake{Results: suiteResults, Posted: posted}
	_, _ = fake.Call("t/add", map[string]int{"a": 2})
	_, _ = fake.Call("t/nowhere", struct{}{})
	if len(*posted) != 2 || (*posted)[0].Name != "t/add" || string((*posted)[0].Input) != `{"a":2}` || (*posted)[1].Name != "t/nowhere" {
		t.Fatalf("the fake keeps %+v, and wants both posts with their input", *posted)
	}
}

// A call past its wait answers the handle its operation reads at, and the post names the wait it sets. [[spec/design_output/model#a-caller-sets-its-wait]]
func TestACallTheIndexStillRunsAnswersItsHandle(t *testing.T) {
	t.Parallel()
	prefer := make(chan string, 1)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		prefer <- r.Header.Get("Prefer")
		w.WriteHeader(http.StatusAccepted)
		_, _ = w.Write([]byte(`{"running":true,"handle":"/v1/values/ops/h7"}`))
	}))
	defer server.Close()
	said, err := V1{Base: server.URL + "/v1"}.Call("work/pull", struct{}{})
	if err != nil || !said.Running || said.Handle != "/v1/values/ops/h7" {
		t.Fatalf("a call still running answers %+v and %v, and wants its handle", said, err)
	}
	if got := <-prefer; !strings.HasPrefix(got, "wait=") {
		t.Fatalf("the post prefers %q, and wants a wait", got)
	}
}
