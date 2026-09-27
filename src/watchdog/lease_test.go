// The watchdog: an expired lease marks its provider's names stale, the wait
// doubles to its cap, and faults in a window raise an alarm.
// [[spec/design_output/model#watchdogs]]
package watchdog

import (
	"errors"
	"testing"
	"time"

	"quackitect/src/q"
)

type clock struct{ now time.Time }

func (c *clock) Now() time.Time          { return c.now }
func (c *clock) pass(span time.Duration) { c.now = c.now.Add(span) }

func dogOf(t *testing.T, settings Settings, register func(*q.Catalog)) (*Dog, *q.Store, *clock) {
	t.Helper()
	c := q.New()
	as := Registers(c)
	if register != nil {
		register(c)
	}
	if faults := c.Check(); len(faults) > 0 {
		t.Fatalf("the catalog refuses: %v", faults)
	}
	store := q.NewStore(c)
	now := &clock{now: time.Unix(1_700_000_000, 0)}
	return New(now.Now, store, as, settings), store, now
}

func alarmsIn(store *q.Store) []Alarm {
	said, _ := store.Snapshot().Read(AlarmsName).([]Alarm)
	return said
}

func TestAnExpiredLeaseMarksEachNameOfItsPartStale(t *testing.T) {
	var items, count q.Writer
	dog, store, now := dogOf(t, Settings{}, func(c *q.Catalog) {
		items = q.GivenIn(c, "w/items/<id>", 0)
		count = q.GivenIn(c, "w/count", 0)
	})
	if _, err := store.Commit(0, items, map[string]any{"w/items/a": 1, "w/items/b": 2}); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Commit(0, count, map[string]any{"w/count": 2}); err != nil {
		t.Fatal(err)
	}
	dog.Hold("w/items/<id>", 10*time.Second)
	now.pass(5 * time.Second)
	if expired := dog.Check(); len(expired) != 0 {
		t.Fatalf("the lease expires inside its term: %v", expired)
	}
	now.pass(10 * time.Second)
	if expired := dog.Check(); len(expired) != 1 || expired[0] != "w/items/<id>" {
		t.Fatalf("the check answers %v", expired)
	}
	snap := store.Snapshot()
	for _, name := range []string{"w/items/a", "w/items/b"} {
		if _, stale := snap.Stale(name); !stale {
			t.Fatalf("%s reads current past its provider's lease", name)
		}
	}
	if _, stale := snap.Stale("w/count"); stale {
		t.Fatal("w/count reads stale, and its provider holds no lease")
	}
}

func TestTheWaitDoublesUpToItsCap(t *testing.T) {
	dog, _, _ := dogOf(t, Settings{First: time.Second, Cap: 5 * time.Second, Faults: 100, Window: time.Hour}, nil)
	for _, want := range []time.Duration{time.Second, 2 * time.Second, 4 * time.Second, 5 * time.Second, 5 * time.Second} {
		wait, restart := dog.Fault("work", errors.New("hangs"))
		if wait != want || !restart {
			t.Fatalf("the fault answers %v and %v, not %v", wait, restart, want)
		}
	}
}

func TestFaultsInTheWindowRaiseAnAlarm(t *testing.T) {
	dog, store, now := dogOf(t, Settings{First: time.Second, Cap: time.Minute, Faults: 3, Window: time.Minute}, nil)
	dog.Fault("work", errors.New("one"))
	now.pass(2 * time.Minute)
	dog.Fault("work", errors.New("two"))
	if _, restart := dog.Fault("work", errors.New("three")); !restart || len(dog.Alarms()) != 0 {
		t.Fatal("a fault outside the window counts toward the alarm")
	}
	if _, restart := dog.Fault("work", errors.New("four")); restart {
		t.Fatal("the restarts go on under an alarm")
	}
	said := alarmsIn(store)
	if len(said) != 1 || said[0].Part != "work" || said[0].Faults != 3 || said[0].Error != "four" || said[0].Clears == "" {
		t.Fatalf("session/alarms reads %+v", said)
	}
}

func TestAClearedAlarmLeavesSessionAlarms(t *testing.T) {
	dog, store, _ := dogOf(t, Settings{First: time.Second, Cap: time.Minute, Faults: 1, Window: time.Minute}, nil)
	dog.Fault("work", errors.New("hangs"))
	if len(alarmsIn(store)) != 1 {
		t.Fatalf("session/alarms reads %+v", alarmsIn(store))
	}
	if err := dog.Clear("work"); err != nil {
		t.Fatal(err)
	}
	if said := alarmsIn(store); len(said) != 0 {
		t.Fatalf("session/alarms reads %+v after the clear", said)
	}
	if wait, restart := dog.Fault("work", errors.New("again")); restart || wait != 0 {
		t.Fatalf("one fault answers %v and %v, and one fault raises the alarm", wait, restart)
	}
}

func TestAHeartbeatRenewsTheLease(t *testing.T) {
	dog, _, now := dogOf(t, Settings{}, func(c *q.Catalog) { q.GivenIn(c, "w/count", 0) })
	dog.Hold("w/count", 10*time.Second)
	now.pass(8 * time.Second)
	dog.Beat("w/count")
	now.pass(8 * time.Second)
	if expired := dog.Check(); len(expired) != 0 {
		t.Fatalf("a renewed lease expires: %v", expired)
	}
}
