// The failure verb: an agent raises a failure by id, writes a node for a
// failure it meets with no id, and counts the failures the log holds by id.
// [[spec/design_output/failures#an-agent-raises-by-verb]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"sort"
	"strings"
	"time"

	"quackitect/src/failure"
	"quackitect/src/index"
	"quackitect/src/modules/check"
	logmodule "quackitect/src/modules/log"
	"quackitect/src/pull"
)

// The subverbs, the flags new reads, the kind a node takes, and the shape an id takes, so a node lands under spec/failures alone. [[spec/design_output/failures#an-agent-raises-by-verb]]
const (
	failureRaise  = "raise"
	failureNew    = "new"
	failureCount  = "count"
	failureLevel  = "level"
	failureRemedy = "remedy"
	failureWhen   = "when"
	failureKind   = "failure"
	whenSection   = "When"
)

var failureID = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)

var failureUsage = []string{
	"Usage: ./RUNME.sh failure <raise|new|count>\n",
	"  raise <id> [said]                                       raise the failure, print its lines and log its row",
	"  new <id> --level=<level> --remedy=<line>... --when=<line> write the node, one --remedy a remedy",
	"  count                                                   count each failure id the session log holds",
}

// What the verb reads: the root and the clock. [[spec/design_output/failures#an-agent-raises-by-verb]]
type failureDoors struct {
	root string
	now  func() time.Time
	// Stages a written node in git, so the next commit carries it. Nil stages nothing. [[spec/design_output/failures#an-agent-raises-by-verb]]
	stage func(path string) bool
}

// The doors over the tree's own root and the wall clock. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureHere() (failureDoors, error) {
	root, err := index.Root()
	stage := func(path string) bool {
		_, ok := gitIn(root, "add", "--", path)
		return ok
	}
	return failureDoors{root: root, now: time.Now, stage: stage}, err
}

func init() { register("failure", failureVerb(failureHere)) }

// The failure verb over the doors. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureVerb(doors func() (failureDoors, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[1:]
		if len(said) == 0 || !slices.Contains([]string{failureRaise, failureNew, failureCount}, said[0]) {
			for _, row := range failureUsage {
				fmt.Fprintln(errs, row)
			}
			return exitUsage
		}
		d, err := doors()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		switch said[0] {
		case failureRaise:
			return failureRaises(d, said[1:], out, errs)
		case failureNew:
			return failureWrites(d, said[1:], out, errs)
		}
		return failureCounts(d, out, errs)
	}
}

// Raises the id through the door, its words joined into one message, prints its lines, and appends the row the door answers. An id no node carries still prints and logs, and answers exitFailed. [[spec/design_output/failures#one-door-raises-a-failure]] [[spec/tickets/failure-raise-row-off-door]] [[spec/tickets/failure-raise-joins-said]] [[spec/tickets/failure-raise-unregistered-case]]
func failureRaises(d failureDoors, said []string, out, errs io.Writer) int {
	if len(said) == 0 {
		fmt.Fprintln(errs, failureUsage[1])
		return exitUsage
	}
	message := []string{}
	if words := strings.TrimSpace(strings.Join(said[1:], " ")); words != "" {
		message = append(message, words)
	}
	raised := failure.Raise(failure.Load(failure.Dir{Root: d.root}), said[0], message...)
	if err := raisedOnto(d, raised, out); err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if !raised.Registered {
		return exitFailed
	}
	return 0
}

// Prints a raised failure's lines, and appends the row the door answers onto the session log, the id under extra. A verb raising a refusal shares it. [[spec/design_output/failures#one-door-raises-a-failure]] [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func raisedOnto(d failureDoors, raised failure.Raised, out io.Writer) error {
	for _, line := range raised.Lines() {
		fmt.Fprintln(out, line)
	}
	row := raised.Row("")
	extra, err := json.Marshal(map[string]any{failure.IDField: row[failure.IDField]})
	if err != nil {
		return err
	}
	fields := map[string]json.RawMessage{"extra": extra}
	for _, key := range []string{"level", "kind", "said"} {
		fields[key], _ = json.Marshal(row[key])
	}
	line, err := sayLine(d.now(), fields)
	if err != nil {
		return err
	}
	return appendsLine(filepath.Join(d.root, filepath.FromSlash(sessionLog)), line)
}

// Writes the node in the shape the failure schema names, through the mint's writer, and reads it back through NodeOf first. It refuses an id off the shape, an id a node carries, a level off the log ladder, no remedy and no when. [[spec/design_output/failures#an-agent-raises-by-verb]] [[spec/tickets/failure-new-shape-once]] [[spec/tickets/failure-new-refusals-tested]]
func failureWrites(d failureDoors, said []string, out, errs io.Writer) int {
	id, level, when, remedies := "", "", "", []any{}
	for _, word := range said {
		pair := fieldFlag.FindStringSubmatch(word)
		switch {
		case pair == nil && id == "":
			id = word
		case pair == nil:
			fmt.Fprintf(errs, "failure new takes one id, and reads %s past %s\n", word, id)
			return exitUsage
		case pair[1] == failureLevel:
			level = pair[2]
		case pair[1] == failureRemedy:
			remedies = append(remedies, pair[2])
		case pair[1] == failureWhen:
			when = strings.TrimSpace(pair[2])
		default:
			fmt.Fprintf(errs, "failure new takes --level, --remedy and --when, and reads --%s\n", pair[1])
			return exitUsage
		}
	}
	where := failure.Folder + "/" + id + ".md"
	switch {
	case !failureID.MatchString(id):
		fmt.Fprintf(errs, "failure new takes an id of lowercase words joined by hyphens, and reads %q\n", id)
		return exitUsage
	case !slices.Contains(logmodule.Ladder, level):
		fmt.Fprintf(errs, "%s names the level %q, and a level stands on the ladder %s\n", id, level, strings.Join(logmodule.Ladder, ", "))
		return exitUsage
	case when == "":
		fmt.Fprintf(errs, "%s names no --when, the line saying when the failure fires\n", id)
		return exitUsage
	}
	if _, err := os.Stat(filepath.Join(d.root, filepath.FromSlash(where))); err == nil {
		fmt.Fprintf(errs, "%s stands already, and failure raise %s raises it\n", where, id)
		return exitUsage
	}
	schemas := check.SchemasIn(check.TreeOver(d.root, rootDisk{d.root}))
	text, why := check.Minted(schemas, failureKind, where, map[string]any{failureLevel: level, "remedies": remedies, whenSection: when})
	if _, faults := failure.NodeOf(id, text); why == "" && len(faults) > 0 {
		why = strings.Join(faults, "\n")
	}
	if why != "" {
		fmt.Fprintln(errs, why)
		return exitUsage
	}
	if err := (pull.OSDisk{Root: d.root}).Write(where, text); err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if d.stage != nil && !d.stage(where) {
		fmt.Fprintf(errs, "%s stands, and git stages it nowhere, so commit it by its path\n", where)
	}
	fmt.Fprintf(out, "%s stands. Raise it with ./RUNME.sh failure raise %s\n", where, id)
	return 0
}

// Counts each failure id the session file holds, the most first, then by id. A row naming no id counts nowhere. The rotated files stay out, since a retro collects them. [[spec/design_output/failures#an-agent-raises-by-verb]] [[spec/tickets/failure-count-skips-no-id]]
func failureCounts(d failureDoors, out, errs io.Writer) int {
	text, err := os.ReadFile(filepath.Join(d.root, filepath.FromSlash(sessionLog)))
	if err != nil {
		fmt.Fprintln(out, noLog)
		return 0
	}
	counts := map[string]int{}
	for _, row := range logLinesOf(string(text)) {
		raw, held := row.values[failure.IDField]
		var id string
		if row.field("kind") != failure.RowKind || !held || json.Unmarshal(raw, &id) != nil || strings.TrimSpace(id) == "" {
			continue
		}
		counts[id]++
	}
	ids := make([]string, 0, len(counts))
	for id := range counts {
		ids = append(ids, id)
	}
	sort.Slice(ids, func(a, b int) bool {
		if counts[ids[a]] != counts[ids[b]] {
			return counts[ids[a]] > counts[ids[b]]
		}
		return ids[a] < ids[b]
	})
	for _, id := range ids {
		fmt.Fprintf(out, "%d %s\n", counts[id], id)
	}
	return 0
}
