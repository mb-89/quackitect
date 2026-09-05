package main

import (
	"bufio"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"quackitect/engine/internal/version"
	"sync/atomic"
	"time"
)

// THE MODEL, AND THE SOCKET IT ANSWERS ON.
//
// The resident engine holds the index and a revision that moves with every
// change the watcher applies. A client connects, sends one question on one
// line, and reads one answer on one line. The answer carries the revision,
// which is what a memoized derived answer is keyed by: a cone or a
// propagation computed at revision n is good for every caller until the
// tree moves.
//
// A UNIX SOCKET ON EVERY PLATFORM. Windows has had AF_UNIX since 2018 and Go
// listens on it with the same call as everywhere else, so there is one code
// path and no pipe library. The address is published in engine.json beside
// the pid and the beat, where a client already looks.
//
// A CLIENT THAT FINDS NO MODEL WORKS COLD. It reads the index file, and
// failing that the files, the way it did before the socket existed. Level 0
// holds without the daemon, which is the ruling this file is built under.

// modelDialBudget is how long a client waits to reach the model, and
// modelAnswerBudget how long it waits for the answer. A hook gates every
// tool call, so a model that is slow is a model that is absent.
const (
	modelDialBudget   = 50 * time.Millisecond
	modelAnswerBudget = 500 * time.Millisecond
)

// socketPathLimit is what the platforms allow for a socket's path.
const socketPathLimit = 100

// THE METHODS THAT ARE NOT READS, and how long each may take. Everything else
// answers off the index and is held to the read budget, because a model that is
// slow to read is a model that is absent.
var slowMethods = map[string]time.Duration{
	"verb": verbBudget,
	"swap": swapDrainBudget + swapVerifyBudget,
}

// model is what the daemon holds: the open index and the revision of the
// tree it reflects.
type model struct {
	db    *sql.DB
	roots Roots
	// ctx is the engine's own, and a verb run inside takes it, so a git call
	// a verb makes ends when the engine does.
	ctx context.Context
	rev atomic.Int64
	// ready is set once the first scan is done and the cookie was waited
	// for, and watching says whether the cookie came. A ping answers both,
	// so the battery reads the daemon's own self-check instead of waiting
	// on the operating system for a second time.
	ready    atomic.Bool
	watching atomic.Bool
	// askedToStop is told once when a client asks the engine to stop.
	askedToStop chan<- struct{}
	// askedToSwap carries a built and verified engine waiting to take over.
	// The loop does the handover, because draining the calls in flight is
	// something the answer to one of them cannot do for itself.
	askedToSwap chan<- swapPlan
	// pendingSwap is a plan that has been answered for but not yet set going.
	// THE ANSWER GOES OUT BEFORE THE HANDOVER STARTS. Signalling from inside
	// the dispatch raced the encoder: the loop tore the socket down while the
	// answer was still being written, and every swap reported "no engine is
	// running over this folder" while swapping perfectly well.
	pendingSwap atomic.Pointer[swapPlan]
}

func (m *model) moved() { m.rev.Add(1) }

// A question and its answer, one line each.
type modelAsk struct {
	Method string          `json:"method"`
	Params json.RawMessage `json:"params,omitempty"`
}

type modelAnswer struct {
	OK     bool            `json:"ok"`
	Rev    int64           `json:"rev"`
	Result json.RawMessage `json:"result,omitempty"`
	Error  string          `json:"error,omitempty"`
}

// socketPath is where the daemon listens. Under the private folder, so it
// never travels, unless the path is too long for a socket, and then under
// the temporary folder with the root folded into the name.
func socketPath(r Roots) string {
	p := r.Private("engine.sock")
	if len(p) < socketPathLimit {
		return p
	}
	sum := sha256.Sum256([]byte(r.Work))
	return filepath.Join(os.TempDir(), "quackitect-"+hex.EncodeToString(sum[:6])+".sock")
}

// listenModel opens the socket. A socket file left by a dead engine is
// removed first, because the platform refuses to listen over one.
func listenModel(r Roots) (net.Listener, string, error) {
	p := socketPath(r)
	_ = os.Remove(p) // a file left by a dead engine, or nothing
	ln, err := net.Listen("unix", p)
	if err != nil {
		return nil, "", err
	}
	return ln, p, nil
}

// serveModel answers questions until the listener closes.
func serveModel(ln net.Listener, m *model) {
	for {
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		go answerModel(conn, m)
	}
}

func answerModel(conn net.Conn, m *model) {
	defer conn.Close()
	in := bufio.NewScanner(conn)
	in.Buffer(make([]byte, 0, 1<<16), 1<<22)
	out := json.NewEncoder(conn)
	for in.Scan() {
		_ = conn.SetDeadline(time.Now().Add(modelAnswerBudget)) // a client that stops talking is dropped
		var ask modelAsk
		if err := json.Unmarshal(in.Bytes(), &ask); err != nil {
			_ = out.Encode(modelAnswer{Error: "the question will not read: " + err.Error()})
			continue
		}
		// AN ACT MAY TAKE AS LONG AS THE ACT TAKES, and only a read is quick.
		// The run verb runs a test suite, and a swap builds the next engine
		// before it answers. A swap left on the read budget timed out mid-build
		// every time: the answer could not be written, so the client was told
		// no engine was running while one was building its own successor.
		if budget, slow := slowMethods[ask.Method]; slow {
			_ = conn.SetDeadline(time.Now().Add(budget)) // a deadline it cannot set is a wait the act's own ceiling ends
		}
		result, err := m.answer(ask)
		a := modelAnswer{OK: err == nil, Rev: m.rev.Load()}
		if err != nil {
			a.Error = err.Error()
		} else {
			a.Result, _ = json.Marshal(result)
		}
		if err := out.Encode(a); err != nil {
			return
		}
		// A HANDOVER STARTS ONLY ONCE ITS ANSWER HAS GONE, and this connection
		// is finished with, so it is closed before the engine begins to leave.
		if plan := m.pendingSwap.Swap(nil); plan != nil {
			conn.Close()
			select {
			case m.askedToSwap <- *plan:
			default: // one is already going
			}
			return
		}
	}
}

// answer is the one dispatch. Every method is a read over the model; the
// model writes nothing on a client's word, because the files are the truth
// and the watcher is what changes the index.
func (m *model) answer(ask_ modelAsk) (any, error) {
	switch ask_.Method {
	case "ping":
		return map[string]any{"build": version.Build, "pid": os.Getpid(), "load": theLoad.snapshot(),
			"ready": m.ready.Load(), "watching": m.watching.Load()}, nil
	case "verb":
		var ask verbAsk
		if err := json.Unmarshal(ask_.Params, &ask); err != nil {
			return nil, err
		}
		theLoad.verbsInFlight.Add(1)
		defer theLoad.verbsInFlight.Add(-1)
		defer theLoad.verbsAnswered.Add(1)
		return runVerbInside(m.ctx, m.roots, ask), nil
	case "stop":
		select {
		case m.askedToStop <- struct{}{}:
		default: // already asked
		}
		return map[string]any{"stopping": true}, nil
	case "swap":
		// THE BUILD HAPPENS HERE, WHILE THE ENGINE STILL ANSWERS. It touches
		// nothing that is running, so a tree whose source will not compile is
		// told so and keeps the engine it has. Only once the new program has
		// answered for itself is the handover set going, and that is the loop's
		// to do: it has to drain the calls in flight, and this is one of them.
		var p struct {
			Why   string `json:"why"`
			Built bool   `json:"built"`
		}
		_ = json.Unmarshal(ask_.Params, &p) // a swap nobody explained is still a swap
		plan, err := planSwap(m.roots, p.Why, p.Built)
		if err != nil {
			return nil, err
		}
		if !m.pendingSwap.CompareAndSwap(nil, &plan) {
			return swapAnswer{Swapping: true, Build: plan.Build, From: version.Build,
				Says: "a swap was already asked for, so this one is the same one"}, nil
		}
		return swapAnswer{Swapping: true, Build: plan.Build, From: version.Build,
			Says: "the next engine is built and answers. The calls in flight finish, then it takes over"}, nil
	case "copy":
		var p struct {
			Size int    `json:"size"`
			Hash string `json:"hash"`
		}
		if err := json.Unmarshal(ask_.Params, &p); err != nil {
			return nil, err
		}
		var path string
		err := m.db.QueryRow("SELECT path FROM file WHERE size = ? AND hash = ? AND path LIKE '.se/%' "+
			"AND path NOT LIKE '.se/log/%' LIMIT 1", p.Size, p.Hash).Scan(&path)
		if errors.Is(err, sql.ErrNoRows) {
			return map[string]any{"path": ""}, nil
		}
		if err != nil {
			return nil, err
		}
		return map[string]any{"path": path}, nil
	case "passage":
		var p struct {
			Content string `json:"content"`
		}
		if err := json.Unmarshal(ask_.Params, &p); err != nil {
			return nil, err
		}
		from, line, found := copiedPassage(m.db, p.Content)
		return map[string]any{"path": from, "line": line, "found": found}, nil
	case "ask":
		var p AskParams
		if err := json.Unmarshal(ask_.Params, &p); err != nil {
			return nil, err
		}
		query, err := p.query()
		if err != nil {
			return nil, err
		}
		got, err := askDB(m.db, query, p.Limit)
		if err != nil {
			return nil, err
		}
		got.Fresh = indexIsFresh(m.db)
		return got, nil
	case "find":
		var p FindParams
		if err := json.Unmarshal(ask_.Params, &p); err != nil {
			return nil, err
		}
		got, err := findDB(m.db, p)
		if err != nil {
			return nil, err
		}
		got.Fresh = indexIsFresh(m.db)
		return got, nil
	}
	return nil, fmt.Errorf("no such question: %q", ask_.Method)
}

// askModel puts one question to the running model and answers whether a
// model answered at all. A missing address, a refused connection, a slow
// answer and an error are all the same to the caller: no model, go cold.
func askModel(r Roots, method string, params any) (json.RawMessage, int64, bool) {
	return askModelWithin(r, method, params, modelAnswerBudget)
}

// theSocketOf answers where the engine is dialled: the socket the record
// names, and the engine's own path when it names none.
//
// THE SOCKET IS THE TRUTH, NOT THE RECORD. A second engine that could not
// bind wrote the record with no socket in it and beat beside the first, so
// every other read saw no socket while the first engine answered on its path
// the whole time. Nine calls in twenty were told to start an engine. The path
// is decided by socketPath from the roots alone, so a record naming none, or
// no record at all, still leaves the one place to try. What is dialled
// either answers or refuses, and only a refusal is no engine.
func theSocketOf(r Roots, running Running) string {
	if running.Socket != "" {
		return running.Socket
	}
	return socketPath(r)
}

// askModelWithin is askModel with the caller's own patience for the answer.
func askModelWithin(r Roots, method string, params any, within time.Duration) (json.RawMessage, int64, bool) {
	running, _ := LoadRunning(r) // a record that is not an engine still leaves the socket to try
	conn, err := net.DialTimeout("unix", theSocketOf(r, running), modelDialBudget)
	if err != nil {
		return nil, 0, false
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(within)) // a deadline it cannot set is a wait it cannot bound, and the read below still answers
	raw, err := json.Marshal(params)
	if err != nil {
		return nil, 0, false
	}
	if err := json.NewEncoder(conn).Encode(modelAsk{Method: method, Params: raw}); err != nil {
		return nil, 0, false
	}
	var a modelAnswer
	if err := json.NewDecoder(bufio.NewReader(conn)).Decode(&a); err != nil || !a.OK {
		return nil, 0, false
	}
	return a.Result, a.Rev, true
}

// copiedPassageViaModel is the passage check put to the model. The last
// answer says whether a model answered.
func copiedPassageViaModel(r Roots, content string) (from string, line int, found, answered bool) {
	raw, _, ok := askModel(r, "passage", map[string]any{"content": content})
	if !ok {
		return "", 0, false, false
	}
	var got struct {
		Path  string `json:"path"`
		Line  int    `json:"line"`
		Found bool   `json:"found"`
	}
	if json.Unmarshal(raw, &got) != nil {
		return "", 0, false, false
	}
	return got.Path, got.Line, got.Found, true
}

// privateCopyViaModel is the copy check put to the model. The third answer
// says whether a model answered.
func privateCopyViaModel(r Roots, content string) (from string, found, answered bool) {
	sum := sha256.Sum256([]byte(content))
	raw, _, ok := askModel(r, "copy", map[string]any{"size": len(content), "hash": hex.EncodeToString(sum[:])})
	if !ok {
		return "", false, false
	}
	var got struct {
		Path string `json:"path"`
	}
	if json.Unmarshal(raw, &got) != nil {
		return "", false, false
	}
	if got.Path == "" {
		return "", false, true
	}
	return filepath.Join(r.Work, filepath.FromSlash(got.Path)), true, true
}

// ErrNoEngine is what a caller gets when nothing is listening over the tree, as
// against an engine that answered and refused.
var ErrNoEngine = errors.New("no engine is running")

// askModelForAnAnswer is askModelWithin for a caller that has to tell the
// difference between no engine and an engine that said no.
//
// EVERY READER ABOVE GOES COLD ON BOTH, and that is right for a read: the index
// file and then the files are a true answer either way. It is wrong for an act.
// A swap whose build failed was reported as "no engine is running over this
// folder" while one was running and had just said exactly what was wrong with
// the program it was handed, and the battery went on for thirty seconds waiting
// for a handover that had already been refused.
func askModelForAnAnswer(r Roots, method string, params any, within time.Duration) (json.RawMessage, error) {
	running, _ := LoadRunning(r) // a record that is not an engine still leaves the socket to try
	conn, err := net.DialTimeout("unix", theSocketOf(r, running), modelDialBudget)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrNoEngine, err)
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(within)) // a deadline it cannot set is a wait the answer itself ends
	raw, err := json.Marshal(params)
	if err != nil {
		return nil, err
	}
	if err := json.NewEncoder(conn).Encode(modelAsk{Method: method, Params: raw}); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrNoEngine, err)
	}
	var a modelAnswer
	if err := json.NewDecoder(bufio.NewReader(conn)).Decode(&a); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrNoEngine, err)
	}
	if !a.OK {
		return nil, errors.New(a.Error)
	}
	return a.Result, nil
}
