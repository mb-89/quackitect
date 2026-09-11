// Lines arriving in the session log. The operating system wakes the reader on
// every write, and a poll stands behind it. A rotated file starts the reading
// again from its top.
// [[spec/design_output/viewer#how-a-line-arrives]]

package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/fsnotify/fsnotify"
)

const poll = 250 * time.Millisecond

type linesMsg struct {
	recs      []Record
	restarted bool
}

type tailErrMsg struct{ err error }

type tailer struct {
	path string
	held []byte
	wake chan struct{}
}

func newTailer(path string) *tailer {
	t := &tailer{path: path, wake: make(chan struct{}, 1)}
	watch, err := fsnotify.NewWatcher()
	if err != nil {
		return t
	}
	if watch.Add(filepath.Dir(path)) != nil {
		watch.Close()
		return t
	}
	name := filepath.Base(path)
	go func() {
		for event := range watch.Events {
			if filepath.Base(event.Name) != name {
				continue
			}
			select {
			case t.wake <- struct{}{}:
			default:
			}
		}
	}()
	return t
}

// [[spec/design_output/viewer#a-rotation-starts-it-again]]
func (t *tailer) read() ([]Record, bool, error) {
	body, err := os.ReadFile(t.path)
	if os.IsNotExist(err) {
		return nil, false, nil
	}
	if err != nil {
		return nil, false, err
	}
	restarted := false
	if !bytes.HasPrefix(body, t.held) {
		if bytes.HasPrefix(t.held, body) {
			return nil, false, nil
		}
		t.held = nil
		restarted = true
	}
	fresh := body[len(t.held):]
	end := bytes.LastIndexByte(fresh, '\n')
	if end < 0 {
		return nil, restarted, nil
	}
	t.held = append(t.held, fresh[:end+1]...)
	var out []Record
	var last time.Time
	for _, line := range strings.Split(string(fresh[:end]), "\n") {
		line = strings.TrimRight(line, "\r")
		if strings.TrimSpace(line) == "" {
			continue
		}
		r := ParseRecord(line)
		if r.At.IsZero() {
			r.At = last
		}
		last = r.At
		out = append(out, r)
	}
	return out, restarted, nil
}

func (t *tailer) cmd() tea.Cmd {
	return func() tea.Msg {
		select {
		case <-t.wake:
		case <-time.After(poll):
		}
		recs, restarted, err := t.read()
		if err != nil {
			return tailErrMsg{err}
		}
		return linesMsg{recs: recs, restarted: restarted}
	}
}
