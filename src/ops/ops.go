// The book of operations: the handle a longer action answers, its states,
// one writer per tree, the restart, the deadline and the retention.
// [[spec/design_output/operations]]
package ops

import (
	"time"

	"quackitect/src/q"
)

type State string

const (
	Queued    State = "queued"
	Running   State = "running"
	Done      State = "done"
	Failed    State = "failed"
	Cancelled State = "cancelled"
)

type Progress struct {
	Done  int    `json:"done"`
	Known int    `json:"known"`
	Step  string `json:"step"`
}

// [[spec/design_output/operations#the-handle-is-a-name]]
type Op struct {
	ID       string    `json:"id"`
	Action   string    `json:"action"`
	Input    any       `json:"input,omitempty"`
	Caller   string    `json:"caller"`
	State    State     `json:"state"`
	Progress Progress  `json:"progress"`
	Deadline time.Time `json:"deadline"`
	Result   any       `json:"result,omitempty"`
	Error    string    `json:"error,omitempty"`
	Undone   []string  `json:"undone,omitempty"`
	Writes   bool      `json:"writes"`
	Started  time.Time `json:"started"`
	Ended    time.Time `json:"ended"`
}

// The seam the index fills, so an operation outlives a restart. [[spec/design_output/operations#an-operation-outlives-callers]]
type Keep interface {
	Save(one Op) error
	All() ([]Op, error)
	Drop(id string) error
}

// [[spec/design_output/operations#what-stays-how-long]]
type Settings struct {
	Done   time.Duration
	Failed time.Duration
}

type Book struct{}

func New(now func() time.Time, keep Keep, settings Settings) (*Book, error) { return &Book{}, nil }

func Name(id string) string { return id }

func (b *Book) Start(action string, input any, caller string, declared q.Declared) (string, error) {
	return "", nil
}

func (b *Book) Next() []string                     { return nil }
func (b *Book) Finish(id string, result any) error { return nil }
func (b *Book) Fail(id, reason string) error       { return nil }
func (b *Book) Cancel(id, reason string) error     { return nil }
func (b *Book) Get(id string) (Op, bool)           { return Op{}, false }
func (b *Book) Restart() error                     { return nil }
func (b *Book) Expire() []string                   { return nil }
func (b *Book) Sweep() []string                    { return nil }
