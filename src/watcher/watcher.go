// The file watch both Go watches stand on: it hands each event to a hear
// function, which may add folders, and its Close returns while one does.
// [[spec/tickets/a-watch-stops-mid-add]]
package watcher

import "github.com/fsnotify/fsnotify"

// Reads one event, and may add a folder through the watch it gets.
type Hear func(eyes *Watcher, event fsnotify.Event)

// The part of an fsnotify watch the loop reads, so a test hands a fake with the Windows timing. [[spec/tickets/a-watch-stops-mid-add]]
type source struct {
	add    func(path string) error
	close  func() error
	events <-chan fsnotify.Event
	errors <-chan error
}

type Watcher struct {
	from source
	done chan struct{}
}

// A watch over fsnotify, handing each event to hear.
func New(hear Hear) (*Watcher, error) {
	eyes, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	return over(source{eyes.Add, eyes.Close, eyes.Events, eyes.Errors}, hear), nil
}

func over(from source, hear Hear) *Watcher {
	one := &Watcher{from: from, done: make(chan struct{})}
	go func() {
		defer close(one.done)
		for event := range from.events {
			hear(one, event)
		}
	}()
	return one
}

func (one *Watcher) Add(path string) error { return one.from.add(path) }

func (one *Watcher) Close() error {
	err := one.from.close()
	<-one.done
	return err
}
