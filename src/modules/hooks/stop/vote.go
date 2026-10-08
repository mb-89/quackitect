// The vote at a turn's end, and the block text asking for a stop.
// [[spec/tickets/cage-stop-rules-port]]
package stop

import (
	"regexp"
	"strings"
	"unicode"
)

// The check the hook stands off under, the priority a vote with no stop reads, and a continue that fires nowhere. [[spec/design_output/stop#the-vote]]
const (
	OffCheck = "stop-hook-off"
	floor    = 0
	noGo     = -1
)

// The marks the JavaScript space class holds beside the ones unicode.IsSpace reads. [[spec/design_output/stop#the-chat-is-new]]
const (
	byteOrderMark      = 0xFEFF
	lineSeparator      = 0x2028
	paragraphSeparator = 0x2029
)

// The key the binding line names, and the heading a report carries. [[spec/design_output/stop#a-refusal-names-the-binding]]
const (
	BindingKey   = "engine.binding"
	needsHeading = "What the agent needs"
)

// The stop line, the first row of the needs table, and the sentences that name the agent's own next act. [[spec/design_output/stop#the-stop-is-one-line]] [[spec/design_output/stop#the-chat-is-new]]
var (
	stopLine   = regexp.MustCompile(`(?i)^stop:\s*([a-z0-9-]+)\s*$`)
	firstRow   = regexp.MustCompile(`(?m)^\|\s*1\s*\|`)
	paragraphs = regexp.MustCompile(`\r?\n\s*\r?\n`)
	stopOpens  = regexp.MustCompile(`(?i)^stop:`)
	holdsOpens = regexp.MustCompile(`^level0 holds this session`)
	bullet     = regexp.MustCompile(`^[-*]\s+`)
	next       = regexp.MustCompile(`(?i)^(?:next\b|then i\b|i (?:start|begin|read|run|pull|take|look|check|open|write|fix|merge|work|list|review)\b|i'll\b|i will\b)`)
)

// The marks a sentence's emphasis or quote closes on, past its own end. [[spec/design_output/stop#a-cloud-box-decides]]
const emphasisMarks = "*_`\"')"

// What the vote answers: whether the turn ends, the stop and the continue that won their sides, whether the stop yields, whether the hook stands off, whether the cap let go, and the holds in a row the tooth read. [[spec/design_output/stop#the-vote]]
type Decision struct {
	Ends    bool
	Stop    *Rule
	Go      *Rule
	Yields  bool
	Off     bool
	Runaway bool
	InARow  int
}

// The vote over the rules: ran answers a check by its name, and whether this door holds it. [[spec/design_output/stop#the-vote]]
func Decide(rules []Rule, claimed string, ran func(name string) (bool, bool)) Decision {
	var firing []Rule
	for _, one := range rules {
		if fires(one, claimed, ran) {
			firing = append(firing, one)
		}
	}
	var off *Rule
	for at := range firing {
		if firing[at].Runs == OffCheck {
			off = &firing[at]
			break
		}
	}
	stop, goes := highest(firing, StopSide), highest(firing, GoSide)
	// A claim reads the agent, and a check reads the tree, so the check wins. [[spec/design_output/stop#a-check-beats-a-claim]]
	yields := false
	if stop != nil && stop.Yields {
		for _, one := range firing {
			yields = yields || (one.Side == GoSide && one.Decides == Mechanical && !one.Beside)
		}
	}
	goAt, stopAt := noGo, floor
	if goes != nil {
		goAt = goes.Priority
	}
	if stop != nil {
		stopAt = stop.Priority
	}
	if off != nil {
		stop = off
	}
	return Decision{Ends: off != nil || (!yields && goAt <= stopAt), Stop: stop, Go: goes, Yields: yields, Off: off != nil}
}

// A claimed rule naming a check fires where the claim and the check both stand. [[spec/design_output/stop#a-claim-a-check-holds]]
func fires(one Rule, claimed string, ran func(string) (bool, bool)) bool {
	if one.Decides == Claimed && claimed != one.ID {
		return false
	}
	if one.Decides == Claimed && one.Runs == "" {
		return true
	}
	said, known := ran(one.Runs)
	return known && said
}

// The rule of a side with the highest priority, the first of a tie. [[spec/design_output/stop#the-vote]]
func highest(firing []Rule, side string) *Rule {
	var best *Rule
	for at := range firing {
		if firing[at].Side == side && (best == nil || firing[at].Priority > best.Priority) {
			best = &firing[at]
		}
	}
	return best
}

// The tooth at a turn's end: past the cap of holds in a row the turn ends, unless it is pinned, and the answer carries the run it read and the run that stands after. [[spec/design_output/stop#three-in-a-row]]
func AtTurnEnd(decision Decision, inARow, most int, pinned bool) (Decision, int) {
	runaway := !decision.Ends && !pinned && most > 0 && inARow >= most
	decision.Ends = decision.Ends || runaway
	decision.Runaway = runaway
	if decision.Ends {
		decision.InARow = inARow
		return decision, 0
	}
	decision.InARow = inARow + 1
	return decision, inARow + 1
}

// The reasons an agent claims: a stop the agent decides, asking a question. [[spec/design_output/stop#the-stop-is-one-line]]
func StopReasons(rules []Rule) []Rule {
	var out []Rule
	for _, one := range rules {
		if one.Side == StopSide && one.Decides == Claimed && one.Asks != "" {
			out = append(out, one)
		}
	}
	return out
}

// The rule an id names among the reasons, or none. [[spec/design_output/stop#the-stop-is-one-line]]
func ReasonOf(rules []Rule, id string) (Rule, bool) {
	for _, one := range StopReasons(rules) {
		if one.ID == id {
			return one, true
		}
	}
	return Rule{}, false
}

// A claim waits on the owner where a rule under waits: owner names it. [[spec/tickets/the-clear-keeps-questions]]
func WaitsForOwner(rules []Rule, claimed string) bool {
	for _, one := range rules {
		if claimed != "" && one.ID == claimed && one.Waits == ownerWaits {
			return true
		}
	}
	return false
}

// The reason the last line names, or nothing. [[spec/design_output/stop#the-stop-is-one-line]]
func LastLineReason(text string) string {
	last := ""
	for _, one := range strings.Split(text, "\n") {
		if trimmed := strings.TrimSpace(one); trimmed != "" {
			last = trimmed
		}
	}
	if found := stopLine.FindStringSubmatch(last); found != nil {
		return found[1]
	}
	return ""
}

// A message carries the report where the needs heading stands with a first row under it. [[spec/design_output/stop#a-talk-follows-a-report]]
func ReportStands(text string) bool {
	at := strings.Index(text, needsHeading)
	return at >= 0 && firstRow.MatchString(text[at:])
}

// An answer names a next step where a paragraph past the tables opens a sentence on the agent's own next act. [[spec/design_output/stop#the-chat-is-new]]
func NamesNext(text string) bool {
	for _, raw := range paragraphs.Split(text, -1) {
		one := strings.TrimSpace(raw)
		if one == "" || strings.HasPrefix(one, "|") || strings.HasPrefix(one, "#") || stopOpens.MatchString(one) || holdsOpens.MatchString(one) {
			continue
		}
		for _, sentence := range sentencesOf(one) {
			if next.MatchString(strings.TrimSpace(bullet.ReplaceAllString(sentence, ""))) {
				return true
			}
		}
	}
	return false
}

// An answer ends on a question where its last prose paragraph, past the tables, the headings and the stop line, closes on a question mark. [[spec/design_output/stop#a-cloud-box-decides]]
func EndsOnQuestion(text string) bool {
	last := ""
	for _, raw := range paragraphs.Split(text, -1) {
		one := strings.TrimSpace(raw)
		if one == "" || strings.HasPrefix(one, "|") || strings.HasPrefix(one, "#") || stopOpens.MatchString(one) || holdsOpens.MatchString(one) {
			continue
		}
		last = one
	}
	return strings.HasSuffix(strings.TrimRight(last, emphasisMarks), "?")
}

// A paragraph cut at each run of space that follows a full stop, a question or a cry, as the split behind namesNext does. [[spec/design_output/stop#the-chat-is-new]]
func sentencesOf(text string) []string {
	var out []string
	runes := []rune(text)
	start := 0
	for at := 1; at < len(runes); at++ {
		if !isSpace(runes[at]) || !strings.ContainsRune(".!?", runes[at-1]) {
			continue
		}
		end := at
		for end < len(runes) && isSpace(runes[end]) {
			end++
		}
		out = append(out, string(runes[start:at]))
		start = end
		at = end
	}
	return append(out, string(runes[start:]))
}

func isSpace(one rune) bool {
	return unicode.IsSpace(one) || one == byteOrderMark || one == lineSeparator || one == paragraphSeparator
}

// The block a held turn reads: why, the reasons to claim, and the binding line. [[spec/design_output/stop#a-refusal-names-the-binding]]
func AsksForStop(rules []Rule, why, binding string) string {
	lines := []string{strings.TrimSpace(why + " This turn holds open. Carry on, or end the turn with one last line, alone: stop: <reason>, with one of these reasons:")}
	for _, one := range StopReasons(rules) {
		lines = append(lines, "  "+one.ID+": "+one.Asks)
	}
	return strings.Join(append(lines, binding), "\n")
}

// The line naming the binding, the layer setting it, and the moment it was first read so. [[spec/design_output/stop#a-refusal-names-the-binding]]
func BindingLine(value, layer, at string) string {
	if layer == "" {
		return "No file sets " + BindingKey + " for this session, read so at " + at + "."
	}
	return "This session binds to " + value + ", set in " + layer + ", read so at " + at + "."
}
