// The catalog's contract: one suite of cases, run against the fake and
// against the /v1 door over a server answering the same values.
// [[spec/design_output/model#the-fake-keeps-a-contract]]

package registry

import (
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
	if _, err := c.Read("t/nowhere"); err == nil {
		t.Fatalf("a read of a name the catalog lacks answers no error")
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
