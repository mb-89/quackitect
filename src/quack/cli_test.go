// quack builds its command tree off the registry over /v1: the help reads
// each q.Doc, run follows an action to its end, and --detach answers at once.
// [[spec/tickets/the-quack-cli-gets-generated]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
)

// The span t/slow runs, past the wait run posts with. [[spec/tickets/the-quack-cli-gets-generated]]
const slowSpan = 1500 * time.Millisecond

// The input of the fake action t/add. [[spec/tickets/the-quack-cli-gets-generated]]
type addIn struct {
	A int `json:"a" doc:"the first term"`
	B int `json:"b" doc:"the second term"`
}

// Answers t/add at once, and t/slow once its span passes. [[spec/tickets/the-quack-cli-gets-generated]]
func fakeAccept(asked q.Request) (any, error) {
	switch asked.Verb {
	case "add":
		in, _ := asked.Args.(addIn)
		return map[string]int{"sum": in.A + in.B}, nil
	case "slow":
		time.Sleep(slowSpan)
		return "slept", nil
	}
	return nil, fmt.Errorf("t takes no %s", asked.Verb)
}

// A door with the manager over the fake actions t/add and t/slow and the name t/n, and the base of its /v1. [[spec/tickets/the-quack-cli-gets-generated]]
func standingTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	as := manager.Registers(c)
	q.OutIn(c, "t/n", 4, q.Doc("a count the case reads"))
	q.ActionIn(c, "t/add", func(in addIn) []q.Request {
		return []q.Request{{Module: "t", Verb: "add", Args: in, NoUndo: "a sum writes nothing"}}
	}, q.Doc("adds two terms"))
	q.ActionIn(c, "t/slow", func(string) []q.Request {
		return []q.Request{{Module: "t", Verb: "slow", NoUndo: "a sleep writes nothing"}}
	}, q.Doc("sleeps past the wait"))
	manage := func(root string, store *q.Store, rows index.OpRows, _ index.Reads, steps func(hand func())) (index.Managed, error) {
		stop, call, err := manager.Serves(manager.Outside{
			Root: root, Store: store, As: as, Rows: opRows{rows}, Steps: steps, Now: time.Now, Accept: fakeAccept,
			Every: func(time.Duration, func(time.Time)) func() { return func() {} },
		})
		return index.Managed{Stop: stop, Call: func(name string, input any, caller string, wait time.Duration) (index.Called, error) {
			said, err := call(name, input, caller, wait)
			return index.Called(said), err
		}}, err
	}
	stop, _, err := index.ServeManaged(root, filepath.Join(t.TempDir(), "index.db"), c, manage)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	body, err := os.ReadFile(filepath.Join(root, index.Runtime, "index.json"))
	if err != nil {
		t.Fatal(err)
	}
	var standing index.Standing
	if err := json.Unmarshal(body, &standing); err != nil {
		t.Fatal(err)
	}
	return fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1)
}

// Runs one command of the tree, and answers its exit code, its standard output and its standard error. [[spec/tickets/the-quack-cli-gets-generated]]
func ran(base string, argv ...string) (int, string, string) {
	var out, errs bytes.Buffer
	code := cli(&out, &errs, base, argv)
	return code, out.String(), errs.String()
}

func TestTheHelpReadsEachActionsDoc(t *testing.T) {
	t.Parallel()
	base := standingTree(t)
	code, out, errs := ran(base, "--help")
	if code != 0 || !strings.Contains(out, "t/add") || !strings.Contains(out, "adds two terms") || !strings.Contains(out, "sleeps past the wait") {
		t.Fatalf("quack --help answers %d: %s%s", code, out, errs)
	}
	code, out, errs = ran(base, "run", "t/add", "--help")
	first, _, _ := strings.Cut(out, "\n")
	if code != 0 || first != "adds two terms" || !strings.Contains(out, "the first term") {
		t.Fatalf("quack run t/add --help answers %d: %s%s", code, out, errs)
	}
}

func TestRunPostsItsFlagsAsTheInput(t *testing.T) {
	t.Parallel()
	code, out, errs := ran(standingTree(t), "run", "t/add", "--a", "2", "--b", "3")
	if code != 0 || !strings.Contains(out, `"sum": 5`) {
		t.Fatalf("quack run t/add answers %d: %s%s", code, out, errs)
	}
}

func TestRunFollowsASlowActionToItsResult(t *testing.T) {
	t.Parallel()
	code, out, errs := ran(standingTree(t), "run", "t/slow")
	if code != 0 || !strings.Contains(out, `"slept"`) {
		t.Fatalf("quack run t/slow answers %d: %s%s", code, out, errs)
	}
}

func TestRunDetachedAnswersTheHandleAtOnce(t *testing.T) {
	t.Parallel()
	base := standingTree(t)
	started := time.Now()
	code, out, errs := ran(base, "run", "t/slow", "--detach")
	if took := time.Since(started); took >= slowSpan {
		t.Fatalf("quack run --detach answers after %v", took)
	}
	if code != 0 || !strings.HasPrefix(strings.TrimSpace(out), "/v1/values/ops/") {
		t.Fatalf("quack run --detach answers %d: %s%s", code, out, errs)
	}
}

func TestGetPrintsTheValueOfAName(t *testing.T) {
	t.Parallel()
	code, out, errs := ran(standingTree(t), "get", "t/n")
	if code != 0 || strings.TrimSpace(out) != "4" {
		t.Fatalf("quack get t/n answers %d: %s%s", code, out, errs)
	}
}

func TestToolsPrintsTheListTheIndexGenerates(t *testing.T) {
	t.Parallel()
	code, out, errs := ran(standingTree(t), "tools")
	if code != 0 || !strings.Contains(out, `"index_t_add"`) || !strings.Contains(out, "adds two terms") {
		t.Fatalf("quack tools answers %d: %s%s", code, out, errs)
	}
}

func TestActPostsItsJSONAndPrintsTheResult(t *testing.T) {
	t.Parallel()
	code, out, errs := ran(standingTree(t), "act", "t/add", `{"a":2,"b":3}`)
	if code != 0 || !strings.Contains(out, `"sum": 5`) {
		t.Fatalf("quack act t/add answers %d: %s%s", code, out, errs)
	}
}
