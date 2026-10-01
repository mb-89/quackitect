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
	"quackitect/src/q/qtest"
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
	ticks []func(time.Time)
	spans []time.Duration
}

func (l *loop) outside(t *testing.T, s *q.Store, as q.Writer, rows Rows) Outside {
	return Outside{
		Root: t.TempDir(), Store: s, As: as, Rows: rows,
		Steps: func(hand func()) { l.hands = append(l.hands, hand) },
		Now:   func() time.Time { return l.now },
		Every: func(span time.Duration, hand func(time.Time)) func() {
			l.ticks = append(l.ticks, hand)
			l.spans = append(l.spans, span)
			return func() {}
		},
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

func (l *loop) tick(t *testing.T) {
	t.Helper()
	if len(l.ticks) == 0 {
		t.Fatal("the manager takes no tick")
	}
	for _, hand := range l.ticks {
		hand(l.now)
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

func TestTheManagerDeclaresThePlacementsUnderTheirDottedName(t *testing.T) {
	c := q.New()
	Registers(c)
	for _, key := range c.Keys() {
		if key.Dotted() == PlacementsDotted {
			if key.Default != "[]" {
				t.Fatalf("%s stands built in at %v", PlacementsDotted, key.Default)
			}
			return
		}
	}
	t.Fatalf("the manager declares no %s", PlacementsDotted)
}

func TestTheManagerRunsOverTheFakeIndex(t *testing.T) {
	var as q.Writer
	ix := qtest.New(t, func(c *q.Catalog) { as = Registers(c) })
	store := ix.Store()
	if store == nil {
		t.Fatal("the fake index hands the manager no store")
	}
	l := &loop{now: time.Unix(1000, 0).UTC()}
	starts(t, l.outside(t, store, as, rowsOf(map[string]string{})))
	l.step(t)
	if health := fields(t, ix.Read("index/health")); health["part"] != "index" {
		t.Fatalf("the fake index reads index/health %v", health)
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

// A lease key resolving to zero holds the built-in term, and a beat moving past its start re-arms the tick. The config module's own layers meet the manager in src/quack. [[spec/design_output/model#a-lease]]
func TestALeaseAtZeroTakesTheBuiltInTerm(t *testing.T) {
	var as, resolved q.Writer
	ix := qtest.New(t, func(c *q.Catalog) {
		resolved = q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the values each key resolves, as the case seeds them"))
		as = Registers(c)
	})
	l := &loop{now: time.Unix(1000, 0).UTC()}
	starts(t, l.outside(t, ix.Store(), as, rowsOf(map[string]string{})))
	ix.SeedAs(resolved, map[string]any{q.ResolvedName: q.Resolved{LeaseKey: "0", BeatKey: "3"}})
	ix.Run(LeaseKey)
	ix.Run(BeatKey)
	l.step(t)
	if term := fields(t, ix.Read("index/health"))["term"]; term != float64(builtInLease) {
		t.Fatalf("a lease at zero reads the term %v, not %v", term, float64(builtInLease))
	}
	if last := l.spans[len(l.spans)-1]; last != 3*time.Second {
		t.Fatalf("a beat of 3 ticks at %v", l.spans)
	}
}

// [[spec/design_output/model#deadlines]]
func TestATickFailsAnOperationPastItsDeadline(t *testing.T) {
	s, l, from, _ := manager(t)
	one, err := begins(from)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(one.stops)
	id, err := one.book.Start("t/read", nil, "s1", q.Declared{Deadline: time.Minute})
	if err != nil {
		t.Fatal(err)
	}
	l.now = l.now.Add(2 * time.Minute)
	l.tick(t)
	said := fields(t, s.Snapshot().Read(Name(id)))
	if said["state"] != "failed" || said["error"] != "the deadline passes" {
		t.Fatalf("%s reads %v after a tick past its deadline", Name(id), said)
	}
}

// [[spec/design_output/model#what-stays-how-long]]
func TestAnOperationPastItsWindowLeavesTheStore(t *testing.T) {
	t.Setenv("SE_OPS_KEEPFAILED", "60")
	s, l, from, rows := manager(t)
	starts(t, from)
	if held, _ := s.Snapshot().Read("ops/1").(Op); held.ID != "1" {
		t.Fatalf("ops/1 stands nowhere before its window passes: %#v", held)
	}
	l.now = l.now.Add(time.Hour)
	l.tick(t)
	if held, _ := s.Snapshot().Read("ops/1").(Op); held.ID == "1" {
		t.Fatalf("the store holds ops/1 past its window: %#v", held)
	}
	if body := rows.body("1"); body != nil {
		t.Fatalf("the op table holds 1 past its window: %s", body)
	}
}

// An action whose input fields carry their docs, so a catalog row names each field. [[spec/tickets/the-catalog-reads-as-rows]]
type askIn struct {
	Ticket string `json:"ticket" label:"Ticket" doc:"the ticket the ask reads"`
}

// The manager started over a catalog holding its own names, an action and a config key, stepped once. [[spec/tickets/the-catalog-reads-as-rows]]
func catalogued(t *testing.T) *qtest.Index {
	t.Helper()
	var as q.Writer
	ix := qtest.New(t, func(c *q.Catalog) {
		as = Registers(c)
		q.ActionIn(c, "t/ask", func(askIn) []q.Request { return nil }, q.Doc("asks about a ticket"), q.Label("Ask"), q.Icon("❓"))
		q.CfgIn(c, "depth", 3, q.Doc("how deep the ask reads"))
		q.OutIn(c, "t/badge", 0, q.Doc("a count a renderer badges"), q.Label("Tickets"), q.Looks(q.Count))
	})
	l := &loop{now: time.Unix(1000, 0).UTC()}
	starts(t, l.outside(t, ix.Store(), as, rowsOf(map[string]string{})))
	l.step(t)
	return ix
}

// A list read as the JSON it commits, one map a row. [[spec/tickets/the-catalog-reads-as-rows]]
func rowsRead(t *testing.T, value any) []map[string]any {
	t.Helper()
	text, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	var out []map[string]any
	if err := json.Unmarshal(text, &out); err != nil {
		return nil
	}
	return out
}

func rowNamed(t *testing.T, topic string, rows []map[string]any, name string) map[string]any {
	t.Helper()
	for _, row := range rows {
		if row["name"] == name {
			return row
		}
	}
	t.Fatalf("%s holds no row naming %s: %v", topic, name, rows)
	return nil
}

// A field row carries its key and its doc, whatever the row calls them. [[spec/tickets/the-catalog-reads-as-rows]]
func carries(row map[string]any, wants ...string) bool {
	for _, want := range wants {
		found := false
		for _, value := range row {
			found = found || value == want
		}
		if !found {
			return false
		}
	}
	return true
}

// [[spec/tickets/the-catalog-reads-as-rows]]
func TestIndexNamesNameEachNameItsProviderAndState(t *testing.T) {
	ix := catalogued(t)
	rows := rowsRead(t, ix.Read("index/names"))
	for _, want := range []struct{ name, kind, state string }{
		{"index/health", "out", "answered"},
		{"t/ask", "action", "default"},
		{"config/depth", "derived", "default"},
	} {
		row := rowNamed(t, "index/names", rows, want.name)
		provider := fields(t, row["provider"])
		if provider["name"] != want.name || provider["kind"] != want.kind {
			t.Fatalf("index/names reads the provider of %s as %v", want.name, row["provider"])
		}
		if row["state"] != want.state {
			t.Fatalf("index/names reads %s in the state %v, not %s", want.name, row["state"], want.state)
		}
	}
}

// [[spec/tickets/the-catalog-reads-as-rows]]
func TestIndexActionsNameEachActionWithItsDocAndFields(t *testing.T) {
	ix := catalogued(t)
	rows := rowsRead(t, ix.Read("index/actions"))
	row := rowNamed(t, "index/actions", rows, "t/ask")
	if row["doc"] != "asks about a ticket" {
		t.Fatalf("index/actions reads the doc of t/ask as %v", row["doc"])
	}
	fieldRows := rowsRead(t, row["fields"])
	if len(fieldRows) != 1 || !carries(fieldRows[0], "ticket", "the ticket the ask reads") {
		t.Fatalf("index/actions reads the fields of t/ask as %v", row["fields"])
	}
	for _, one := range rows {
		if one["name"] == HealthName {
			t.Fatalf("index/actions names %s, which no action provides", HealthName)
		}
	}
}

// [[spec/tickets/the-catalog-reads-as-rows]]
func TestIndexDocsNameEachNameActionAndKeyWithItsDoc(t *testing.T) {
	ix := catalogued(t)
	rows := rowsRead(t, ix.Read("index/docs"))
	for _, want := range []struct{ name, kind, doc string }{
		{HealthName, "name", "the index's own lease: its part, its last renewal and its term"},
		{"t/ask", "action", "asks about a ticket"},
		{"config/depth", "key", "how deep the ask reads"},
	} {
		row := rowNamed(t, "index/docs", rows, want.name)
		if row["kind"] != want.kind || row["doc"] != want.doc {
			t.Fatalf("index/docs reads %s as the %v %q, not the %s %q", want.name, row["kind"], row["doc"], want.kind, want.doc)
		}
	}
}

// A row under index/ carries no value, so index/names holds no copy of itself however many steps run. [[spec/tickets/the-catalog-reads-as-rows]]
func TestIndexNamesNestsNoListOfItself(t *testing.T) {
	var as q.Writer
	ix := qtest.New(t, func(c *q.Catalog) { as = Registers(c) })
	l := &loop{now: time.Unix(1000, 0).UTC()}
	starts(t, l.outside(t, ix.Store(), as, rowsOf(map[string]string{})))
	l.step(t)
	l.step(t)
	row := rowNamed(t, NamesName, rowsRead(t, ix.Read(NamesName)), NamesName)
	if _, held := row["value"]; held {
		t.Fatalf("index/names carries a value of itself after two steps: %v", row["value"])
	}
}

// The manager's call runs an action through the accept its outside hands it, and a nil accept refuses every request. [[spec/tickets/actions-answer-over-http]]
func TestServesCallsAnActionThroughItsAccept(t *testing.T) {
	for _, accept := range []func(q.Request) (any, error){held(nil), nil} {
		c := q.New()
		as := Registers(c)
		q.ActionIn(c, "t/read", func(path string) []q.Request {
			return []q.Request{{Module: "disk", Verb: "read", Args: path, NoUndo: "a read"}}
		}, q.Deadline(time.Minute))
		l := &loop{now: time.Unix(1000, 0).UTC()}
		from := l.outside(t, q.NewStore(c), as, rowsOf(map[string]string{}))
		from.Accept = accept
		stop, call, err := Serves(from)
		if err != nil {
			t.Fatal(err)
		}
		t.Cleanup(stop)
		said, err := call("t/read", "a.md", "s1", quick)
		if err != nil {
			t.Fatal(err)
		}
		if accept != nil && said.Result != "read a.md" {
			t.Fatalf("the call answers %+v", said)
		}
		if accept == nil && !strings.Contains(said.Error, "no IO module accepts disk.read") {
			t.Fatalf("a nil accept answers %+v", said)
		}
	}
}

// The start answers the book's reads beside its call, so the hooks door reads a session's operations. [[spec/tickets/the-hooks-door-lands]]
func TestServingAnswersEveryOperationOfACaller(t *testing.T) {
	_, _, from, _ := manager(t)
	served, err := Serving(from)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(served.Stop)
	if ops := served.Of("s1"); len(ops) != 1 || ops[0].ID != "1" || ops[0].State != Failed {
		t.Fatalf("the book answers %+v for s1, and wants the one operation the restart fails", ops)
	}
	if ops := served.Of("s2"); len(ops) != 0 {
		t.Fatalf("the book answers %+v for s2, and wants none", ops)
	}
}

// The row carries what the registration declares for a renderer. [[spec/tickets/the-work-view-gains-actions]]
func TestANameRowCarriesItsLabelAndLook(t *testing.T) {
	ix := catalogued(t)
	row := rowNamed(t, "index/names", rowsRead(t, ix.Read("index/names")), "t/badge")
	if row["label"] != "Tickets" || row["looks"] != "count" {
		t.Fatalf("index/names reads t/badge with label %v and looks %v, and wants Tickets and count", row["label"], row["looks"])
	}
}

// A registration declaring no label leaves the row's label empty. [[spec/tickets/the-work-view-gains-actions]]
func TestANameRowWithNoLabelCarriesNone(t *testing.T) {
	ix := catalogued(t)
	row := rowNamed(t, "index/names", rowsRead(t, ix.Read("index/names")), "config/depth")
	if _, held := row["label"]; held {
		t.Fatalf("index/names reads config/depth with label %v, and it declares none", row["label"])
	}
}
