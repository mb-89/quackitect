// The clock IO module: it writes the minute on its out-port, which the wiring
// binds to clock/minute. Its file carries the real clock and the fake.
// [[spec/design_output/model#its-file-carries-its-fake]]
package clock

import (
	"time"

	"quackitect/src/q"
)

// The out-port, by its local name. [[spec/design_output/model#the-wiring-file]]
const Port = "minute"

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Clock interface {
	Now() time.Time
	Every(span time.Duration, hand func(time.Time)) (stop func())
}

type clock struct{}

// The real clock. [[spec/design_output/model#its-file-carries-its-fake]]
func New() Clock { return clock{} }

func (clock) Now() time.Time                                     { return time.Time{} }
func (clock) Every(time.Duration, func(time.Time)) (stop func()) { return func() {} }

// A time that stands still until a test calls Tick. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeClock struct{}

func NewFake(at time.Time) *FakeClock { return &FakeClock{} }

func (one *FakeClock) Now() time.Time                                     { return time.Time{} }
func (one *FakeClock) Every(time.Duration, func(time.Time)) (stop func()) { return func() {} }
func (one *FakeClock) Tick(span time.Duration)                           {}

// The minute of a time, counted from the Unix epoch. [[spec/design_output/model#io-modules-and-their-fakes]]
func Minute(at time.Time) int64 { return 0 }

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Port, int64(0), q.Doc("the minute, counted from the Unix epoch"))
}

// Commits the minute at start and at each minute after. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Clock, commit func(values map[string]any) error) (stop func()) {
	return func() {}
}
