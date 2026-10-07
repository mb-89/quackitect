// The probe verb: measures the client itself. compact, cold and reply drive
// the claude client, and dry and smoke post a session's events to the door a
// clone stands, all in Go.
// [[spec/tickets/box-verbs-port-to-go]] [[spec/tickets/probes-leave-node]]
package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"
)

// The words the probe answers, and the line an unknown word prints. [[spec/tickets/box-verbs-port-to-go]]
const probeUsage = "Usage: ./RUNME.sh probe compact|cold|dry|smoke|reply"

// The width of the float a JSON number reads as. [[spec/tickets/box-verbs-port-to-go]]
const jsonFloatBits = 64

// The span each outside run gets, the bound the compaction probe takes. [[spec/design_output/level0#what-the-probe-does]]
const probeWait = 900 * time.Second

// The plugin folder the client loads, as PLUGIN_FOLDER in .claude/skills/level0/lib/vehicle.js names it. [[spec/design_output/level0#the-cold-probe]]
const pluginFolder = ".claude/skills/level0"

// The word naming the revision the dry road runs at. [[spec/tickets/probe-at-revision-guards-merges]]
const atFlag = "--at"

// What each canary row says, which HEARD in .claude/skills/level0/lib/guidance.js owns, spelled again here because Go reads no JavaScript. [[spec/design_output/level0#the-canary]]
const (
	heardSame  = "the canary opens the answer whole"
	heardOther = "the canary opens the answer with other counts"
	heardNone  = "the canary opens no answer"
	heardAgain = "the canary opens a second answer in one context"
)

// The compaction probe's prompt and the variable that arms it, as PROBE in .claude/skills/level0/lib/guidance.js names them. [[spec/design_output/level0#what-the-probe-does]]
const (
	compactVariable = "SE_PROBE_COMPACT"
	compactOpens    = "Say hello in one line."
)

// The words the compaction probe answers. [[spec/design_output/level0#what-the-probe-reads]]
const (
	probeSurvives = "survives"
	probeDrops    = "drops"
	probeUnproven = "no compaction"
)

// The width a row's kind pads to. [[spec/design_output/level0#what-the-probe-does]]
const probeKindWidth = 8

func init() { registerBox("probe", probeVerb) }

// Runs the probe the first word names, over the client the survey finds. [[spec/tickets/box-verbs-port-to-go]]
func probeVerb(d boxDoors, argv []string) int {
	said := ""
	if len(argv) > 0 {
		said = argv[0]
	}
	client := whereIs(d.root, "claude", readSurvey(d.root))
	switch said {
	case "compact":
		return compaction(d, client)
	// [[spec/design_output/level0#the-cold-probe]]
	case "cold":
		return probeCold(d, client, func(line string) { fmt.Fprintln(d.out, line) }, "")
	// Level zero runs on a fresh box with no model and no key. [[spec/tickets/level0-runs-on-the-door]]
	// Level zero runs over the tree as it stands, in seconds. [[spec/tickets/level0-smoke-runs-in-seconds]]
	case "dry", "smoke":
		resolved, code := resolvedAt(d, argv)
		if code != 0 {
			return code
		}
		if said == "smoke" {
			return probeSmoke(d, resolved)
		}
		return probeDry(d, resolved)
	// [[spec/tickets/the-reply-probe-runs]]
	case "reply":
		return probeReply(d, client)
	}
	fmt.Fprintln(d.errs, probeUsage)
	return exitUsage
}

// The words with the revision --at names resolved to its commit, on the dry road alone. The smoke and the working change stand on the tree as it is, with the root's built tools, so neither takes another revision. [[spec/tickets/probe-at-revision-guards-merges]] [[spec/tickets/probe-at-stays-dry]]
func resolvedAt(d boxDoors, argv []string) ([]string, int) {
	at := slices.Index(argv, atFlag)
	if at < 0 {
		return argv, 0
	}
	if argv[0] != "dry" || slices.Contains(argv, workingFlag) {
		fmt.Fprintf(d.errs, "%s runs on the dry road alone and with no %s beside it, since the smoke and the working change stand on the tree as it is.\n", atFlag, workingFlag)
		return nil, exitUsage
	}
	if at+1 >= len(argv) {
		fmt.Fprintf(d.errs, "%s names no revision.\n", atFlag)
		return nil, exitUsage
	}
	revision := argv[at+1]
	ran := d.run([]string{"git", "rev-parse", "--verify", "--quiet", revision + "^{commit}"}, runOpts{cwd: d.root})
	if ran.missing || ran.code != 0 {
		fmt.Fprintf(d.errs, "git resolves no commit at %s, so the dry road runs nowhere.\n", revision)
		return nil, exitFailed
	}
	resolved := slices.Clone(argv)
	resolved[at+1] = strings.TrimSpace(ran.stdout)
	return resolved, 0
}

// What the compaction probe reads off the log: the reads, the word, and why. [[spec/design_output/level0#what-the-probe-reads]]
type compactRead struct {
	reads       int
	answer, why string
}

// Reads the log rows for whether the layer survives a compaction. [[spec/design_output/level0#what-the-probe-reads]]
func readsCompaction(rows []probeRow) compactRead {
	read := compactRead{answer: probeUnproven}
	at := -1
	reread := false
	for i, one := range rows {
		if one.text("kind") == "context" {
			read.reads++
			reread = reread || one.text("reason") == "re-read"
		}
		if at < 0 && one.text("kind") == "compact" && one.text("level") == "info" {
			at = i
		}
	}
	if at < 0 {
		read.why = "no line says a compaction runs, so the road stands unproven"
		return read
	}
	read.answer = probeDrops
	if !reread {
		read.why = "the compaction brings the layer back no second time"
		return read
	}
	for _, one := range rows[at:] {
		switch said := one.text("said"); said {
		case heardSame:
			read.answer, read.why = probeSurvives, said
			return read
		case heardOther, heardNone, heardAgain:
			read.why = said
			return read
		}
	}
	read.why = "no answer after the compaction carries a canary"
	return read
}

// Runs the client headless under the probe's variable, and reads the log it leaves. [[spec/design_output/level0#what-the-probe-does]]
func compaction(d boxDoors, client string) int {
	cage := filepath.Join(d.root, filepath.FromSlash(pluginFolder))
	ran := d.run([]string{client, "-p", compactOpens, "--plugin-dir", cage}, runOpts{
		cwd:     d.root,
		env:     map[string]string{compactVariable: "1"},
		timeout: probeWait,
	})
	if ran.missing {
		fmt.Fprintln(d.errs, "claude stands nowhere, so this box measures no compaction.")
		return exitFailed
	}
	rows := probeRows(filepath.Join(d.root, filepath.FromSlash(sessionLog)))
	read := readsCompaction(rows)
	for _, one := range rows {
		kind := one.text("kind")
		if kind != "context" && kind != "compact" {
			continue
		}
		why := one.text("trigger")
		if one.holds("reason") {
			why = one.text("reason")
		}
		fmt.Fprintf(d.out, "  %-*s %s %s\n", probeKindWidth, kind, why, one.text("said"))
	}
	fmt.Fprintf(d.out, "\n%s: %s\n", read.answer, read.why)
	fmt.Fprintf(d.out, "The layer reaches the session %d time(s).\n", read.reads)
	if ran.code != 0 {
		fmt.Fprintf(d.errs, "The client answers %d.\n", ran.code)
	}
	if read.answer == probeSurvives {
		return 0
	}
	return exitFailed
}

// One row of the session log, field for field as the line holds it. [[spec/design_output/log#what-one-line-looks-like]]
type probeRow map[string]any

// Whether the row carries the field with a value, as ?? reads it. [[spec/design_output/log#what-one-line-looks-like]]
func (r probeRow) holds(key string) bool { return r[key] != nil }

// The field as text, empty where the row carries none. [[spec/design_output/log#what-one-line-looks-like]]
func (r probeRow) text(key string) string {
	if !r.holds(key) {
		return ""
	}
	return probeValueText(r[key])
}

// The rows of the log at the path, a torn line dropping alone, and no row where the log stands nowhere. [[spec/design_output/log#every-writer-appends]]
func probeRows(at string) []probeRow {
	text, _ := readText(at)
	return rowsOfText(text)
}

// The rows a log's text holds, a line no parser takes dropping alone. [[spec/design_output/log#every-writer-appends]]
func rowsOfText(text string) []probeRow {
	var out []probeRow
	for _, line := range strings.Split(text, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		var row probeRow
		reads := json.NewDecoder(strings.NewReader(line))
		reads.UseNumber()
		if reads.Decode(&row) == nil && row != nil {
			out = append(out, row)
		}
	}
	return out
}

// A JSON value as String writes it in JavaScript. [[spec/tickets/box-verbs-port-to-go]]
func probeValueText(value any) string {
	switch one := value.(type) {
	case nil:
		return "null"
	case string:
		return one
	case json.Number:
		return one.String()
	case float64:
		return strconv.FormatFloat(one, 'f', -1, jsonFloatBits)
	case bool:
		if one {
			return "true"
		}
		return "false"
	case []any:
		parts := make([]string, len(one))
		for i, each := range one {
			if each != nil {
				parts[i] = probeValueText(each)
			}
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}
