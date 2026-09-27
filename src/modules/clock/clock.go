// The clock IO module: it writes the minute on its out-port, which the wiring
// binds to clock/minute. Its file carries the real clock and the fake.
// [[spec/design_output/model#its-file-carries-its-fake]]
package clock

import (
	"sync"
	"time"

	"quackitect/src/q"
)

// The out-port, by its local name. [[spec/design_output/model#the-wiring-file]]
const Port = "minute"

const secondsAMinute = 60

// [[spec/design_output/model#io-modules-and-their-fakes]]
type Clock interface {
	Now() time.Time
	Every(span time.Duration, hand func(time.Time)) (stop func())
}

type clock struct{}

// The real clock. [[spec/design_output/model#its-file-carries-its-fake]]
func New() Clock { return clock{} }

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

type every struct {
	span time.Duration
	last time.Time
	hand func(time.Time)
}

// A time that stands still until a test calls Tick. [[spec/design_output/model#io-modules-and-their-fakes]]
type FakeClock struct {
	mu    sync.Mutex
	at    time.Time
	hands map[int]*every
	next  int
}

func NewFake(at time.Time) *FakeClock { return &FakeClock{at: at, hands: map[int]*every{}} }

func (one *FakeClock) Now() time.Time {
	one.mu.Lock()
	defer one.mu.Unlock()
	return one.at
}

func (one *FakeClock) Every(span time.Duration, hand func(time.Time)) (stop func()) {
	one.mu.Lock()
	defer one.mu.Unlock()
	at := one.next
	one.next++
	one.hands[at] = &every{span: span, last: one.at, hand: hand}
	return func() {
		one.mu.Lock()
		defer one.mu.Unlock()
		delete(one.hands, at)
	}
}

// Moves the time on, and calls each hand whose span passes. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeClock) Tick(span time.Duration) {
	one.mu.Lock()
	one.at = one.at.Add(span)
	now := one.at
	var due []func(time.Time)
	for _, each := range one.hands {
		if now.Sub(each.last) >= each.span {
			each.last = now
			due = append(due, each.hand)
		}
	}
	one.mu.Unlock()
	for _, hand := range due {
		hand(now)
	}
}

// The minute of a time, counted from the Unix epoch. [[spec/design_output/model#io-modules-and-their-fakes]]
func Minute(at time.Time) int64 { return at.Unix() / secondsAMinute }

// [[spec/design_output/model#io-modules-are-modules]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, Port, int64(0), q.Doc("the minute, counted from the Unix epoch"), q.IO())
}

// Commits the minute at start and at each minute after. [[spec/design_output/model#io-modules-are-modules]]
func Start(from Clock, commit func(values map[string]any) error) (stop func()) {
	_ = commit(map[string]any{Port: Minute(from.Now())})
	return from.Every(time.Minute, func(at time.Time) {
		_ = commit(map[string]any{Port: Minute(at)})
	})
}
