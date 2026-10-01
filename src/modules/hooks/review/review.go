// Package review frames a review: the reader's prompt, the reading of its
// answer, and the report, off .claude/skills/level0/lib/review.js.
// [[spec/tickets/review-spawns-off-the-door]]
package review

import (
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// The width a report row's name pads to, the span ToInt32 wraps a fix over, and the bounds past which a JavaScript number prints with an exponent. [[spec/design_output/review#what-the-report-looks-like]]
const (
	nameWidth  = 10
	int32Span  = 1 << 32
	bigNumber  = 1e21
	tinyNumber = 1e-6
	floatBits  = 64
)

// The fenced answer readerSays reads first. [[spec/design_output/review#what-the-reader-answers]]
var fencedAnswer = regexp.MustCompile("```(?:json)?\\s*([\\s\\S]*?)```")

// What the branch verb gathers for a reader, as `branch review --json` prints it. [[spec/design_output/review#the-tool-the-session-calls]]
type Material struct {
	Branch   string `json:"branch"`
	Ask      string `json:"ask"`
	Handback string `json:"handback"`
	Stat     string `json:"stat"`
	Diff     string `json:"diff"`
	Check    Check  `json:"check"`
	Retro    bool   `json:"retro"`
}

// The check on the branch: whether it passes, its exit code where one stands, and what it says. [[spec/design_output/review#what-the-report-looks-like]]
type Check struct {
	OK   bool   `json:"ok"`
	Code *int   `json:"code"`
	Says string `json:"says"`
}

// What the reader answers: the fixes it counts, a line for each question, and its text where it reads as no JSON. [[spec/design_output/review#what-the-reader-answers]]
type Read struct {
	Fix    int    `json:"fix"`
	Ask    string `json:"ask"`
	Beyond string `json:"beyond"`
	Tests  string `json:"tests"`
	Unread string `json:"unread,omitempty"`
}

// The sample answer, in the key order JSON.stringify gives it. [[spec/design_output/review#what-the-reader-answers]]
type sample struct {
	Ask    string `json:"ask"`
	Beyond string `json:"beyond"`
	Tests  string `json:"tests"`
	Fix    int    `json:"fix"`
}

// The reader's prompt over the material and the rules of the tree. [[spec/design_output/review#the-tool-the-session-calls]]
func ReaderAsks(material Material, rules string) string {
	shown, _ := json.MarshalIndent(sample{
		Ask:    "done, and nothing beyond it",
		Beyond: "src/doors/git.js, a one-line fix, trivial",
		Tests:  "2 rules added, 1 carries no test:\nStopRule fires on nothing",
		Fix:    2,
	}, "", "  ")
	return strings.Join([]string{
		"You read one work branch and answer three questions about it. A person",
		"merges this branch either way, so your answer holds nothing back: it",
		"spares the reader the diff and names what to fix next.",
		"",
		"# The branch: " + material.Branch,
		"",
		"## Question one",
		"",
		"Does the branch do what the ask calls for? Name what the ask calls for",
		"and goes missing, or say it is done.",
		"",
		"## Question two",
		"",
		"Is everything the diff touches beyond the ask a trivial fix? A branch",
		"fixes what it trips over, so a file outside the ask is no fault by",
		"itself. A diversion is: a redesign of something the ask leaves alone.",
		"Name the files beyond the ask and say which kind each one is.",
		"",
		"## Question three",
		"",
		"Does every rule the branch adds carry a test proving it fires? A rule",
		"firing on nothing looks alive. So the question is whether a test feeds",
		"the rule something bad and asserts the rule refuses it. Name every rule",
		"the diff adds and say which of them a test drives that way.",
		"",
		"# How this tree is worked",
		"",
		strings.TrimSpace(rules),
		"",
		"# The group ticket, as the branch was cut with it",
		"",
		fence(material.Ask),
		"",
		"# The handback, as the branch carries it now",
		"",
		fence(material.Handback),
		"",
		"# The shape of the diff",
		"",
		fence(material.Stat),
		"",
		"# The diff",
		"",
		fence(material.Diff),
		"",
		"# What you answer",
		"",
		"Answer one JSON object and nothing else. Every value is one short line,",
		"or several lines where a list serves the reader better:",
		"",
		fence(string(shown)),
		"",
		"`fix` counts the things in your three answers a person acts on. Write 0",
		"where the branch stands clean. Keep every line short enough to read whole.",
	}, "\n")
}

func fence(text string) string {
	body := strings.TrimRightFunc(text, unicode.IsSpace)
	if body == "" {
		body = "(empty)"
	}
	return strings.Join([]string{"```", body, "```"}, "\n")
}

// The reading of the reader's answer: the fenced object, or the text from its first brace. Text reading as no JSON counts one fix and stays unread. [[spec/design_output/review#what-the-reader-answers]]
func ReaderSays(text string) Read {
	var parsed any
	if err := json.Unmarshal([]byte(answerOf(text)), &parsed); err != nil || parsed == nil {
		return Read{Fix: 1, Unread: strings.TrimSpace(text)}
	}
	read, _ := parsed.(map[string]any)
	out := Read{Ask: line(read["ask"]), Beyond: line(read["beyond"]), Tests: line(read["tests"])}
	if fix, ok := read["fix"].(float64); ok {
		out.Fix = max(0, int32Of(fix))
	}
	return out
}

// The body readerSays parses: the fence's inside, the text from its first brace, or its last character where it holds no brace. [[spec/design_output/review#what-the-reader-answers]]
func answerOf(text string) string {
	if fenced := fencedAnswer.FindStringSubmatch(text); fenced != nil {
		return fenced[1]
	}
	if at := strings.IndexByte(text, '{'); at >= 0 {
		return text[at:]
	}
	if runes := []rune(text); len(runes) > 0 {
		return string(runes[len(runes)-1:])
	}
	return ""
}

func int32Of(value float64) int {
	return int(int32(uint32(int64(math.Mod(math.Trunc(value), int32Span)))))
}

// A value as String reads it, and a list a line an item. [[spec/design_output/review#what-the-reader-answers]]
func line(said any) string {
	switch value := said.(type) {
	case nil:
		return ""
	case []any:
		parts := make([]string, 0, len(value))
		for _, one := range value {
			parts = append(parts, stringOf(one, "null"))
		}
		return strings.Join(parts, "\n")
	}
	return stringOf(said, "null")
}

func stringOf(said any, none string) string {
	switch value := said.(type) {
	case nil:
		return none
	case string:
		return value
	case bool:
		return strconv.FormatBool(value)
	case float64:
		return numberOf(value)
	case []any:
		parts := make([]string, 0, len(value))
		for _, one := range value {
			parts = append(parts, stringOf(one, ""))
		}
		return strings.Join(parts, ",")
	}
	return "[object Object]"
}

func numberOf(value float64) string {
	if value == 0 {
		return "0"
	}
	if size := math.Abs(value); size < bigNumber && size >= tinyNumber {
		return strconv.FormatFloat(value, 'f', -1, floatBits)
	}
	shown := strconv.FormatFloat(value, 'e', -1, floatBits)
	return strings.NewReplacer("e+0", "e+", "e-0", "e-").Replace(shown)
}

// The reading of an answered event: a refused spawn, a failed reader, or the reader's answer. [[spec/design_output/review#what-the-report-looks-like]]
func ReadOf(deny string, failed bool, text string) Read {
	if deny != "" {
		return Read{Unread: "the spawn is refused: " + deny}
	}
	if failed {
		return Read{Unread: "the reader failed: " + text}
	}
	return ReaderSays(text)
}

// The report the session reads: one line where nothing waits, or a row a finding and the count to fix. [[spec/design_output/review#what-the-report-looks-like]]
func Report(material Material, read Read) string {
	fix := read.Fix
	if !material.Check.OK {
		fix++
	}
	if !material.Retro {
		fix++
	}
	unread := strings.TrimSpace(read.Unread)
	if fix == 0 && unread == "" {
		return material.Branch + "   nothing to fix. Run branch merge to take it in."
	}
	check, retro := "passes", "present"
	if !material.Check.OK {
		check = redly(material.Check)
	}
	if !material.Retro {
		retro = "absent from the handback"
	}
	out := []string{material.Branch, ""}
	for _, row := range [][2]string{{"check", check}, {"retro", retro}, {"ask", read.Ask}, {"tests", read.Tests}, {"beyond", read.Beyond}, {"reader", unread}} {
		if strings.TrimSpace(row[1]) == "" {
			continue
		}
		lines := strings.Split(row[1], "\n")
		out = append(out, fmt.Sprintf("%-*s %s", nameWidth, row[0], lines[0]))
		for _, rest := range lines[1:] {
			out = append(out, strings.Repeat(" ", nameWidth)+" "+rest)
		}
	}
	return strings.Join(append(out, "", closing(fix)), "\n")
}

func redly(check Check) string {
	head := "answers nothing"
	if check.Code != nil {
		head = "answers " + strconv.Itoa(*check.Code)
	}
	if says := strings.TrimSpace(check.Says); says != "" {
		return head + ":\n" + says
	}
	return head
}

func closing(fix int) string {
	if fix == 0 {
		return "Nothing to fix. Run branch merge once every fix lands."
	}
	plural := "s"
	if fix == 1 {
		plural = ""
	}
	return fmt.Sprintf("%d thing%s to fix. Run branch merge once every fix lands.", fix, plural)
}
