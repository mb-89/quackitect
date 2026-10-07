// The door, driven over the fake network. A case puts one up on a tree it
// wrote, asks it the questions a verb asks, and reads the answers back as JSON.
// [[spec/design_output/index#the-door-owns-the-database]]
package index // level0: InPackageTest - it asks through the unexported posts, standingOf and stands

import (
	"encoding/json"
	"strconv"
	"testing"
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// A fake clock telling each wait it is asked, so a case moves it on once the code under test waits. [[spec/tickets/test-walks-move-onto-fakes]]
type toldClock struct {
	*qtest.FakeClock
	asked chan time.Duration
}

// The waits a told clock holds before it drops the next one it tells. [[spec/tickets/test-walks-move-onto-fakes]]
const toldWaits = 256

func newToldClock() *toldClock {
	return &toldClock{FakeClock: qtest.NewFake(time.Time{}), asked: make(chan time.Duration, toldWaits)}
}

func (one *toldClock) After(span time.Duration) <-chan time.Time {
	fired := one.FakeClock.After(span)
	one.tell(span)
	return fired
}

func (one *toldClock) AfterFunc(span time.Duration, hand func()) (stop func() bool) {
	stop = one.FakeClock.AfterFunc(span, hand)
	one.tell(span)
	return stop
}

func (one *toldClock) tell(span time.Duration) {
	select {
	case one.asked <- span:
	default:
	}
}

// Waits until the code under test asks a wait of the span, then moves the clock past it. [[spec/tickets/test-walks-move-onto-fakes]]
func (one *toldClock) passes(span time.Duration) {
	one.waitsOn(span)
	one.Tick(span)
}

// Waits until the code under test asks a wait of the span. [[spec/tickets/test-walks-move-onto-fakes]]
func (one *toldClock) waitsOn(span time.Duration) {
	for got := range one.asked {
		if got == span {
			return
		}
	}
}

// The door answers the settled value of one name, the one a reader beside the old path compares. [[spec/tickets/open-tasks-run-in-shadow]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheDoorAnswersTheValueOfAName(t *testing.T) {
	t.Parallel()
	c := q.New()
	q.OutIn(c, "work/open-tasks", 3, q.Doc("a count the case reads"))
	_, standing := served(t, qtest.Wall(), tree(t), c, nil)
	said, err := posts(standing, []string{"value", "work/open-tasks"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error != "" || said.Result != 3.0 {
		t.Fatalf("value answered %#v, and the error %q", said.Result, said.Error)
	}
}

// A name nobody registered answers an error, so a reader beside the old path compares nothing. [[spec/tickets/open-tasks-run-in-shadow]]
func TestTheDoorAnswersNoValueForANameNobodyRegistered(t *testing.T) {
	t.Parallel()
	said, err := posts(bareDoor(t), []string{"value", "work/open-tasks"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error == "" {
		t.Fatalf("value answered %#v for a name nobody registered, and no error", said.Result)
	}
}

func TestAMethodNobodyNamedComesBackNamed(t *testing.T) {
	t.Parallel()
	said, err := posts(bareDoor(t), []string{"nonsense"})
	if err != nil {
		t.Fatal(err)
	}
	if said.Error == "" {
		t.Fatal("a method nobody named answered no error")
	}
}

// [[spec/design_output/index#the-watcher-keeps-it-warm]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestAWriteUnderTheTreeReachesTheIndex(t *testing.T) {
	t.Parallel()
	root := tree(t)
	clock := newToldClock()
	_, standing := served(t, clock, root, q.New(), nil)

	write(t, root, "spec/three.md", "---\nid: three\n---\n\nA word nobody indexed yet: marmalade.\n")
	clock.passes(burstSettleDelay)
	if _, err := posts(standing, []string{"changes", "1"}); err != nil {
		t.Fatal(err)
	}
	said, err := posts(standing, []string{"find", "marmalade"})
	if err != nil || said.Error != "" {
		t.Fatalf("find answered %v, %q", err, said.Error)
	}
	if rows, ok := said.Result.([]any); !ok || len(rows) == 0 {
		t.Fatal("a file written under the tree never reached the index")
	}
}

// level0: FixtureOutsideHome - the case reads a fresh root of its own
func TestADoorFromAnotherBuildStandsAside(t *testing.T) {
	t.Parallel()
	root := t.TempDir()

	self, _ := executableOf()

	if stands(Standing{Root: root, Stamp: stampOf(self), Bin: self}, root) != true {
		t.Fatal("this build talks to its own door")
	}
	if stands(Standing{Root: root, Stamp: "another build", Bin: self}, root) {
		t.Fatal("a door whose build moved on disk stands aside")
	}
	if stands(Standing{Root: "/somewhere/else", Stamp: stampOf(self), Bin: self}, root) {
		t.Fatal("a door over another tree answers about that tree")
	}
	if stampOf(self) == "" {
		t.Fatal("a build with no stamp leaves every door looking stale")
	}
}

// A changes call past a write answers once the door's clock passes the burst, so it fires within a second of the write. [[spec/design_output/index#the-index-fires-on-change]]
func changesFireWithinASecond(t *testing.T, rel, text, what string) {
	t.Helper()
	root := tree(t)
	clock := newToldClock()
	_, standing := served(t, clock, root, q.New(), nil)
	first, err := posts(standing, []string{"changes", "0"})
	if err != nil || first.Error != "" {
		t.Fatalf("a changes call from nothing answers the tick now, and answered %v %q", err, first.Error)
	}
	tick := tickOf(t, first)
	if tick < 1 {
		t.Fatalf("the walk on the way up counts one, and the tick reads %d", tick)
	}

	write(t, root, rel, text)
	from := clock.Now()
	clock.passes(burstSettleDelay)
	next, err := posts(standing, []string{"changes", strconv.FormatInt(tick, decimalBase)})
	if err != nil || next.Error != "" {
		t.Fatalf("a changes call past the tick answers, and answered %v %q", err, next.Error)
	}
	if tickOf(t, next) <= tick {
		t.Fatalf("%s counts one more, and the tick stayed at %d", what, tick)
	}
	if gone := clock.Now().Sub(from); gone > time.Second {
		t.Fatalf("the call fires within a second of %s, and took %v", what, gone)
	}
}

// [[spec/design_output/index#the-index-fires-on-change]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestAChangesCallFiresOnAWrittenFileWithinASecond(t *testing.T) {
	t.Parallel()
	changesFireWithinASecond(t, "spec/tickets/late.md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA ticket written while the door stands.\n", "a sweep past a write")
}

// [[spec/design_output/index#the-index-fires-on-change]]
// level0: FixtureOutsideHome - the case writes its own tree
func TestAChangesCallFiresOnAPlanWriteWithinASecond(t *testing.T) {
	t.Parallel()
	changesFireWithinASecond(t, Plan, `{"working":"","todos":[]}`, "a plan write, so the work tab reads the todos again,")
}

func tickOf(t *testing.T, said answer) int64 {
	t.Helper()
	held, ok := said.Result.(map[string]any)
	if !ok {
		t.Fatalf("a changes call answers a tick, and answered %#v", said.Result)
	}
	tick, ok := held["tick"].(float64)
	if !ok {
		t.Fatalf("the tick reads as a number, and reads %#v", held["tick"])
	}
	return int64(tick)
}

// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheDoorAnswersWhy(t *testing.T) {
	t.Parallel()
	catalog := q.New()
	q.OutIn(catalog, "t/n", 0)
	_, standing := served(t, qtest.Wall(), tree(t), catalog, nil)
	said, err := posts(standing, []string{"why", "t/n"})
	if err != nil {
		t.Fatal(err)
	}
	found, ok := said.Result.(map[string]any)
	if said.Error != "" || !ok || found["name"] != "t/n" || found["state"] != "default" {
		t.Fatalf("why t/n answers %#v, %q", said.Result, said.Error)
	}
}

func TestTheWhyVerbAsksTheName(t *testing.T) {
	t.Parallel()
	method, params := asked([]string{"why", "t/n"})
	if method != "why" || string(params) != `{"name":"t/n"}` {
		t.Fatalf("the verb asks %s with %s", method, params)
	}
}

// The engine asks the door for the hash of a note, so the door answers the hashes method. [[spec/design_output/pull#an-input-marks-its-steps]]
func TestTheDoorAnswersTheHashesOfThePathsAsked(t *testing.T) {
	t.Parallel()
	said, err := posts(bareDoor(t), []string{"call", "hashes", `{"asks":[{"path":"src/plain.js","size":10}]}`})
	if err != nil {
		t.Fatal(err)
	}
	rows, ok := said.Result.(map[string]any)
	one, found := rows["src/plain.js"].(map[string]any)
	if !ok || !found || one["hash"] != "8f93e4f24776ff1d" || one["head"] != "e0ce802675de49b5" {
		t.Fatalf("hashes answered %#v", said.Result)
	}
}

// Serve builds the scheduler over its store, so a move an IO module commits runs the provider reading it. [[spec/tickets/the-scheduler-runs-providers]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheDoorRunsAProviderWhenAnIOModuleMovesItsInput(t *testing.T) {
	t.Parallel()
	type countOf struct {
		N int `q:"t/n"`
	}
	catalog := q.New()
	hand := q.OutIn(catalog, "t/n", 0)
	q.DerivedIn(catalog, "t/double", 0, func(in countOf) int { return in.N * 2 })
	moves := func(_ string, commit Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"t/n": 3})
	}
	one, standing := served(t, qtest.Wall(), tree(t), catalog, nil, moves)
	for {
		next := one.nextCommit()
		said, err := posts(standing, []string{"call", "read", `{"name":"t/double"}`})
		if err != nil {
			t.Fatal(err)
		}
		if said.Result == float64(6) {
			return
		}
		<-next
	}
}

// The manager's step runs on the work loop, and the loop's beat runs it, so the lease it renews stands off the loop. [[spec/design_output/model#a-lease]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheIndexLeaseRenewsOffItsWorkLoop(t *testing.T) {
	t.Parallel()
	root := tree(t)
	write(t, root, config.Tracked, `{"watchdog":{"beat":1,"lease":5}}`)
	stepped := make(chan struct{}, 1)
	manage := func(_ string, _ *q.Store, _ OpRows, _ Reads, steps func(func())) (Managed, error) {
		steps(func() {
			select {
			case stepped <- struct{}{}:
			default:
			}
		})
		return Managed{Stop: func() {}}, nil
	}
	clock := newToldClock()
	served(t, clock, root, q.New(), manage)
	clock.Tick(time.Second)
	clock.passes(burstSettleDelay)
	<-stepped
}

// The value answer drains through the manager's settle, so a reader reads what the placed processes answer before it. [[spec/tickets/callers-name-drains-readers]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheValueAnswerWaitsOnTheManagersSettle(t *testing.T) {
	t.Parallel()
	catalog := q.New()
	hand := q.OutIn(catalog, "t/n", 4, q.Doc("a count"))
	manage := func(_ string, store *q.Store, _ OpRows, _ Reads, _ func(func())) (Managed, error) {
		settle := func() {
			if _, err := store.Commit(store.Snapshot().Revision, hand, map[string]any{"t/n": 9}); err != nil {
				t.Error(err)
			}
		}
		return Managed{Stop: func() {}, Settle: settle}, nil
	}
	one, _ := served(t, qtest.Wall(), tree(t), catalog, manage)
	said, err := one.answers(call{Method: "value", Params: json.RawMessage(`{"name":"t/n"}`)})
	if err != nil || said != 9 {
		t.Fatalf("the value answer reads %v and %v, and wants the 9 the settle commits", said, err)
	}
}

// The door answers the dump text, and the root writes it. [[spec/design_output/model#everything-on-disk-mirrors]]
// level0: FixtureOutsideHome - the case starts its own door over its own catalog
func TestTheDoorAnswersADumpOfAPrefix(t *testing.T) {
	t.Parallel()
	catalog := q.New()
	q.OutIn(catalog, "t/n", 4, q.Doc("a count"))
	_, standing := served(t, qtest.Wall(), tree(t), catalog, nil)
	said, err := posts(standing, []string{"dump", "t/"})
	if err != nil {
		t.Fatal(err)
	}
	if text, _ := said.Result.(string); text != "{\n  \"t/n\": 4\n}\n" {
		t.Fatalf("the dump of t/ answers %#v, %q", said.Result, said.Error)
	}
}
