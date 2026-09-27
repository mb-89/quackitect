// A call answers its result within the wait, or still running past it with
// the handle and the fraction done, and ops/wait waits on a session.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package ops

import (
	"errors"
	"testing"
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
)

const (
	quick    = 2 * time.Second
	slow     = 50 * time.Millisecond
	patience = 2 * time.Second
)

// A store holding t/read, one request, and t/save, two. [[spec/design_output/model#a-caller-sets-its-wait]]
func actions() *q.Store {
	c := q.New()
	q.ActionIn(c, "t/read", func(path string) []q.Request {
		return []q.Request{{Module: "disk", Verb: "read", Args: path, NoUndo: "a read"}}
	}, q.Deadline(time.Minute))
	q.ActionIn(c, "t/save", func(path string) []q.Request {
		return []q.Request{
			{Module: "disk", Verb: "write", Args: path, NoUndo: "a case"},
			{Module: "git", Verb: "commit", Args: path, NoUndo: "a case"},
		}
	}, q.Deadline(time.Minute), q.Writes())
	return q.NewStore(c)
}

// Answers the disk at once and holds git until the case lets it go. [[spec/design_output/model#a-caller-sets-its-wait]]
func held(gate chan struct{}) func(q.Request) (any, error) {
	return func(one q.Request) (any, error) {
		if one.Module == "git" {
			<-gate
		}
		return one.Verb + " " + one.Args.(string), nil
	}
}

func TestAQuickCallAnswersItsResultWithinTheWait(t *testing.T) {
	b, _, _ := bookOf(t)
	said, err := Call(b, actions(), "t/read", "a.md", "s1", quick, held(nil))
	if err != nil {
		t.Fatal(err)
	}
	if said.Running || said.Result != "read a.md" || said.Handle == "" {
		t.Fatalf("the call answers %+v", said)
	}
	if one, _ := b.Get(said.Handle); one.State != Done {
		t.Fatalf("%s stands %s", said.Handle, one.State)
	}
}

func TestASlowCallAnswersStillRunningWithItsHandleAndFraction(t *testing.T) {
	b, _, _ := bookOf(t)
	gate := make(chan struct{})
	said, err := Call(b, actions(), "t/save", "a.md", "s1", slow, held(gate))
	if err != nil {
		t.Fatal(err)
	}
	if !said.Running || said.Handle == "" || said.Fraction != 0.5 || said.Result != nil {
		close(gate)
		t.Fatalf("the call answers %+v", said)
	}
	close(gate)
	one, ended := b.Wait(said.Handle, patience)
	if !ended || one.State != Done || one.Result != "commit a.md" {
		t.Fatalf("%s ends as %+v", said.Handle, one)
	}
}

func TestAFailingCallAnswersItsReason(t *testing.T) {
	b, _, _ := bookOf(t)
	refuse := func(q.Request) (any, error) { return nil, errors.New("the disk refuses") }
	said, err := Call(b, actions(), "t/read", "a.md", "s1", quick, refuse)
	if err != nil {
		t.Fatal(err)
	}
	if said.Running || said.Error != "the disk refuses" {
		t.Fatalf("the call answers %+v", said)
	}
	if one, _ := b.Get(said.Handle); one.State != Failed {
		t.Fatalf("%s stands %s", said.Handle, one.State)
	}
}

func TestWaitWithNoHandleWaitsOnTheSessionsOpenOperations(t *testing.T) {
	b, _, _ := bookOf(t)
	mine, other := make(chan struct{}), make(chan struct{})
	defer close(other)
	store := actions()
	for range 2 {
		if said, err := Call(b, store, "t/save", "a.md", "s1", slow, held(mine)); err != nil || !said.Running {
			t.Fatalf("the call answers %+v, %v", said, err)
		}
	}
	if said, err := Call(b, store, "t/save", "b.md", "s2", slow, held(other)); err != nil || !said.Running {
		t.Fatalf("the call of s2 answers %+v, %v", said, err)
	}
	if open := b.Open("s1"); len(open) != 2 {
		t.Fatalf("s1 holds %v open", open)
	}
	close(mine)
	ended := b.WaitCaller("s1", patience)
	if len(ended) != 2 || ended[0].State != Done || ended[1].State != Done || ended[0].Caller != "s1" {
		t.Fatalf("the wait on s1 answers %+v", ended)
	}
	if open := b.Open("s2"); len(open) != 1 {
		t.Fatalf("s2 holds %v open", open)
	}
}

func TestTheConfigHoldsOneActionDeadline(t *testing.T) {
	if _, held := config.Value("../..", "watchdog.deadlineOp"); held {
		t.Fatal("watchdog.deadlineOp stands beside watchdog.deadlineAction")
	}
	if _, held := config.Value("../..", "watchdog.deadlineAction"); !held {
		t.Fatal("watchdog.deadlineAction stands nowhere")
	}
}
