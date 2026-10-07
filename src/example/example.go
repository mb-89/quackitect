// The one parser of an example: the front, the chapter its path names, and the
// steps its shell blocks hold, each a call with the expect lines under it.
// A pure package, so the check, the harness, the run verb and the tab read one shape.
// [[spec/design_output/examples#the-format]]
package example

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

const (
	runme      = "./RUNME.sh"
	expectOpen = "# expect:"
	// A field expect names its ticket, its field and its value.
	fieldWords = 3
)

var (
	chapterAt = regexp.MustCompile(`(?:^|/)spec/examples/([0-9]{3}_[a-z0-9_]+)/[^/]+\.md$`)
	devAt     = regexp.MustCompile(`^9[0-9]{2}_dev_`)
	shellAt   = regexp.MustCompile("^\\s*```\\s*(sh|bash|shell)\\s*$")

	// The words each form takes, past the form itself. [[spec/design_output/examples#the-format]]
	forms = map[string]int{"exit": 1, "says": 1, "quiet": 1, "stands": 1, "field": fieldWords}
)

// A line out of shape, by its line and the rule it breaks. [[spec/design_output/examples#the-format]]
type Fault struct {
	Line    int
	Rule    string
	Message string
}

// One expect line: its form, the words after the form, and its line. [[spec/design_output/examples#the-format]]
type Expect struct {
	Form  string
	Words []string
	Line  int
}

// One call: the prose standing before it, the words past ./RUNME.sh, its line and its expect lines. [[spec/design_output/examples#the-format]]
type Step struct {
	Prose   string
	Call    []string
	Line    int
	Expects []Expect
}

// An example as one parser reads it. [[spec/design_output/examples#the-places]]
type Example struct {
	Path      string
	Chapter   string
	Dev       bool
	Title     string
	Keywords  []string
	Interface []string
	Edge      string
	Steps     []Step
}

// Reads an example off its path and text, and answers the faults beside it. [[spec/design_output/examples#the-format]]
func Read(path, text string) (Example, []Fault) {
	out := Example{Path: path}
	faults := []Fault{}
	if chapter := chapterAt.FindStringSubmatch(path); chapter != nil {
		out.Chapter = chapter[1]
		out.Dev = devAt.MatchString(chapter[1])
	} else {
		faults = append(faults, Fault{1, "Chapter", fmt.Sprintf("%s stands in no chapter: an example stands at spec/examples/<number>_<name>/<example>.md.", path)})
	}

	rows := yaml.SplitLines(text)
	front := note.FrontOf(rows)
	out.Title = yaml.AsString(front.Said.Get("title"))
	out.Keywords = yaml.StringsOf(front.Said.Get("keywords"))
	out.Interface = yaml.StringsOf(front.Said.Get("interface"))
	out.Edge = yaml.AsString(front.Said.Get("edge"))

	start := 0
	if front.Stands {
		start = front.Close + 1
	}
	steps, more := stepsOf(rows, start)
	out.Steps = steps
	return out, append(faults, more...)
}

// The steps the shell blocks hold, each call under the prose standing before it. [[spec/design_output/examples#the-format]]
func stepsOf(rows []string, start int) ([]Step, []Fault) {
	steps := []Step{}
	faults := []Fault{}
	prose := []string{}
	shell, fenced, called, refused := false, false, false, false
	for i := start; i < len(rows); i++ {
		line, at := rows[i], i+1
		bare := strings.TrimSpace(line)
		switch {
		case !fenced && shellAt.MatchString(line):
			fenced, shell, called, refused = true, true, false, false
		case note.FenceAt.MatchString(line):
			fenced, shell = !fenced, false
		case fenced && !shell:
		case !fenced:
			if bare != "" {
				prose = append(prose, bare)
			}
		case bare == "":
		case strings.HasPrefix(bare, expectOpen):
			if !called {
				faults = append(faults, Fault{at, "Expect", "An expect line stands under the call it asserts, and no call stands above this one."})
				continue
			}
			if refused {
				continue
			}
			if expect, fault := expectOf(strings.TrimSpace(strings.TrimPrefix(bare, expectOpen)), at); fault != "" {
				faults = append(faults, Fault{at, "Expect", fault})
			} else {
				last := &steps[len(steps)-1]
				last.Expects = append(last.Expects, expect)
			}
		default:
			call, fault := callOf(bare)
			if fault != "" {
				faults = append(faults, Fault{at, "Call", fault})
				called, refused = true, true
				continue
			}
			steps = append(steps, Step{Prose: strings.Join(prose, " "), Call: call, Line: at})
			prose, called, refused = nil, true, false
		}
	}
	return steps, faults
}

// The words past ./RUNME.sh, or why the line is no call. [[spec/design_output/examples#the-format]]
func callOf(line string) ([]string, string) {
	words, fault := wordsOf(line)
	if fault != "" {
		return nil, fault
	}
	if len(words) == 0 || words[0] != runme {
		return nil, fmt.Sprintf("A shell block holds ./RUNME.sh calls and expect lines alone, and this line reads %q.", line)
	}
	return words[1:], ""
}

// One expect line past its opening, or why its form falls outside the table. [[spec/design_output/examples#the-format]]
func expectOf(said string, at int) (Expect, string) {
	form, rest, _ := strings.Cut(said, " ")
	rest = strings.TrimSpace(rest)
	takes, known := forms[form]
	if !known {
		return Expect{}, fmt.Sprintf("An expect line takes exit, says, quiet, stands or field, and this one reads %q.", form)
	}
	words, fault := wordsOf(rest)
	switch {
	case fault != "":
		return Expect{}, fault
	case len(words) != takes:
		return Expect{}, fmt.Sprintf("An expect %s takes %d words, and this one holds %d.", form, takes, len(words))
	case form == "exit":
		if _, err := strconv.Atoi(words[0]); err != nil {
			return Expect{}, fmt.Sprintf("An expect exit takes a number, and this one reads %q.", words[0])
		}
	case (form == "says" || form == "quiet") && !strings.HasPrefix(rest, `"`):
		return Expect{}, fmt.Sprintf("An expect %s takes its phrase in double quotes.", form)
	}
	return Expect{Form: form, Words: words, Line: at}, ""
}

// The shell words of a line, or why the line holds more than one call. [[spec/design_output/examples#the-format]]
func wordsOf(line string) ([]string, string) {
	words := []string{}
	word := strings.Builder{}
	held, quote := false, rune(0)
	runes := []rune(line)
	for i := 0; i < len(runes); i++ {
		one := runes[i]
		switch {
		case quote == '\'':
			if one == '\'' {
				quote = 0
			} else {
				word.WriteRune(one)
			}
		case one == '`' || (one == '$' && i+1 < len(runes) && runes[i+1] == '('):
			return nil, "A call holds no substitution, so every call stands fakeable."
		case quote == '"':
			switch {
			case one == '"':
				quote = 0
			case one == '\\' && i+1 < len(runes):
				i++
				word.WriteRune(runes[i])
			default:
				word.WriteRune(one)
			}
		case one == '\'' || one == '"':
			quote, held = one, true
		case strings.ContainsRune("|&;<>", one):
			return nil, "A call stands one a line, with no pipe, redirect or chain."
		case one == ' ' || one == '\t':
			if held {
				words = append(words, word.String())
				word.Reset()
				held = false
			}
		default:
			word.WriteRune(one)
			held = true
		}
	}
	if quote != 0 {
		return nil, "A quote opens on this line and closes nowhere."
	}
	if held {
		words = append(words, word.String())
	}
	return words, ""
}
