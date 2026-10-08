// The catalog's contract: one suite of cases, run against the fake and
// against the /v1 door over a server answering the same values.
// [[spec/design_output/model#the-fake-keeps-a-contract]]

package registry

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

var suiteValues = map[string]any{
	DocsName: []map[string]any{{"name": "t/depth", "kind": "name", "doc": "how deep the tree reads"}},
}

// A read answers the value the name holds, and a name the catalog lacks answers an error. [[spec/design_output/model#the-fake-keeps-a-contract]]
func holdsTheContract(t *testing.T, c Catalog) {
	t.Helper()
	said, err := c.Read(DocsName)
	if err != nil {
		t.Fatalf("a read of %s answers %v", DocsName, err)
	}
	var rows []map[string]any
	if err := json.Unmarshal(said, &rows); err != nil || len(rows) != 1 || rows[0]["doc"] != "how deep the tree reads" {
		t.Fatalf("a read of %s answers %s, not the value it holds", DocsName, said)
	}
	if _, err := c.Read("t/nowhere"); err == nil || !strings.Contains(err.Error(), "t/nowhere") {
		t.Fatalf("a read of a name the catalog lacks answers %v, and wants the problem's detail naming it", err)
	}
}

// The /v1 answer for one name, as the index gives it. [[spec/design_output/model#surfaces]]
func serves(values map[string]any) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(r.URL.Path, "/v1/values/")
		value, found := values[name]
		if !found {
			w.Header().Set("content-type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]any{"detail": "no provider answers " + name})
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"name": name, "value": value, "revision": 1})
	}
}

// [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestTheFakeCatalogKeepsTheContract(t *testing.T) {
	holdsTheContract(t, Fake{Values: suiteValues})
}

// [[spec/design_output/model#the-fake-keeps-a-contract]]
func TestTheV1CatalogKeepsTheContract(t *testing.T) {
	server := httptest.NewServer(serves(suiteValues))
	defer server.Close()
	holdsTheContract(t, V1{Base: server.URL + "/v1"})
}

// [[spec/design_output/model#the-registry-tabs]]
func TestTheFakeAnswersTheErrorACaseNames(t *testing.T) {
	want := errors.New("the index stands down")
	if _, err := (Fake{Values: suiteValues, Err: want}).Read(DocsName); !errors.Is(err, want) {
		t.Fatalf("the fake answers %v, not the error the case names", err)
	}
}

var suiteChanges = []Change{
	{Name: "work/rows", Revision: 3, Value: json.RawMessage("[1]")},
	{Name: "log/rows", Revision: 4, Value: json.RawMessage("[2]")},
}

// The refusal the index answers for a name no provider holds. [[spec/tickets/test-walks-move-onto-fakes]]
const suiteRefusal = "the catalog holds no provider of t/none"

// A watch hands each change on as a message and then ends, and a refused watch ends on the problem's detail. [[spec/tickets/test-walks-move-onto-fakes]]
func watchesKeepTheContract(t *testing.T, flowing, refusing Watcher) {
	t.Helper()
	ctx, stop := context.WithCancel(context.Background())
	defer stop()
	stream := Stream(ctx, flowing, []string{"work/rows", "log/rows"})
	for _, want := range suiteChanges {
		one, _ := Next(stream)().(Change)
		if one.Name != want.Name || one.Revision != want.Revision || string(one.Value) != string(want.Value) {
			t.Fatalf("the message reads %+v, and wants %+v", one, want)
		}
	}
	if ended, _ := Next(stream)().(Ended); ended != (Ended{}) {
		t.Fatalf("the stream ends on %+v, and wants a bare end", ended)
	}
	refused := Stream(ctx, refusing, []string{"t/none"})
	if ended, _ := Next(refused)().(Ended); ended.Why != suiteRefusal {
		t.Fatalf("the stream ends on %q, and wants the problem's detail", ended.Why)
	}
}

// The /v1 watch, as the index streams it: each change a name asks for, or the problem where a name holds no provider. [[spec/tickets/test-walks-move-onto-fakes]]
func streams(changes []Change) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/watch" || r.URL.Query().Get("names") != "work/rows,log/rows" {
			w.Header().Set("Content-Type", "application/problem+json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]any{"detail": suiteRefusal})
			return
		}
		w.Header().Set("Content-Type", "text/event-stream")
		for _, one := range changes {
			data, _ := json.Marshal(one)
			_, _ = w.Write([]byte("event: change\ndata: " + string(data) + "\n\n"))
		}
	}
}

// [[spec/tickets/test-walks-move-onto-fakes]]
func TestTheFakeWatchKeepsTheContract(t *testing.T) {
	watchesKeepTheContract(t, Fake{Changes: suiteChanges}, Fake{Err: errors.New(suiteRefusal)})
}

// [[spec/tickets/test-walks-move-onto-fakes]]
func TestTheV1WatchKeepsTheContract(t *testing.T) {
	server := httptest.NewServer(streams(suiteChanges))
	defer server.Close()
	door := V1{Base: server.URL + "/v1"}
	watchesKeepTheContract(t, door, door)
}
