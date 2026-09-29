// The file watch both Go watches stand on: it hands each event to a hear
// function, which adds folders, and its Close returns while an add runs.
// [[spec/tickets/a-watch-stops-mid-add]]
package watcher

import (
	"sync"

	"github.com/fsnotify/fsnotify"
)

// Reads one event, and adds a folder through the watch it gets. [[spec/tickets/a-watch-stops-mid-add]]
type Hear func(eyes *Watcher, event fsnotify.Event)

// The part of an fsnotify watch the loop reads, so a test hands a fake with the Windows timing. [[spec/tickets/a-watch-stops-mid-add]]
type source struct {
	add    func(path string) error
	close  func() error
	events <-chan fsnotify.Event
	errors <-chan error
}

// One goroutine drains the events into a queue with no bound, so fsnotify's reader waits on no send, and a second hands them to hear. Add and Close share one lock and a closed flag, so no Add waits on a reply a closed reader drops. [[spec/tickets/a-watch-stops-mid-add]]
type Watcher struct {
	from source

	lock   sync.Mutex
	closed bool

	queue   sync.Mutex
	waiting []fsnotify.Event
	drained bool
	ready   chan struct{}

	loops sync.WaitGroup
}

// A watch over fsnotify, handing each event to hear. [[spec/tickets/a-watch-stops-mid-add]]
func New(hear Hear) (*Watcher, error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	return over(source{eyes.Add, eyes.Close, eyes.Events, eyes.Errors}, hear), nil
}

func over(from source, hear Hear) *Watcher {
	one := &Watcher{from: from, ready: make(chan struct{}, 1)}
	one.loops.Add(2)
	go one.drains()
	go one.hears(hear)
	return one
}

// Reads Events and Errors both until fsnotify closes them, since the reader waits on a send to either. [[spec/tickets/a-watch-stops-mid-add]]
func (one *Watcher) drains() {
	defer one.loops.Done()
	events, errs := one.from.events, one.from.errors
	for events != nil || errs != nil {
		select {
		case event, open := <-events:
			if !open {
				events = nil
				continue
			}
			one.queue.Lock()
			one.waiting = append(one.waiting, event)
			one.queue.Unlock()
			one.wakes()
		case _, open := <-errs:
			if !open {
				errs = nil
			}
		}
	}
	one.queue.Lock()
	one.drained = true
	one.queue.Unlock()
	one.wakes()
}

func (one *Watcher) wakes() {
	select {
	case one.ready <- struct{}{}:
	default:
	}
}

// Hands each queued event to hear in order, and none once Close sets the flag. [[spec/tickets/a-watch-stops-mid-add]]
func (one *Watcher) hears(hear Hear) {
	defer one.loops.Done()
	for {
		one.queue.Lock()
		batch, drained := one.waiting, one.drained
		one.waiting = nil
		one.queue.Unlock()
		for _, event := range batch {
			if one.isClosed() {
				return
			}
			hear(one, event)
		}
		if drained {
			return
		}
		<-one.ready
	}
}

func (one *Watcher) isClosed() bool {
	one.lock.Lock()
	defer one.lock.Unlock()
	return one.closed
}

// [[spec/tickets/a-watch-stops-mid-add]]
func (one *Watcher) Add(path string) error {
	one.lock.Lock()
	defer one.lock.Unlock()
	if one.closed {
		return fsnotify.ErrClosed
	}
	return one.from.add(path)
}

// Sets the flag and closes fsnotify under the lock, then drops the lock and waits on both loops, so a hear inside Add finishes first. [[spec/tickets/a-watch-stops-mid-add]]
func (one *Watcher) Close() error {
	one.lock.Lock()
	if one.closed {
		one.lock.Unlock()
		one.loops.Wait()
		return nil
	}
	one.closed = true
	err := one.from.close()
	one.lock.Unlock()
	one.loops.Wait()
	return err
}
