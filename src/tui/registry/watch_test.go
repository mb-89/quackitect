// The watch road hands each event on as a message, and its end as one more.
// [[spec/tickets/v1-watch-streams-changes]]

package registry

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestTheWatchHandsEachEventOnAsAMessage(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/watch" || r.URL.Query().Get("names") != "work/rows,log/rows" {
			t.Errorf("the road asks %q", r.URL.String())
		}
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = w.Write([]byte("event: change\ndata: {\"name\":\"work/rows\",\"revision\":3,\"value\":[1]}\n\n"))
		_, _ = w.Write([]byte("event: change\ndata: {\"name\":\"log/rows\",\"revision\":4,\"value\":[2]}\n\n"))
	}))
	defer server.Close()
	ctx, stop := context.WithCancel(context.Background())
	defer stop()
	stream := Stream(ctx, V1{Base: server.URL}, []string{"work/rows", "log/rows"})
	first, _ := Next(stream)().(Change)
	second, _ := Next(stream)().(Change)
	if first.Name != "work/rows" || first.Revision != 3 || string(first.Value) != "[1]" {
		t.Fatalf("the first message reads %+v", first)
	}
	if second.Name != "log/rows" || second.Revision != 4 || string(second.Value) != "[2]" {
		t.Fatalf("the second message reads %+v", second)
	}
}

func TestTheWatchEndsWithItsStream(t *testing.T) {
	t.Parallel()
	fake := Fake{Changes: []Change{{Name: "work/rows", Revision: 1}}}
	stream := Stream(context.Background(), fake, []string{"work/rows"})
	if one, _ := Next(stream)().(Change); one.Name != "work/rows" {
		t.Fatalf("the first message reads %+v, and wants the fake's change", one)
	}
	if _, ended := Next(stream)().(Ended); !ended {
		t.Fatal("the stream ends, and no Ended message lands")
	}
}
