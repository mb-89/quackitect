// A call answers its result within the wait, or still running past it with
// the handle and the fraction done.
// [[spec/design_output/model#a-caller-sets-its-wait]]
package index

import (
	"errors"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
	"time"

	"quackitect/src/config"
	"quackitect/src/imports"
	"quackitect/src/q"
)

const (
	quick    = 2 * time.Second
	slow     = 250 * time.Millisecond
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

// A wait arms its span through the timer the book holds, so a case reads when it waits. [[spec/tickets/caller-wait-meets-no-sleep]]
func TestAWaitArmsItsSpanThroughTheBooksTimer(t *testing.T) {
	t.Parallel()
	b, _, _ := bookOf(t)
	armed := []time.Duration{}
	b.after = func(span time.Duration) <-chan time.Time {
		armed = append(armed, span)
		return make(chan time.Time)
	}
	b.Wait("no-such-handle", patience)
	if !slices.Equal(armed, []time.Duration{patience}) {
		t.Fatalf("the wait arms %v through the book's timer", armed)
	}
}

// The wait cases sleep on nothing, and the doors chapter lists this file among no test reaching a real door. [[spec/tickets/caller-wait-meets-no-sleep]]
func TestTheWaitCasesSleepOnNothingAndTheDoorsChapterListsThemNowhere(t *testing.T) {
	t.Parallel()
	file, err := parser.ParseFile(token.NewFileSet(), "call_test.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	if waits := imports.RealWaits(file); len(waits) > 0 {
		t.Errorf("call_test.go calls %v, where the wait cases run on a signal", waits)
	}
	note, err := os.ReadFile(filepath.Join("..", "..", "..", "spec", "design_output", "doors.md"))
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(note), "`src/modules/index/call_test.go`") {
		t.Error("spec/design_output/doors.md still lists src/modules/index/call_test.go as a test reaching a real door")
	}
}

func TestTheConfigHoldsOneActionDeadline(t *testing.T) {
	if _, held := config.Value("../../..", "watchdog.deadlineOp"); held {
		t.Fatal("watchdog.deadlineOp stands beside watchdog.deadlineAction")
	}
	if _, held := config.Value("../../..", "watchdog.deadlineAction"); !held {
		t.Fatal("watchdog.deadlineAction stands nowhere")
	}
}
