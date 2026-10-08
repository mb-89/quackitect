// The log verb reads the session file and the rotated files a span reaches,
// narrows the rows by span, level, kind, words and count, prints them the way
// the window does, and appends one row under --say.
// [[spec/design_output/log#one-verb-reads-the-log]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"io"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
)

// The moment every case reads as now. [[spec/design_output/log#one-verb-reads-the-log]]
var logNow = time.Date(2026, 10, 4, 12, 0, 0, 0, time.UTC)

// A root holding the files named under it, and the log verb over it at the case's now. [[spec/design_output/log#one-verb-reads-the-log]]
func logOver(t *testing.T, files map[string]string) (diskDoors, twin) {
	t.Helper()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, files)
	if err := disk.makeAll(root, 0o755); err != nil {
		t.Fatal(err)
	}
	return disk, logVerb(func() (logDoors, error) {
		return logDoors{root: root, now: func() time.Time { return logNow }, disk: disk}, nil
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
		disk, log := logOver(t, map[string]string{sessionLog: logRow(1, "info", "tool", "theirs")})
		code, _, _ := runsTwin(log, "log", "--say", `{"level":"warn","kind":"side","said":"  two\n  lines ","extra":{"level":"x","ms":3,"detail":"`+strings.Repeat("d", 130)+`"}}`)
		text := disk.text(filepath.Join("/tree", filepath.FromSlash(sessionLog)))
		lines := strings.Split(strings.TrimSpace(text), "\n")
		want := `{"at":"2026-10-04T12:00:00.000Z","level":"warn","kind":"side","said":"two lines","ms":3,"detail":"` + strings.Repeat("d", logDetailCap) + `"}`
		if code != 0 || len(lines) != 2 || !strings.Contains(lines[0], "theirs") || lines[1] != want {
			t.Fatalf("log --say answers %d and leaves %q, and wants %s after the row standing", code, lines, want)
		}
	})
	t.Run("a level the ladder holds nowhere reads as info, a reply keeps its lines, and the bridgehead's row keeps its event and its detail", func(t *testing.T) {
		for row, want := range map[string]string{
			`{"level":"loud","kind":"reply","said":" a\nb "}`: `"level":"info","kind":"reply","said":"a\nb"}`,
			`{"level":"warn","kind":"bridge","said":"the server answers nothing at tool.call","extra":{"event":"tool.call","detail":"fetch failed"}}`: `"level":"warn","kind":"bridge","said":"the server answers nothing at tool.call","event":"tool.call","detail":"fetch failed"}`,
		} {
			disk, log := logOver(t, map[string]string{})
			code, _, _ := runsTwin(log, "log", "--say", row)
			if text := disk.text(filepath.Join("/tree", filepath.FromSlash(sessionLog))); code != 0 || text != `{"at":"2026-10-04T12:00:00.000Z",`+want+"\n" {
				t.Fatalf("log --say answers %d and leaves %q, and wants %q", code, text, want)
			}
		}
	})
	t.Run("a row no JSON reads exits 2 and writes nothing", func(t *testing.T) {
		disk, log := logOver(t, map[string]string{})
		code, _, errs := runsTwin(log, "log", "--say", "{torn")
		if stands := disk.stands(filepath.Join("/tree", filepath.FromSlash(sessionLog))); code != exitUsage || !strings.Contains(errs, "takes one JSON row") || stands {
			t.Fatalf("log --say answers %d, %q, the file stands %v, and wants 2 and no file", code, errs, stands)
		}
	})
}

// The log verb takes an array alone, so a log holding no row answers an empty one. [[spec/tickets/log-shadow-reads-unfiltered-rows]]
func TestLogAnswersAnEmptyArrayForNoRow(t *testing.T) {
	t.Parallel()
	said, err := json.Marshal(logRows(""))
	if err != nil || string(said) != "[]" {
		t.Fatalf("no row reads %s, %v, and wants []", said, err)
	}
}

// An ask recording the words it takes and answering the value or the fault it holds. [[spec/tickets/read-verbs-port-to-go]]
func askHolding(said any, fault error, asked *[][]string) asker {
	return func(argv ...string) (any, error) {
		*asked = append(*asked, argv)
		return said, fault
	}
}

// Runs a twin over the words, and answers its code, its output and its error stream. [[spec/tickets/read-verbs-port-to-go]]
func runsTwin(one twin, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := one(argv, false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestIndexVerb(t *testing.T) {
	t.Parallel()
	t.Run("no words ask standing, and the answer prints indented", func(t *testing.T) {
		asked := [][]string{}
		code, out, _ := runsTwin(indexVerb(askHolding(map[string]any{"port": 1}, nil, &asked)), "index")
		if code != 0 || out != "{\n  \"port\": 1\n}\n" || len(asked) != 1 || strings.Join(asked[0], " ") != "standing" {
			t.Fatalf("index answers %d, %q, asked %v, and wants standing printed indented", code, out, asked)
		}
	})
	t.Run("the words pass to the index whole, and why prints the answer's text, as se-index prints it", func(t *testing.T) {
		asked := [][]string{}
		runsTwin(indexVerb(askHolding([]any{}, nil, &asked)), "index", "call", "value", "{}")
		code, out, _ := runsTwin(indexVerb(askHolding(map[string]any{"text": "a\n└ b"}, nil, &asked)), "index", "why", "a")
		if strings.Join(asked[0], " ") != "call value {}" || code != 0 || out != "a\n└ b\n" {
			t.Fatalf("index asks %v, and why answers %d, %q", asked, code, out)
		}
	})
	t.Run("a fault prints on the error stream and exits 1", func(t *testing.T) {
		code, out, errs := runsTwin(indexVerb(askHolding(nil, errors.New("no door"), &[][]string{})), "index")
		if code != exitFailed || out != "" || !strings.Contains(errs, "no door") {
			t.Fatalf("index answers %d, %q, %q, and wants the fault on the error stream", code, out, errs)
		}
	})
}

func TestNotesVerb(t *testing.T) {
	t.Parallel()
	asked := [][]string{}
	if code, _, _ := runsTwin(notesVerb(askHolding([]any{}, nil, &asked)), "notes", "verb", "5"); code != 0 || strings.Join(asked[0], " ") != "notes verb 5" {
		t.Fatalf("notes answers %d and asks %v, and wants notes verb 5", code, asked)
	}
}

func TestLinksVerb(t *testing.T) {
	t.Parallel()
	for _, one := range []struct{ argv, want string }{
		{"links spec/guidance/working", "links spec/guidance/working"},
		{"links", "dangling"},
	} {
		asked := [][]string{}
		if code, _, _ := runsTwin(linksVerb(askHolding([]any{}, nil, &asked)), strings.Fields(one.argv)...); code != 0 || strings.Join(asked[0], " ") != one.want {
			t.Fatalf("%s answers %d and asks %v, and wants %s", one.argv, code, asked, one.want)
		}
	}
}

func TestFindVerb(t *testing.T) {
	t.Parallel()
	asked, logged := [][]string{}, [][]string{}
	find := findVerb(askHolding([]any{}, nil, &asked), logRecording(&logged))
	if code, _, _ := runsTwin(find, "find", "verb registry"); code != 0 || strings.Join(asked[0], " ") != "find verb registry" || len(logged) != 0 {
		t.Fatalf("find answers %d, asks %v and logs %v, and wants the index alone", code, asked, logged)
	}
	if code, _, _ := runsTwin(find, "find", "lint", "--log", "pass"); code != 0 || len(asked) != 1 || strings.Join(logged[0], "|") != "log|--words|lint pass" {
		t.Fatalf("find answers %d, asks %v and logs %v, and wants log --words lint pass", code, asked, logged)
	}
}

// A log twin recording the words it takes. [[spec/design_output/log#one-verb-reads-the-log]]
func logRecording(logged *[][]string) twin {
	return func(argv []string, _ bool, _, _ io.Writer) int {
		*logged = append(*logged, argv)
		return 0
	}
}

func TestTheSweepVerbPrintsTheSettledSweep(t *testing.T) {
	t.Parallel()
	var asked []string
	var out strings.Builder
	rows := []any{map[string]any{"file": "spec/a.md", "rule": "DeadAnchor", "line": 1}}
	err := sweeps(&out, func(argv ...string) (any, error) {
		asked = argv
		return rows, nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if strings.Join(asked, " ") != "value check/sweep" {
		t.Fatalf("the verb asks %v, and wants the settled value of check/sweep", asked)
	}
	if out.String() != `[{"file":"spec/a.md","line":1,"rule":"DeadAnchor"}]`+"\n" {
		t.Fatalf("the verb prints %q", out.String())
	}
}

// An empty sweep prints an empty list, and an index fault reaches the caller. [[spec/tickets/the-lsp-server-leaves]]
func TestAnEmptySweepPrintsAnEmptyListAndAFaultReachesTheCaller(t *testing.T) {
	t.Parallel()
	for fault, want := range map[error]string{nil: "[]\n", errors.New("down"): ""} {
		var out strings.Builder
		if err := sweeps(&out, func(...string) (any, error) { return nil, fault }); (err == nil) != (fault == nil) || out.String() != want {
			t.Fatalf("a sweep over %v prints %q and answers %v", fault, out.String(), err)
		}
	}
}

// A finding at the severity named. [[spec/tickets/read-verbs-port-to-go]]
func lintRow(file, rule, severity string) check.Finding {
	return check.Finding{File: file, Rule: rule, Line: 2, Column: 3, Message: rule + " says", Severity: severity}
}

// The doors over a root holding the files named, the rows each source answers, and the log rows the lint writes. [[spec/tickets/read-verbs-port-to-go]]
type lintFake struct {
	tools, swept, box []check.Finding
	sweepFault        error
	changed           []string
	left              []lintFound
	asked             [][]string
	rows              []map[string]any
}

func (fake *lintFake) verb(t *testing.T, files map[string]string) twin {
	t.Helper()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, files)
	return lintVerb(func() (lintDoors, error) {
		return lintDoors{
			root: root,
			tools: func(where []string) []check.Finding {
				fake.asked = append(fake.asked, where)
				return fake.tools
			},
			sweep:   func() ([]check.Finding, error) { return fake.swept, fake.sweepFault },
			box:     func() []check.Finding { return fake.box },
			changed: func(func(string)) []string { return fake.changed },
			leave: func(found lintFound) error {
				fake.left = append(fake.left, found)
				return nil
			},
			log: func(row map[string]any) error {
				fake.rows = append(fake.rows, row)
				return nil
			},
			now:  func() time.Time { return logNow },
			disk: disk,
		}, nil
	})
}

// A row below the floor reaches no writer, a row at or past it does, and no floor reads as info. [[spec/design_output/log#which-kind-says-what]]
func TestLintRowKeepsFloor(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
	t.Run("the rules passing print one line, exit 0 and log at debug", func(t *testing.T) {
		fake := &lintFake{}
		code, out, _ := runsTwin(fake.verb(t, nil), "lint")
		if code != 0 || out != "The rules pass.\n" || len(fake.rows) != 1 || fake.rows[0]["level"] != "debug" || fake.rows[0]["said"] != "the rules pass over ." {
			t.Fatalf("lint answers %d, %q, logs %v, and wants the pass at debug", code, out, fake.rows)
		}
	})
	// A warning prints as a notice, so CI spends no error annotation on it. [[spec/tickets/check-lines-read-as-notices]]
	t.Run("warnings print the count a rule first and the lines last as notices, exit 0 and log at warn", func(t *testing.T) {
		fake := &lintFake{
			tools: []check.Finding{lintRow("a.md", "Sentence", check.SeverityWarning)},
			swept: []check.Finding{lintRow("b.go", "Passive", check.SeverityWarning), lintRow("c.go", "Passive", check.SeverityWarning)},
		}
		code, out, _ := runsTwin(fake.verb(t, nil), "lint")
		want := strings.Join([]string{
			"     2  Passive", "     1  Sentence", "     3  in all", "",
			"3 stand at warning. They stand in the Problems panel, and the push waits until the panel stands clear.", "",
			"a.md:2:3 Sentence: Sentence says", "b.go:2:3 Passive: Passive says", "c.go:2:3 Passive: Passive says", "",
		}, "\n")
		if code != 0 || out != want {
			t.Fatalf("lint answers %d, %q, and wants %q", code, out, want)
		}
		if row := fake.rows[0]; row["level"] != "warn" || row["said"] != "3 line(s) break a rule" || row["detail"] != "a.md:2 Sentence, b.go:2 Passive, c.go:2 Passive" {
			t.Fatalf("lint logs %v, and wants the warn row naming the first rows", row)
		}
	})
	// The commit and the check read a warning as a refusal. [[spec/tickets/rules-lint-changed-files-first]]
	t.Run("a warning under --strict, or a finding at error, exits 1 and names no warning note", func(t *testing.T) {
		for _, one := range []struct {
			found check.Finding
			argv  []string
			ends  string
		}{
			{lintRow("a.md", "Sentence", check.SeverityWarning), []string{"lint", "--strict"}, "a.md:2:3: Sentence: Sentence says\n"},
			{lintRow("a.go", "FileCeiling", check.SeverityError), []string{"lint"}, "a.go:2:3: FileCeiling: FileCeiling says\n"},
		} {
			fake := &lintFake{tools: []check.Finding{one.found}}
			code, out, _ := runsTwin(fake.verb(t, nil), one.argv...)
			if code != exitFailed || strings.Contains(out, "stand at warning") || !strings.HasSuffix(out, one.ends) {
				t.Fatalf("%v answers %d, %q, and wants 1 ending on the finding", one.argv, code, out)
			}
		}
	})
	// The engine writes the tickets and the retros, so a hand fixes no warning there. [[spec/tickets/rules-lint-changed-files-first]]
	t.Run("--changed reads the changed files past the tickets, the retros and the private folder", func(t *testing.T) {
		fake := &lintFake{changed: []string{"spec/a.md", "spec/tickets/t.md", "spec/retros/r.md", ".se/tickets/n.md"}}
		code, out, _ := runsTwin(fake.verb(t, map[string]string{"spec/a.md": "a\n", "spec/tickets/t.md": "t\n", "spec/retros/r.md": "r\n", ".se/tickets/n.md": "n\n"}), "lint", "--changed")
		if code != 0 || len(fake.asked) != 1 || strings.Join(fake.asked[0], " ") != "spec/a.md" {
			t.Fatalf("lint --changed answers %d, %q, asks the tools over %v, and wants spec/a.md alone", code, out, fake.asked)
		}
	})
	t.Run("--changed over no changed file passes and asks no tool", func(t *testing.T) {
		fake := &lintFake{}
		if code, out, _ := runsTwin(fake.verb(t, nil), "lint", "--changed", "--strict"); code != 0 || len(fake.asked) != 0 || out != "The rules pass.\n" {
			t.Fatalf("lint --changed answers %d, %q, asks %v", code, out, fake.asked)
		}
	})
	// The check counts the warnings in its stamp and names the errors under --errors, off what the lint leaves. [[spec/tickets/the-check-lint-runs-in-go]]
	t.Run("the lint leaves each warning by its file and source, and each error as its line", func(t *testing.T) {
		warned := lintRow("a.md", "Sentence", check.SeverityWarning)
		warned.Source = "rules"
		fake := &lintFake{tools: []check.Finding{warned, lintRow("b.go", "FileCeiling", check.SeverityError)}}
		runsTwin(fake.verb(t, nil), "lint")
		want := lintFound{Stood: []finding{{File: "a.md", Source: "rules"}}, Erred: []string{"b.go:2:3: FileCeiling: FileCeiling says"}}
		if len(fake.left) != 1 || !reflect.DeepEqual(fake.left[0], want) {
			t.Fatalf("lint leaves %+v, and wants %+v", fake.left, want)
		}
		clean := &lintFake{}
		runsTwin(clean.verb(t, nil), "lint")
		if len(clean.left) != 1 || len(clean.left[0].Stood)+len(clean.left[0].Erred) != 0 {
			t.Fatalf("a clean lint leaves %+v, and wants one empty list", clean.left)
		}
	})
	// A red changed part names its warnings under --errors. [[spec/tickets/lint-strict-leaves-erred]]
	// A rule in report mode leaves under neither list, so it holds no push. [[spec/tickets/report-mode-holds-no-push]]
	t.Run("a warning under --strict leaves as an erred line, and a report-mode warning leaves under neither", func(t *testing.T) {
		fake := &lintFake{tools: []check.Finding{lintRow("a.md", "Sentence", check.SeverityWarning), lintRow("b.go", "ExampleCovers", check.SeverityWarning)}}
		runsTwin(fake.verb(t, nil), "lint", "--strict")
		want := lintFound{Stood: []finding{}, Erred: []string{"a.md:2:3: Sentence: Sentence says"}}
		if len(fake.left) != 1 || !reflect.DeepEqual(fake.left[0], want) {
			t.Fatalf("lint --strict leaves %+v, and wants %+v", fake.left, want)
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
	t.Run("a rules load that fails, or no sweep, stops the lint with its fault", func(t *testing.T) {
		for says, fake := range map[string]*lintFake{
			"The rules load nothing":       {tools: []check.Finding{{Rule: lsp.RulesLoad, Message: "The rules load nothing, so every rule stands unchecked."}}},
			"quack answers no check sweep": {sweepFault: errors.New("no door")},
		} {
			if code, out, errs := runsTwin(fake.verb(t, nil), "lint"); code != exitFailed || out != "" || !strings.Contains(errs, says) {
				t.Fatalf("lint answers %d, %q, %q, and wants the fault %q", code, out, errs, says)
			}
		}
	})
	t.Run("a path the disk holds nowhere passes the rules and asks no tool", func(t *testing.T) {
		fake := &lintFake{}
		if code, out, _ := runsTwin(fake.verb(t, nil), "lint", "gone.md"); code != 0 || out != "The rules pass.\n" || len(fake.asked) != 0 {
			t.Fatalf("lint answers %d, %q, asks %v, and wants the pass with no tool", code, out, fake.asked)
		}
	})
}

// A git answering each argument line it holds, and failing every other. [[spec/tickets/changed-lint-without-merge-base]]
func gitHolding(answers map[string]string) gitAnswers {
	return func(args ...string) (string, bool) {
		said, ok := answers[strings.Join(args, " ")]
		return said, ok
	}
}

// The working tree's changes and the new files, which both roads read. [[spec/tickets/changed-lint-without-merge-base]]
var workingTree = map[string]string{
	"diff --name-only --diff-filter=d HEAD": "src/b.go\nspec/a.md\n",
	"ls-files --others --exclude-standard":  "spec/new.md\n",
}

func TestChangedOver(t *testing.T) {
	t.Parallel()
	t.Run("a merge in progress reads the working tree against MERGE_HEAD in place of HEAD", func(t *testing.T) {
		answers := map[string]string{
			"merge-base origin/main HEAD":                  "abc123\n",
			"diff --name-only --diff-filter=d abc123 HEAD": "src/c.go\n",
			"rev-parse -q --verify MERGE_HEAD":             "def456\n",
			"diff --name-only --diff-filter=d MERGE_HEAD":  "src/c.go\nsrc/resolved.go\n",
			"diff --name-only --diff-filter=d HEAD":        "src/trunk.go\nsrc/resolved.go\n",
			"ls-files --others --exclude-standard":         "",
		}
		got := changedOver(gitHolding(answers), func(string) {})
		if want := []string{"src/c.go", "src/resolved.go"}; !reflect.DeepEqual(got, want) {
			t.Fatalf("the door reads %v, and wants %v with trunk's own file left out", got, want)
		}
	})
	t.Run("a merge base, or HEAD's own commit where a clone holds no trunk ref and says so, reads with the working tree once each and sorted", func(t *testing.T) {
		for lines, answers := range map[int]map[string]string{
			0: {"merge-base origin/main HEAD": "abc123\n", "diff --name-only --diff-filter=d abc123 HEAD": "spec/a.md\nsrc/c.go\n"},
			1: {"diff-tree --no-commit-id --name-only -r --root --diff-filter=d HEAD": "src/c.go\n"},
		} {
			for args, said := range workingTree {
				answers[args] = said
			}
			var said []string
			got := changedOver(gitHolding(answers), func(line string) { said = append(said, line) })
			if want := []string{"spec/a.md", "spec/new.md", "src/b.go", "src/c.go"}; !reflect.DeepEqual(got, want) || len(said) != lines {
				t.Fatalf("the door reads %v and says %v, and wants %v and %d line(s)", got, said, want, lines)
			}
			if lines == 1 && (!strings.Contains(said[0], "origin/main") || !strings.Contains(said[0], "HEAD")) {
				t.Fatalf("the door says %v, and wants one line naming origin/main and HEAD", said)
			}
		}
	})
}
