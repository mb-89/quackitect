// The index manager: the operations, the leases and the alarms, one IO module
// the index always loads.
// [[spec/design_output/model#the-index-manager]]
package index

import (
	"time"

	"quackitect/src/config"
	"quackitect/src/q"
)

// The part the index holds its lease under, the name its lease stands at, and the spans a tree setting none above zero takes. [[spec/design_output/model#a-lease]]
const (
	leasePart    = "index"
	HealthName   = "index/health"
	builtInBeat  = 5 * time.Second
	builtInLease = 30 * time.Second
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

// The manager writes ops/<id>, session/alarms, index/health and the catalog rows, and carries q.IO(), since it starts and ends processes. [[spec/design_output/model#the-index-manager]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.OutIn(c, "ops/<id>", Op{}, q.Doc("the handle of a longer action, its state and its result"), q.IO()),
		q.OutIn(c, AlarmsName, []Alarm{}, q.Doc("the alarms standing, one row a part")),
		q.OutIn(c, HealthName, Lease{}, q.Doc("the index's own lease: its part, its last renewal and its term")),
		q.OutIn(c, NamesName, []NameRow{}, q.Doc("each name, its provider and its state"), q.Looks(q.Rows)),
		q.OutIn(c, ActionsName, []ActionRow{}, q.Doc("each action, its doc and its input fields"), q.Looks(q.Rows)),
		q.OutIn(c, DocsName, []DocRow{}, q.Doc("each name, action and key, with its doc"), q.Looks(q.Rows)),
	)
}

// The book and the dog one start holds, over the outside it reaches. [[spec/design_output/model#the-index-manager]]
type managed struct {
	from Outside
	book *Book
	dog  *Dog
	stop func()
}

// [[spec/design_output/model#the-index-manager]]
func Start(from Outside) (stop func(), err error) {
	one, err := begins(from)
	if err != nil {
		return nil, err
	}
	return one.stop, nil
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
	one.dog.Hold(leasePart, spanOf(from.Root, "watchdog.lease", builtInLease))
	from.Steps(one.renews)
	one.stop = from.Every(spanOf(from.Root, "watchdog.beat", builtInBeat), one.ticks)
	return one, nil
}

// A key in seconds, or the built-in span where the tree sets none above zero, since a ticker takes no zero. [[spec/design_output/model#a-lease]]
func spanOf(root, key string, builtIn time.Duration) time.Duration {
	if seconds := config.Count(root, key); seconds > 0 {
		return time.Duration(seconds) * time.Second
	}
	return builtIn
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

// A tick off the loop checks the leases, fails each operation past its deadline, and drops each one past its window from the store. [[spec/design_output/model#deadlines]]
func (one *managed) ticks(time.Time) {
	one.dog.Check()
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
