package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// THE LINT. Every rule a token has to keep, run over the tokens that exist.
//
// The mint checks the same rules, and that is not enough on its own. A note is
// a markdown file a person edits by hand, and a rule added after the work was
// minted has to reach the work. So the check has two homes and one
// implementation.

// File and Line are what an editor needs to put the mark on the right row.
// A finding about no place in particular leaves them empty.
type Finding struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Says  string `json:"says"`
	File  string `json:"file,omitempty"`
	Line  int    `json:"line,omitempty"`
}

// LintTokens names what breaks a rule. An empty answer is a clean ledger.
func LintTokens(r Roots) []Finding {
	var out []Finding
	for _, t := range Tokens(r) {
		if err := checkTitle(t.Title); err != nil {
			out = append(out, Finding{ID: t.ID, Title: t.Title, Says: err.Error()})
		}
		for _, dir := range workDirs(r) {
			b, err := os.ReadFile(filepath.Join(dir, t.ID+".md"))
			if err != nil {
				continue
			}
			for _, line := range timesIn(string(b)) {
				out = append(out, Finding{ID: t.ID, Title: t.Title,
					Says: "a token carries no time, and this one carries " + line})
			}
			for _, line := range holdersIn(string(b)) {
				out = append(out, Finding{ID: t.ID, Title: t.Title,
					Says: "a hold ends with the session, so the record goes stale: " + line})
			}
		}
	}
	return out
}

// LintIcons names every icon a control asks for that the table does not hold.
//
// AN UNDECLARED NAME DRAWS ITSELF, so the mistake reaches a button as a bare
// word rather than as a blank. That is visible, and this is how it is caught
// before somebody sees it.
func LintIcons(r Roots) []Finding {
	icons, err := Icons(r)
	if err != nil {
		return []Finding{{ID: "icons", Says: err.Error()}}
	}
	// A CHECK THAT CANNOT READ WHAT IT GUARDS SAYS SO. Returning nothing here
	// made the lint answer clean precisely when the file was missing or broken,
	// which is the moment it was most worth hearing from.
	raw, err := os.ReadFile(filepath.Join(r.Method, "util", "parameters.json"))
	if err != nil {
		return []Finding{{ID: "util/parameters.json", Title: "the declaration",
			Says: "cannot be read, so nothing about it was checked: " + err.Error()}}
	}
	var root Node
	if err := json.Unmarshal(raw, &root); err != nil {
		return []Finding{{ID: "util/parameters.json", Title: "the declaration",
			Says: "cannot be read, so nothing about it was checked: " + err.Error()}}
	}
	var out []Finding
	Walk(root, "", func(path string, n Node) {
		for _, want := range append(valuesOf(n.Labels), n.Label) {
			if want == "" || !plainName(want) {
				continue
			}
			if _, ok := icons[want]; !ok {
				out = append(out, Finding{ID: path, Title: n.Name,
					Says: "names the icon " + want + ", and util/icons.json has no such name"})
			}
		}
	})
	return out
}

func valuesOf(m map[string]string) []string {
	var out []string
	for _, v := range m {
		out = append(out, v)
	}
	return out
}

// A LABEL IS A NAME OR A GLYPH, and this is how they are told apart. A name is
// written in the letters a person types.
func plainName(s string) bool {
	for _, r := range s {
		if r > 127 {
			return false
		}
	}
	return s != ""
}

// LintLimits names a declared range nothing can reach, and a number the engine
// and the declaration disagree about.
//
// A DECLARED RANGE HAS TO TELL THE TRUTH. narrow smaller means a stored value
// above the default is ignored, so a maximum above the default is a range a
// person is offered and cannot use.
//
// ONE NUMBER DECLARED TWICE HAS TO AGREE WITH ITSELF. The floor in Go and the
// default in the declaration are one fact in two places, and nothing said so
// while they happened to match.
func LintLimits(r Roots) []Finding {
	root, err := LoadTree(r.Method)
	if err != nil {
		return []Finding{{ID: "util/parameters.json", Title: "the declaration",
			Says: "cannot be read, so no limit was checked: " + err.Error()}}
	}
	var out []Finding
	floor := TheFloor()
	inGo := map[string]int{
		// THE NUMBER OF HANDS IS ONE DATUM IN TWO FILES. A box with no tree
		// reads the floor and a box with one reads the declaration, so a change
		// to either alone is two machines staffing the queue differently.
		"quackitect.limits.parallel_agents":            floor.ParallelAgents,
		"quackitect.limits.heartbeat_seconds":          floor.HeartbeatSeconds,
		"quackitect.limits.ready_budget_ms":            floor.ReadyBudgetMs,
		"quackitect.limits.pulls_before_hold_is_stale": floor.PullsBeforeHoldIsStale,
	}
	Walk(root, "", func(path string, n Node) {
		d, hasDefault := toNumber(n.Default)
		if n.Narrow == "smaller" && hasDefault && n.Max != nil && *n.Max > d {
			top := *n.Max
			out = append(out, Finding{ID: path, Title: n.Name, Says: fmt.Sprintf(
				"offers up to %v and may only be made smaller than %v, so the range above %v is one nobody can reach",
				top, d, d)})
		}
		if want, ok := inGo[path]; ok && hasDefault && int(d) != want {
			out = append(out, Finding{ID: path, Title: n.Name, Says: fmt.Sprintf(
				"is %v in the declaration and %d in the engine, and one number cannot be two", d, want)})
		}
		delete(inGo, path)
	})
	for path := range inGo {
		out = append(out, Finding{ID: path, Title: path,
			Says: "is a number in the engine and nothing declares it"})
	}
	return out
}

func runLint(c *call) int {
	fs := flag.NewFlagSet("lint", flag.ContinueOnError)
	fs.SetOutput(c.err)
	fs.Usage = func() {
		fmt.Fprintln(c.err, "se lint - read every work token and name what breaks a rule.")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se lint          say what is wrong, and exit non-zero if anything is")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	if code, stop := c.parse(fs, "lint"); stop {
		return code
	}

	roots := c.roots
	found := append(LintTokens(roots), LintIcons(roots)...)
	found = append(found, LintLimits(roots)...)
	found = append(found, LintGuidance(roots)...)
	found = append(found, LintRationales(roots)...)
	found = append(found, LintProcesses(roots)...)
	c.answerJSON(map[string]any{"findings": found, "clean": len(found) == 0})
	if len(found) > 0 {
		return 1
	}
	return 0
}

// A TOKEN CARRIES NO TIME. It travels, and a time on it says when somebody was
// at their desk. The record holds every moment instead, and the record never
// travels.
//
// A note is edited by hand and a rule added after the work was minted has to
// reach the work, so this reads what is on disk rather than what this program
// would have written.
func timesIn(text string) []string {
	var found []string
	for _, line := range strings.Split(text, "\n") {
		l := strings.TrimSpace(line)
		for _, key := range []string{"opened:", "taken_at:", "sent_at:", "closed_at:", "**at:**", "at:"} {
			if strings.HasPrefix(l, key) {
				found = append(found, l)
			}
		}
	}
	return found
}

// A TOKEN CARRIES NO HOLDER EITHER, and this is the same rule reaching prose.
// A hold ends with the session, so a note saying who holds something is wrong
// from the next session on, and nobody rereads it. The engine holds the holds
// and answers for them, so the note names the door rather than the answer.
//
// IT IS THE SPELLINGS RATHER THAN ONE OF THEM. Saying a token is unheld goes
// stale exactly as fast as saying who has it, so both are here, and a line that
// names an actor without claiming a hold is left alone.
// AND A LINE THAT DESCRIBES HOLDING IS NOT A LINE THAT CLAIMS A HOLD.
//
// This matched four spellings anywhere in a line, and a token's detail is where
// an engineer writes about the engine. So "AgentGone leaves no open token held
// by that agent", "the unheld loop in next()" and every sentence naming the
// behaviour under repair were reported as stale holder claims. Seven findings
// stood against the tree, none of them a hold, and a lint answering mostly
// noise is one a reader learns to run past.
//
// WHAT A CLAIM LOOKS LIKE. It names WHO, and the who is an actor: a name like
// worker-one or reviewer-nyx, or a plain nobody-in-particular the engine writes.
// A generic word after the phrase is prose about the rule rather than a claim
// about this token, and a code identifier is not English at all.
func holdersIn(text string) []string {
	var found []string
	for _, line := range strings.Split(text, "\n") {
		l := strings.TrimSpace(line)
		low := strings.ToLower(l)
		for _, says := range []string{"held by", "is held", "the holder is", "unheld"} {
			at := strings.Index(low, says)
			if at < 0 {
				continue
			}
			if !claimsAHold(low, says, at) {
				continue
			}
			found = append(found, l)
			break
		}
	}
	return found
}

// claimsAHold answers whether this occurrence names somebody rather than
// describing the rule.
func claimsAHold(low, says string, at int) bool {
	// "unheld" IS A WORD IN AN IDENTIFIER MORE OFTEN THAN A CLAIM. A hold is
	// claimed by naming a holder, and saying a token is unheld names nobody, so
	// it only counts as English: a letter or an underscore against it makes it
	// part of something else, like the unheld loop in next().
	rest := low[at+len(says):]
	if says == "unheld" {
		before := byte(' ')
		if at > 0 {
			before = low[at-1]
		}
		if isWordByte(before) || (len(rest) > 0 && isWordByte(rest[0])) {
			return false // part of a longer word, so not this word at all
		}
		// IT IS A CLAIM ONLY WHEN SOMETHING IS SAID TO BE UNHELD. As an
		// adjective it names code, and the unheld loop in next() is the line
		// that made this rule worth narrowing.
		return strings.HasSuffix(low[:at], "is ") || strings.HasSuffix(low[:at], "was ") ||
			strings.HasSuffix(low[:at], "are ") || strings.HasSuffix(low[:at], "were ") ||
			strings.HasPrefix(strings.TrimSpace(rest), "token")
	}
	// "the holder is" ALREADY NAMES THE HOLDER, so whatever follows is the who,
	// and "the holder is the reviewer who asked" is a claim like any other. Only
	// the two phrases where a generic word can stand in for a person are
	// narrowed below.
	if says == "the holder is" {
		return true
	}
	// THE WHO COMES NEXT, and a word that names no one particular is the rule
	// being described rather than this token being claimed. "held by that agent"
	// and "held by agents that are gone" are sentences about how the engine
	// behaves, and they were the bulk of what this rule reported.
	next := strings.Fields(rest)
	if len(next) == 0 {
		return false // the line stops before it says who, so it names nobody
	}
	switch strings.Trim(next[0], ".,:;\"'`)") {
	case "a", "an", "that", "this", "any", "some", "no", "another",
		"agents", "agent", "somebody", "anybody", "nobody", "whoever", "them", "it":
		return false
	}
	return true
}

func isWordByte(b byte) bool {
	return b == '_' || (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z') || (b >= '0' && b <= '9')
}
