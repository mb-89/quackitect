// One running index answers a name over /v1 and over the old API, a name the
// catalog lacks as a problem, and its OpenAPI document.
// [[spec/design_output/model#surfaces]]
package index // level0: InPackageTest - it drives the unexported posts and valueOf, and declares getV1 other cases share

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func getV1(t *testing.T, standing Standing, path string) (reply, []byte) {
	t.Helper()
	said, err := fetchV1(standing, path)
	if err != nil {
		t.Fatal(err)
	}
	return said, said.Body
}

func TestOneIndexAnswersAFileOverV1AndTheOldAPI(t *testing.T) {
	t.Parallel()
	standing := standingV1(t)
	said, body := getV1(t, standing, "/v1/values/files/spec/one.md")
	var found struct {
		Name  string `json:"name"`
		Value any    `json:"value"`
	}
	if said.StatusCode != statusOK || json.Unmarshal(body, &found) != nil || found.Name != "files/spec/one.md" {
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
	t.Parallel()
	said, body := getV1(t, standingV1(t), "/v1/values/t/none")
	if said.StatusCode != statusNotFound || !strings.Contains(said.Header.Get("Content-Type"), "problem+json") || !strings.Contains(string(body), "t/none") {
		t.Fatalf("/v1 answers %d, %s: %s", said.StatusCode, said.Header.Get("Content-Type"), body)
	}
}

func TestV1WritesItsOpenAPIDocument(t *testing.T) {
	t.Parallel()
	said, body := getV1(t, standingV1(t), "/v1/openapi.json")
	if said.StatusCode != statusOK || !strings.Contains(string(body), "/values/") {
		t.Fatalf("the document answers %d: %.200s", said.StatusCode, body)
	}
}

// The value carries its stale mark. [[spec/design_output/model#a-stale-mark]]
func TestV1ReadsAStaleName(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
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
	t.Parallel()
	said, body := getV1(t, standingV1(t), "/v1/docs")
	if said.StatusCode != statusOK || !strings.Contains(string(body), "openapi") {
		t.Fatalf("the docs answer %d: %.200s", said.StatusCode, body)
	}
}

// V1 answers the base of the door standing over the root. [[spec/tickets/the-quack-cli-gets-generated]]
func TestV1AnswersTheBaseOfTheStandingDoor(t *testing.T) {
	t.Parallel()
	standing := standingV1(t)
	base, err := V1At(qtest.Wall(), standing.Root)
	if want := fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1); err != nil || base != want {
		t.Fatalf("V1 answers %q, %v, not %q", base, err, want)
	}
}
