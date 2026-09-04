package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// The engine writes the record. Nothing else does. A viewer reads the file,
// and the file is the whole interface between them.
//
// One file per session. The session is already the scope a person sees when
// they open the window, so making it the file boundary means the default view
// is a whole file and nothing has to be searched for.
type Log struct {
	mu      sync.Mutex
	f       *os.File
	path    string
	dir     string
	session string
	seq     int64
	written int64
	limit   int64

	// continued says this engine took over a session another engine began,
	// rather than starting one. A swap is one session with two processes in it,
	// so the successor is not a new session and nothing about a start belongs
	// to it. See unbound.go, where the binding is put back on a start and left
	// alone on a handover.
	continued bool
}

type Record struct {
	T       string         `json:"t"`
	Seq     int64          `json:"seq"`
	Session string         `json:"session"`
	Src     string         `json:"src"`
	Kind    string         `json:"kind"`
	Actor   string         `json:"actor"`
	Msg     string         `json:"msg"`
	OK      *bool          `json:"ok,omitempty"`
	Data    map[string]any `json:"data,omitempty"`
}

const defaultLimit = 32 << 20

// The current log always has the same name. Nothing else may.
//
// A window can then be opened on the log before there is a log, and it fills
// as the engine writes. Every earlier file carries a stamp, so "the one with
// no stamp" is always the one happening now.
const Current = "session.jsonl"

// sessionVar names the session a starting engine is continuing rather than
// beginning. Only a handover sets it: see swap.go.
const sessionVar = "SE_SESSION"

func OpenLog(dir string) (*Log, error) {
	// A SWAP IS ONE SESSION WITH TWO PROCESSES IN IT. The engine that handed
	// over named the session it was in, so the successor appends to it instead
	// of retiring it. Retiring here split one stretch of work in half at a
	// moment nobody chose, and a person watching the log saw it start over.
	if s := os.Getenv(sessionVar); s != "" {
		// THE BATON IS PUT DOWN ONCE IT IS TAKEN. It stayed in the successor's
		// environment, so every process that engine started inherited it: a test
		// run under a swapped engine opened a log that continued the engine's own
		// session instead of its own, and the check that an earlier session is
		// set aside rather than written over went red for no defect of its own.
		os.Unsetenv(sessionVar)
		return ContinueLog(dir, s)
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	l := &Log{dir: dir, limit: defaultLimit,
		session: time.Now().UTC().Format("20060102-150405")}
	// Whatever was current belongs to a session that is over. It is set aside
	// under a stamped name, never deleted.
	if err := l.retire(); err != nil {
		return nil, err
	}
	return l, l.open()
}

// ContinueLog opens the current log under a session that is already going.
// Nothing is retired, because nothing has ended.
func ContinueLog(dir, session string) (*Log, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, err
	}
	l := &Log{dir: dir, limit: defaultLimit, session: session, continued: true}
	return l, l.open()
}

// Continued answers whether this engine took over a session rather than
// beginning one.
func (l *Log) Continued() bool { return l.continued }

func (l *Log) retire() error { return RetireCurrent(l.dir) }

// RetireCurrent sets the current log aside under a stamped name. Nothing is
// ever deleted: a session that is over is still a session that happened.
//
// It is called when the engine starts, and again by the editor when a window
// opens, so that a log window opened without an engine shows this session and
// not the last one.
func RetireCurrent(dir string) error {
	cur := filepath.Join(dir, Current)
	st, err := os.Stat(cur)
	if err != nil {
		return nil // nothing to set aside
	}
	if st.Size() == 0 {
		return nil // nothing was written to it, so there is nothing to keep
	}
	stamp := st.ModTime().UTC().Format("20060102-150405")
	old := filepath.Join(dir, "session-"+stamp+".jsonl")
	for i := 1; ; i++ {
		if _, err := os.Stat(old); err != nil {
			break
		}
		old = filepath.Join(dir, fmt.Sprintf("session-%s.%d.jsonl", stamp, i))
	}
	return os.Rename(cur, old)
}

func (l *Log) open() error {
	l.path = filepath.Join(l.dir, Current)
	f, err := os.OpenFile(l.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return err
	}
	if st, err := f.Stat(); err == nil {
		l.written = st.Size()
	}
	l.f = f
	return nil
}

func (l *Log) Path() string { return l.path }

// Write is the only way a record reaches disk, and it never fails silently.
// Completeness of the record is this layer's first duty, so a failure to
// write goes to standard error where a person can see it.
func (l *Log) Write(src, kind, actor, msg string, ok *bool, data map[string]any) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.seq++
	b, err := json.Marshal(Record{
		T: time.Now().UTC().Format(time.RFC3339Nano), Seq: l.seq,
		Session: l.session, Src: src, Kind: kind, Actor: actor,
		Msg: msg, OK: ok, Data: data,
	})
	if err != nil {
		fmt.Fprintln(os.Stderr, "log: cannot encode a record:", err)
		return
	}
	b = append(b, '\n')
	n, err := l.f.Write(b)
	if err != nil {
		fmt.Fprintln(os.Stderr, "log: cannot write:", err)
		return
	}
	l.written += int64(n)
	// A long session is unbounded. The file must not be. The part that is
	// set aside takes a stamp, and the current file keeps its name, so a
	// window that is open on it keeps working.
	if l.written >= l.limit {
		l.f.Close()
		if err := l.retire(); err != nil {
			fmt.Fprintln(os.Stderr, "log: cannot set the full file aside:", err)
		}
		if err := l.open(); err != nil {
			fmt.Fprintln(os.Stderr, "log: cannot rotate:", err)
		}
		l.written = 0
	}
}

func (l *Log) Close() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.f.Close()
}

func Yes() *bool { b := true; return &b }
func No() *bool  { b := false; return &b }

func (l *Log) Session() string { return l.session }

// OpenExistingLog appends to the session that is already running. A guard is
// a separate process, started by the harness for one event, and it must add to
// the record rather than start a new one.
//
// It is an error when there is no current file: no engine is running, and the
// guard still has to answer.
func OpenExistingLog(dir string) (*Log, error) {
	cur := filepath.Join(dir, Current)
	st, err := os.Stat(cur)
	if err != nil {
		return nil, err
	}
	f, err := os.OpenFile(cur, os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return nil, err
	}
	// The sequence numbers of two writers cannot be one series without a
	// shared counter. Each writer carries its own, and the record is read in
	// file order, which is the order things happened.
	return &Log{f: f, dir: dir, path: cur, limit: defaultLimit, written: st.Size(),
		session: sessionOf(cur)}, nil
}

// The session name is in the first record of the file. Reading one line is
// cheaper than any other way of knowing it.
func sessionOf(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return "current"
	}
	defer f.Close()
	buf := make([]byte, 4096)
	n, _ := f.Read(buf)
	var probe struct {
		Session string `json:"session"`
	}
	line := buf[:n]
	if i := bytesIndexNewline(line); i > 0 {
		line = line[:i]
	}
	if json.Unmarshal(line, &probe) == nil && probe.Session != "" {
		return probe.Session
	}
	return "current"
}

func bytesIndexNewline(b []byte) int {
	for i, c := range b {
		if c == '\n' {
			return i
		}
	}
	return -1
}
