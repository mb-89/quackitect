// The index manager: the operations, the leases and the alarms, one IO module
// the index always loads.
// [[spec/design_output/model#the-index-manager]]
package index

import (
	"time"

	"quackitect/src/q"
)

// The term a lease takes where the tree sets none above zero. [[spec/design_output/model#a-lease]]
const builtInLease = 30 * time.Second

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

// [[spec/design_output/model#the-index-manager]]
func Registers(*q.Catalog) q.Writer { return q.Writer{} }

// [[spec/design_output/model#the-index-manager]]
func Start(Outside) (stop func(), err error) { return nil, nil }
