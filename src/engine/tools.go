package main

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
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
// person stops using. They run at the same time, so the boot pays for the
// slowest one. Two seconds was more than any of them needs to print a
// version on a quiet machine, and under the battery's load go version took
// longer and the first pull carried no tools. Ten is the bound of a hang,
// not the cost of a boot.
const probeWait = 10 * time.Second

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
			t, ok := askOne(c)
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
func askOne(c Candidate) (Tool, bool) {
	path, err := exec.LookPath(c.Name)
	if err != nil {
		return Tool{}, false
	}
	ctx, cancel := context.WithTimeout(context.Background(), probeWait)
	defer cancel()
	out, err := quiet.Quietly(exec.CommandContext(ctx, path, c.Args...)).CombinedOutput()
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
	_ = writeAtomic(probePath(r), append(b, '\n'), 0o644) // a probe it cannot remember is run again
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

// PathWithTools prepends the directory of every probed tool to PATH in the
// given environment, so a command through the engine resolves what the probe
// found without exporting anything by hand. The parent's entries stay, after
// the probe's, so the copy the probe answered is the copy that runs.
func PathWithTools(env []string, found []Tool) []string {
	var dirs []string
	seen := map[string]bool{}
	for _, t := range found {
		d := filepath.Dir(t.Path)
		if d == "." || d == "" || seen[strings.ToLower(d)] {
			continue
		}
		seen[strings.ToLower(d)] = true
		dirs = append(dirs, d)
	}
	if len(dirs) == 0 {
		return env
	}
	sep := string(os.PathListSeparator)
	prefix := strings.Join(dirs, sep)
	out := make([]string, 0, len(env)+1)
	donePath := false
	for _, e := range env {
		if k, v, ok := strings.Cut(e, "="); ok && strings.EqualFold(k, "PATH") && !donePath {
			out = append(out, k+"="+prefix+sep+v)
			donePath = true
			continue
		}
		out = append(out, e)
	}
	if !donePath {
		out = append(out, "PATH="+prefix)
	}
	return out
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
