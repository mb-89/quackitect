// The log verb: the rows the session log and its rotated files hold, narrowed
// by span, level, kind, words and count, printed the way the window prints
// them, and one row appended under --say.
// [[spec/design_output/log#one-verb-reads-the-log]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"quackitect/src/index"
	logmodule "quackitect/src/modules/log"
)

// The folder a session rotates its file into and the end each file carries, under the log folder src/modules/check/folders.go owns, and the line a reader meets where no file stands. [[spec/design_output/log#a-session-rotates-its-file]]
const (
	logOld = ".se/.log/old"
	logEnd = ".jsonl"
	noLog  = "No log stands yet. A writer starts one the next time it says a line."
)

// The flags the verb reads. [[spec/design_output/log#one-verb-reads-the-log]]
const (
	logHelp  = "--help"
	logSay   = "--say"
	logSince = "--since"
	logLevel = "--level"
	logKind  = "--kind"
	logWords = "--words"
	logLast  = "--last"
	logCount = "--count"
)

// The row's shape as sayLine and asRow write it: the longest words, the longest detail, the kind keeping its whole text, the stamp's slice, and the widths of the level and the kind. [[spec/design_output/log#what-one-line-looks-like]]
const (
	logSaidCap   = 80
	logDetailCap = 120
	logDetail    = "detail"
	replyKind    = "reply"
	logDefault   = "info"
	stampFrom    = 11
	stampTo      = 23
	levelWidth   = 5
	kindWidth    = 6
	msInSecond   = 1000
	// The bits a span and a count parse at. [[spec/design_output/log#one-verb-reads-the-log]]
	numberBits = 64
)

var logUsage = []string{
	"Usage: ./RUNME.sh log [flags]\n",
	"  --since <span>  the rows stamped inside the span, as 10m, 2h or 3d",
	"  --level <name>  the rows at that level and above",
	"  --kind <name>   the rows of that kind",
	"  --words <text>  the rows carrying every word, in any case",
	"  --last <count>  the last rows, after every filter above",
	"  --count         one row a kind, over the rows the filters keep",
	"  --say <row>     append one row, a JSON object of level, kind, said and extra",
}

// The seconds a span unit holds, and the base its count reads in. [[spec/design_output/log#one-verb-reads-the-log]]
const (
	secondsAMinute = 60
	secondsAnHour  = 3600
	secondsADay    = 86400
	decimal        = 10
)

// The fields a row holds by name, which the extra line leaves out. [[spec/design_output/log#what-one-line-looks-like]]
var logOwn = []string{"at", "level", "kind", "said"}

// A rotated file's name, which carries its first stamp, and a span as spanOf in src/branches/group.go reads it. [[spec/design_output/log#a-session-rotates-its-file]]
var (
	rotatedName = regexp.MustCompile(`^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-[0-9a-z]+\.jsonl$`)
	spanText    = regexp.MustCompile(`^(\d+)\s*([mhd])$`)
	spanSeconds = map[string]int64{"m": secondsAMinute, "h": secondsAnHour, "d": secondsADay}
	spaces      = regexp.MustCompile(`\s+`)
)

// What the verb reads: the root and the clock. [[spec/design_output/log#one-verb-reads-the-log]]
type logDoors struct {
	root string
	now  func() time.Time
}

// The doors over the tree's own root and the wall clock. [[spec/design_output/log#one-verb-reads-the-log]]
func logHere() (logDoors, error) {
	root, err := index.Root()
	return logDoors{root: root, now: time.Now}, err
}

// One row as its line holds it: the keys in the order the line writes them, each key's JSON, and the line. [[spec/design_output/log#what-one-line-looks-like]]
type logLine struct {
	keys   []string
	values map[string]json.RawMessage
	line   string
}

func init() { register("log", logVerb(logHere)) }

// The log verb over the doors. [[spec/design_output/log#one-verb-reads-the-log]]
func logVerb(doors func() (logDoors, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[1:]
		if slices.Contains(said, logHelp) {
			for _, row := range logUsage {
				fmt.Fprintln(out, row)
			}
			return 0
		}
		d, err := doors()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if slices.Contains(said, logSay) {
			return logSays(d, flagOf(said, logSay), errs)
		}
		now := d.now()
		paths := logFiles(d.root, flagOf(said, logSince), now)
		if len(paths) == 0 {
			fmt.Fprintln(out, noLog)
			return 0
		}
		rows := []logLine{}
		for _, path := range paths {
			if text, err := os.ReadFile(path); err == nil {
				rows = append(rows, logLinesOf(string(text))...)
			}
		}
		kept := narrowed(rows, said, now)
		if slices.Contains(said, logCount) {
			for _, one := range logCounts(kept) {
				fmt.Fprintln(out, one)
			}
			return 0
		}
		for _, one := range kept {
			fmt.Fprintln(out, asRow(one))
		}
		return 0
	}
}

// The word after the flag, and nothing where the flag stands nowhere. [[spec/design_output/log#one-verb-reads-the-log]]
func flagOf(argv []string, name string) string {
	at := slices.Index(argv, name)
	if at < 0 || at+1 >= len(argv) {
		return ""
	}
	return argv[at+1]
}

// A span's seconds, and none where the words name no span. [[spec/design_output/log#one-verb-reads-the-log]]
func spanOf(said string) int64 {
	found := spanText.FindStringSubmatch(strings.TrimSpace(said))
	if found == nil {
		return 0
	}
	many, _ := strconv.ParseInt(found[1], decimal, numberBits)
	return many * spanSeconds[found[2]]
}

// A rotated file's first stamp in milliseconds, and none where the name carries none. [[spec/design_output/log#a-session-rotates-its-file]]
func timeOf(name string) int64 {
	found := rotatedName.FindStringSubmatch(name)
	if found == nil {
		return 0
	}
	at, err := time.Parse(time.RFC3339, found[1]+"T"+found[2]+":"+found[3]+":"+found[4]+"Z")
	if err != nil {
		return 0
	}
	return at.UnixMilli()
}

// The files a span opens: every rotated file opening inside it, the newest one opening before it, since its later rows run on into the span, and the session file. [[spec/design_output/log#a-session-rotates-its-file]]
func logFiles(root, since string, now time.Time) []string {
	old := filepath.Join(root, filepath.FromSlash(logOld))
	from := int64(0)
	if seconds := spanOf(since); seconds > 0 {
		from = now.UnixMilli() - seconds*msInSecond
	}
	rotated := []string{}
	if found, err := os.ReadDir(old); err == nil {
		for _, one := range found {
			if !one.IsDir() && strings.HasSuffix(one.Name(), logEnd) {
				rotated = append(rotated, one.Name())
			}
		}
	}
	sort.Strings(rotated)
	inside, before := []string{}, []string{}
	for _, name := range rotated {
		if from == 0 || timeOf(name) >= from {
			inside = append(inside, name)
		} else if timeOf(name) > 0 {
			before = append(before, name)
		}
	}
	sort.SliceStable(before, func(a, b int) bool { return timeOf(before[a]) < timeOf(before[b]) })
	if len(before) > 0 {
		inside = append([]string{before[len(before)-1]}, inside...)
	}
	out := []string{}
	for _, name := range inside {
		out = append(out, filepath.Join(old, name))
	}
	if here := filepath.Join(root, filepath.FromSlash(sessionLog)); standsFile(here) {
		out = append(out, here)
	}
	return out
}

func standsFile(path string) bool {
	said, err := os.Stat(path)
	return err == nil && !said.IsDir()
}

// One row a line holding a JSON object. A torn line drops alone, and the rows around it stand. [[spec/design_output/log#every-writer-appends]]
func logLinesOf(text string) []logLine {
	out := []logLine{}
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		if keys, values, ok := orderedObject([]byte(line)); ok {
			out = append(out, logLine{keys: keys, values: values, line: line})
		}
	}
	return out
}

// A JSON object's keys in the order it writes them, and each key's JSON. A key written twice keeps its first place and its last value, as JSON.parse reads it. [[spec/design_output/log#what-one-line-looks-like]]
func orderedObject(text []byte) ([]string, map[string]json.RawMessage, bool) {
	reads := json.NewDecoder(bytes.NewReader(text))
	if open, err := reads.Token(); err != nil || open != json.Delim('{') {
		return nil, nil, false
	}
	keys, values := []string{}, map[string]json.RawMessage{}
	for reads.More() {
		key, err := reads.Token()
		if err != nil {
			return nil, nil, false
		}
		name, _ := key.(string)
		var value json.RawMessage
		if err := reads.Decode(&value); err != nil {
			return nil, nil, false
		}
		if _, held := values[name]; !held {
			keys = append(keys, name)
		}
		values[name] = value
	}
	if _, err := reads.Token(); err != nil {
		return nil, nil, false
	}
	if _, err := reads.Token(); err != io.EOF {
		return nil, nil, false
	}
	return keys, values, true
}

// A value as String() in JavaScript writes it: a string as itself, an object as [object Object], a list joined by commas, a missing one as undefined. [[spec/design_output/log#what-one-line-looks-like]]
func jsText(raw json.RawMessage, held bool) string {
	if !held {
		return "undefined"
	}
	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return string(raw)
	}
	switch one := value.(type) {
	case string:
		return one
	case map[string]any:
		return "[object Object]"
	case []any:
		var items []json.RawMessage
		_ = json.Unmarshal(raw, &items)
		parts := make([]string, 0, len(items))
		for _, item := range items {
			if string(item) == "null" {
				parts = append(parts, "")
				continue
			}
			parts = append(parts, jsText(item, true))
		}
		return strings.Join(parts, ",")
	}
	return string(raw)
}

// A field of the row as text. [[spec/design_output/log#what-one-line-looks-like]]
func (one logLine) field(key string) string {
	raw, held := one.values[key]
	return jsText(raw, held)
}

// The rows past every filter the words name: span, level, kind and words, then the count. [[spec/design_output/log#one-verb-reads-the-log]]
func narrowed(rows []logLine, argv []string, now time.Time) []logLine {
	out := []logLine{}
	span := spanOf(flagOf(argv, logSince))
	level, kind := flagOf(argv, logLevel), flagOf(argv, logKind)
	words := strings.Fields(strings.ToLower(flagOf(argv, logWords)))
	for _, one := range rows {
		if span > 0 && !stampedSince(one.field("at"), now.UnixMilli()-span*msInSecond) {
			continue
		}
		if level != "" && logmodule.Rank(one.field("level")) < logmodule.Rank(level) {
			continue
		}
		if kind != "" && one.field("kind") != kind {
			continue
		}
		if !carries(one.line, words) {
			continue
		}
		out = append(out, one)
	}
	return lastOf(out, flagOf(argv, logLast))
}

// Whether the stamp reads at or after the moment, and a stamp no clock reads stands outside every span. [[spec/design_output/log#one-verb-reads-the-log]]
func stampedSince(at string, from int64) bool {
	stamp, err := time.Parse(time.RFC3339Nano, at)
	return err == nil && stamp.UnixMilli() >= from
}

// Whether the row carries every word, in any case, anywhere in its line. [[spec/design_output/log#one-verb-reads-the-log]]
func carries(line string, words []string) bool {
	text := strings.ToLower(line)
	for _, word := range words {
		if !strings.Contains(text, word) {
			return false
		}
	}
	return true
}

// The last rows, and every row where the count names no positive number. [[spec/design_output/log#one-verb-reads-the-log]]
func lastOf(rows []logLine, count string) []logLine {
	many, err := strconv.ParseFloat(strings.TrimSpace(count), numberBits)
	if err != nil || many < 1 || int(many) >= len(rows) {
		return rows
	}
	return rows[len(rows)-int(many):]
}

// One row a kind, the most first and then by kind. [[spec/design_output/log#one-verb-reads-the-log]]
func logCounts(rows []logLine) []string {
	per, order := map[string]int{}, []string{}
	for _, one := range rows {
		kind := one.field("kind")
		if per[kind] == 0 {
			order = append(order, kind)
		}
		per[kind]++
	}
	sort.SliceStable(order, func(a, b int) bool {
		if per[order[a]] != per[order[b]] {
			return per[order[a]] > per[order[b]]
		}
		return order[a] < order[b]
	})
	out := make([]string, 0, len(order))
	for _, kind := range order {
		out = append(out, fmt.Sprintf("%d  %s", per[kind], kind))
	}
	return out
}

// One row as the window prints it: the clock, the level, the kind and the words, and the other fields on a line under them in key order, as the log module's rows hand them. [[spec/design_output/log#what-one-line-looks-like]]
func asRow(one logLine) string {
	at := []rune(one.field("at"))
	clock := string(at[min(stampFrom, len(at)):min(stampTo, len(at))])
	said := fmt.Sprintf("%s %-*s %-*s %s", clock, levelWidth, one.field("level"), kindWidth, one.field("kind"), one.field("said"))
	rest := []string{}
	for _, key := range one.keys {
		if !slices.Contains(logOwn, key) {
			rest = append(rest, key+"="+one.field(key))
		}
	}
	if len(rest) == 0 {
		return said
	}
	sort.Strings(rest)
	return said + "\n" + strings.Repeat(" ", stampTo-stampFrom+1) + strings.Join(rest, " ")
}

// Appends one row to the session log, so a row another writer lands in the meantime stays. A JSON value holding no object reads as a row naming nothing. [[spec/tickets/the-sidebar-writes-through-actions]]
func logSays(d logDoors, text string, errs io.Writer) int {
	_, values, ok := orderedObject([]byte(text))
	if !ok && !json.Valid([]byte(text)) {
		fmt.Fprintf(errs, "log --say takes one JSON row, and reads %s\n", text)
		return exitUsage
	}
	line, err := sayLine(d.now(), values)
	if err == nil {
		err = appendsLine(filepath.Join(d.root, filepath.FromSlash(sessionLog)), line)
	}
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	return 0
}

// Appends one line to the file, its folder made where none stands. [[spec/tickets/the-sidebar-writes-through-actions]]
func appendsLine(at, line string) error {
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		return err
	}
	file, err := os.OpenFile(at, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = file.WriteString(line + "\n")
	return err
}

// The row --say writes, as rowOf shapes it: a level the ladder holds else info, the words on one line and cut, and the extra fields after, the detail cut. [[spec/design_output/log#what-one-line-looks-like]]
func sayLine(now time.Time, said map[string]json.RawMessage) (string, error) {
	level := logDefault
	var named string
	if json.Unmarshal(said["level"], &named) == nil && slices.Contains(logmodule.Ladder, named) {
		level = named
	}
	raw, held := said["kind"]
	kind := jsText(raw, held)
	words := ""
	if raw, held := said["said"]; held && string(raw) != "null" {
		words = jsText(raw, true)
	}
	if kind == replyKind {
		words = strings.TrimSpace(words)
	} else {
		words = cutRunes(strings.TrimSpace(spaces.ReplaceAllString(words, " ")), logSaidCap)
	}
	fields := [][2]any{{"at", now.UTC().Format(logStamp)}, {"level", level}, {"kind", kind}, {"said", words}}
	keys, values, ok := orderedObject(said["extra"])
	for _, key := range keys {
		if !ok || slices.Contains(logOwn, key) {
			continue
		}
		if key == logDetail {
			fields = append(fields, [2]any{key, cutRunes(jsText(values[key], true), logDetailCap)})
			continue
		}
		fields = append(fields, [2]any{key, values[key]})
	}
	parts := make([]string, 0, len(fields))
	for _, pair := range fields {
		key, err := jsonOf(pair[0])
		if err != nil {
			return "", err
		}
		value, err := jsonOf(pair[1])
		if err != nil {
			return "", err
		}
		parts = append(parts, key+":"+value)
	}
	return "{" + strings.Join(parts, ",") + "}", nil
}

// A value as JSON.stringify writes it: compact, with no escape of the HTML characters. [[spec/design_output/log#what-one-line-looks-like]]
func jsonOf(value any) (string, error) {
	var text bytes.Buffer
	writes := json.NewEncoder(&text)
	writes.SetEscapeHTML(false)
	if err := writes.Encode(value); err != nil {
		return "", err
	}
	return strings.TrimRight(text.String(), "\n"), nil
}

// The first runes of a text, up to the cap. [[spec/design_output/log#what-one-line-looks-like]]
func cutRunes(text string, most int) string {
	runes := []rune(text)
	if len(runes) <= most {
		return text
	}
	return string(runes[:most])
}
