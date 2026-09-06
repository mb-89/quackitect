package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// The stub finds its engine the way anything else does: through the register.
// Nothing is compiled in, and an entry that no longer resolves is skipped.
type roots struct{ method, work string }

type entry struct {
	MethodRoot string `json:"method_root"`
}

func findRoots() roots {
	w := *work
	if w == "" {
		w, _ = os.Getwd()
	}
	w, _ = filepath.Abs(w)

	m := *method
	if m == "" {
		m = fromRegister()
	}
	// THE STUB LIVES BESIDE ITS ENGINE. It is built into .bin under the method
	// root, so where this program is answers which engine it belongs to, and
	// that answer holds when the register names nothing usable. The register
	// held eighty entries left by a check, each a folder with no engine in it,
	// and the first of them was taken as the engine for every call.
	if m == "" {
		if exe, err := os.Executable(); err == nil {
			own := filepath.Dir(filepath.Dir(exe))
			if hasEngine(own) {
				m = own
			}
		}
	}
	m, _ = filepath.Abs(m)
	return roots{method: m, work: w}
}

// hasEngine says whether a method root has a built engine to ask.
func hasEngine(methodRoot string) bool {
	exe := filepath.Join(methodRoot, ".bin", "se")
	if isWindows() {
		exe += ".exe"
	}
	_, err := os.Stat(exe)
	return err == nil
}

// fromRegister answers the first entry with an engine in it. An entry that no
// longer resolves, or resolves to a folder with nothing built, is skipped:
// a folder that exists is not an engine that answers.
func fromRegister() string {
	dirs := splitList(os.Getenv("SE_REGISTRY"))
	if len(dirs) == 0 {
		if home, err := os.UserHomeDir(); err == nil {
			dirs = []string{filepath.Join(home, ".se")}
		}
	}
	for _, d := range dirs {
		b, err := os.ReadFile(filepath.Join(d, "registry.json"))
		if err != nil {
			continue
		}
		var entries []entry
		if json.Unmarshal(b, &entries) != nil {
			continue
		}
		for _, e := range entries {
			if e.MethodRoot != "" && hasEngine(e.MethodRoot) {
				return e.MethodRoot
			}
		}
	}
	return ""
}

func splitList(s string) []string {
	if s == "" {
		return nil
	}
	return strings.Split(s, string(os.PathListSeparator))
}

func logDir(r roots) string { return filepath.Join(r.work, ".se", "log") }

func status(r roots) string {
	var b strings.Builder
	fmt.Fprintf(&b, "method root: %s\n", or(r.method, "not found in the register"))
	fmt.Fprintf(&b, "work root:   %s\n", r.work)

	cur := filepath.Join(logDir(r), "session.jsonl")
	if st, err := os.Stat(cur); err == nil {
		fmt.Fprintf(&b, "log:         %s, %d bytes\n", cur, st.Size())
	} else {
		fmt.Fprintf(&b, "log:         %s, not written yet\n", cur)
	}

	// The rules in force are the engine's answer, not this program's opinion.
	b.WriteString("\n")
	b.WriteString(strings.TrimSpace(engineCall(r, []string{"config"}, nil)))
	b.WriteString("\n")
	// AND THE STATE OF PLAY, which carries what the engine returned this
	// session and how much of it was wrong. A reader gets the count here
	// without knowing a second command.
	b.WriteString("\n")
	b.WriteString(strings.TrimSpace(engineCall(r, []string{"state"}, nil)))
	b.WriteString("\n")
	return b.String()
}

func or(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

// said puts what the person said in the record, word for word. The engine owns
// the format, so the stub asks it rather than writing the record itself.
func said(r roots, msg string) error {
	return recorded(engineCall(r, []string{"said", "--text", msg}, nil))
}

// answered puts the agent's answer in the record beside the prompt it answers.
func answered(r roots, msg string) error {
	return recorded(engineCall(r, []string{"answer", "--text", msg}, nil))
}

// recorded reads the record verbs' one-word answer, and anything else as
// the reason it was not recorded.
func recorded(said string) error {
	if strings.Contains(said, "recorded") {
		return nil
	}
	return fmt.Errorf("%s", strings.TrimSpace(said))
}
