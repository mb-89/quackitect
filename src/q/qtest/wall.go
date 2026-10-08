// The wall: the real time, for a case in a package that imports no module and
// so reaches no clock IO module, where the case needs no control of time. The
// clock's contract suite runs it beside the real clock and the fake.
// [[spec/tickets/go-waits-on-events]]
package qtest

import (
	"context"
	"sync"
	"time"

	"quackitect/src/q"
)

type wall struct{}

// [[spec/tickets/go-waits-on-events]]
func Wall() q.Clock { return wall{} }

func (wall) Now() time.Time { return time.Now() }

func (wall) Every(span time.Duration, hand func(time.Time)) (stop func()) {
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

func (wall) After(span time.Duration) <-chan time.Time { return time.After(span) }

func (wall) AfterFunc(span time.Duration, hand func()) (stop func() bool) {
	return time.AfterFunc(span, hand).Stop
}

func (wall) WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(parent, span)
}
