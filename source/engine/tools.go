package main

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// WHAT THE MACHINE HAS.
//
// An agent told it may write a helper script will write one, and it will write
// it in whatever language it assumes is there. On this machine that assumption
// was python and it happened to hold. On the next machine it is uv, or node,
// or nothing at all.
//
// So the engine asks rather than assuming, once per boot, by running each
// candidate and keeping the ones that answer. Probing is mechanical and needs
// no judgement, which is why it is here and not above.
//
// THE CANDIDATES ARE DATA, in util/tools.json. The argument differs per tool,
// because go prints its version without dashes and nothing can be inferred
// from a name. Adding a tool is a line in a file.

type Candidate struct {
	Name string   `json:"name"`
	Args []string `json:"args"`
	For  string   `json:"for"`
}

type Tool struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Version string `json:"version"`
	For     string `json:"for"`
}

type Probe struct {
	Session string `json:"session"`
	At      string `json:"at"`
	Found   []Tool `json:"found"`
}

func probePath(r Roots) string { return r.Private("tools.json") }

// A probe that hangs holds up the boot, and a boot that is slow is one a
// person stops using. Two seconds is more than any of these needs to print a
// version, and they run at the same time.
const probeWait = 2 * time.Second

func LoadCandidates(methodRoot string) ([]Candidate, error) {
	b, err := os.ReadFile(filepath.Join(methodRoot, "util", "tools.json"))
	if err != nil {
		return nil, err
	}
	var f struct {
		Tools []Candidate `json:"tools"`
	}
	if err := json.Unmarshal(b, &f); err != nil {
		return nil, err
	}
	return f.Tools, nil
}

// ProbeTools runs every candidate and writes what answered. It never fails a
// boot: a candidate that is missing is the ordinary case, and a rules file
// that will not read leaves the list empty rather than stopping the engine.
func ProbeTools(r Roots, session string) Probe {
	p := Probe{Session: session, At: now()}
	cands, err := LoadCandidates(r.Method)
	if err != nil {
		return p
	}
	var mu sync.Mutex
	var wg sync.WaitGroup
	for _, c := range cands {
		wg.Add(1)
		go func(c Candidate) {
			defer wg.Done()
			t, ok := ask1(c)
			if !ok {
				return
			}
			mu.Lock()
			p.Found = append(p.Found, t)
			mu.Unlock()
		}(c)
	}
	wg.Wait()
	sort.Slice(p.Found, func(i, j int) bool { return p.Found[i].Name < p.Found[j].Name })
	writeProbe(r, p)
	return p
}

// A tool is present when it is on the path and it answers. Both have to hold:
// a name that resolves and then refuses to run is not a tool anyone can use.
func ask1(c Candidate) (Tool, bool) {
	path, err := exec.LookPath(c.Name)
	if err != nil {
		return Tool{}, false
	}
	ctx, cancel := context.WithTimeout(context.Background(), probeWait)
	defer cancel()
	out, err := exec.CommandContext(ctx, path, c.Args...).CombinedOutput()
	if err != nil {
		return Tool{}, false
	}
	return Tool{Name: c.Name, Path: path, Version: strings.TrimSpace(firstLine(string(out))), For: c.For}, true
}

func writeProbe(r Roots, p Probe) {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return
	}
	b, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(probePath(r), append(b, '\n'), 0o644)
}

func LoadProbe(r Roots) (Probe, bool) {
	var p Probe
	b, err := os.ReadFile(probePath(r))
	if err != nil {
		return p, false
	}
	if json.Unmarshal(b, &p) != nil {
		return p, false
	}
	return p, true
}

// KnownTools is what this boot found. Who has already been told is not asked
// here: an arrival is the one thing that decides it, and arrivals are recorded
// in one place for every fact that keys off them.
//
// A probe from an earlier session is ignored. The machine may have changed,
// and a stale answer about what exists is worse than none.
func KnownTools(r Roots, session string) []Tool {
	p, ok := LoadProbe(r)
	if !ok || p.Session != session {
		return nil
	}
	return p.Found
}
