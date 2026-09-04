package main

import (
	"bytes"
	"fmt"
	"hash/fnv"
	"io"
	"net"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

// THE GUARD, SERVED BY THE ENGINE THAT LIVES.
//
// A command hook is a process the harness starts for every event, and the
// process costs more than anything the guard does: measured on the reference
// machine, the spawn alone is most of every decision. An HTTP hook is the
// same event posted to a URL, and the resident engine answers it from the
// process that is already running, with the index open and the log held.
//
// THE ANSWER IS THE SAME ANSWER. The guard is one function over one event,
// writing its decision to a writer. The command form hands it standard
// output, and this hands it the response. Nothing about a decision knows
// which door it came through.
//
// A DEAD ENGINE IS AN UNGUARDED WINDOW, AND IT IS WATCHED. The harness does
// not block a call whose hook it cannot reach. So the cage carries a short
// timeout on every HTTP hook, session start is a command hook that brings
// the engine up when it is down, the liveness light goes red, and every
// event the engine did answer is in the record, so the window shows as a gap.

// guard is where one decision writes its answer.
type guard struct {
	out io.Writer
}

// hookTimeoutSeconds is what the cage gives an HTTP hook before the harness
// gives up on it. An engine that has not answered in this long is one that
// is not there, and the call goes on rather than waiting on a corpse.
const hookTimeoutSeconds = 3

// hooksPort is derived from the work root, so the cage can name the URL
// before any engine has started and every engine over this folder binds
// the same one. The range sits above the well-known ports and below the
// ephemeral ones on every platform this runs on.
//
// DERIVING IT WAS NEVER THE DEFECT. COMMITTING THE FILE IT LANDS IN WAS. This
// number is right here and meaningless anywhere else, and it sat in the
// settings file every clone carries: this box wrote 33987, a cloud clone bound
// 30268, and whichever box committed last pushed its own. A value that must
// tell two folders apart on one machine cannot also be the same on two
// machines, because two clones of one commit are the same tree. So the cage is
// two files, and only the door moves. See util/cage/claude-settings.json.
//
// v3 had no such number because every hook there was a command, computing the
// door at runtime. The HTTP door is what removed a process per tool call, and
// this is the price of it, paid in a file git does not carry.
func hooksPort(r Roots) int {
	h := fnv.New32a()
	h.Write([]byte(theSameFolderEveryTime(r.Work)))
	return 20000 + int(h.Sum32()%20000)
}

// theSameFolderEveryTime answers one spelling for one folder.
//
// THE HASH IS OF A PATH, AND A PATH IS NOT ONE STRING. A session was handed
// this tree as c: and then as C:, which Windows means the same folder by. The
// two spellings hashed to two ports, the engine restarted onto the second, and
// the settings file was rewritten. The harness had read that file once, so it
// went on posting to the first. Every guard rides on that door, so all of them
// were absent for an hour and nothing said so.
//
// IT IS LEXICAL AND ASKS THIS MACHINE NOTHING. filepath answers differently on
// each platform, and the cage names this port on every platform this runs on.
// A canonical form that reads the disk would also fail before the folder is
// made, which is exactly when the cage needs the number.
//
// CASE IS FOLDED ONLY FOR A WINDOWS PATH, which a colon in the second place
// tells. A POSIX path is left alone, because two folders there really can
// differ by case alone.
func theSameFolderEveryTime(path string) string {
	path = strings.ReplaceAll(path, `\`, "/")
	for strings.Contains(path, "//") {
		path = strings.ReplaceAll(path, "//", "/")
	}
	path = strings.TrimRight(path, "/")
	if len(path) >= 2 && path[1] == ':' {
		path = strings.ToLower(path)
	}
	return path
}

// hooksURL is where the engine over this folder answers hook events.
func hooksURL(r Roots) string {
	return fmt.Sprintf("http://127.0.0.1:%d/hook", hooksPort(r))
}

// listenHooks binds the port the cage names. The port is fixed, because the
// cage was written with it; a port that is taken is said loudly and the
// engine runs without the door, which the record then shows.
func listenHooks(r Roots) (net.Listener, error) {
	return net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", hooksPort(r)))
}

// serveHooks answers events until the listener closes.
//
// ONE EVENT AT A TIME. The guard keeps its state in files under the private
// folder with a lock beside each, and the record is one file, so events are
// serialised here rather than raced. A decision takes milliseconds, and the
// harness sends few at once.
func serveHooks(ln net.Listener, r Roots, log *Log) {
	var one sync.Mutex
	srv := &http.Server{
		ReadHeaderTimeout: 2 * time.Second,
		Handler: http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			if req.Method != http.MethodPost {
				http.Error(w, "the guard takes a POST with the event as JSON", http.StatusMethodNotAllowed)
				return
			}
			raw, err := io.ReadAll(io.LimitReader(req.Body, 1<<24))
			if err != nil {
				http.Error(w, "the event could not be read: "+err.Error(), http.StatusBadRequest)
				return
			}
			var out bytes.Buffer
			// THE QUEUE IS COUNTED, AND A DEEP ONE IS SAID. Events wait here
			// one behind another, so the depth of the wait is the one number
			// that says the engine is the bottleneck.
			waiting := theLoad.hooksWaiting.Add(1)
			arrived := time.Now()
			one.Lock()
			theLoad.hooksWaiting.Add(-1)
			waited := time.Since(arrived)
			began := time.Now()
			answerHook(raw, []string{"--method", r.Method}, &out, log)
			took := time.Since(began)
			one.Unlock()
			theLoad.hooksAnswered.Add(1)
			theLoad.noteHook(log, int(waiting), waited, took)
			w.Header().Set("Content-Type", "application/json")
			if out.Len() == 0 {
				// No decision is an empty object, which the harness reads as
				// nothing to say, rather than an empty body.
				out.WriteString("{}\n")
			}
			_, _ = w.Write(out.Bytes()) // a client that went away gets nothing, and the record has the decision
		}),
	}
	_ = srv.Serve(ln) // ends when the listener closes, which is the daemon stopping
}

// THE LOAD, COUNTED WHERE IT QUEUES.
//
// The engine is one process answering every hook and every verb, so the
// question is whether it has become the thing everybody waits on. The hooks
// queue on one lock, so their queue depth and their wait are the number. A
// verb runs in its own goroutine and only counts as in flight. Both are said
// in the record when they pass a bound, no more than once a minute, and both
// ride on a ping so a person can ask.
type engineLoad struct {
	hooksWaiting  atomic.Int64
	hooksAnswered atomic.Int64
	verbsInFlight atomic.Int64
	verbsAnswered atomic.Int64
	lastSaid      atomic.Int64 // unix nanos of the last line said, so a busy minute is one line
}

var theLoad engineLoad

// The bounds. A queue deeper than this, or a wait longer than this, is the
// engine being the bottleneck, and the record says so.
const (
	hookQueueBound = 4
	hookWaitBound  = 250 * time.Millisecond
	hookTookBound  = 500 * time.Millisecond
	loadSayEvery   = time.Minute
)

// noteHook records one answered hook against the bounds.
//
// THE HEADLINE SAYS WHICH BOUND TRIPPED. A deep queue or a long wait is other
// work piling up behind the guard, which is what the word bottleneck means. A
// long answer with nobody queued is one slow hook and nothing more.
//
// MEASURED. The line said bottleneck on all three, and the owner read "the
// guard is the bottleneck: 1 queued, waited 0 ms" and asked how that was one.
// The numbers beside the headline already said it was not.
func (l *engineLoad) noteHook(log *Log, queued int, waited, took time.Duration) {
	behind := queued >= hookQueueBound || waited >= hookWaitBound
	if !behind && took < hookTookBound {
		return
	}
	now := time.Now().UnixNano()
	last := l.lastSaid.Load()
	if now-last < int64(loadSayEvery) || !l.lastSaid.CompareAndSwap(last, now) {
		return
	}
	says := "the guard was slow on one hook"
	if behind {
		says = "the guard is the bottleneck"
	}
	log.Write("engine", "load", "engine",
		fmt.Sprintf("%s: %d queued, waited %d ms, answered in %d ms",
			says, queued, waited.Milliseconds(), took.Milliseconds()), No(),
		map[string]any{"queued": queued, "waited_ms": waited.Milliseconds(), "took_ms": took.Milliseconds(),
			"behind": behind, "verbs_in_flight": l.verbsInFlight.Load()})
}

// snapshot answers the counters, for a ping.
func (l *engineLoad) snapshot() map[string]any {
	return map[string]any{
		"hooks_waiting": l.hooksWaiting.Load(), "hooks_answered": l.hooksAnswered.Load(),
		"verbs_in_flight": l.verbsInFlight.Load(), "verbs_answered": l.verbsAnswered.Load(),
	}
}
