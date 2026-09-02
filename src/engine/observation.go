package main

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// AN OBSERVATION NAMES THE TEST AND WHAT IT SAID, NOT A LINE NUMBER.
//
// THE OWNER'S WORDS: why are you even baking line numbers into assertions, that
// is insane, this is again that thing where you make assertions about something
// that you have no control over.
//
// The Go runner prints file, line and message on one line, and the recorded red
// was a copy of that whole line. The line number was never chosen, it was
// carried along, and it moves whenever anybody adds a function above it.

// TheTestNamed answers the test an observation names, or "". An observation
// reads TestSomething: what it said, so the name is what stands before the
// first colon.
func TheTestNamed(said string) string {
	at := strings.Index(said, ":")
	if at < 0 {
		return ""
	}
	name := strings.TrimSpace(said[:at])
	if !strings.HasPrefix(name, "Test") || strings.ContainsAny(name, " \t/\\.") {
		return ""
	}
	return name
}

// theAddress is the old form: a file and a line where a name belongs.
var theAddress = regexp.MustCompile(`^[\w./\\-]+\.(?:go|ts|mjs):\d+:\s*`)

// TheMessageOf answers what an observation says, which is everything after the
// name it carries.
//
// AN ADDRESS IS STRIPPED BEFORE THE MATCH. An observation in the old form
// carries the file and line in front of the message, so a prefix match against
// the assertion would never fire and the very shape this rule exists to catch
// would be silently exempt.
func TheMessageOf(said string) string {
	if TheTestNamed(said) == "" {
		return strings.TrimSpace(theAddress.ReplaceAllString(strings.TrimSpace(said), ""))
	}
	return strings.TrimSpace(said[strings.Index(said, ":")+1:])
}

var declares = regexp.MustCompile(`(?m)^func (Test\w+)\(`)

// TestsDeclared answers every test function declared under src.
func TestsDeclared(root string) map[string]bool {
	out := map[string]bool{}
	for _, text := range everySource(root) {
		for _, m := range declares.FindAllStringSubmatch(text, -1) {
			out[m[1]] = true
		}
	}
	return out
}

var asserts = regexp.MustCompile(`\.(?:Errorf|Fatalf|Error|Fatal)\(\s*"((?:[^"\\]|\\.)*)"`)

// ThePrefixes answers every assertion's format string under src, cut at its
// first verb.
//
// THE CUT IS A FACT ABOUT THE SOURCE rather than a guess about the output. The
// runner has already substituted the values by the time an observation is
// written, so nothing in the recorded line says where a value began. Reading the
// format string the other way round is the half that can be computed.
//
// A FORMAT STRING OPENING WITH A VERB YIELDS THE EMPTY PREFIX AND IS DROPPED. A
// prefix everything begins with is a rule nothing can fail.
func ThePrefixes(root string) []string {
	seen := map[string]bool{}
	var out []string
	for _, text := range everySource(root) {
		for _, m := range asserts.FindAllStringSubmatch(text, -1) {
			cut := theLead(unescaped(m[1]))
			if cut == "" || seen[cut] {
				continue
			}
			seen[cut] = true
			out = append(out, cut)
		}
	}
	return out
}

// theLead is the run of a format string before its first verb. A string with no
// verb is its own lead, which is an exact match.
func theLead(format string) string {
	for i := 0; i+1 < len(format); i++ {
		if format[i] != '%' {
			continue
		}
		if format[i+1] == '%' {
			i++
			continue
		}
		return strings.TrimSpace(format[:i])
	}
	return strings.TrimSpace(format)
}

// TheObservationIsSound answers what is wrong with one, or "".
//
// TWO HALVES, AND THE TEST NAME IS THE ONE THAT DECIDES. Where the message
// matches an assertion under src, the observation has to name a test the tree
// declares. Where it matches nothing, it is left as it stands: inventing a test
// name for a run nobody can find is worse than a stale address.
func TheObservationIsSound(said string, tests map[string]bool, prefixes []string) string {
	if !TheMessageMatches(TheMessageOf(said), prefixes) {
		return ""
	}
	name := TheTestNamed(said)
	if name == "" {
		return "it names no test, and its message is one an assertion under src produces"
	}
	if !tests[name] {
		return "it names " + name + ", and no test of that name is declared under src"
	}
	return ""
}

// TheMessageMatches answers whether a recorded message begins with the lead of
// some assertion under src. It is what the word matches means on this token,
// wherever it is used.
func TheMessageMatches(message string, prefixes []string) bool {
	for _, p := range prefixes {
		if strings.HasPrefix(message, p) {
			return true
		}
	}
	return false
}

func everySource(root string) []string {
	var out []string
	_ = filepath.Walk(filepath.Join(root, "src"), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			if info.Name() == "node_modules" || info.Name() == "out" {
				return filepath.SkipDir
			}
			return nil
		}
		if !strings.HasSuffix(path, ".go") {
			return nil
		}
		b, err := os.ReadFile(path)
		if err == nil {
			out = append(out, string(b))
		}
		return nil
	})
	return out
}

func unescaped(s string) string {
	s = strings.ReplaceAll(s, `\"`, `"`)
	s = strings.ReplaceAll(s, `\n`, "\n")
	s = strings.ReplaceAll(s, `\t`, "\t")
	return strings.ReplaceAll(s, `\\`, `\`)
}

// EveryObservation answers every recorded red said in the record, with the
// token it sits on.
type Observation struct {
	Token string
	Said  string
}

func EveryObservation(r Roots) []Observation {
	var out []Observation
	for _, dir := range workDirs(r) {
		names, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, n := range names {
			if n.IsDir() || !strings.HasSuffix(n.Name(), ".md") {
				continue
			}
			b, err := os.ReadFile(filepath.Join(dir, n.Name()))
			if err != nil {
				continue
			}
			for _, line := range strings.Split(string(b), "\n") {
				l := strings.TrimSpace(line)
				if strings.HasPrefix(l, leadRed) {
					out = append(out, Observation{
						Token: strings.TrimSuffix(n.Name(), ".md"),
						Said:  strings.TrimPrefix(l, leadRed),
					})
				}
			}
		}
	}
	return out
}
