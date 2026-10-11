// The run's secret decides who posts as a person: a /v1 post marking a
// person and a call to the first port carry it, and its file and the standing file stand
// at the owner's mode alone.
// [[spec/tickets/v1-takes-a-run-secret]]
package index // level0: InPackageTest - it drives the unexported opens and the fake network

import (
	"fmt"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The statuses a post lacking the run's secret answers. [[spec/tickets/v1-takes-a-run-secret]]
const (
	statusUnauthorized = 401
	statusForbidden    = 403
)

// The input of the fake action t/mark, which carries the person mark as the verbs do. [[spec/tickets/v1-takes-a-run-secret]]
type markIn struct {
	Person bool `json:"person,omitempty" doc:"whether a person posts it"`
}

// A door over the fake action t/mark, whose accept answers the mark it reads. [[spec/tickets/v1-takes-a-run-secret]]
func markDoor(t *testing.T) (*door, Standing) {
	t.Helper()
	return markDoorOver(t, tree(t))
}

// The same door over a root the case seeds. [[spec/tickets/standing-chmods-existing-file]]
func markDoorOver(t *testing.T, root string) (*door, Standing) {
	t.Helper()
	c := q.New()
	ops := q.OutIn(c, "ops/<id>", map[string]any{}, q.Doc("the fake manager's operations"))
	q.OutIn(c, WaitName, 5, q.Doc("the default wait"))
	q.ActionIn(c, "t/mark", func(in markIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "mark", Args: in, NoUndo: "a mark writes nothing"}}
	}, q.Doc("reads the person mark"), q.Answers[addOut]())
	accept := func(q.Request) (any, error) { return addOut{Sum: 1}, nil }
	clock := qtest.NewFake(time.Time{})
	return served(t, clock, root, c, fakeManager(clock, ops, accept))
}

// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestAPersonPostWithoutTheRunSecretMeetsARefusal(t *testing.T) {
	t.Parallel()
	_, standing := markDoor(t)
	said, body := postV1(t, standing, "/v1/actions/t/mark", "wait=5", `{"person":true}`)
	if said.StatusCode != statusForbidden {
		t.Fatalf("a person post with no secret answers %d: %s", said.StatusCode, body)
	}
	if said, body := postV1(t, standing, "/v1/actions/t/mark", "wait=5", `{}`); said.StatusCode != statusOK {
		t.Fatalf("a post marking no person answers %d: %s", said.StatusCode, body)
	}
	if said, body := postV1(t, standing, "/v1/actions/t/mark", "wait=5", `{"PERSON":true}`); said.StatusCode != statusForbidden {
		t.Fatalf("a person post in another case with no secret answers %d: %s", said.StatusCode, body)
	}
}

// A person's post carrying the run's secret runs, and one carrying another word meets the refusal. [[spec/tickets/secret-post-serves-test]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestAPersonPostCarryingTheRunSecretRuns(t *testing.T) {
	t.Parallel()
	_, standing := markDoor(t)
	post := func(word string) int {
		said, err := asksDoor("POST", fmt.Sprintf("http://127.0.0.1:%d/v1/actions/t/mark", standing.V1), map[string]string{"Content-Type": "application/json", PersonHeader: word}, strings.NewReader(`{"person":true}`))
		if err != nil {
			t.Fatal(err)
		}
		return said.StatusCode
	}
	if code := post(SecretOf(standing.Root)); code != statusOK {
		t.Fatalf("a person post carrying the secret answers %d", code)
	}
	if code := post("guess"); code != statusForbidden {
		t.Fatalf("a person post carrying another word answers %d", code)
	}
	if said, err := posts(standing, []string{"files"}); err != nil || said.Error != "" {
		t.Fatalf("the first port's own client answers %+v, %v", said, err)
	}
}

// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheFirstPortRefusesACallWithoutTheRunSecret(t *testing.T) {
	t.Parallel()
	_, standing := markDoor(t)
	said, err := asksDoor("POST", fmt.Sprintf("http://127.0.0.1:%d/", standing.Port), map[string]string{"Content-Type": "application/json"}, strings.NewReader(`{"method":"files","id":1}`))
	if err != nil {
		t.Fatal(err)
	}
	if said.StatusCode != statusUnauthorized {
		t.Fatalf("a call to the first port with no secret answers %d: %s", said.StatusCode, said.Body)
	}
}

// A standing file left at 644 by an earlier run stands at the owner's mode once the door writes it again. [[spec/tickets/standing-chmods-existing-file]]
// level0: FixtureOutsideHome - the case starts its own door over its own tree
func TestTheStandingAndTheSecretStandAtOwnerMode(t *testing.T) {
	t.Parallel()
	root := tree(t)
	if err := makeDir(filepath.Dir(standingPath(root)), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := writeFile(standingPath(root), []byte("{}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	one, _ := markDoorOver(t, root)
	for _, at := range []string{standingPath(one.root), filepath.Join(one.root, filepath.FromSlash(Runtime), "person.json")} {
		said, err := statOf(at)
		if err != nil {
			t.Fatalf("%s stands nowhere: %v", at, err)
		}
		if mode := said.Mode().Perm(); mode != 0o600 {
			t.Fatalf("%s stands at %o, and wants 600", at, mode)
		}
	}
}
