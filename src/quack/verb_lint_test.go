// The lint verb reads the tools, the sweep and the box over the paths named,
// prints the count a rule first and the finding lines last, logs one row, and
// exits 1 on a finding at error alone.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
)

// A finding at the severity named. [[spec/tickets/read-verbs-port-to-go]]
func lintRow(file, rule, severity string) check.Finding {
	return check.Finding{File: file, Rule: rule, Line: 2, Column: 3, Message: rule + " says", Severity: severity}
}

// The doors over a root holding the files named, the rows each source answers, and the log rows the lint writes. [[spec/tickets/read-verbs-port-to-go]]
type lintFake struct {
	tools, swept, box []check.Finding
	sweepFault        error
	asked             [][]string
	rows              []map[string]any
}

func (fake *lintFake) verb(t *testing.T, files map[string]string) twin {
	t.Helper()
	root := t.TempDir()
	for at, text := range files {
		path := filepath.Join(root, filepath.FromSlash(at))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return lintVerb(func() (lintDoors, error) {
		return lintDoors{
			root: root,
			tools: func(where []string) []check.Finding {
				fake.asked = append(fake.asked, where)
				return fake.tools
			},
			sweep: func() ([]check.Finding, error) { return fake.swept, fake.sweepFault },
			box:   func() []check.Finding { return fake.box },
			log: func(row map[string]any) error {
				fake.rows = append(fake.rows, row)
				return nil
			},
			now: func() time.Time { return logNow },
		}, nil
	})
}

// A row below the floor reaches no writer, a row at or past it does, and no floor reads as info. [[spec/design_output/log#which-kind-says-what]]
func TestLintRowKeepsFloor(t *testing.T) {
	for _, one := range []struct {
		floor, level string
		writes       bool
	}{{"info", "debug", false}, {"info", "warn", true}, {"debug", "debug", true}, {"", "debug", false}, {"", "info", true}} {
		wrote := 0
		say := keepsFloor(one.floor, func(map[string]any) error { wrote++; return nil })
		if err := say(map[string]any{"level": one.level}); err != nil || (wrote == 1) != one.writes {
			t.Fatalf("a %s row over the floor %q writes %d time(s), and wants %v", one.level, one.floor, wrote, one.writes)
		}
	}
}

func TestLintVerb(t *testing.T) {
	t.Run("the rules passing print one line, exit 0 and log at debug", func(t *testing.T) {
		fake := &lintFake{}
		code, out, _ := runsTwin(fake.verb(t, nil), "lint")
		if code != 0 || out != "The rules pass.\n" || len(fake.rows) != 1 || fake.rows[0]["level"] != "debug" || fake.rows[0]["said"] != "the rules pass over ." {
			t.Fatalf("lint answers %d, %q, logs %v, and wants the pass at debug", code, out, fake.rows)
		}
	})
	t.Run("warnings print the count a rule first and the lines last, exit 0 and log at warn", func(t *testing.T) {
		fake := &lintFake{
			tools: []check.Finding{lintRow("a.md", "Sentence", check.SeverityWarning)},
			swept: []check.Finding{lintRow("b.md", "Passive", check.SeverityWarning), lintRow("c.md", "Passive", check.SeverityWarning)},
		}
		code, out, _ := runsTwin(fake.verb(t, nil), "lint")
		want := strings.Join([]string{
			"     2  Passive", "     1  Sentence", "     3  in all", "",
			"3 stand at warning. They stand in the Problems panel, and the push waits until the panel stands clear.", "",
			"a.md:2:3: Sentence: Sentence says", "b.md:2:3: Passive: Passive says", "c.md:2:3: Passive: Passive says", "",
		}, "\n")
		if code != 0 || out != want {
			t.Fatalf("lint answers %d, %q, and wants %q", code, out, want)
		}
		if row := fake.rows[0]; row["level"] != "warn" || row["said"] != "3 line(s) break a rule" || row["detail"] != "a.md:2 Sentence, b.md:2 Passive, c.md:2 Passive" {
			t.Fatalf("lint logs %v, and wants the warn row naming the first rows", row)
		}
	})
	t.Run("a finding at error exits 1 and names no warning note", func(t *testing.T) {
		fake := &lintFake{tools: []check.Finding{lintRow("a.go", "FileCeiling", check.SeverityError)}}
		code, out, _ := runsTwin(fake.verb(t, nil), "lint")
		if code != exitFailed || strings.Contains(out, "stand at warning") || !strings.HasSuffix(out, "a.go:2:3: FileCeiling: FileCeiling says\n") {
			t.Fatalf("lint answers %d, %q, and wants 1 ending on the finding", code, out)
		}
	})
	t.Run("the paths named reach the tools, and the sweep and the box keep the rows under them", func(t *testing.T) {
		fake := &lintFake{
			swept: []check.Finding{lintRow("spec/a.md", "Kept", check.SeverityWarning), lintRow("src/b.go", "Gone", check.SeverityWarning)},
			box:   []check.Finding{lintRow(".se/.runtime/tools.json", lintBox, check.SeverityError)},
		}
		code, out, _ := runsTwin(fake.verb(t, map[string]string{"spec/a.md": "a\n"}), "lint", "spec", "gone/folder")
		if code != 0 || strings.Join(fake.asked[0], " ") != "spec" || !strings.Contains(out, "Kept") || strings.Contains(out, "Gone") || strings.Contains(out, lintBox) {
			t.Fatalf("lint answers %d, %q, asks the tools over %v, and wants spec alone", code, out, fake.asked)
		}
	})
	t.Run("the box decides the survey rule, and the sweep's row of it leaves", func(t *testing.T) {
		fake := &lintFake{
			swept: []check.Finding{lintRow("x", lintBox, check.SeverityError)},
			box:   []check.Finding{lintRow("y", lintBox, check.SeverityError)},
		}
		_, out, _ := runsTwin(fake.verb(t, nil), "lint")
		if strings.Contains(out, "x:2") || !strings.Contains(out, "y:2") {
			t.Fatalf("lint prints %q, and wants the box's row alone", out)
		}
	})
	t.Run("a closed ticket's rows leave, and an open one's stay", func(t *testing.T) {
		fake := &lintFake{swept: []check.Finding{
			lintRow("spec/tickets/shut.md", "Shut", check.SeverityWarning),
			lintRow("spec/tickets/open.md", "Open", check.SeverityWarning),
		}}
		_, out, _ := runsTwin(fake.verb(t, map[string]string{
			"spec/tickets/shut.md": "---\nstate: closed\n---\n",
			"spec/tickets/open.md": "---\nstate: open\n---\n",
		}), "lint")
		if strings.Contains(out, "Shut") || !strings.Contains(out, "Open") {
			t.Fatalf("lint prints %q, and wants the open ticket's row alone", out)
		}
	})
	t.Run("Vale failing stops the lint with its fault", func(t *testing.T) {
		fake := &lintFake{tools: []check.Finding{{Rule: lsp.ValeRuns, Message: "Vale stands nowhere here."}}}
		code, out, errs := runsTwin(fake.verb(t, nil), "lint")
		if code != exitFailed || out != "" || !strings.Contains(errs, "Vale stands nowhere here.\nVale read no file") {
			t.Fatalf("lint answers %d, %q, %q, and wants the Vale fault", code, out, errs)
		}
	})
	t.Run("no sweep stops the lint with its fault", func(t *testing.T) {
		fake := &lintFake{sweepFault: errors.New("no door")}
		code, _, errs := runsTwin(fake.verb(t, nil), "lint")
		if code != exitFailed || !strings.Contains(errs, "quack answers no check sweep") {
			t.Fatalf("lint answers %d, %q, and wants the sweep fault", code, errs)
		}
	})
	t.Run("a path the disk holds nowhere passes the rules and asks no tool", func(t *testing.T) {
		fake := &lintFake{}
		if code, out, _ := runsTwin(fake.verb(t, nil), "lint", "gone.md"); code != 0 || out != "The rules pass.\n" || len(fake.asked) != 0 {
			t.Fatalf("lint answers %d, %q, asks %v, and wants the pass with no tool", code, out, fake.asked)
		}
	})
}
