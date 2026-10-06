// The VoiceParagraph scripts over the shape of a text: a run of paragraphs,
// the opening of an answer, and a line restating the table beside it.
// [[spec/design_output/rules#a-script-answers-offsets]]
package rules

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/yaml"
)

// The answer register's words: where a message names it, and the blocks its opening names. [[spec/design_output/projection#the-list-opens-an-answer]]
const (
	paraInAnswer         = " in an answer"
	paraTldr             = "tldr"
	paraQuestions        = "questions"
	paraOpensListSays    = "An answer opens with a list, one sentence an item and one bottom line each. Write that list here."
	paraOpensHeadingSays = "A heading stands under the TL;DR list, and this one opens the answer. Write the list first."
)

// The patterns of the answer opening and the table rule. [[spec/design_output/lsp#a-second-copy-draws]]
var (
	paraOpensList = regexp.MustCompile(`^(?:[-*+]|[0-9]+[.)])\s+\S`)
	paraWikiLink  = regexp.MustCompile(`\[\[[^\]]*\]\]`)
	paraNonWord   = regexp.MustCompile(`[^a-z0-9]+`)
	paraDivider   = regexp.MustCompile(`^[-: ]+$`)
)

// A run of paragraphs past its cap with no structure between them, and in an answer a first line that opens no list. [[spec/design_output/projection#a-layer-writes-two-files]]
func paraShape(answer bool) scriptMaker {
	return func(read Read) (script, error) {
		schema := paraSchemaOf(read)
		most, err := paraNumber(schema.layer("shape"), "paragraphsPerRun")
		where, opens, table := "", false, false
		if answer {
			where = paraInAnswer
			if held := yaml.AsDoc(schema.answer.Get("shape")); held.Has("paragraphsPerRun") {
				most, err = paraNumber(held, "paragraphsPerRun")
			}
			for _, one := range yaml.AsList(schema.answer.Get("opens")) {
				block := yaml.AsString(yaml.AsDoc(one).Get("block"))
				opens = opens || block == paraTldr
				table = table || block == paraQuestions
			}
		}
		if err != nil {
			return nil, err
		}
		return func(in scriptIn) []scriptMatch {
			said := paraFrontless(schema.prose, in.Text)
			rows := paraRows(schema.prose, said)
			out := paraRuns(rows, most, where)
			if opens {
				out = append(out, paraOpening(rows, table)...)
			}
			return out
		}, nil
	}
}

// The runs of paragraphs past the cap. [[spec/design_output/projection#a-layer-writes-two-files]]
func paraRuns(rows []paraRow, most int, where string) []scriptMatch {
	out := []scriptMatch{}
	fenced, inPara := false, false
	run, runStart, runEnd := 0, 0, 0
	closeRun := func() {
		if run > most {
			out = append(out, scriptMatch{Begin: runStart, End: runEnd, Message: fmt.Sprintf("A run holds %d paragraphs%s with no list, table or diagram between them, and this one holds %d. Carry the rest as structure.", most, where, run)})
		}
		run = 0
	}
	for _, row := range rows {
		trimmed := strings.TrimSpace(row.said)
		switch {
		case strings.HasPrefix(trimmed, "```"):
			inPara = false
			closeRun()
			fenced = !fenced
		case fenced:
		case trimmed == "":
			inPara = false
		case paraStructure(row.said):
			inPara = false
			closeRun()
		default:
			if !inPara {
				inPara = true
				if run == 0 {
					runStart = row.begin
				}
				run++
			}
			runEnd = row.end
		}
	}
	closeRun()
	return out
}

// The first line of an answer past its fences, its blanks and, where the questions table opens it, its table rows, which opens the list. [[spec/design_output/projection#the-list-opens-an-answer]]
func paraOpening(rows []paraRow, table bool) []scriptMatch {
	fence := false
	for _, row := range rows {
		line := strings.TrimSpace(row.said)
		if strings.HasPrefix(line, "```") {
			fence = !fence
			continue
		}
		if fence || line == "" || (table && strings.HasPrefix(line, "|")) {
			continue
		}
		if paraOpensList.MatchString(line) {
			return nil
		}
		why := paraOpensListSays
		if strings.HasPrefix(line, "#") {
			why = paraOpensHeadingSays
		}
		return []scriptMatch{paraOver(row, why)}
	}
	return nil
}

// The words a line holds, with a code span and a link blanked out. [[spec/design_output/lsp#a-second-copy-draws]]
func paraTableWords(one string) []string {
	clean := paraCodeSpan.ReplaceAllString(one, " ")
	clean = paraWikiLink.ReplaceAllString(clean, " ")
	clean = paraNonWord.ReplaceAllString(strings.ToLower(clean), " ")
	return strings.Fields(clean)
}

// Each run of words that long a place holds, so a long table takes one lookup a run. [[spec/design_output/lsp#a-second-copy-draws]]
func paraRunsOf(words []string, most int) map[string]bool {
	seen := map[string]bool{}
	for j := 0; j+most <= len(words); j++ {
		seen[strings.Join(words[j:j+most], " ")] = true
	}
	return seen
}

// Whether a place shares a run of words that long with the runs a cell holds. [[spec/design_output/lsp#a-second-copy-draws]]
func paraShares(words []string, seen map[string]bool, most int) bool {
	for i := 0; i+most <= len(words); i++ {
		if seen[strings.Join(words[i:i+most], " ")] {
			return true
		}
	}
	return false
}

// A heading, a row, an item, a quote and a blank stand outside the paragraph beside a table. [[spec/design_output/lsp#a-second-copy-draws]]
func paraAside(line string) bool {
	said := strings.TrimSpace(line)
	if said == "" {
		return true
	}
	for _, head := range []string{"#", "|", "-", ">"} {
		if strings.HasPrefix(said, head) {
			return true
		}
	}
	return false
}

// A line beside a table sharing a run of words with one of its cells. [[spec/design_output/lsp#a-second-copy-draws]]
func paraRestatedTable(read Read) (script, error) {
	schema := paraSchemaOf(read)
	most, err := paraNumber(schema.layer("restated"), "table")
	if err != nil {
		return nil, err
	}
	rowOf := func(line paraRow) bool { return strings.HasPrefix(strings.TrimSpace(line.said), "|") }
	return func(in scriptIn) []scriptMatch {
		out := []scriptMatch{}
		lines := paraRows(schema.prose, paraFrontless(schema.prose, in.Text))
		at := 0
		for at < len(lines) {
			if !rowOf(lines[at]) {
				at++
				continue
			}
			from := at
			cells := []map[string]bool{}
			for at < len(lines) && rowOf(lines[at]) {
				for _, cell := range strings.Split(strings.TrimSpace(lines[at].said), "|") {
					if one := strings.TrimSpace(cell); one != "" && !paraDivider.MatchString(one) {
						cells = append(cells, paraRunsOf(paraTableWords(one), most))
					}
				}
				at++
			}
			near := []paraRow{}
			up := from - 1
			for up >= 0 && strings.TrimSpace(lines[up].said) == "" {
				up--
			}
			for up >= 0 && !paraAside(lines[up].said) {
				near = append(near, lines[up])
				up--
			}
			down := at
			for down < len(lines) && strings.TrimSpace(lines[down].said) == "" {
				down++
			}
			for down < len(lines) && !paraAside(lines[down].said) {
				near = append(near, lines[down])
				down++
			}
			for _, row := range near {
				mine := paraTableWords(row.said)
				for _, cell := range cells {
					if paraShares(mine, cell, most) {
						out = append(out, paraOver(row, "This line says again what a cell of the table beside it holds. Cut it, and let the table carry it."))
						break
					}
				}
			}
		}
		return out
	}, nil
}
