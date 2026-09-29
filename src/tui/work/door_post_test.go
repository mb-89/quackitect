// The work tab's post to the index's door answers the body it gets back.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAPostToTheDoorSendsTheBodyAndAnswersTheReply(t *testing.T) {
	t.Parallel()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sent, _ := io.ReadAll(r.Body)
		_, _ = w.Write(append([]byte("heard "), sent...))
	}))
	defer server.Close()
	got, err := postJSON(server.URL, []byte(`{"a":1}`), time.Second)
	if err != nil || string(got) != `heard {"a":1}` {
		t.Fatalf("the post answers %q and %v", got, err)
	}
}
