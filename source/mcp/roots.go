package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
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
	m, _ = filepath.Abs(m)
	return roots{method: m, work: w}
}

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
			if e.MethodRoot == "" {
				continue
			}
			if _, err := os.Stat(e.MethodRoot); err == nil {
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
	if out, err := ask(r, "--config"); err == nil {
		b.WriteString("\n")
		b.WriteString(strings.TrimSpace(out))
		b.WriteString("\n")
	} else {
		b.WriteString("\nthe engine could not be asked: " + err.Error() + "\n")
	}
	return b.String()
}

func or(s, fallback string) string {
	if s == "" {
		return fallback
	}
	return s
}

// note appends one line to the session that is running. The engine owns the
// format, so the stub asks it rather than writing the record itself.
func note(r roots, msg string) error {
	_, err := ask(r, "--note", msg)
	return err
}

func ask(r roots, args ...string) (string, error) {
	exe := filepath.Join(r.method, ".bin", "se")
	if isWindows() {
		exe += ".exe"
	}
	if _, err := os.Stat(exe); err != nil {
		return "", fmt.Errorf("no engine at %s", exe)
	}
	full := append([]string{"--work", r.work, "--method", r.method}, args...)
	out, err := runWithTimeout(exe, full, 10*time.Second)
	return out, err
}

// askWithInput is ask with a payload. The engine is found the same way. The
// arguments are passed exactly as given, because a subcommand has to be the
// first of them.
func askWithInput(r roots, args []string, in []byte, d time.Duration) (string, error) {
	exe := filepath.Join(r.method, ".bin", "se")
	if isWindows() {
		exe += ".exe"
	}
	if _, err := os.Stat(exe); err != nil {
		return "", fmt.Errorf("no engine at %s", exe)
	}
	return runWithInput(exe, args, in, d)
}
