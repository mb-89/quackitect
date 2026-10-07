// A context the fake clock ends: it names its deadline, and answers
// DeadlineExceeded once a tick passes it, as the real clock's context does.
// [[spec/tickets/go-waits-on-events]]
package qtest

import (
	"context"
	"sync/atomic"
	"time"
)

type deadline struct {
	context.Context
	at     time.Time
	passed atomic.Bool
}

func (one *deadline) Deadline() (time.Time, bool) { return one.at, true }

func (one *deadline) Err() error {
	err := one.Context.Err()
	if err != nil && one.passed.Load() {
		return context.DeadlineExceeded
	}
	return err
}
