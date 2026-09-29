// One running index answers a name over /v1 and over the old API, a name the
// catalog lacks as a problem, and its OpenAPI document.
// [[spec/design_output/model#surfaces]]
package index

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

func standingV1(t *testing.T) Standing {
	t.Helper()
	root := tree(t)
	c := q.New()
	hand := q.OutIn(c, "files/<path...>", q.Content{})
	file := func(_ string, commit Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"files/spec/one.md": q.Content{Hash: "one", Text: "one"}})
	}
	stop, _, err := Serve(root, filepath.Join(t.TempDir(), "index.db"), c, file)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	standing, err := standingOf(root)
	if err != nil {
		t.Fatal(err)
	}
	if standing.V1 == 0 || standing.V1 == standing.Port {
		t.Fatalf("the standing file says %+v", standing)
	}
	return standing
}

func getV1(t *testing.T, standing Standing, path string) (*http.Response, []byte) {
	t.Helper()
	said, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d%s", standing.V1, path))
	if err != nil {
		t.Fatal(err)
	}
	defer said.Body.Close()
	body, err := io.ReadAll(said.Body)
	if err != nil {
		t.Fatal(err)
	}
	return said, body
}

func TestOneIndexAnswersAFileOverV1AndTheOldAPI(t *testing.T) {
	standing := standingV1(t)
	said, body := getV1(t, standing, "/v1/values/files/spec/one.md")
	var found struct {
		Name  string `json:"name"`
		Value any    `json:"value"`
	}
	if said.StatusCode != http.StatusOK || json.Unmarshal(body, &found) != nil || found.Name != "files/spec/one.md" {
		t.Fatalf("/v1 answers %d: %s", said.StatusCode, body)
	}
	old, err := posts(standing, []string{"call", "read", `{"name":"files/spec/one.md"}`})
	if err != nil || old.Error != "" {
		t.Fatalf("the old API answers %v, %q", err, old.Error)
	}
	if found.Value == nil || !reflect.DeepEqual(found.Value, old.Result) {
		t.Fatalf("/v1 reads %#v, and the old API %#v", found.Value, old.Result)
	}
}

func TestV1AnswersANameTheCatalogLacksWithAProblem(t *testing.T) {
	said, body := getV1(t, standingV1(t), "/v1/values/t/none")
	if said.StatusCode != http.StatusNotFound || !strings.Contains(said.Header.Get("Content-Type"), "problem+json") || !strings.Contains(string(body), "t/none") {
		t.Fatalf("/v1 answers %d, %s: %s", said.StatusCode, said.Header.Get("Content-Type"), body)
	}
}

func TestV1WritesItsOpenAPIDocument(t *testing.T) {
	said, body := getV1(t, standingV1(t), "/v1/openapi.json")
	if said.StatusCode != http.StatusOK || !strings.Contains(string(body), "/values/") {
		t.Fatalf("the document answers %d: %.200s", said.StatusCode, body)
	}
}

// The value carries its stale mark. [[spec/design_output/model#a-stale-mark]]
func TestV1ReadsAStaleName(t *testing.T) {
	c := q.New()
	q.OutIn(c, "t/n", 0)
	store := q.NewStore(c)
	since := time.Unix(1_700_000_000, 0)
	if err := store.Stale("t/n", since); err != nil {
		t.Fatal(err)
	}
	said, err := valueOf(store, nil, "t/n")
	if err != nil || said.Body.Name != "t/n" || said.Body.Stale == nil || !said.Body.Stale.Equal(since) {
		t.Fatalf("the value reads %+v, %v", said, err)
	}
}

// A door fresh from its start holds a derived value at its default until the scheduler settles, so the route settles first. [[spec/tickets/fix-verbs-shadow-yours]]
func TestV1SettlesBeforeItReads(t *testing.T) {
	c := q.New()
	hand := q.OutIn(c, "t/n", 0)
	store := q.NewStore(c)
	settle := func() {
		if _, err := store.Commit(store.Snapshot().Revision, hand, map[string]any{"t/n": 7}); err != nil {
			t.Fatal(err)
		}
	}
	said, err := valueOf(store, settle, "t/n")
	if err != nil || said.Body.Value != 7 {
		t.Fatalf("the value reads %+v, %v, and wants 7 once the wave settles", said, err)
	}
}

func TestV1DrawsItsDocs(t *testing.T) {
	said, body := getV1(t, standingV1(t), "/v1/docs")
	if said.StatusCode != http.StatusOK || !strings.Contains(string(body), "openapi") {
		t.Fatalf("the docs answer %d: %.200s", said.StatusCode, body)
	}
}

// V1 answers the base of the door standing over the root. [[spec/tickets/the-quack-cli-gets-generated]]
func TestV1AnswersTheBaseOfTheStandingDoor(t *testing.T) {
	standing := standingV1(t)
	t.Setenv("QUACKITECT_ROOT", standing.Root)
	base, err := V1()
	if want := fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1); err != nil || base != want {
		t.Fatalf("V1 answers %q, %v, not %q", base, err, want)
	}
}
