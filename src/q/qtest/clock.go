// The fake clock: a time that stands still until a case calls Tick, and fires
// each hand, wait and deadline whose span the tick passes. A package that
// imports no module reaches it here.
// [[spec/design_output/model#io-modules-and-their-fakes]]
package qtest

import (
	"context"
	"sort"
	"sync"
	"time"
)

type every struct {
	span time.Duration
	last time.Time
	hand func(time.Time)
}

type timer struct {
	due  time.Time
	fire func(time.Time)
}

// [[spec/tickets/go-waits-on-events]]
type FakeClock struct {
	mu     sync.Mutex
	at     time.Time
	hands  map[int]*every
	timers map[int]*timer
	next   int
}

func NewFake(at time.Time) *FakeClock {
	return &FakeClock{at: at, hands: map[int]*every{}, timers: map[int]*timer{}}
}

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

// A wait past no span fires at once, as the real clock's does. [[spec/tickets/go-waits-on-events]]
func (one *FakeClock) After(span time.Duration) <-chan time.Time {
	fired := make(chan time.Time, 1)
	one.waits(span, func(at time.Time) { fired <- at })
	return fired
}

// A hand past no span runs on its own goroutine, as the real clock's does, so a caller holding a lock meets no deadlock. [[spec/tickets/go-waits-on-events]]
func (one *FakeClock) AfterFunc(span time.Duration, hand func()) (stop func() bool) {
	if span <= 0 {
		go hand()
		return func() bool { return false }
	}
	at := one.waits(span, func(time.Time) { hand() })
	return func() bool {
		one.mu.Lock()
		defer one.mu.Unlock()
		_, held := one.timers[at]
		delete(one.timers, at)
		return held
	}
}

// The context ends on its deadline once a tick passes its span, or with its parent. [[spec/tickets/go-waits-on-events]]
func (one *FakeClock) WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc) {
	inner, cancel := context.WithCancelCause(parent)
	bounded := &deadline{Context: inner, at: one.Now().Add(span)}
	at := one.waits(span, func(time.Time) {
		bounded.passed.Store(true)
		cancel(context.DeadlineExceeded)
	})
	return bounded, func() {
		one.mu.Lock()
		delete(one.timers, at)
		one.mu.Unlock()
		cancel(context.Canceled)
	}
}

// Holds the fire until the time passes the span, or fires it now where the span is none. [[spec/tickets/go-waits-on-events]]
func (one *FakeClock) waits(span time.Duration, fire func(time.Time)) int {
	one.mu.Lock()
	at := one.next
	one.next++
	if span <= 0 {
		now := one.at
		one.mu.Unlock()
		fire(now)
		return at
	}
	one.timers[at] = &timer{due: one.at.Add(span), fire: fire}
	one.mu.Unlock()
	return at
}

// Moves the time on, and calls each hand whose span passes and each wait falling due, earliest first. [[spec/design_output/model#io-modules-and-their-fakes]]
func (one *FakeClock) Tick(span time.Duration) {
	one.mu.Lock()
	one.at = one.at.Add(span)
	now := one.at
	var hands []func(time.Time)
	for _, each := range one.hands {
		if now.Sub(each.last) >= each.span {
			each.last = now
			hands = append(hands, each.hand)
		}
	}
	var due []*timer
	for at, each := range one.timers {
		if !now.Before(each.due) {
			due = append(due, each)
			delete(one.timers, at)
		}
	}
	one.mu.Unlock()
	sort.Slice(due, func(i, j int) bool { return due[i].due.Before(due[j].due) })
	for _, each := range due {
		each.fire(now)
	}
	for _, hand := range hands {
		hand(now)
	}
}
