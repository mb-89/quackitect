// The answer check, off checksAnswer in src/bridge/tools.js and readsAnswer in
// src/bridge/answer-read.js, with the shape rules of lib/answer.js and the
// stop line of lib/stop.js.
// [[spec/tickets/prose-tools-answer-in-go]]
package drafts

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/prose"
)

// The file an answer lints as, and what the check says where it reads no draft. [[spec/design_output/level0#the-tool-reads-a-draft]]
const (
	answerAs    = "level0-answer.md"
	noDraft     = AnswerVerb + " takes the text of one draft."
	noRules     = "No voice rules stand here, so the draft goes unread."
	rulesUnread = "The voice rules read nothing: "
)

// The shape rules, the needs table's heading, its heads and the words a cell holds. [[spec/design_output/level0#the-needs-table]]
const (
	tableRule   = "QuestionTable"
	needsRule   = "NeedsTable"
	lengthRule  = "AnswerLength"
	needsHead   = "What the agent needs"
	cellWords   = 12
	perWords    = 1000
	tenths      = 10
	needsShape  = "Close it with the heading " + needsHead + " and a table headed No., question and proposed answer."
	questionAsk = "question"
)

var (
	tableHeads = []string{"question", "answer"}
	needsHeads = []string{"no.", "question", "proposed answer"}
	stopLine   = regexp.MustCompile(`(?i)^stop:\s*([a-z0-9-]+)\s*$`)
	lineBreak  = regexp.MustCompile(`\r?\n`)
	fenceLine  = regexp.MustCompile("^\\s*(```|~~~)")
	cellOpen   = regexp.MustCompile(`^\s*\|`)
	cellClose  = regexp.MustCompile(`\|\s*$`)
	ruledRow   = regexp.MustCompile(`^\|[\s:|-]+\|?$`)
	lettered   = regexp.MustCompile(`[A-Za-z0-9]`)
	needsTitle = regexp.MustCompile(`(?i)^#{1,6}\s+` + needsHead + `\s*$`)
)

// The bands a reading falls in. [[spec/design_output/level0#the-three-bands]]
const (
	bandClean   = "clean"
	bandCarry   = "carry"
	bandRewrite = "rewrite"
)

// [[spec/design_output/level0#the-tool-reads-a-draft]]
func (from Outside) checksAnswer(in Answer) string {
	text := in.Text
	if strings.TrimSpace(text) == "" {
		return noDraft
	}
	// The stop line alone ends a turn the answer before it reported, so it reads clean. [[spec/design_output/stop#the-stop-is-one-line]]
	if stopLine.MatchString(strings.TrimSpace(text)) {
		return clean
	}
	linted := from.Lint(text, answerAs)
	if !linted.Stands {
		return noRules
	}
	if !linted.Ran {
		return rulesUnread + linted.Why
	}
	bands := from.bands()
	found := append(tableFaults(text, from.questions()), needsFaults(text, in.Stop)...)
	found = append(found, lengthFaults(text, bands.Words)...)
	found = append(found, withContext(text, linted.Found)...)
	band := bandClean
	if len(found) > 0 {
		band = bandOf(scoreOf(text, len(found)), bands, found)
	}
	return answerFindings(answerAs, found, band == bandRewrite)
}

// The owner's question count, or none where no seam stands. [[spec/tickets/prose-tools-answer-in-go]]
func (from Outside) questions() int {
	if from.Questions == nil {
		return 0
	}
	return from.Questions()
}

// The answer's caps, or none where no seam stands. [[spec/tickets/prose-tools-answer-in-go]]
func (from Outside) bands() Bands {
	if from.Bands == nil {
		return Bands{}
	}
	return from.Bands()
}

// The question table an owner's question asks the answer to open with. [[spec/design_output/level0#the-table-answers-every-question]]
func tableFaults(text string, asked int) []prose.Refused {
	if asked < 1 {
		return nil
	}
	rows := lineBreak.Split(text, -1)
	at := 0
	for at < len(rows) && strings.TrimSpace(rows[at]) == "" {
		at++
	}
	var block []string
	for i := at; i < len(rows) && strings.TrimSpace(rows[i]) != ""; i++ {
		block = append(block, strings.TrimSpace(rows[i]))
	}
	head := ""
	if len(block) > 0 {
		head = block[0]
	}
	one := func(message string) []prose.Refused {
		return []prose.Refused{{Line: at + 1, Column: 1, Rule: tableRule, Said: head, Message: message}}
	}
	if !strings.HasPrefix(head, "|") {
		return one("The prompt asks " + many(asked, questionAsk) + ", and this answer opens with no table. Open it with a table headed question and answer.")
	}
	cells := lowered(cellsOf(head))
	if !headsOpen(cells, tableHeads) {
		return one("A question table heads its two columns question and answer, and this one reads " + orNothing(strings.Join(cells, ", ")) + ". Write the two names.")
	}
	body := 0
	for _, row := range block[1:] {
		if strings.HasPrefix(row, "|") && !ruledRow.MatchString(row) {
			body++
		}
	}
	if body < asked {
		return one("The prompt asks " + many(asked, questionAsk) + ", and the table holds " + many(body, "row") + ". Give every question a row, and say what blocks the open ones.")
	}
	return nil
}

// The needs table an answer ending on a stop closes with. [[spec/design_output/level0#the-needs-table]]
func needsFaults(spoken string, stopped bool) []prose.Refused {
	if !stopped {
		return nil
	}
	rows := lineBreak.Split(spoken, -1)
	end := len(rows) - 1
	for end >= 0 && strings.TrimSpace(rows[end]) == "" {
		end--
	}
	at := func(line int, said, message string) []prose.Refused {
		return []prose.Refused{{Line: line, Column: 1, Rule: needsRule, Said: said, Message: message}}
	}
	if end < 0 {
		return at(1, "", "This answer ends on a stop with no table above it. "+needsShape)
	}
	start := end
	for start > 0 && strings.TrimSpace(rows[start-1]) != "" {
		start--
	}
	var block []string
	for _, row := range rows[start : end+1] {
		block = append(block, strings.TrimSpace(row))
	}
	for _, row := range block {
		if !strings.HasPrefix(row, "|") {
			return at(start+1, block[0], "This answer ends on a stop with no table above it. "+needsShape)
		}
	}
	above := start - 1
	for above >= 0 && strings.TrimSpace(rows[above]) == "" {
		above--
	}
	heading := ""
	if above >= 0 {
		heading = strings.TrimSpace(rows[above])
	}
	if !needsTitle.MatchString(heading) {
		return at(start+1, block[0], "The table above the stop stands under no heading "+needsHead+". "+needsShape)
	}
	heads := lowered(cellsOf(block[0]))
	if len(heads) != len(needsHeads) || !headsOpen(heads, needsHeads) {
		return at(start+1, block[0], "The needs table reads "+orNothing(strings.Join(heads, ", "))+". "+needsShape)
	}
	var found []prose.Refused
	number := 0
	for i, row := range block[1:] {
		if ruledRow.MatchString(row) {
			continue
		}
		number++
		line := start + i + 2
		cells := cellsOf(row)
		if cells[0] != strconv.Itoa(number) {
			found = append(found, at(line, row, fmt.Sprintf("Row %d of the needs table carries the number %s. Number the rows 1, 2, 3 in order.", number, orNothing(cells[0])))...)
		}
		for _, cell := range cells[1:] {
			if strings.Contains(cell, "`") {
				found = append(found, at(line, cell, "A needs table cell holds no code. Put the detail above the table.")...)
			} else if words := wordsIn(cell); words > cellWords {
				found = append(found, at(line, cell, fmt.Sprintf("A needs table cell holds %d words, and this one holds %d. Put the detail above the table.", cellWords, words))...)
			}
		}
	}
	if number == 0 {
		return at(start+1, block[0], "The needs table holds no row. Write one, and where nothing waits, say so in it.")
	}
	return found
}

// The word cap an answer's prose meets, its tables left out. [[spec/design_output/level0#the-cap-counts-the-prose]]
func lengthFaults(text string, most int) []prose.Refused {
	if most < 1 {
		return nil
	}
	count := proseWordsIn(text)
	if count <= most {
		return nil
	}
	first := lineBreak.Split(strings.TrimSpace(text), -1)[0]
	return []prose.Refused{{Line: 1, Column: 1, Rule: lengthRule, Said: first, Message: fmt.Sprintf("An answer holds %d words outside its code and tables, and this one holds %d. Cut it to %d.", most, count, most)}}
}

// The words outside the table rows. [[spec/design_output/level0#the-cap-counts-the-prose]]
func proseWordsIn(text string) int {
	var kept []string
	for _, line := range lineBreak.Split(text, -1) {
		if !strings.HasPrefix(strings.TrimSpace(line), "|") {
			kept = append(kept, line)
		}
	}
	return wordsIn(strings.Join(kept, "\n"))
}

// The words outside a fence, each run of letters or digits between spaces. [[spec/design_output/level0#the-score-is-a-rate]]
func wordsIn(text string) int {
	fenced, count := false, 0
	for _, line := range lineBreak.Split(text, -1) {
		if fenceLine.MatchString(line) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		for _, one := range strings.Fields(line) {
			if lettered.MatchString(one) {
				count++
			}
		}
	}
	return count
}

// The findings a thousand words, to a tenth, off scoreOf in lib/voice.js. [[spec/design_output/level0#the-score-is-a-rate]]
func scoreOf(text string, findings int) float64 {
	words := wordsIn(text)
	if words == 0 {
		return 0
	}
	return math.Round(float64(findings)/float64(words)*perWords*tenths) / tenths
}

// A shape finding rewrites, and the score meets the caps a band sets. A cap at none reads as none set. [[spec/design_output/level0#the-three-bands]]
func bandOf(score float64, bands Bands, found []prose.Refused) string {
	for _, one := range found {
		if one.Rule == tableRule || one.Rule == needsRule || one.Rule == lengthRule {
			return bandRewrite
		}
	}
	if bands.Ceiling > 0 && score >= float64(bands.Ceiling) {
		return bandRewrite
	}
	if bands.WarnAt > 0 && score >= float64(bands.WarnAt) {
		return bandCarry
	}
	return bandClean
}

// The cells of a table row. [[spec/design_output/level0#the-table-answers-every-question]]
func cellsOf(row string) []string {
	cells := strings.Split(cellClose.ReplaceAllString(cellOpen.ReplaceAllString(row, ""), ""), "|")
	for at, cell := range cells {
		cells[at] = strings.TrimSpace(cell)
	}
	return cells
}

func lowered(cells []string) []string {
	for at, cell := range cells {
		cells[at] = strings.ToLower(cell)
	}
	return cells
}

// Whether the cells open with the heads named, in order. [[spec/design_output/level0#the-table-answers-every-question]]
func headsOpen(cells, heads []string) bool {
	for at, want := range heads {
		if at >= len(cells) || cells[at] != want {
			return false
		}
	}
	return true
}

func many(count int, what string) string {
	if count == 1 {
		return "1 " + what
	}
	return strconv.Itoa(count) + " " + what + "s"
}

func orNothing(said string) string {
	if said == "" {
		return "nothing"
	}
	return said
}
