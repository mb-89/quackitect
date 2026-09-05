package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// READ EVIDENCE, AND THE AGENTS THAT HOLD IT.
//
// What an agent has read is a fact about this session, so it is kept with the
// session and it is thrown away when the session's memory is. It is evidence,
// not permission: nothing here refuses anything yet.
//
// The set is reset after a compaction, because the agent no longer holds what
// it read. It is reset for one file when that file changes, because what was
// read is no longer what is there.

type Evidence struct {
	Reads  map[string]Read  `json:"reads"`
	Agents map[string]Agent `json:"agents"`
}

type Read struct {
	Actor string    `json:"actor"`
	Hash  string    `json:"hash"`
	At    time.Time `json:"at"`
	// Page is the range that was read, as offset:limit, so a second read of
	// another range of the same file is not the same read.
	Page string `json:"page,omitempty"`
	// Bytes is the size of the file when it was read, which is what a helper's
	// digest is measured against.
	Bytes int64 `json:"bytes,omitempty"`
}

type Agent struct {
	Kind  string    `json:"kind"`
	First time.Time `json:"first_seen"`

	// A SPEAKING NAME, because a hash in the actor column tells a reader
	// nothing. It is the kind and a number, so two reviewers are two names and
	// the reader can tell them apart.
	Name string `json:"name,omitempty"`

	// THE SESSION IT BELONGS TO, as the harness names it. Its end is what
	// takes out the helpers whose own stop never arrived.
	Session string `json:"session,omitempty"`

	// AND THE ENGINE'S OWN RUN, WHICH IS A DIFFERENT QUESTION. A register
	// outlives the run that filled it: a machine switched off mid-session
	// says no end for anybody, and every row would stay here for ever. So
	// what is present is what this run wrote, the same test the arrival
	// record already applies to an actor that pulled.
	//
	// IT IS THE ENGINE'S PROCESS AND NOT THE LOG'S SESSION. Those were one
	// thing until a swap made the successor continue the session, which is
	// right for the record and wrong for this: an agent registered hours
	// earlier stayed present for ever, and a fresh editor drew five workers
	// that had not existed since the night before. An agent that is still
	// here says so on its next call, which is at most one call away.
	Run string `json:"run,omitempty"`

	// WHEN IT WENT, and zero while it is here. The row is kept rather than
	// deleted, because the name is numbered from what has been named and a
	// deleted reviewer-1 would make the next helper a second reviewer-1.
	Gone time.Time `json:"gone,omitempty"`
}

func evidencePath(roots Roots) string { return roots.Private("evidence.json") }

func LoadEvidence(roots Roots) Evidence {
	e := Evidence{Reads: map[string]Read{}, Agents: map[string]Agent{}}
	b, err := os.ReadFile(evidencePath(roots))
	if err != nil {
		return e
	}
	// A file that cannot be read is an empty set. Evidence is never the
	// reason a machine stops working.
	var got Evidence
	if json.Unmarshal(b, &got) != nil {
		return e
	}
	if got.Reads == nil {
		got.Reads = map[string]Read{}
	}
	if got.Agents == nil {
		got.Agents = map[string]Agent{}
	}
	return got
}

func SaveEvidence(roots Roots, e Evidence) error {
	b, err := json.MarshalIndent(e, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(evidencePath(roots)), 0o755); err != nil {
		return err
	}
	return writeAtomic(evidencePath(roots), append(b, '\n'), 0o644)
}

// NoteRead records that an actor read a file, with what the file said at the
// time. The hash is what makes a later change detectable.
func NoteRead(roots Roots, actor, path string) { NoteReadPage(roots, actor, path, "") }

// NoteReadPage is NoteRead with the range that was read.
func NoteReadPage(roots Roots, actor, path, page string) {
	if path == "" {
		return
	}
	var size int64
	if info, err := os.Stat(path); err == nil {
		size = info.Size()
	}
	changeEvidence(roots, func(e *Evidence) {
		e.Reads[clean(path)] = Read{Actor: actor, Hash: hashFile(path), At: time.Now().UTC(), Page: page, Bytes: size}
	})
}

// BytesReadBy answers how much one actor has read this session, which is
// the denominator of a helper's compression ratio.
func BytesReadBy(roots Roots, actor string) int64 {
	var n int64
	for _, r := range LoadEvidence(roots).Reads {
		if r.Actor == actor {
			n += r.Bytes
		}
	}
	return n
}

// changeEvidence reads, changes and writes the store as one operation. Two
// guards recording two reads at once each wrote the whole store, and the
// second write took the first read with it.
func changeEvidence(roots Roots, change func(*Evidence)) {
	_ = locked(evidencePath(roots), func() error { // a read it cannot record is a read it asks about again
		e := LoadEvidence(roots)
		change(&e)
		return SaveEvidence(roots, e)
	})
}

// StaleReads names the files that were read and have changed since. What was
// read is no longer what is there.
func StaleReads(roots Roots) []string {
	e := LoadEvidence(roots)
	var out []string
	for path, r := range e.Reads {
		if hashFile(path) != r.Hash {
			out = append(out, path)
		}
	}
	sort.Strings(out)
	return out
}

// ForgetReads is what a compaction does. The agent no longer holds what it
// read, so the record of having read it is no longer true.
func ForgetReads(roots Roots, why string) int {
	var n int
	changeEvidence(roots, func(e *Evidence) {
		n = len(e.Reads)
		e.Reads = map[string]Read{}
	})
	return n
}

// ForgetRead drops one file, which is what a change to that file means.
func ForgetRead(roots Roots, path string) {
	changeEvidence(roots, func(e *Evidence) { delete(e.Reads, clean(path)) })
}

// NoteAgent records an identity the harness started. Level 0 does not invent
// identities and cannot check one: the harness says who is calling, and the
// agent does not write that field. What this layer guarantees is that every
// call carries one and that the record says which.
// Why is [[every-call-carries-an-identity]].
func NoteAgent(roots Roots, id, kind, session string) {
	if id == "" || id == "main" {
		return
	}
	changeEvidence(roots, func(e *Evidence) {
		was, seen := e.Agents[id]
		if !seen {
			e.Agents[id] = Agent{Kind: kind, First: time.Now().UTC(),
				Name: nextName(*e, kind), Session: session, Run: TheRunNow(roots)}
			return
		}
		// AN IDENTITY THAT ARRIVES AGAIN IS HERE AGAIN, and it keeps the name
		// it was given. Renaming it would put two names on one agent in one
		// record.
		was.Gone = time.Time{}
		was.Session, was.Run = session, TheRunNow(roots)
		e.Agents[id] = was
	})
}

// NoteSession registers the session itself, which is an agent like any other:
// it is the one the person is talking to.
//
// ITS NAME IS THE ONE THE RECORD ALREADY USES. Everything the main agent does
// is filed under main, so a register calling it session-1 would put a second
// name on it and nothing would join the two.
//
// AND AN ACTOR IS A SESSION, NOT A WORD. main is a word, and two sessions over
// one tree can both say it. TakeUp puts back everything else that actor holds,
// so every time one of them named a token the other's token left its hands,
// and the agent it left was refused its next write for holding nothing. So the
// session that is here first keeps main, any other is named apart from it, and
// the name a session is given is the name it keeps for as long as it is here.
func NoteSession(roots Roots, session string) {
	if session == "" {
		return
	}
	run := TheRunNow(roots)
	changeEvidence(roots, func(e *Evidence) {
		was, seen := e.Agents[session]
		if !seen {
			was = Agent{First: time.Now().UTC()}
		}
		// A SESSION KEEPS THE NAME IT WAS GIVEN. It is registered again on
		// every call the engine has not seen it make, and a name worked out
		// afresh each time would move under the tokens it already holds.
		if was.Name == "" {
			was.Name = aSessionName(*e, session, run)
		}
		was.Kind, was.Session, was.Gone = "session", session, time.Time{}
		was.Run = run
		e.Agents[session] = was
	})
}

// aSessionName is main where nobody here is main, and main with the id's short
// form after it where somebody is.
//
// THE FIRST SESSION KEEPS main, so one session over one tree reads exactly as
// it did and every name already written down goes on meaning what it meant.
//
// A COLLISION FALLS BACK TO THE WHOLE ID rather than to a second main, because
// two actors under one name is the defect this is about and a short form is
// short enough to repeat.
func aSessionName(e Evidence, session, run string) string {
	taken := map[string]bool{}
	for id, a := range e.Agents {
		if id != session && a.Name != "" && a.Gone.IsZero() && a.Run == run {
			taken[a.Name] = true
		}
	}
	if !taken["main"] {
		return "main"
	}
	if short := "main-" + theShortForm(session); !taken[short] {
		return short
	}
	return "main-" + session
}

// theShortForm is enough of an identity to tell two of them apart and short
// enough for a person to type. A letter or a digit is kept and everything else
// is dropped, because the name is typed on a command line and read in a table.
func theShortForm(id string) string {
	kept := strings.Map(func(r rune) rune {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			return r
		case r >= 'A' && r <= 'Z':
			return r + ('a' - 'A')
		}
		return -1
	}, id)
	if kept == "" {
		return "session"
	}
	if len(kept) > 8 {
		return kept[:8]
	}
	return kept
}

// TheSessionName is the name this session acts under, which is the name it was
// given when it was registered. A session nothing registered is main, because
// one session over one tree is what main has always meant.
func TheSessionName(roots Roots, session string) string {
	if session == "" {
		return "main"
	}
	if a, ok := LoadEvidence(roots).Agents[session]; ok && a.Name != "" {
		return a.Name
	}
	return "main"
}

// TheActorOf is the name the record uses for whoever is calling: the helper's
// name where the harness named one, and the session's own where it did not.
//
// THE SESSION IS NOT ASKED FOR BY A HASH. Every other identity the harness
// sends is an agent id, and the session sends none: it is the caller with no
// agent, so the session id is the only thing that tells two of them apart.
func TheActorOf(roots Roots, session, agent string) string {
	if agent == "" || agent == "main" {
		return TheSessionName(roots, session)
	}
	return NameOf(roots, agent)
}

// AgentSeen registers whoever is calling, if this run has not seen them.
//
// THE OWNER'S WORDS: it says there's nobody there, but that's not true.
// There's one agent running.
//
// A session outlives the engine. The battery restarts the engine on every
// run and a person's session goes on across it, so a register filled at
// SessionStart is empty after the first restart and stays empty until the
// next session. Every call carries the session and the agent it comes from,
// so presence is read off the calls: a caller this run has not registered
// is registered now, under the name it already has. The start events still
// register first, and the end events still take out.
func AgentSeen(roots Roots, session, id, kind string) {
	if session == "" {
		return
	}
	run := currentSession(roots)
	e := LoadEvidence(roots)
	if s, seen := e.Agents[session]; !seen || s.Run != run || !s.Gone.IsZero() {
		NoteSession(roots, session)
	}
	if id == "" || id == "main" {
		return
	}
	if a, seen := e.Agents[id]; !seen || a.Run != run || !a.Gone.IsZero() {
		NoteAgent(roots, id, kind, session)
	}
}

// HelpersGoneWith writes down that every helper of this session has gone,
// and leaves the session itself.
//
// THE HARNESS SAYS NOTHING WHEN A TURN IS INTERRUPTED, and SubagentStop
// reaches some helpers and not others: 36 of the 78 that had settled by
// 2026-09-04, and none of the seven an interrupt killed at 08:16 that day.
// So a helper closed only by its own stop is a helper the register keeps
// after it is gone. What it does say is when the
// session's turn ends and when its next prompt arrives, and a helper is a
// thing of one turn: it is spawned in it and it is dead by the next prompt,
// whether the turn ended or was cut. So the turn's end takes the helpers
// out, and one that goes on calling, as a background helper may, is
// registered again by its own call.
func HelpersGoneWith(roots Roots, session string) {
	if session == "" {
		return
	}
	// AND THE WORK GOES BACK WITH THEM. A sweep that marks a helper gone and
	// leaves its token held is the same defect by a second door: a stop reaches
	// some helpers and never others, so this is where most of them are collected.
	for id, a := range LoadEvidence(roots).Agents {
		if a.Session == session && id != session && a.Kind != "session" && a.Gone.IsZero() {
			PutDownWhatTheyHeld(roots, id)
		}
	}
	changeEvidence(roots, func(e *Evidence) {
		now := time.Now().UTC()
		for id, a := range e.Agents {
			if a.Session == session && id != session && a.Kind != "session" && a.Gone.IsZero() {
				a.Gone = now
				e.Agents[id] = a
			}
		}
	})
}

// AgentGone writes down that this identity has gone. A stop for an identity
// nothing started is ignored rather than recorded, because a row invented on
// the way out says an agent was here that never was.
func AgentGone(roots Roots, id string) {
	if id == "" {
		return
	}
	// WHAT IT HELD GOES BACK BEFORE IT DOES. A token held by an agent that no
	// longer exists is work the queue counts as in hand and hands to nobody, and
	// the panel draws a row for the holder, so the dead look busy. See
	// goneputsdown.go.
	PutDownWhatTheyHeld(roots, id)
	changeEvidence(roots, func(e *Evidence) {
		if a, seen := e.Agents[id]; seen && a.Gone.IsZero() {
			a.Gone = time.Now().UTC()
			e.Agents[id] = a
		}
	})
}

// AgentsGoneWith writes down that every agent of this session has gone, the
// session's own row among them.
//
// A HELPER'S STOP CAN GO MISSING and the session's end cannot: the harness
// says SubagentStop for a helper that finishes, and a helper killed with its
// session says nothing at all. So the session ending is what closes the rest,
// and without it the panel would hold a crowd that is gone.
func AgentsGoneWith(roots Roots, session string) {
	if session == "" {
		return
	}
	// AND THE HELPERS' WORK GOES BACK WITH THEM, by the third door. A helper
	// still alive when its session ends, with no turn end before it, kept what
	// it held: the queue counted that work as in hand and handed it to nobody
	// until the next engine start swept it. The other two doors that mark an
	// agent gone put down what it held first, and this one was left out.
	//
	// THE SESSION'S OWN HOLD IS LEFT ALONE. It holds its work across a restart
	// on purpose, so the put-down is for the helpers of the session only, which
	// is the filter HelpersGoneWith uses.
	for id, a := range LoadEvidence(roots).Agents {
		if a.Session == session && id != session && a.Kind != "session" && a.Gone.IsZero() {
			PutDownWhatTheyHeld(roots, id)
		}
	}
	changeEvidence(roots, func(e *Evidence) {
		now := time.Now().UTC()
		for id, a := range e.Agents {
			if a.Session == session && a.Gone.IsZero() {
				a.Gone = now
				e.Agents[id] = a
			}
		}
	})
}

// The next free name for this kind. Counting the ones already named means the
// second reviewer is reviewer-2 rather than a second reviewer-1.
func nextName(e Evidence, kind string) string {
	if kind == "" {
		kind = "agent"
	}
	kind = strings.ToLower(strings.ReplaceAll(kind, " ", "-"))
	n := 0
	for _, a := range e.Agents {
		if a.Kind == kind || strings.HasPrefix(a.Name, kind+"-") {
			n++
		}
	}
	return fmt.Sprintf("%s-%d", kind, n+1)
}

// NameOf answers what to call an agent in the record. An identity nobody
// started keeps its own name, because inventing one would hide that the
// harness named it something this program never saw.
func NameOf(roots Roots, id string) string {
	if id == "" || id == "main" {
		return "main"
	}
	if a, ok := LoadEvidence(roots).Agents[id]; ok && a.Name != "" {
		return a.Name
	}
	return id
}

// KnownAgent says whether this identity was started in this session. An
// unknown one is recorded and not refused: refusing would make a harness that
// names agents differently unusable, and the threat model here is a confused
// agent rather than a hostile one.
func KnownAgent(roots Roots, id string) bool {
	if id == "" || id == "main" {
		return true
	}
	_, ok := LoadEvidence(roots).Agents[id]
	return ok
}

func clean(p string) string {
	abs, err := filepath.Abs(p)
	if err != nil {
		return p
	}
	return filepath.Clean(abs)
}

func hashFile(path string) string {
	b, err := os.ReadFile(path)
	if err != nil {
		return "gone"
	}
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])[:16]
}
