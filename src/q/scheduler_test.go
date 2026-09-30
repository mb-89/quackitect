// A moved input runs its provider, and a burst during a run leaves one
// pending run and no overlap. [[spec/design_output/model#the-provider-kinds]]
package q

import (
	"fmt"
	"strings"
	"sync"
	"testing"
	"time"
)

const runWait = time.Second

type countOf struct {
	N int `q:"t/n"`
}

func spawned(run func()) { go run() }

func failOn(t *testing.T) func(name string, err error) {
	return func(name string, err error) { t.Errorf("the run of %s answers %v", name, err) }
}

func TestAMovedInputRunsItsProvider(t *testing.T) {
	c := New()
	hand := OutIn(c, "t/n", 0)
	DerivedIn(c, "t/double", 0, func(in countOf) int { return in.N * 2 })
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if got := s.Snapshot().Read("t/double"); got != 6 {
		t.Fatalf("t/double reads %v after t/n moves to 3", got)
	}
}

func TestTwoMovesDuringARunLeaveOnePendingRunAndNoOverlap(t *testing.T) {
	c := New()
	hand := OutIn(c, "t/n", 0)
	started := make(chan struct{}, 1)
	release := make(chan struct{})
	var held sync.Mutex
	inFlight, most, runs := 0, 0, 0
	DerivedIn(c, "t/slow", 0, func(in countOf) int {
		held.Lock()
		inFlight, runs = inFlight+1, runs+1
		most = max(most, inFlight)
		held.Unlock()
		select {
		case started <- struct{}{}:
		default:
		}
		<-release
		held.Lock()
		inFlight--
		held.Unlock()
		return in.N
	})
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	seed(t, s, hand, "t/n", 1)
	select {
	case <-started:
	case <-time.After(runWait):
		t.Fatalf("no run of t/slow starts after t/n moves")
	}
	seed(t, s, hand, "t/n", 2)
	seed(t, s, hand, "t/n", 3)
	close(release)
	scheduler.Settle()
	held.Lock()
	defer held.Unlock()
	if runs != 2 || most != 1 {
		t.Fatalf("t/slow runs %d times, at most %d at once", runs, most)
	}
	if got := s.Snapshot().Read("t/slow"); got != 3 {
		t.Fatalf("t/slow reads %v after the pending run", got)
	}
}

func TestAMoveAfterStopRunsNothing(t *testing.T) {
	c := New()
	hand := OutIn(c, "t/n", 0)
	DerivedIn(c, "t/double", 0, func(in countOf) int { return in.N * 2 })
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	scheduler.Stop()
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if got := s.Snapshot().Read("t/double"); got != 0 {
		t.Fatalf("t/double reads %v after a move past the stop", got)
	}
}

// Counts each run of t/double off t/n, the one provider the wave cases read. [[spec/design_output/model#one-wave-settles-a-change]]
func doubled(t *testing.T) (*Store, Writer, *Scheduler, *int) {
	t.Helper()
	c := New()
	hand := OutIn(c, "t/n", 0)
	runs := 0
	DerivedIn(c, "t/double", 0, func(in countOf) int { runs++; return in.N * 2 })
	s := NewStore(c)
	return s, hand, NewScheduler(s, spawned, failOn(t)), &runs
}

func TestASecondChangeReusesTheKeptList(t *testing.T) {
	s, hand, scheduler, _ := doubled(t)
	seed(t, s, hand, "t/n", 1)
	scheduler.Settle()
	seed(t, s, hand, "t/n", 2)
	scheduler.Settle()
	if got := scheduler.Lists(); got != 1 {
		t.Fatalf("the scheduler keeps %d run lists after two changes of t/n", got)
	}
}

func TestAnEqualCommitRunsNothingBelow(t *testing.T) {
	s, hand, scheduler, runs := doubled(t)
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	pushed := 0
	s.OnCommit(func(values map[string]any) {
		if _, ok := values["t/double"]; ok {
			pushed++
		}
	})
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if *runs != 1 || pushed != 0 {
		t.Fatalf("t/double runs %d times and pushes %d times over two equal commits", *runs, pushed)
	}
}

func TestAnUnwatchedPendingNameRunsWhenRead(t *testing.T) {
	s, hand, scheduler, runs := doubled(t)
	scheduler.Unwatch("t/double")
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	if *runs != 0 {
		t.Fatalf("an unwatched t/double runs %d times with no reader", *runs)
	}
	if got := scheduler.Read("t/double"); got != 6 || *runs != 1 {
		t.Fatalf("a read of t/double answers %v after %d runs", got, *runs)
	}
}

func TestWhyNamesAPendingValue(t *testing.T) {
	s, hand, scheduler, _ := doubled(t)
	scheduler.Unwatch("t/double")
	seed(t, s, hand, "t/n", 3)
	scheduler.Settle()
	at := s.Snapshot().Revision
	said, err := s.Why("t/double")
	if err != nil || said.State != "pending" || said.Pending != at {
		t.Fatalf("why t/double answers %s at %d, %v", said.State, said.Pending, err)
	}
	if want := fmt.Sprintf("pending since r%d", at); !strings.Contains(said.Text, want) {
		t.Fatalf("why t/double reads %q, with no %q", said.Text, want)
	}
}

// A loaded family a case registers over files/, beside the plan it parses. [[spec/tickets/index-reads-loaded-projections]]
func loadedPlan(t *testing.T) (*Store, *Scheduler, Writer) {
	t.Helper()
	c := New()
	files := OutIn(c, "files/<path...>", Content{})
	ProjectIn(c, "queue", ".se/.runtime/*.txt", Codec[[]string](linesCodec{}), Loaded, []string{})
	s := NewStore(c)
	return s, NewScheduler(s, spawned, failOn(t)), files
}

func TestALoadedProjectionReadsASeededFile(t *testing.T) {
	s, scheduler, files := loadedPlan(t)
	seed(t, s, files, "files/.se/.runtime/plan.txt", Content{Hash: "h", Text: "a\nb\n"})
	scheduler.Settle()
	got, _ := s.Snapshot().Read("queue/.se/.runtime/plan.txt").([]string)
	if len(got) != 2 || got[0] != "a" || got[1] != "b" {
		t.Fatalf("queue/.se/.runtime/plan.txt reads %v after its file lands", got)
	}
}

func TestALoadedProjectionFollowsAFileChange(t *testing.T) {
	s, scheduler, files := loadedPlan(t)
	seed(t, s, files, "files/.se/.runtime/plan.txt", Content{Hash: "h", Text: "a\n"})
	scheduler.Settle()
	seed(t, s, files, "files/.se/.runtime/plan.txt", Content{Hash: "i", Text: "c\n"})
	scheduler.Settle()
	got, _ := s.Snapshot().Read("queue/.se/.runtime/plan.txt").([]string)
	if len(got) != 1 || got[0] != "c" {
		t.Fatalf("queue/.se/.runtime/plan.txt reads %v after its file changes to c", got)
	}
}

type planIn struct {
	Plan []string `q:"queue/.se/.runtime/plan.txt"`
}

func TestALoadedProjectionFeedsADerivedReader(t *testing.T) {
	c := New()
	files := OutIn(c, "files/<path...>", Content{})
	ProjectIn(c, "queue", ".se/.runtime/*.txt", Codec[[]string](linesCodec{}), Loaded, []string{})
	DerivedIn(c, "t/todos", 0, func(in planIn) int { return len(in.Plan) })
	s := NewStore(c)
	scheduler := NewScheduler(s, spawned, failOn(t))
	seed(t, s, files, "files/.se/.runtime/plan.txt", Content{Hash: "h", Text: "a\nb\nc\n"})
	scheduler.Settle()
	if got := s.Snapshot().Read("t/todos"); got != 3 {
		t.Fatalf("t/todos reads %v after a plan of three lines lands", got)
	}
}

// One commit moving two files runs both concrete keys in one wave. [[spec/tickets/index-reads-loaded-projections]]
func TestOneWaveRunsEveryKeyItsFilesCover(t *testing.T) {
	s, scheduler, files := loadedPlan(t)
	if _, err := s.Commit(s.Snapshot().Revision, files, map[string]any{
		"files/.se/.runtime/a.txt": Content{Hash: "a", Text: "one\n"},
		"files/.se/.runtime/b.txt": Content{Hash: "b", Text: "two\nthree\n"},
	}); err != nil {
		t.Fatal(err)
	}
	scheduler.Settle()
	a, _ := s.Snapshot().Read("queue/.se/.runtime/a.txt").([]string)
	b, _ := s.Snapshot().Read("queue/.se/.runtime/b.txt").([]string)
	if len(a) != 1 || len(b) != 2 {
		t.Fatalf("the two keys read %v and %v after one commit moves both files", a, b)
	}
}

func TestAKeyOutsideTheGlobsRunsNothing(t *testing.T) {
	s, scheduler, files := loadedPlan(t)
	seed(t, s, files, "files/.se/.runtime/plan.json", Content{Hash: "h", Text: "a\n"})
	scheduler.Settle()
	if got, _ := s.Snapshot().Read("queue/.se/.runtime/plan.json").([]string); len(got) != 0 {
		t.Fatalf("queue/.se/.runtime/plan.json reads %v, a key no glob covers", got)
	}
}
