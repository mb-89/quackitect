// quack builds its command tree off the registry over /v1: the help reads
// each q.Doc, run follows an action to its end, and --detach answers at once.
// [[spec/tickets/the-quack-cli-gets-generated]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/index"
	manager "quackitect/src/modules/index"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// Every action the wiring loads opens, on a zero input, with requests acceptsVerb accepts, so the list drops no tool the real wiring answers. An action that reads no request off a zero input stays out of the read. [[spec/tickets/real-catalog-reads-accepts]]
func TestEveryWiredToolAnswersThroughAct(t *testing.T) {
	t.Parallel()
	c, err := catalogOf(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	read := 0
	for _, name := range store.Names() {
		opens := zeroRequests(store, name)
		if len(opens) > 0 {
			read++
		}
		for _, asked := range opens {
			if !acceptsVerb(asked.Module, asked.Verb) {
				t.Errorf("%s opens with %s.%s, which no IO module accepts", name, asked.Module, asked.Verb)
			}
		}
	}
	if read == 0 {
		t.Errorf("no action of %d opens with a request on a zero input", len(store.Names()))
	}
}

// The requests an action opens with on a zero input, and none where it reads none. [[spec/tickets/real-catalog-reads-accepts]]
func zeroRequests(store *q.Store, name string) (asked []q.Request) {
	defer func() {
		if recover() != nil {
			asked = nil
		}
	}()
	input, err := store.Input(name, nil)
	if err != nil {
		return nil
	}
	asked, _ = store.Act(name, input)
	return asked
}

// The span t/slow waits on the fake clock, past the wait run posts with. [[spec/tickets/the-quack-cli-gets-generated]]
const slowSpan = 1500 * time.Millisecond

// The fake clock the manager waits on, the spans its waits arm, and each start of t/slow. [[spec/tickets/test-walks-move-onto-fakes]]
type hq1Slow struct {
	clock   *qtest.FakeClock
	armed   chan time.Duration
	started chan struct{}
}

// A clock whose beat stands still, naming the span of each wait it arms. [[spec/tickets/test-walks-move-onto-fakes]]
type hq1ArmedClock struct {
	q.Clock
	armed chan<- time.Duration
}

func (one hq1ArmedClock) After(span time.Duration) <-chan time.Time {
	fired := one.Clock.After(span)
	select {
	case one.armed <- span:
	default:
	}
	return fired
}

// The input of the fake action t/add. [[spec/tickets/the-quack-cli-gets-generated]]
type addIn struct {
	A int `json:"a" doc:"the first term"`
	B int `json:"b" doc:"the second term"`
}

// Answers t/add at once, and t/slow once its span passes on the fake clock. [[spec/tickets/the-quack-cli-gets-generated]]
func (slow *hq1Slow) accept(asked q.Request) (any, error) {
	switch asked.Verb {
	case "add":
		in, _ := asked.Args.(addIn)
		return map[string]int{"sum": in.A + in.B}, nil
	case "slow":
		passed := slow.clock.After(slowSpan)
		slow.started <- struct{}{}
		<-passed
		return "slept", nil
	}
	return nil, fmt.Errorf("t takes no %s", asked.Verb)
}

// A door with the manager over the fake actions t/add and t/slow and the name t/n, and the base of its /v1. [[spec/tickets/the-quack-cli-gets-generated]]
func standingTree(t *testing.T) string {
	t.Helper()
	base, _ := slowTree(t)
	return base
}

// The standing tree, with the fake clock its manager waits on. [[spec/tickets/test-walks-move-onto-fakes]]
func slowTree(t *testing.T) (string, *hq1Slow) {
	t.Helper()
	slow := &hq1Slow{clock: qtest.NewFake(time.Unix(0, 0)), armed: make(chan time.Duration, 64), started: make(chan struct{}, 4)}
	root := t.TempDir()
	if err := realDisk().makeAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
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
			Root: root, Store: store, As: as, Rows: opRows{rows}, Steps: steps, Clock: hq1ArmedClock{stillBeat{slow.clock}, slow.armed}, Accept: slow.accept,
		})
		return index.Managed{Stop: stop, Call: func(name string, input any, caller string, wait time.Duration) (index.Called, error) {
			said, err := call(name, input, caller, wait)
			return index.Called(said), err
		}}, err
	}
	stop, _, err := index.ServeManaged(wall, root, filepath.Join(t.TempDir(), "index.db"), c, manage)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	body, err := realDisk().read(filepath.Join(root, index.Runtime, "index.json"))
	if err != nil {
		t.Fatal(err)
	}
	var standing index.Standing
	if err := json.Unmarshal(body, &standing); err != nil {
		t.Fatal(err)
	}
	return fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1), slow
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
	base, slow := slowTree(t)
	done := make(chan [3]string)
	go func() {
		code, out, errs := ran(base, "run", "t/slow")
		done <- [3]string{fmt.Sprint(code), out, errs}
	}()
	<-slow.started
	for span := range slow.armed {
		if span == time.Second {
			break
		}
	}
	slow.clock.Tick(time.Second)
	slow.clock.Tick(slowSpan)
	said := <-done
	code, out, errs := said[0], said[1], said[2]
	if code != "0" || !strings.Contains(out, `"slept"`) {
		t.Fatalf("quack run t/slow answers %s: %s%s", code, out, errs)
	}
}

func TestRunDetachedAnswersTheHandleAtOnce(t *testing.T) {
	t.Parallel()
	base, slow := slowTree(t)
	code, out, errs := ran(base, "run", "t/slow", "--detach")
	<-slow.started
	t.Cleanup(func() { slow.clock.Tick(slowSpan) })
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
