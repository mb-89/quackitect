// The /v1 road reads a value through the door, and a refusal says why.
// [[spec/design_output/model#surfaces]]

package registry

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestTheV1RoadReadsTheValueTheIndexAnswers(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/values/log/rows" {
			t.Errorf("the road asks %q", r.URL.Path)
		}
		_, _ = w.Write([]byte(`{"value":[1,2]}`))
	}))
	defer server.Close()
	got, err := V1{Base: server.URL}.Read("log/rows")
	if err != nil || string(got) != "[1,2]" {
		t.Fatalf("the road answers %s and %v, and wants [1,2]", got, err)
	}
}

func TestTheV1RoadNamesTheDetailOfARefusal(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		_, _ = w.Write([]byte(`{"detail":"no such name"}`))
	}))
	defer server.Close()
	if _, err := (V1{Base: server.URL}).Read("x"); err == nil || !strings.Contains(err.Error(), "no such name") {
		t.Fatalf("the refusal reads %v, and wants the problem's detail", err)
	}
}
