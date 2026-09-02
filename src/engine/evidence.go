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
}

type Agent struct {
	Kind  string    `json:"kind"`
	First time.Time `json:"first_seen"`

	// A SPEAKING NAME, because a hash in the actor column tells a reader
	// nothing. It is the kind and a number, so two reviewers are two names and
	// the reader can tell them apart.
	Name string `json:"name,omitempty"`
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
func NoteRead(roots Roots, actor, path string) {
	if path == "" {
		return
	}
	e := LoadEvidence(roots)
	e.Reads[clean(path)] = Read{Actor: actor, Hash: hashFile(path), At: time.Now().UTC()}
	_ = SaveEvidence(roots, e) // a read it cannot record is a read it asks about again
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
	e := LoadEvidence(roots)
	n := len(e.Reads)
	e.Reads = map[string]Read{}
	_ = SaveEvidence(roots, e) // a read it cannot record is a read it asks about again
	return n
}

// ForgetRead drops one file, which is what a change to that file means.
func ForgetRead(roots Roots, path string) {
	e := LoadEvidence(roots)
	delete(e.Reads, clean(path))
	_ = SaveEvidence(roots, e) // a read it cannot record is a read it asks about again
}

// NoteAgent records an identity the harness started. Level 0 does not invent
// identities and cannot check one: the harness says who is calling, and the
// agent does not write that field. What this layer guarantees is that every
// call carries one and that the record says which.
func NoteAgent(roots Roots, id, kind string) {
	if id == "" || id == "main" {
		return
	}
	e := LoadEvidence(roots)
	if _, seen := e.Agents[id]; !seen {
		e.Agents[id] = Agent{Kind: kind, First: time.Now().UTC(), Name: nextName(e, kind)}
		_ = SaveEvidence(roots, e) // a read it cannot record is a read it asks about again
	}
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
