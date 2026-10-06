// The log verb reads the session file and the rotated files a span reaches,
// narrows the rows by span, level, kind, words and count, prints them the way
// the window does, and appends one row under --say.
// [[spec/design_output/log#one-verb-reads-the-log]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// The moment every case reads as now. [[spec/design_output/log#one-verb-reads-the-log]]
var logNow = time.Date(2026, 10, 4, 12, 0, 0, 0, time.UTC)

// A root holding the files named under it, and the log verb over it at the case's now. [[spec/design_output/log#one-verb-reads-the-log]]
func logOver(t *testing.T, files map[string]string) (string, twin) {
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
	return root, logVerb(func() (logDoors, error) {
		return logDoors{root: root, now: func() time.Time { return logNow }, disk: realDisk()}, nil
	})
}

// One line of the log, stamped minutes before the case's now. [[spec/design_output/log#one-verb-reads-the-log]]
func logRow(minutes int, level, kind, said string) string {
	at := logNow.Add(-time.Duration(minutes) * time.Minute).Format(logStamp)
	return `{"at":"` + at + `","level":"` + level + `","kind":"` + kind + `","said":"` + said + `"}` + "\n"
}

// The words of each printed row, in order. [[spec/design_output/log#one-verb-reads-the-log]]
func saidIn(out string) []string {
	said := []string{}
	for _, line := range strings.Split(strings.TrimSpace(out), "\n") {
		if fields := strings.Fields(line); len(fields) > 0 {
			said = append(said, fields[len(fields)-1])
		}
	}
	return said
}

func TestLogVerb(t *testing.T) {
	t.Parallel()
	session := logRow(120, "info", "tool", "early") + logRow(30, "warn", "vale", "middle") + logRow(5, "error", "tool", "late")
	cases := []struct {
		name, argv, want string
	}{
		{"a span keeps the rows stamped inside it", "log --since 1h", "middle late"},
		{"a level keeps that level and every one above it", "log --level warn", "middle late"},
		{"a kind keeps the rows of that kind alone", "log --kind tool", "early late"},
		{"a count keeps the last rows", "log --last 2", "middle late"},
		{"a count past the rows keeps them all", "log --last 9", "early middle late"},
		{"words keep the rows carrying every one, in any case", "log --words VALE middle", "middle"},
		{"no words keep every row", "log", "early middle late"},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			_, log := logOver(t, map[string]string{sessionLog: session})
			code, out, _ := runsTwin(log, strings.Fields(one.argv)...)
			if got := strings.Join(saidIn(out), " "); code != 0 || got != one.want {
				t.Fatalf("%s answers %d, %q, and wants %s", one.argv, code, got, one.want)
			}
		})
	}
	t.Run("a row prints its clock, level and kind padded, and its other fields under it in key order", func(t *testing.T) {
		_, log := logOver(t, map[string]string{sessionLog: `{"at":"2026-10-04T11:55:00.123Z","level":"info","kind":"vale","said":"the rules pass","ms":5,"detail":"a.md:1 R"}` + "\n"})
		_, out, _ := runsTwin(log, "log")
		want := "11:55:00.123 info  vale   the rules pass\n             detail=a.md:1 R ms=5\n"
		if out != want {
			t.Fatalf("log prints %q, and wants %q", out, want)
		}
	})
	t.Run("a count prints one row a kind, the most first", func(t *testing.T) {
		_, log := logOver(t, map[string]string{sessionLog: session})
		if _, out, _ := runsTwin(log, "log", "--count"); out != "2  tool\n1  vale\n" {
			t.Fatalf("log --count prints %q", out)
		}
	})
	t.Run("a torn line drops alone, and the rows around it read", func(t *testing.T) {
		_, log := logOver(t, map[string]string{sessionLog: logRow(3, "info", "tool", "before") + "{\"at\":\n" + logRow(2, "info", "tool", "after")})
		if _, out, _ := runsTwin(log, "log"); strings.Join(saidIn(out), " ") != "before after" {
			t.Fatalf("log prints %q, and wants before and after", out)
		}
	})
	t.Run("a span opens every rotated file it reaches and the newest one before it, in the order they stand", func(t *testing.T) {
		_, log := logOver(t, map[string]string{
			logOld + "/2026-10-03T00-00-00-a1.jsonl": logRow(36*60, "info", "tool", "gone"),
			logOld + "/2026-10-04T10-00-00-b2.jsonl": logRow(119, "info", "tool", "before"),
			logOld + "/2026-10-04T11-30-00-c3.jsonl": logRow(29, "info", "tool", "inside"),
			sessionLog:                               logRow(1, "info", "tool", "now"),
		})
		if _, out, _ := runsTwin(log, "log", "--since", "2h"); strings.Join(saidIn(out), " ") != "before inside now" {
			t.Fatalf("log --since 2h prints %q, and wants before, inside and now", out)
		}
	})
	t.Run("no file says no log stands", func(t *testing.T) {
		_, log := logOver(t, map[string]string{})
		if code, out, _ := runsTwin(log, "log"); code != 0 || strings.TrimSpace(out) != noLog {
			t.Fatalf("log answers %d, %q, and wants the no-log line", code, out)
		}
	})
	t.Run("help prints the usage", func(t *testing.T) {
		_, log := logOver(t, map[string]string{})
		if _, out, _ := runsTwin(log, "log", "--help"); !strings.HasPrefix(out, "Usage: ./RUNME.sh log [flags]\n\n") || !strings.Contains(out, "--say <row>") {
			t.Fatalf("log --help prints %q", out)
		}
	})
}

// A span reads its count in minutes, hours or days, and words naming no span read none. [[spec/design_output/log#one-verb-reads-the-log]]
func TestLogSpanSeconds(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]int64{"5m": 300, "2h": 7200, "1d": 86400, " 3 h ": 10800, "soon": 0} {
		if got := spanOf(said); got != want {
			t.Fatalf("spanOf(%q) reads %d seconds, and %d stand", said, got, want)
		}
	}
}

func TestLogVerbSays(t *testing.T) {
	t.Parallel()
	t.Run("say appends one row and keeps the rows another writer lands", func(t *testing.T) {
		root, log := logOver(t, map[string]string{sessionLog: logRow(1, "info", "tool", "theirs")})
		code, _, _ := runsTwin(log, "log", "--say", `{"level":"warn","kind":"side","said":"  two\n  lines ","extra":{"level":"x","ms":3,"detail":"`+strings.Repeat("d", 130)+`"}}`)
		text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(sessionLog)))
		lines := strings.Split(strings.TrimSpace(string(text)), "\n")
		want := `{"at":"2026-10-04T12:00:00.000Z","level":"warn","kind":"side","said":"two lines","ms":3,"detail":"` + strings.Repeat("d", logDetailCap) + `"}`
		if code != 0 || len(lines) != 2 || !strings.Contains(lines[0], "theirs") || lines[1] != want {
			t.Fatalf("log --say answers %d and leaves %q, and wants %s after the row standing", code, lines, want)
		}
	})
	t.Run("a level the ladder holds nowhere reads as info, and a reply keeps its lines", func(t *testing.T) {
		root, log := logOver(t, map[string]string{})
		runsTwin(log, "log", "--say", `{"level":"loud","kind":"reply","said":" a\nb "}`)
		text, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(sessionLog)))
		if want := `{"at":"2026-10-04T12:00:00.000Z","level":"info","kind":"reply","said":"a\nb"}` + "\n"; string(text) != want {
			t.Fatalf("log --say leaves %q, and wants %q", text, want)
		}
	})
	t.Run("a row no JSON reads exits 2 and writes nothing", func(t *testing.T) {
		root, log := logOver(t, map[string]string{})
		code, _, errs := runsTwin(log, "log", "--say", "{torn")
		if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(sessionLog))); code != exitUsage || !strings.Contains(errs, "takes one JSON row") || err == nil {
			t.Fatalf("log --say answers %d, %q, the file stands %v, and wants 2 and no file", code, errs, err == nil)
		}
	})
}
