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

// level0: OutsideInDoors - a case importing no module reads the real time through the wall
func (wall) Now() time.Time { return time.Now() }

func (wall) Every(span time.Duration, hand func(time.Time)) (stop func()) {
	// level0: OutsideInDoors - a case importing no module waits on the real time through the wall
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

// level0: OutsideInDoors - a case importing no module waits on the real time through the wall
func (wall) After(span time.Duration) <-chan time.Time { return time.After(span) }

func (wall) AfterFunc(span time.Duration, hand func()) (stop func() bool) {
	// level0: OutsideInDoors - a case importing no module waits on the real time through the wall
	return time.AfterFunc(span, hand).Stop
}

func (wall) WithTimeout(parent context.Context, span time.Duration) (context.Context, context.CancelFunc) {
	// level0: OutsideInDoors - a case importing no module waits on the real time through the wall
	return context.WithTimeout(parent, span)
}
