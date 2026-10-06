// The clock IO module: it writes the minute on its out-port, which the wiring
// binds to clock/minute. Its file carries the real clock, and hands on the fake
// q/qtest keeps for the packages that import no module.
// [[spec/design_output/model#its-file-carries-its-fake]]
package clock

import (
	"context"
	"sync"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

// The out-port, by its local name. [[spec/design_output/model#the-wiring-file]]
const Port = "minute"

const secondsAMinute = 60

// The span between two reads of the time, so two clocks started apart turn the minute within it of each other. [[spec/tickets/process-shadow-reads-clean]]
const poll = time.Second

type clock struct{}

// The real clock. [[spec/design_output/model#its-file-carries-its-fake]]
func New() q.Clock { return clock{} }

func (clock) Now() time.Time { return time.Now() }

func (clock) Every(span time.Duration, hand func(time.Time)) (stop func()) {
	ticker := time.NewTicker(span)
	done := make(chan struct{})
	go func() {
		for {
			select {
			case at := <-ticker.C:
				hand(at)
			case <-done:
				return
			}
		}
	}()
	var once sync.Once
	return func() {
		once.Do(func() {
			ticker.Stop()
			close(done)
		})
	}
}

func (clock) After(span time.Duration) <-chan time.Time { return time.After(span) }

func (clock) AfterFunc(span time.Duration, hand func()) (stop func() bool) {
	return time.AfterFunc(span, hand).Stop
}

func (clock) WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, span)
}

// A time that stands still until a test calls Tick. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeClock = qtest.FakeClock

func NewFake(at time.Time) *FakeClock { return qtest.NewFake(at) }

// The minute of a time, counted from the Unix epoch. [[spec/design_output/model#io-modules-and-their-fakes]]
func Minute(at time.Time) int64 { return at.Unix() / secondsAMinute }

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.OutIn(c, Port, int64(0), q.Doc("the minute, counted from the Unix epoch"), q.IO())
}

// Commits the minute at start, and again as the minute turns, read each poll, so the index and the IO process commit the same minute within a poll of each other. [[spec/design_output/model#io-modules-are-modules]] [[spec/tickets/process-shadow-reads-clean]]
func Start(from q.Clock, commit func(values map[string]any) error) (stop func()) {
	var mu sync.Mutex
	last := Minute(from.Now())
	_ = commit(map[string]any{Port: last})
	return from.Every(poll, func(at time.Time) {
		mu.Lock()
		defer mu.Unlock()
		if minute := Minute(at); minute != last {
			last = minute
			_ = commit(map[string]any{Port: minute})
		}
	})
}
