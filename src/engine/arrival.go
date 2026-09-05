package main

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// ARRIVAL.
//
// An agent arrives once per session. Its first pull is that arrival, and every
// pull after it is an ordinary pull. Two things key off the difference: the
// machine's tool list is handed over once, and an arriving agent reclaims what
// its dead predecessor left holding.
//
// THE DIFFERENCE HAS TO BE REAL. If every pull reclaimed, two reviewers would
// take the same token from each other forever. So it is recorded, and the
// record is the answer.
//
// A SESSION IS THE BOUNDARY, and an arrival record from an earlier session says
// nothing about this one. The machine may have changed and every agent is new.

// WHAT IS KEPT. The session, a count of the pulls it has seen, and the count
// each actor was at when it last pulled.
//
// AN ACTOR THAT IS IN THE RECORD HAS ARRIVED, and that never changes. Whether it
// is still there is a different question, and this file no longer answers it.
type arrivals struct {
	Session string         `json:"session"`
	Pulls   int            `json:"pulls"`
	At      map[string]int `json:"at"`

	// THE ORDER THEY FIRST PULLED, which At cannot answer twice over: a map has
	// no order, and the count it holds is the LAST pull rather than the first.
	// It is written where the first pull is already known, which is here.
	Order []string `json:"order,omitempty"`

	// THE QUEUE EACH ACTOR PULLS ON, so the staffing can count workers and
	// reviewers apart.
	Roles map[string]string `json:"roles,omitempty"`
}

func arrivalPath(r Roots) string { return r.Private("arrivals.json") }

// ArrivalSession answers the session arrivals are keyed by: the harness's.
//
// THE ENGINE OUTLIVES AGENTS. Keyed on the engine's own session, a harness
// restart inside one engine run was not seen as an arrival and the reclaim
// never fired, so what a dead predecessor held stayed held. Every session
// record in the log carries the harness session id and where it came from,
// and a compaction is the same agent continuing, so a start from one does
// not move the key.
//
// A LOG WITH NO SUCH RECORD FALLS BACK TO THE ENGINE SESSION, which is the
// boundary it had before: better one arrival per engine run than none at all.
func ArrivalSession(r Roots) string {
	if key := TheHarnessSession(r); key != "" {
		return key
	}
	return currentSession(r)
}

// TheHarnessSession answers the harness session the log names, or nothing where
// it names none.
//
// IT IS ArrivalSession WITHOUT THE FALLBACK, and the difference is the whole
// point. A caller that wants a session whatever happens takes the fallback. A
// caller deciding whether a person has left needs to tell "a different session"
// from "the log cannot say", because an engine start retires the log and the
// fallback then answers a fresh engine run, which reads as a person leaving.
func TheHarnessSession(r Roots) string {
	f, err := os.Open(filepath.Join(r.Private("log"), Current))
	if err != nil {
		return ""
	}
	defer f.Close()
	key := ""
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 0, 64*1024), 4<<20)
	for sc.Scan() {
		var rec struct {
			Kind string `json:"kind"`
			Data struct {
				Session string `json:"session"`
				Source  string `json:"source"`
			} `json:"data"`
		}
		if json.Unmarshal(sc.Bytes(), &rec) != nil {
			continue
		}
		if rec.Kind != "session" || rec.Data.Session == "" || rec.Data.Source == "compact" {
			continue
		}
		key = rec.Data.Session
	}
	return key
}

// Arrived answers whether this is the actor's first pull of the session, and
// records that it has now happened. It answers true once and false after.
//
// A pull with no session is a pull with no engine running. It answers false,
// because nothing probed the machine and nothing knows what to reclaim from.
func Arrived(r Roots, session, actor string) bool {
	return ArrivedAs(r, session, actor, RoleWorker)
}

// ArrivedAs is Arrived with the queue the actor pulled on.
func ArrivedAs(r Roots, session, actor, role string) bool {
	if !Named(session) {
		return false
	}
	var seen bool
	_ = locked(arrivalPath(r), func() error { // the guard answers whether or not it can record the arrival
		a := loadArrivals(r)
		if a.Session != session {
			a = arrivals{Session: session}
		}
		if a.At == nil {
			a.At = map[string]int{}
		}
		if a.Roles == nil {
			a.Roles = map[string]string{}
		}
		a.Roles[actor] = orElse(role, RoleWorker)
		_, seen = a.At[actor]
		// EVERY PULL MOVES THE COUNT, whoever made it. That is what makes the
		// queue its own clock: a reviewer that has stopped falls behind because
		// somebody else is still pulling.
		a.Pulls++
		a.At[actor] = a.Pulls
		if !seen {
			a.Order = append(a.Order, actor)
		}
		saveArrivals(r, a)
		return nil
	})
	return !seen
}

// Named answers whether a session is one arrivals can be keyed by. A log that
// nothing has started yet has no name, and current is the file rather than a
// session, so neither can tell one run from another.
func Named(session string) bool { return session != "" && session != "current" }

// WHETHER A HOLDER IS STILL THERE IS NOT ASKED HERE ANY MORE. It was, and it was
// answered by how far the queue had moved since that actor last pulled, which is
// a proxy for a worker that stops BETWEEN tokens: one working inside a single
// long token pulls once and then says nothing to the queue for as long as the
// work takes. Gone is now the time since the holder's last call of any kind,
// which the record already carries. See HasGone in gone.go.

func loadArrivals(r Roots) arrivals {
	var a arrivals
	b, err := os.ReadFile(arrivalPath(r))
	if err != nil {
		return a
	}
	if json.Unmarshal(b, &a) != nil {
		return arrivals{}
	}
	return a
}

func saveArrivals(r Roots, a arrivals) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	b, err := json.MarshalIndent(a, "", "  ")
	if err != nil {
		return
	}
	_ = writeAtomic(arrivalPath(r), append(b, '\n'), 0o644) // the guard answers whether or not it can record the arrival
}

// Reclaim takes back what this actor was holding when it last stopped.
//
// AN ARRIVAL MEANS WHOEVER HELD THIS NAME BEFORE IS GONE. What they held is
// work nobody is doing, so the hold is cleared and the queue can hand it out
// again. The token is not moved: where it stands is the process's business,
// and only the hold was ever this function's.
func Reclaim(r Roots, actor string) []string {
	var back []string
	for _, t := range Tokens(r) {
		if t.Holder != actor || t.Ended() {
			continue
		}
		t.Holder = ""
		if err := SaveToken(r, t); err != nil {
			continue
		}
		back = append(back, t.ID)
		inSession(r, "work", actor, t.ID+" reclaimed: whoever held it is gone", Yes(),
			map[string]any{"id": t.ID})
	}
	return back
}

func reclaimNotice(back []string) string {
	if len(back) == 0 {
		return ""
	}
	return " Work left holding by whoever came before you is back in the queue: " +
		strings.Join(back, ", ") + "."
}
