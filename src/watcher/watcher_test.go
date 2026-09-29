package watcher

import (
	"fmt"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/fsnotify/fsnotify"

	"quackitect/src/watcher/watchertest"
)

// A watch with the timing fsnotify has on Windows: Add waits on a reply the reader sends, the reader picks the stop or the add at random on a wakeup, and an event send waits on a reader of Events. [[spec/tickets/a-watch-stops-mid-add]]
type windowsLike struct {
	port   chan string
	input  chan chan error
	done   chan chan error
	events chan fsnotify.Event
	errors chan error

	mu     sync.Mutex
	closed bool
}

// The name a wakeup carries on the port, beside the names of changed folders. [[spec/tickets/a-watch-stops-mid-add]]
const wakeup = ""

func newWindowsLike() *windowsLike {
	one := &windowsLike{
		port:   make(chan string, 64),
		input:  make(chan chan error, 1),
		done:   make(chan chan error, 1),
		events: make(chan fsnotify.Event),
		errors: make(chan error),
	}
	go one.reads()
	return one
}

func (one *windowsLike) source() source {
	return source{one.add, one.close, one.events, one.errors}
}

// The reader of fsnotify's Windows backend, readEvents, cut to its choices. [[spec/tickets/a-watch-stops-mid-add]]
func (one *windowsLike) reads() {
	for name := range one.port {
		if name != wakeup {
			one.sends(fsnotify.Event{Name: name, Op: fsnotify.Create})
			continue
		}
		select {
		case ch := <-one.done:
			close(one.events)
			close(one.errors)
			ch <- nil
			return
		case reply := <-one.input:
			reply <- nil
		default:
		}
	}
}

func (one *windowsLike) sends(event fsnotify.Event) {
	select {
	case ch := <-one.done:
		one.done <- ch
	case one.events <- event:
	}
}

// A change on disk, dropped where the port stands full. [[spec/tickets/a-watch-stops-mid-add]]
func (one *windowsLike) changes(name string) {
	select {
	case one.port <- name:
	default:
	}
}

func (one *windowsLike) add(string) error {
	one.mu.Lock()
	closed := one.closed
	one.mu.Unlock()
	if closed {
		return fsnotify.ErrClosed
	}
	reply := make(chan error)
	one.input <- reply
	one.port <- wakeup
	return <-reply
}

func (one *windowsLike) close() error {
	one.mu.Lock()
	one.closed = true
	one.mu.Unlock()
	ch := make(chan error)
	one.done <- ch
	one.port <- wakeup
	return <-ch
}

// The reader picks the stop at random, so the test stops many watches while events keep coming. [[spec/tickets/a-watch-stops-mid-add]]
func TestAStopReturnsWhileTheHearAdds(t *testing.T) {
	for round := 0; round < 200; round++ {
		fake := newWindowsLike()
		eyes := over(fake.source(), func(eyes *Watcher, event fsnotify.Event) {
			_ = eyes.Add(event.Name)
		})
		quit := make(chan struct{})
		go func() {
			for at := 0; ; at++ {
				select {
				case <-quit:
					return
				default:
					fake.changes(fmt.Sprint("folder", at))
				}
			}
		}()
		time.Sleep(time.Millisecond)
		watchertest.Returns(t, eyes.Close)
		close(quit)
	}
}

// [[spec/tickets/a-watch-stops-mid-add]]
func TestAStopReturnsOverTheRealWatch(t *testing.T) {
	for round := 0; round < 20; round++ {
		root := t.TempDir()
		eyes, err := New(func(eyes *Watcher, event fsnotify.Event) {
			if info, err := os.Stat(event.Name); err == nil && info.IsDir() {
				_ = eyes.Add(event.Name)
			}
		})
		if err != nil {
			t.Fatal(err)
		}
		if err := eyes.Add(root); err != nil {
			t.Fatal(err)
		}
		stop := watchertest.Appearing(root)
		time.Sleep(5 * time.Millisecond)
		watchertest.Returns(t, eyes.Close)
		stop()
	}
}
