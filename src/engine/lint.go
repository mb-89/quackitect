package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
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

// LintWork reads every work token against the schema its kind names.
//
// THE ONE CORPUS THE SCHEMA LINT NEVER SAW. Guidance and rationales went
// through LintNotes from the start. The token lint read a title and looked for
// times, so a token whose chapters broke its schema was clean to se lint and
// red only in the editor.
//
// A FOLDER THAT IS NOT THERE IS NOT A FINDING. A tree with no private work
// folder has nothing to read there, which is every clone that never made one.
func LintWork(r Roots) []Finding {
	var out []Finding
	for _, dir := range workDirs(r) {
		if _, err := os.Stat(dir); os.IsNotExist(err) {
			continue
		}
		out = append(out, LintNotes(r, dir)...)
	}
	return out
}

// aLint is one corpus se lint reads, and the name a reader is given for it.
type aLint struct {
	Name string
	Read func(Roots) []Finding
}

// theLints are the corpora the verb reads, named once.
var theLints = []aLint{
	{"tokens", LintTokens},
	{"work tokens against their schema", LintWork},
	{"icons", LintIcons},
	{"limits", LintLimits},
	{"guidance", LintGuidance},
	{"rationales", LintRationales},
	{"processes", LintProcesses},
}

// whatTheLintReads is the list, as the help line says it.
//
// THE HELP AND THE VERB WERE TWO LISTS AND THEY DRIFTED. The line said tokens,
// guidance and Go while the verb also read icons, limits, rationales and
// processes, and read no work token against its schema at all. One list is one
// answer. Go is named after it, because it is the one lint that takes a
// context and answers what it could not run.
func whatTheLintReads() string {
	names := make([]string, 0, len(theLints))
	for _, one := range theLints {
		names = append(names, one.Name)
	}
	return strings.Join(names, ", ") + " and Go"
}

// LintTokens names what breaks a rule. An empty answer is a clean ledger.
func LintTokens(r Roots) []Finding {
	var out []Finding
	checks := checkNames(r)
	known, err := theIDsThatOpen(r)
	if err != nil {
		// A CHECK THAT CANNOT READ WHAT IT GUARDS SAYS SO, rather than
		// answering clean at the moment the archive is the thing that is broken.
		out = append(out, Finding{ID: "doc/work/archive.jsonl", Title: "the archive",
			Says: "cannot be read, so no id written into a note was checked: " + err.Error()})
	}
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
			for _, line := range holdersIn(string(b), checks) {
				out = append(out, Finding{ID: t.ID, Title: t.Title,
					Says: "a hold ends with the session, so the record goes stale: " + line})
			}
			for _, id := range idsNamingNothing(string(b), t.ID, known) {
				out = append(out, Finding{ID: t.ID, Title: t.Title,
					Says: "names " + id + ", and no token and no archive row answers to it"})
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
		fmt.Fprintln(c.err, "se lint - read the tree and name what breaks a rule: "+whatTheLintReads()+".")
		fmt.Fprintln(c.err, "")
		fmt.Fprintln(c.err, "  se lint          say what is wrong, and exit non-zero if anything is")
		fmt.Fprintln(c.err, "  se format        run this first: a formatter settles what a lint reports")
		fmt.Fprintln(c.err, "")
		fs.PrintDefaults()
	}
	fs.String("work", "", "the folder being worked on (default: this one)")
	if code, stop := c.parse(fs, "lint"); stop {
		return code
	}

	roots := c.roots
	var found []Finding
	for _, one := range theLints {
		found = append(found, one.Read(roots)...)
	}
	// THE GO IS PART OF THE TREE THIS READS. It was checked by four programs
	// the guidance named and the agent was told to remember, so it was read
	// when the battery ran and at no other time.
	inGo, refused := LintGo(c.ctx, roots)
	found = append(found, inGo...)
	// CLEAN IS NOT THE SAME AS NOTHING FOUND. A box where golangci-lint will
	// not start finds nothing through it, and clean read as findings alone
	// answered that the tree was fine while half the tools never ran. Only the
	// refused list said otherwise, and a caller that reads clean does not read
	// it. A tree judged by some of its tools is not a tree that came back
	// clean.
	c.answerJSON(map[string]any{"findings": found,
		"clean": len(found) == 0 && len(refused) == 0, "refused": refused})
	if len(found) > 0 {
		return 1
	}
	return 0
}

// namesAToken is how a work token id is written wherever one is written.
var namesAToken = regexp.MustCompile(`wk-[0-9a-f]{10}`)

// theIDsThatOpen answers every id this tree can still be asked about: a token
// on the disk, or a row in the archive. An error means the archive could not be
// read, and the answer is nil rather than partial, so nothing is judged against
// half a ledger.
func theIDsThatOpen(r Roots) (map[string]bool, error) {
	rows, err := TheArchive(r)
	if err != nil {
		return nil, err
	}
	known := map[string]bool{}
	for _, t := range Tokens(r) {
		known[t.ID] = true
	}
	for _, row := range rows {
		known[row.ID] = true
	}
	return known, nil
}

// AN ID WRITTEN INTO A NOTE REACHES SOMETHING, OR IT IS A FINDING.
//
// A closed token's evidence said one token each had been minted for three
// files. Two landed and archived. The third was reported missing, and nothing
// in the tree could tell the reader whether that sentence was true. The lint
// read the tokens that exist and never asked whether an id inside one opens.
//
// A CLOSED TOKEN COUNTS, because that is how finished work is traced. A nil
// known is the archive saying it could not be read, and nothing is reported
// against it.
//
// IT SKIPS THE NOTE'S OWN ID, which a note names about itself rather than as a
// reference, and it says each missing id once however often it is written.
func idsNamingNothing(text, self string, known map[string]bool) []string {
	if known == nil {
		return nil
	}
	var found []string
	seen := map[string]bool{}
	for _, id := range namesAToken.FindAllString(text, -1) {
		if id == self || known[id] || seen[id] {
			continue
		}
		seen[id] = true
		found = append(found, id)
	}
	return found
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
// checkNames answers the checks this tree carries, by name and without the
// extension. A NAME THE TREE CARRIES AS A CHECK IS NOT A PERSON: a note saying
// a rule is held by render-check says what pins it, and a check does not change
// hands when the session rolls. Reading the folder rather than a list means a
// check born tomorrow is answered the same way.
func checkNames(r Roots) map[string]bool {
	out := map[string]bool{}
	entries, err := os.ReadDir(filepath.Join(r.Method, filepath.FromSlash(checksDir)))
	if err != nil {
		return out // no checks here, so no name is one
	}
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if name := strings.TrimSuffix(e.Name(), filepath.Ext(e.Name())); name != "" {
			out[name] = true
		}
	}
	return out
}

func holdersIn(text string, checks map[string]bool) []string {
	var found []string
	for _, line := range strings.Split(text, "\n") {
		l := strings.TrimSpace(line)
		low := strings.ToLower(l)
		for _, says := range []string{"held by", "is held", "the holder is", "unheld"} {
			at := strings.Index(low, says)
			if at < 0 {
				continue
			}
			if !claimsAHold(low, says, at, checks) {
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
func claimsAHold(low, says string, at int, checks map[string]bool) bool {
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
	next := strings.Fields(rest)
	word := func(i int) string {
		if i >= len(next) {
			return ""
		}
		return strings.Trim(next[i], ".,:;\"'`)")
	}

	// "the holder is" ALREADY NAMES THE HOLDER, so whatever follows is the who.
	// A word that is a state rather than a person is the engine being described:
	// "the holder is engine state", "the holder is alive", "the holder is not
	// called stale". None of those goes stale when a session ends.
	if says == "the holder is" {
		who := word(0)
		// AN ARTICLE IS NOT THE WHO. "the holder is the engine and not a field
		// on the token" names a thing one word further on, and the words below
		// decide that word instead.
		if who == "the" || who == "a" || who == "an" {
			who = word(1)
		}
		// WHAT THE HOLDER IS DOING IS NOT WHO IT IS. "the holder is pulling
		// again" says what the engine found, not whose hands the token is in,
		// and nothing about it goes stale when the session ends.
		if strings.HasSuffix(who, "ing") {
			return false
		}
		switch who {
		case "not", "neither", "never", "still", "alive", "gone", "engine", "then", "":
			return false
		}
		return true
	}

	// "is held TO" IS A STANDARD, NOT A HOLD. An agent is held to the voice
	// rules, and nobody is holding it. The two senses are one word apart.
	if says == "is held" {
		switch word(0) {
		case "to":
			return false
		case "by":
			// "is held by X" IS THE SAME SENTENCE AS "held by X", and both
			// spellings match here, so the who is read past the by rather than
			// judged as if it were the who.
			return namesSomebody(word(1), checks)
		}
		// A TOKEN SAID TO BE HELD CLAIMS A HOLD WITHOUT NAMING ANYBODY, and it
		// goes stale exactly as fast. That is the rule's other half, and it is
		// about THIS TOKEN, said outright.
		return theTokenIsTheSubject(low[:at])
	}

	// THE WHO COMES NEXT, and a word naming no one particular is the rule being
	// described rather than this token being claimed. "held by that agent" and
	// "held by agents that are gone" are sentences about how the engine behaves,
	// and they were the bulk of what this rule reported.
	return namesSomebody(word(0), checks)
}

// theTokenIsTheSubject answers whether what stands before "is held" is this
// token, claimed outright.
//
// THE OTHER HALF OF THE RULE READ EVERY SENTENCE CARRYING THE WORDS. A note is
// where an engineer writes about the engine, and "the class is held rather than
// the instance", "a cloud box is held until its notes are in git" and "name the
// test as where it is held" were each reported as a stale claim on the token
// they happen to sit on. The lint stood at five findings with no hold among
// them, which is the state the first narrowing was written to end.
//
// SO THE SUBJECT HAS TO BE THE TOKEN. Saying a token is held goes stale with
// the session; a class, a box or a ruling being held is prose about the engine
// and it stays true.
//
// AND THE CLAIM IS MADE OUTRIGHT. "where it is held" names the place a thing
// lives rather than saying anything is held now, so a relative word in front of
// the subject takes the sentence back out of the rule.
func theTokenIsTheSubject(before string) bool {
	words := strings.Fields(before)
	if len(words) == 0 {
		return false // nothing said what is held, so nothing claimed a hold
	}
	switch strings.Trim(words[len(words)-1], ".,:;\"'`(") {
	case "it", "this", "that", "token":
	default:
		return false
	}
	if len(words) < 2 {
		return true
	}
	switch strings.Trim(words[len(words)-2], ".,:;\"'`(") {
	case "where", "when", "why", "how", "whether", "which", "what":
		return false
	// AN INDEFINITE SUBJECT IS ANY TOKEN, NOT THIS ONE. "A token is held under
	// the name its holder pulls with" says how the engine files a hold, and it
	// is as true tomorrow as today. "The token is held" and "this token is
	// held" are the claims that go stale, and they keep their finding.
	case "a", "an", "any", "every", "another":
		return false
	}
	return true
}

// namesSomebody says whether this word stands for a person rather than for
// anybody at all.
func namesSomebody(w string, checks map[string]bool) bool {
	if w == "" {
		return false // the line stops before it says who, so it names nobody
	}
	// A CHECK IS NOT A PERSON. "Held by render-check and drive-editor" names
	// what pins a rule, and the tree says which names those are.
	if checks[w] {
		return false
	}
	// "other" AND "others" NAME NOBODY, the way "agents" and "actors" do. A
	// test holding tokens held by other actors is describing its fixture.
	//
	// AND "nothing" IS THE ABSENCE OF A HOLDER RATHER THAN ONE. A note wrote
	// "the ordering half is held and this half is held by nothing", which says
	// of a rule that nobody has half of it. It is the same sentence as "held by
	// nobody" and "held by no one", both of which this already reads as prose,
	// and the third spelling was the one missing. Nothing about it goes stale
	// when the session ends, because it never named a session's holder.
	switch w {
	case "a", "an", "the", "that", "this", "any", "some", "no", "another",
		"agents", "agent", "actors", "actor", "somebody", "anybody", "nobody",
		"nothing", "other", "others", "whoever", "them", "it", "one":
		return false
	}
	return true
}

func isWordByte(b byte) bool {
	return b == '_' || (b >= 'a' && b <= 'z') || (b >= 'A' && b <= 'Z') || (b >= '0' && b <= '9')
}
