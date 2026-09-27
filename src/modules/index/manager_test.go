// The manager writes its names, fails what a restart leaves in flight, and
// renews index/health on each step of the work loop.
// [[spec/design_output/model#the-index-manager]]
package index

import (
	"encoding/json"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"quackitect/src/q"
)

// An op table in memory, which reads what it saves. [[spec/design_output/model#an-operation-outlives-callers]]
type heldRows struct {
	mu   sync.Mutex
	rows map[string][]byte
}

func rowsOf(seed map[string]string) *heldRows {
	held := &heldRows{rows: map[string][]byte{}}
	for id, body := range seed {
		held.rows[id] = []byte(body)
	}
	return held
}

func (h *heldRows) Save(id string, body []byte) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.rows[id] = append([]byte(nil), body...)
	return nil
}

func (h *heldRows) All() ([]Row, error) {
	h.mu.Lock()
	defer h.mu.Unlock()
	out := make([]Row, 0, len(h.rows))
	for id, body := range h.rows {
		out = append(out, Row{ID: id, Body: append([]byte(nil), body...)})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out, nil
}

func (h *heldRows) Drop(id string) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.rows, id)
	return nil
}

func (h *heldRows) body(id string) []byte {
	h.mu.Lock()
	defer h.mu.Unlock()
	return h.rows[id]
}

// A work loop the case steps by hand, and a time that moves where the case moves it. [[spec/design_output/model#a-lease]]
type loop struct {
	now   time.Time
	hands []func()
}

func (l *loop) outside(t *testing.T, s *q.Store, as q.Writer, rows Rows) Outside {
	return Outside{
		Root: t.TempDir(), Store: s, As: as, Rows: rows,
		Steps: func(hand func()) { l.hands = append(l.hands, hand) },
		Now:   func() time.Time { return l.now },
		Every: func(time.Duration, func(time.Time)) func() { return func() {} },
	}
}

func (l *loop) step(t *testing.T) {
	t.Helper()
	if len(l.hands) == 0 {
		t.Fatal("the manager hands the work loop no step")
	}
	for _, hand := range l.hands {
		hand()
	}
}

func starts(t *testing.T, from Outside) {
	t.Helper()
	stop, err := Start(from)
	if err != nil {
		t.Fatal(err)
	}
	if stop != nil {
		t.Cleanup(stop)
	}
}

// A value read as the JSON it commits, so a case names no type the move renames. [[spec/design_output/model#the-index-manager]]
func fields(t *testing.T, value any) map[string]any {
	t.Helper()
	text, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]any{}
	if err := json.Unmarshal(text, &out); err != nil {
		return map[string]any{}
	}
	return out
}

func manager(t *testing.T) (*q.Store, *loop, Outside, *heldRows) {
	c := q.New()
	as := Registers(c)
	s := q.NewStore(c)
	l := &loop{now: time.Unix(1000, 0).UTC()}
	rows := rowsOf(map[string]string{"1": `{"id":"1","action":"t/read","caller":"s1","state":"running","writes":false}`})
	return s, l, l.outside(t, s, as, rows), rows
}

func TestTheManagerWritesItsNames(t *testing.T) {
	s, _, _, _ := manager(t)
	for _, name := range []string{"ops/1", "session/alarms", "index/health"} {
		said, err := s.Why(name)
		if err != nil {
			t.Fatalf("the manager writes no %s: %v", name, err)
		}
		if where := filepath.ToSlash(said.Provider.Where); !strings.Contains(where, "src/modules/index/manager.go") {
			t.Fatalf("%s reads its writer at %s", name, where)
		}
	}
}

func TestEachStepRenewsIndexHealth(t *testing.T) {
	s, l, from, _ := manager(t)
	starts(t, from)
	for range 2 {
		l.now = l.now.Add(3 * time.Second)
		l.step(t)
		health := fields(t, s.Snapshot().Read("index/health"))
		if health["part"] != "index" {
			t.Fatalf("index/health names the part %v", health["part"])
		}
		if renewed := health["renewed"]; renewed != l.now.Format(time.RFC3339Nano) {
			t.Fatalf("index/health reads renewed %v after a step at %v", renewed, l.now)
		}
	}
}

func TestAStartFailsTheOpsInFlightUnderOpsId(t *testing.T) {
	s, _, from, rows := manager(t)
	starts(t, from)
	if state := fields(t, s.Snapshot().Read("ops/1"))["state"]; state != "failed" {
		t.Fatalf("ops/1 reads the state %v after a start", state)
	}
	if state := fields(t, json.RawMessage(rows.body("1")))["state"]; state != "failed" {
		t.Fatalf("the op row 1 reads the state %v after a start", state)
	}
}

func TestALeaseAtZeroTakesTheBuiltInTerm(t *testing.T) {
	t.Setenv("SE_WATCHDOG_LEASE", "0")
	s, l, from, _ := manager(t)
	starts(t, from)
	l.step(t)
	if term := fields(t, s.Snapshot().Read("index/health"))["term"]; term != float64(builtInLease) {
		t.Fatalf("a lease at zero reads the term %v, not %v", term, float64(builtInLease))
	}
}
