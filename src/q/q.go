// The q core: every name has one owner, one type and one default, and the
// catalog check refuses a start on a fault. Modules register at init into
// Main, and a test builds a catalog of its own.
// [[spec/design_output/model]]
package q

import "time"

// Kind names a fault the check answers.
type Kind string

const (
	Twice     Kind = "a name registered twice"
	NoDefault Kind = "a name with no default"
	TwoActive Kind = "two providers active"
	NoAlt     Kind = "a key picking no registered alt"
	NoName    Kind = "an input naming no name"
	OtherType Kind = "an input of another type"
	Cycle     Kind = "a cycle among derived names"
	BadName   Kind = "a name of other than lowercase segments"
)

// Fault is one refusal, naming every file and line it reaches.
type Fault struct {
	Kind  Kind
	Name  string
	Where []string
	Says  string
}

// Catalog holds the registrations.
type Catalog struct{}

// Main is the one catalog the index checks at start.
var Main = New()

// New answers an empty catalog.
func New() *Catalog { return &Catalog{} }

// Option is what a registration takes last.
type Option func()

func Doc(text string) Option             { return func() {} }
func Alt(name string) Option             { return func() {} }
func Deadline(span time.Duration) Option { return func() {} }

// GivenIn registers a name a door writes.
func GivenIn[T any](c *Catalog, name string, def T, opts ...Option) {}

// DerivedIn registers a name answered by a function of an input struct.
func DerivedIn[In, Out any](c *Catalog, name string, def Out, fn func(In) Out, opts ...Option) {}

// FoldIn registers a name answered by a state reduced over events.
func FoldIn[S, E any](c *Catalog, name string, def S, step func(S, E) S, opts ...Option) {}

// Check answers every fault in the catalog, reading the providers.<name> keys.
func (c *Catalog) Check(keys map[string]string) []Fault { return nil }

// Store holds the values at one revision.
type Store struct{}

// NewStore answers a store over a catalog.
func NewStore(c *Catalog) *Store { return &Store{} }

// Snapshot reads every name at one revision.
type Snapshot struct{ Revision int64 }

func (s *Store) Snapshot() Snapshot                                    { return Snapshot{} }
func (s *Store) Commit(read int64, values map[string]any) (int64, error) { return 0, nil }
func (s *Store) Run(name string) error                                   { return nil }
func (s *Store) Land(name string, event any) error                       { return nil }

func (one Snapshot) Read(name string) any   { return nil }
func (one Snapshot) From(name string) int64 { return 0 }
