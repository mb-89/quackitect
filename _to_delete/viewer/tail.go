package main

import (
	"bufio"
	"os"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/fsnotify/fsnotify"
)

// Lines arriving from the file. The engine writes the record. This process
// reads it. Nothing is sent between them but a wake-up, and the wake-up comes
// from the operating system.
type linesMsg struct {
	recs []Record
	eof  bool
}
type tailErrMsg struct{ err error }

type tailer struct {
	path   string
	offset int64
	lineNo int64
	watch  *fsnotify.Watcher
	wake   chan struct{}
}

func newTailer(path string) *tailer {
	t := &tailer{path: path, wake: make(chan struct{}, 1)}
	// The watcher is the fast path. Failing to create one is not fatal: the
	// poll below sees every change anyway, one interval later.
	if w, err := fsnotify.NewWatcher(); err == nil {
		if w.Add(path) == nil {
			t.watch = w
			go func() {
				for range w.Events {
					select {
					case t.wake <- struct{}{}:
					default:
					}
				}
			}()
		} else {
			w.Close()
		}
	}
	return t
}

// read takes everything written since the last call. A partial last line is
// left on disk and read again next time, so a record is never shown half
// written.
func (t *tailer) read() ([]Record, error) {
	f, err := os.Open(t.path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil {
		return nil, err
	}
	// A file that shrank was rotated or replaced. Start again from the top
	// rather than reading from an offset that now means something else.
	if st.Size() < t.offset {
		t.offset, t.lineNo = 0, 0
	}
	if st.Size() == t.offset {
		return nil, nil
	}
	if _, err := f.Seek(t.offset, 0); err != nil {
		return nil, err
	}
	var out []Record
	rd := bufio.NewReaderSize(f, 1<<16)
	var consumed int64
	for {
		line, err := rd.ReadString('\n')
		if err != nil {
			break // no newline yet: leave the fragment for the next read
		}
		consumed += int64(len(line))
		t.lineNo++
		trimmed := trimEOL(line)
		if trimmed == "" {
			continue
		}
		out = append(out, ParseRecord(trimmed, t.lineNo))
	}
	t.offset += consumed
	return out, nil
}

func trimEOL(s string) string {
	for len(s) > 0 && (s[len(s)-1] == '\n' || s[len(s)-1] == '\r') {
		s = s[:len(s)-1]
	}
	return s
}

// poll is the backstop. File events are missed under conditions nobody can
// enumerate, and a window that silently stops updating is the worst of the
// available failures.
func (t *tailer) cmd() tea.Cmd {
	return func() tea.Msg {
		select {
		case <-t.wake:
		case <-time.After(300 * time.Millisecond):
		}
		recs, err := t.read()
		if err != nil {
			return tailErrMsg{err}
		}
		return linesMsg{recs: recs}
	}
}
