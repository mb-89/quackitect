// The index manager: the operations, the leases and the alarms, one IO module
// the index always loads.
// [[spec/design_output/model#the-index-manager]]
package index

import (
	"sync"
	"time"

	"quackitect/src/q"
)

// The part the index holds its lease under, the name its lease stands at, and the spans a tree setting none above zero takes. [[spec/design_output/model#a-lease]]
const (
	leasePart    = "index"
	HealthName   = "index/health"
	LeasesName   = "index/leases"
	builtInBeat  = 5 * time.Second
	builtInLease = 30 * time.Second
)

// The keys the manager declares, each a span in seconds, which the config module resolves off every layer. [[spec/design_output/model#a-lease]]
const (
	BeatKey  = "config/watchdog/beat"
	LeaseKey = "config/watchdog/lease"
)

// One row of the op table: the id, and the body it holds. [[spec/design_output/model#an-operation-outlives-callers]]
type Row struct {
	ID   string
	Body []byte
}

// The op table the index keeps, so an operation outlives the door. [[spec/design_output/model#an-operation-outlives-callers]]
type Rows interface {
	Save(id string, body []byte) error
	All() ([]Row, error)
	Drop(id string) error
}

// What the manager reaches past itself: the root, the store and its writer, the op table, the work loop's step, and the clock. [[spec/design_output/model#the-index-manager]]
type Outside struct {
	Root  string
	Store *q.Store
	As    q.Writer
	Rows  Rows
	Steps func(hand func())
	Now   func() time.Time
	Every func(span time.Duration, hand func(time.Time)) (stop func())
}

// The manager writes ops/<id>, session/alarms, index/health, index/leases and the catalog rows, and carries q.IO(), since it starts and ends processes. [[spec/design_output/model#the-index-manager]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.OutIn(c, "ops/<id>", Op{}, q.Doc("the handle of a longer action, its state and its result"), q.IO()),
		q.OutIn(c, AlarmsName, []Alarm{}, q.Doc("the alarms standing, one row a part")),
		q.OutIn(c, HealthName, Lease{}, q.Doc("the index's own lease: its part, its last renewal and its term")),
		q.OutIn(c, LeasesName, []string{}, q.Doc("the parts whose lease still holds, which a context of the config module stands on")),
		q.OutIn(c, NamesName, []NameRow{}, q.Doc("each name, its provider and its state"), q.Looks(q.Rows)),
		q.OutIn(c, ActionsName, []ActionRow{}, q.Doc("each action, its doc and its input fields"), q.Looks(q.Rows)),
		q.OutIn(c, DocsName, []DocRow{}, q.Doc("each name, action and key, with its doc"), q.Looks(q.Rows)),
		q.CfgIn(c, "watchdog/beat", int(builtInBeat/time.Second), q.Doc("the seconds between two ticks of the manager")),
		q.CfgIn(c, "watchdog/lease", int(builtInLease/time.Second), q.Doc("the seconds the index's own lease holds past a renewal")),
	)
}

// The book and the dog one start holds, over the outside it reaches. [[spec/design_output/model#the-index-manager]]
type managed struct {
	from Outside
	book *Book
	dog  *Dog
	mu   sync.Mutex
	beat time.Duration
	term time.Duration
	tick func()
	done bool
}

// [[spec/design_output/model#the-index-manager]]
func Start(from Outside) (stop func(), err error) {
	one, err := begins(from)
	if err != nil {
		return nil, err
	}
	return one.stops, nil
}

// Opens the book over the rows and fails what a restart leaves in flight, holds the index's lease, hands the work loop its step, and ticks at the beat. [[spec/design_output/model#the-index-manager]]
func begins(from Outside) (*managed, error) {
	book, err := NewBook(from.Now, rowsKeep{from.Rows}, bookSettingsOf(from.Root))
	if err != nil {
		return nil, err
	}
	one := &managed{from: from, book: book, dog: NewDog(from.Now, from.Store, from.As, dogSettingsOf(from.Root))}
	book.OnMove(func(moved Op) { one.commits(map[string]any{Name(moved.ID): moved}) })
	if err := book.Restart(); err != nil {
		return nil, err
	}
	// The catalog stays fixed once the store starts, so its rows commit once. [[spec/tickets/the-catalog-reads-as-rows]]
	names, actions, docs := catalogOf(from.Store)
	one.commits(map[string]any{NamesName: names, ActionsName: actions, DocsName: docs})
	read := from.Store.Snapshot()
	one.term = spanIn(read.Read(LeaseKey), builtInLease)
	one.dog.Hold(leasePart, one.term)
	from.Steps(one.renews)
	one.beat = spanIn(read.Read(BeatKey), builtInBeat)
	one.tick = from.Every(one.beat, one.ticks)
	from.Store.OnCommit(one.hears)
	return one, nil
}

// A key in seconds, or the built-in span where it reads none above zero, since a ticker takes no zero. [[spec/design_output/model#a-lease]]
func spanIn(value any, builtIn time.Duration) time.Duration {
	if seconds, ok := value.(int); ok && seconds > 0 {
		return time.Duration(seconds) * time.Second
	}
	return builtIn
}

// A commit moving a span holds the lease at its new term, or ticks at the new beat from here on. [[spec/design_output/model#a-lease]]
func (one *managed) hears(values map[string]any) {
	lease, leased := values[LeaseKey]
	beat, beats := values[BeatKey]
	if !leased && !beats {
		return
	}
	one.mu.Lock()
	defer one.mu.Unlock()
	if one.done {
		return
	}
	if term := spanIn(lease, builtInLease); leased && term != one.term {
		one.term = term
		one.dog.Hold(leasePart, term)
	}
	if span := spanIn(beat, builtInBeat); beats && span != one.beat {
		one.tick()
		one.beat, one.tick = span, one.from.Every(span, one.ticks)
	}
}

// Stops the tick, and every span a later commit moves. [[spec/design_output/model#the-index-manager]]
func (one *managed) stops() {
	one.mu.Lock()
	defer one.mu.Unlock()
	one.done = true
	one.tick()
}

func (one *managed) commits(values map[string]any) {
	store := one.from.Store
	store.Commit(store.Snapshot().Revision, one.from.As, values)
}

// A step of the work loop renews the index's lease and commits it under index/health, so a hung loop renews nothing. [[spec/design_output/model#a-lease]]
func (one *managed) renews() {
	one.dog.Beat(leasePart)
	if lease, held := one.dog.Lease(leasePart); held {
		one.commits(map[string]any{HealthName: lease})
	}
	// The names read the states after the health commit, so index/health reads answered. [[spec/tickets/the-catalog-reads-as-rows]]
	names, _, _ := catalogOf(one.from.Store)
	one.commits(map[string]any{NamesName: names})
}

// A tick off the loop checks the leases and commits the live ones, fails each operation past its deadline, and drops each one past its window from the store. [[spec/design_output/model#deadlines]]
func (one *managed) ticks(time.Time) {
	one.dog.Check()
	one.commits(map[string]any{LeasesName: one.dog.Live()})
	one.book.Expire()
	var names []string
	for _, id := range one.book.Sweep() {
		names = append(names, Name(id))
	}
	if len(names) == 0 {
		return
	}
	store := one.from.Store
	store.Drop(store.Snapshot().Revision, one.from.As, names...)
}
