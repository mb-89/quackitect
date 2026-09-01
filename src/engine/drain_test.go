package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// THE SECOND BACKLOG PASS, JUDGED AGAINST THE LIST IT FROZE.
//
// wk-61af3a054e read the twenty-two that stood backlogged when it started.
// Everything minted since is unread, and this is that pass.
//
// BOTH HALVES ARE INSIDE THE TOKEN, so the check freezes when the token closes
// rather than following a backlog that goes on changing.
const theDrainToken = "wk-2b78b911b1"

func drainToken(t *testing.T) Token {
	t.Helper()
	r := Roots{Method: filepath.Join("..", ".."), Work: filepath.Join("..", "..")}
	tok, err := LoadToken(r, theDrainToken)
	if err != nil {
		t.Fatalf("%s cannot be read, so this guards nothing: %v", theDrainToken, err)
	}
	return tok
}

func TestTheSecondBacklogPassReadEveryOne(t *testing.T) {
	named, silent, err := readBacklog(drainToken(t).Detail)
	if err != nil {
		t.Fatal(err)
	}
	for _, id := range silent {
		t.Errorf("%s is on the list and nothing in the detail says what happened to it", id)
	}
	t.Logf("%d ids on the list, %d passed over", len(named), len(silent))
}

// EVERY SETTLEMENT NAMES SOMETHING A READER CAN GO TO, AND IT RESOLVES.
//
// The word obsolete on its own sends a reader looking. A file and line, a
// heading, or a token id is a place, and this follows each one to see whether
// it is there.
//
// IT RESOLVES THEM RATHER THAN MATCHING THEIR SHAPE. A citation that looks like
// a path and points at nothing is the failure, and a check that only asked
// whether a path-shaped string was present could not see it.
func TestEverySettlementResolves(t *testing.T) {
	root := filepath.Join("..", "..")
	r := Roots{Method: root, Work: root}
	tok := drainToken(t)
	named, _, err := readBacklog(tok.Detail)
	if err != nil {
		t.Fatal(err)
	}
	settled, checked := 0, 0
	for _, id := range named {
		one, err := LoadToken(r, id)
		if err != nil {
			t.Errorf("%s is on the list and is not a token: %v", id, err)
			continue
		}
		if !one.Status.Ended() {
			continue // still backlogged, and criterion 3 judges those
		}
		settled++
		if one.Reason == "" {
			t.Errorf("%s was settled with no reason at all", id)
			continue
		}
		found := false
		for _, cited := range citations(one.Reason) {
			checked++
			if why := resolves(r, root, cited); why != "" {
				t.Errorf("%s cites %s and %s", id, cited, why)
				continue
			}
			// A PATH ON ITS OWN IS NOT PROOF. "Obsolete as a token. See
			// src/engine/store.go" names a file that exists and says
			// nothing about where in it to look, which is the sending a
			// reader looking that criterion 2 refuses.
			if proves(cited) {
				found = true
			}
		}
		if !found {
			t.Errorf("%s says %q and names nothing a reader can go to",
				id, firstLines(one.Reason, 1))
		}
	}
	if settled == 0 {
		t.Fatal("nothing on the list was settled, so this guards nothing")
	}
	if checked == 0 {
		t.Fatal("no citation was resolved, so this guards nothing")
	}
}

// AND EACH KIND OF CITATION IS RESOLVED, driven here rather than waiting for a
// settlement to use one.
//
// NOTHING ON THE LIST CITES A TOKEN ID TODAY, so that branch of the resolver is
// reached by nothing above. A branch nothing reaches is a branch that rots, and
// a check that never exercises it says nothing about it. This drives all three.
func TestACitationResolvesOrSaysWhy(t *testing.T) {
	root := filepath.Join("..", "..")
	r := Roots{Method: root, Work: root}
	good := []string{
		"src/engine/drain_test.go",
		"src/engine/drain_test.go:1",
		theDrainToken,
		`section "The command decides the sentence above it"`,
	}
	for _, one := range good {
		for _, cited := range citations(one) {
			if why := resolves(r, root, cited); why != "" {
				t.Errorf("%s does not resolve: %s", cited, why)
			}
		}
	}
	bad := map[string]string{
		// THE DECOYS ROUND 2 NAMED, kept here so the branch they walked past
		// cannot go back to being a substring search. A word that opens a
		// sentence is not a heading, and a heading claimed of one file is not
		// answered by another file carrying it.
		`section "the"`:                    "no guidance carries that section",
		`section "A SET"`:                  "no guidance carries that section",
		"src/engine/nosuchfile.go":         "there is no such file",
		"src/engine/drain_test.go:99999":   "that file has fewer lines than that",
		"wk-0000000000":                    "there is no such token",
		`section "a heading nobody wrote"`: "no guidance carries that section",
	}
	// A PAIR IS ASKED OF THE RESOLVER DIRECTLY, because citations reads a
	// path out of the prose form first and the pair is the second citation
	// it yields, so going through it would test the path branch again.
	for one, want := range map[string]string{
		"pair doc/guidance/voice.md|The command decides the sentence above it": "that heading is in doc/guidance/specifying.md and not there",
		"pair doc/guidance/voice.md|A heading nobody ever wrote":               "no guidance carries that section",
	} {
		if why := resolves(r, root, one); why != want {
			t.Errorf("%q answered %q rather than %q", one, why, want)
		}
	}
	for one, want := range bad {
		found := citations(one)
		if len(found) == 0 {
			t.Errorf("%q is not read as a citation at all", one)
			continue
		}
		if why := resolves(r, root, found[0]); why != want {
			t.Errorf("%q answered %q rather than %q", one, why, want)
		}
	}
}

// proves answers whether a citation is specific enough to stand as proof.
func proves(cited string) bool {
	if strings.HasPrefix(cited, "pair ") || strings.HasPrefix(cited, "wk-") {
		return true
	}
	if strings.HasPrefix(cited, "section ") || strings.HasPrefix(cited, "test ") {
		return true
	}
	m := citedPath.FindStringSubmatch(cited)
	return m != nil && m[2] != ""
}

// A citation is a path with a line, a path, a section named in quotes, or a
// token id.
var (
	citedPath  = regexp.MustCompile(`\b((?:src|doc|util|\.se)/[\w./-]+?\.\w+)(?::(\d+))?\b`)
	citedToken = regexp.MustCompile(`\bwk-[0-9a-f]{10}\b`)
	citedHead  = regexp.MustCompile(`section "([^"]+)"`)
	citedTest  = regexp.MustCompile(`\bTest[A-Z]\w+`)

	// A PAIR: the file, and the heading claimed of that file. This is the
	// form the settlements actually use, and reading it as one citation is
	// what lets the heading be resolved against the file beside it rather
	// than against all of doc/guidance.
	citedPair = regexp.MustCompile(
		`((?:src|doc|util|\.se)/[\w./-]+?\.\w+),?\s+(?:under|beside|section)\s+"?([^:"\n]+?)"?\s*:`)
)

func citations(reason string) []string {
	var out []string
	for _, m := range citedPath.FindAllString(reason, -1) {
		out = append(out, m)
	}
	for _, m := range citedToken.FindAllString(reason, -1) {
		out = append(out, m)
	}
	for _, m := range citedHead.FindAllStringSubmatch(reason, -1) {
		out = append(out, "section "+m[1])
	}
	for _, m := range citedTest.FindAllString(reason, -1) {
		out = append(out, "test "+m)
	}
	for _, m := range citedPair.FindAllStringSubmatch(reason, -1) {
		out = append(out, "pair "+m[1]+"|"+strings.TrimSpace(m[2]))
	}
	return out
}

// headingAt answers whether a line IS a heading reading want, ignoring the
// marks a heading is written with.
//
// A PREFIX OF A BODY LINE IS NOT A HEADING. Anchoring to the start of a line
// stopped a substring in the middle of a paragraph and let section "the" through
// on any sentence beginning with the word, which is a search for a word standing
// in for a search for a heading.
//
// SO THE HEADING ENDS WHERE THE LINE OR THE SENTENCE DOES. What follows want is
// nothing, or the punctuation that closes a heading. That admits both shapes
// this guidance uses: a hash heading, which runs to the end of its line, and an
// uppercase lead, which runs to its full stop or its colon.
func headingAt(body, want string) bool {
	for _, line := range strings.Split(body, nl) {
		line = strings.TrimRight(strings.TrimLeft(line, "#*- \t"), " \t\r")
		rest, is := strings.CutPrefix(line, want)
		if !is {
			continue
		}
		if rest == "" || strings.HasPrefix(rest, ".") || strings.HasPrefix(rest, ":") {
			return true
		}
	}
	return false
}

// carriesHeading answers which file under doc/guidance opens a line with want.
func carriesHeading(root, want string) string {
	found := ""
	filepath.WalkDir(filepath.Join(root, "doc", "guidance"), func(p string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || found != "" {
			return nil
		}
		b, err := os.ReadFile(p)
		if err == nil && headingAt(string(b), want) {
			found = filepath.ToSlash(strings.TrimPrefix(p, root+string(filepath.Separator)))
		}
		return nil
	})
	return found
}

// resolves answers what is wrong with a citation, or nothing.
func resolves(r Roots, root, cited string) string {
	// A TEST NAME IS A PLACE, and the tree decides whether it is one.
	if name, is := strings.CutPrefix(cited, "test "); is {
		found := false
		filepath.WalkDir(filepath.Join(root, "src"), func(p string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() || found || !strings.HasSuffix(p, ".go") {
				return nil
			}
			b, err := os.ReadFile(p)
			if err == nil && strings.Contains(string(b), "func "+name+"(") {
				found = true
			}
			return nil
		})
		if !found {
			return "nothing in src declares that test"
		}
		return ""
	}
	if rest, is := strings.CutPrefix(cited, "pair "); is {
		path, want, _ := strings.Cut(rest, "|")
		b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(path)))
		if err != nil {
			return "there is no such file"
		}
		if headingAt(string(b), want) {
			return ""
		}
		if where := carriesHeading(root, want); where != "" {
			return "that heading is in " + where + " and not there"
		}
		return "no guidance carries that section"
	}
	if strings.HasPrefix(cited, "wk-") {
		if _, err := LoadToken(r, cited); err != nil {
			return "there is no such token"
		}
		return ""
	}
	if name, found := strings.CutPrefix(cited, "section "); found {
		hit := false
		filepath.WalkDir(filepath.Join(root, "doc", "guidance"), func(p string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}
			b, err := os.ReadFile(p)
			if err == nil && headingAt(string(b), name) {
				hit = true
			}
			return nil
		})
		if !hit {
			return "no guidance carries that section"
		}
		return ""
	}
	m := citedPath.FindStringSubmatch(cited)
	if m == nil {
		return ""
	}
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(m[1])))
	if err != nil {
		return "there is no such file"
	}
	if m[2] == "" {
		return ""
	}
	want := 0
	for _, c := range m[2] {
		want = want*10 + int(c-'0')
	}
	if want > len(strings.Split(string(b), nl)) {
		return "that file has fewer lines than that"
	}
	return ""
}

// THE COUNT IS DERIVED. What the counter answers over the snapshot is what the
// detail says, line for line.
func TestTheSecondBacklogCountIsDerived(t *testing.T) {
	root := filepath.Join("..", "..")
	r := Roots{Method: root, Work: root}
	tok := drainToken(t)
	named, _, err := readBacklog(tok.Detail)
	if err != nil {
		t.Fatal(err)
	}
	counted := map[string]int{}
	for _, id := range named {
		one, err := LoadToken(r, id)
		if err != nil {
			continue
		}
		switch {
		case one.Status == Aborted:
			counted["aborted"]++
		case one.Disposition == Became:
			counted["settled as a duplicate"]++
		default:
			counted[string(one.Status)]++
		}
	}
	if len(counted) == 0 {
		t.Fatal("nothing was counted, so this guards nothing")
	}
	said := false
	for kind, n := range counted {
		line := kind + "  "
		if !strings.Contains(tok.Detail, kind) {
			t.Errorf("the detail says nothing about %d %s", n, kind)
			continue
		}
		said = true
		// The number beside that word is the one the counter answered.
		if !numberBeside(tok.Detail, kind, n) {
			t.Errorf("the counter says %d %s and the detail says otherwise", n, kind)
		}
		_ = line
	}
	if !said {
		t.Fatal("the detail carries no count at all")
	}
}

// numberBeside answers whether the detail says this number beside this word.
func numberBeside(detail, kind string, n int) bool {
	want := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(kind) + `\s+` + itoa(n) + `\b|` +
		`(?i)\b` + itoa(n) + `\s+` + regexp.QuoteMeta(kind) + `\b`)
	return want.MatchString(detail)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	out := ""
	for n > 0 {
		out = string(rune('0'+n%10)) + out
		n /= 10
	}
	return out
}

// THE SET AT THE SHA, ENUMERATED RATHER THAN TRUSTED.
//
// The list in the detail is what this token says the backlog was. This asks
// git what it actually was, at the commit the token names, and compares.
//
// WHY A SHA AND NOT THE LIVE STORE. A check that reads doc/work today goes red
// the next time anybody mints a backlogged token, which is the decay
// wk-967b04b877 recorded against the first pass. A commit does not move.
const theDrainBase = "6418d6a4"

// THE TWO GIT CANNOT ANSWER FOR. .se/work is untracked, so no commit holds it
// and there is no state to enumerate at a sha. They are named here, and each
// one is loaded and required to have been backlogged, so the pair is a claim
// this check tests rather than a claim it takes.
var theEphemeral = []string{"wk-4e8eeb76aa", "wk-de69604cfd"}

// backloggedAt answers every id under doc/work that said backlogged at sha.
func backloggedAt(t *testing.T, sha string) []string {
	t.Helper()
	root := filepath.Join("..", "..")
	listing, err := exec.Command("git", "-C", root, "ls-tree", "-r",
		"--name-only", sha, "--", "doc/work").Output()
	if err != nil {
		t.Fatalf("git cannot read %s, so this guards nothing: %v", sha, err)
	}
	var was []string
	for _, path := range strings.Fields(string(listing)) {
		if !strings.HasSuffix(path, ".md") {
			continue
		}
		body, err := exec.Command("git", "-C", root, "show", sha+":"+path).Output()
		if err != nil {
			t.Fatalf("git cannot read %s at %s: %v", path, sha, err)
		}
		if !frontMatterSays(string(body), "backlogged") {
			continue
		}
		was = append(was, strings.TrimSuffix(filepath.Base(path), ".md"))
	}
	if len(was) == 0 {
		t.Fatalf("nothing said backlogged at %s, so this guards nothing", sha)
	}
	return was
}

// frontMatterSays answers whether the front matter's status line says want.
func frontMatterSays(body, want string) bool {
	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		if line == "---" && want != "" {
			continue
		}
		if rest, is := strings.CutPrefix(line, "status:"); is {
			return strings.TrimSpace(rest) == want
		}
	}
	return false
}

// TestTheSnapshotIsTheSetAtTheSha compares the frozen list with the set.
//
// BOTH DIRECTIONS. An id that was backlogged and is missing from the list is
// work this pass never read. An id on the list that was not backlogged is a
// verdict on something this pass did not owe.
func TestTheSnapshotIsTheSetAtTheSha(t *testing.T) {
	r := Roots{Method: filepath.Join("..", ".."), Work: filepath.Join("..", "..")}
	listed, _, err := readBacklog(drainToken(t).Detail)
	if err != nil {
		t.Fatal(err)
	}
	onList := map[string]bool{}
	for _, id := range listed {
		onList[id] = true
	}
	inSet := map[string]bool{}
	for _, id := range backloggedAt(t, theDrainBase) {
		inSet[id] = true
		if !onList[id] {
			t.Errorf("%s said backlogged at %s and is not on the snapshot",
				id, theDrainBase)
		}
	}
	for _, id := range theEphemeral {
		one, err := LoadToken(r, id)
		if err != nil {
			t.Errorf("%s is named as ephemeral and is not a token: %v", id, err)
			continue
		}
		if one.Status != Backlogged && one.AbortedFrom != Backlogged {
			t.Errorf("%s is named as ephemeral and was never backlogged, it is %s",
				id, one.Status)
			continue
		}
		inSet[id] = true
		if !onList[id] {
			t.Errorf("%s is named as ephemeral and is not on the snapshot", id)
		}
	}
	for _, id := range listed {
		if !inSet[id] {
			t.Errorf("%s is on the snapshot and was not backlogged at %s",
				id, theDrainBase)
		}
	}
	t.Logf("%d in the set at %s, %d on the snapshot", len(inSet), theDrainBase, len(listed))
}

// THE TOKEN'S OWN EVIDENCE, HELD TO CRITERION 2's STANDARD.
//
// The spec gate stopped running a criterion's command red for itself and now
// trusts what the criterion records. So an observation nobody can follow leaves
// the criterion with nothing behind it.
//
// CRITERION 2 REFUSES A CITATION THAT DOES NOT RESOLVE, applied to somebody
// else's settlement. This applies the same instrument to this token's own.
func TestEveryRedSaidResolves(t *testing.T) {
	root := filepath.Join("..", "..")
	tok := drainToken(t)
	checked := 0
	for i, c := range tok.Criteria {
		if c.Red == "" {
			continue
		}
		m := redSaid.FindStringSubmatch(c.Red)
		if m == nil {
			t.Errorf("criterion %d records a red that names no file and line: %q",
				i+1, c.Red)
			continue
		}
		checked++
		path := oneNamed(root, m[1])
		if path == "" {
			t.Errorf("criterion %d says the red came from %s and nothing in src is called that",
				i+1, m[1])
			continue
		}
		body, err := os.ReadFile(path)
		if err != nil {
			t.Errorf("criterion %d: %v", i+1, err)
			continue
		}
		lines := strings.Split(string(body), nl)
		want := 0
		for _, r := range m[2] {
			want = want*10 + int(r-'0')
		}
		if want > len(lines) {
			t.Errorf("criterion %d cites %s:%d and that file has %d lines",
				i+1, m[1], want, len(lines))
			continue
		}
		// THE LINE THE RUNNER REPORTS IS WHERE THE ASSERTION IS MADE, and
		// a format string wraps, so the window is the line and the three
		// under it.
		to := want + 3
		if to > len(lines) {
			to = len(lines)
		}
		window := strings.Join(lines[want-1:to], nl)
		if !asserts(window) {
			t.Errorf("criterion %d cites %s:%d and that line makes no assertion",
				i+1, m[1], want)
			continue
		}
		// AND THE MESSAGE IS IN THAT FILE. It is not always on that line,
		// because a message composes: the runner reports where Errorf was
		// called and the words can come from what it was handed.
		if len(longestShared(m[3], string(body))) < sharedEnough {
			t.Errorf("criterion %d cites %s:%d and nothing in that file says %q",
				i+1, m[1], want, m[3])
		}
	}
	if checked == 0 {
		t.Fatal("no criterion on this token records a red, so this guards nothing")
	}
}

// asserts answers whether a run of source makes a claim the runner would
// report at that line.
func asserts(window string) bool {
	for _, call := range []string{"t.Errorf(", "t.Error(", "t.Fatalf(", "t.Fatal(", "t.Logf("} {
		if strings.Contains(window, call) {
			return true
		}
	}
	return false
}

// A red names the file it came from, the line, and what it said.
var redSaid = regexp.MustCompile(`^([\w./-]+\.go):(\d+): (.*)$`)

// HOW MUCH OF THE MESSAGE HAS TO BE THERE. Short enough that a format string
// broken across lines still shares a run this long, long enough that two
// different assertions do not share one by accident.
const sharedEnough = 20

// oneNamed answers the one file under src with that base name, or nothing.
func oneNamed(root, base string) string {
	base = filepath.Base(filepath.FromSlash(base))
	found := ""
	filepath.WalkDir(filepath.Join(root, "src"), func(p string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() || found != "" {
			return nil
		}
		if filepath.Base(p) == base {
			found = p
		}
		return nil
	})
	return found
}

// longestShared answers the longest run of characters both strings carry.
func longestShared(a, b string) string {
	best := ""
	for i := range a {
		for j := i + len(best) + 1; j <= len(a); j++ {
			if strings.Contains(b, a[i:j]) {
				best = a[i:j]
				continue
			}
			break
		}
	}
	return best
}

// A VERDICT ON SOMETHING STILL BACKLOGGED SAYS WHAT IT WAITS ON.
//
// TWO HALVES, AND A COMMAND DECIDES ONE OF THEM. Whether the decision named is
// the right one is prose, and a reviewer reads it. Whether an id was left with
// a one-word disposition and nothing after it is a fact, and this decides that.
//
// THE WORDS ARE NAMED IN THE CRITERION, so the set this reads and the set the
// sentence declares are the same set.
var decisionWords = []string{
	"owner picks", "wants agreeing", "waits on", "the owner decides",
	"is a number", "is the owner's",
}

func TestEveryBacklogVerdictDecides(t *testing.T) {
	root := filepath.Join("..", "..")
	r := Roots{Method: root, Work: root}
	tok := drainToken(t)
	named, _, err := readBacklog(tok.Detail)
	if err != nil {
		t.Fatal(err)
	}
	paragraphs := strings.Split(tok.Detail, nl+nl)
	open := 0
	for _, id := range named {
		one, err := LoadToken(r, id)
		if err != nil || one.Status.Ended() {
			continue // settled, and criterion 2 judges those
		}
		open++
		verdict := ""
		for _, p := range paragraphs {
			if strings.HasPrefix(strings.TrimSpace(p), id+" ") {
				verdict = strings.TrimSpace(p)
				break
			}
		}
		if verdict == "" {
			t.Errorf("%s is still backlogged and has no verdict paragraph of its own", id)
			continue
		}
		rest := strings.TrimSpace(strings.TrimPrefix(verdict, id))
		if len(strings.Fields(rest)) < 2 {
			t.Errorf("%s is left with %q and nothing after it", id, rest)
			continue
		}
		if saysWhichDecision(r, rest) {
			continue
		}
		t.Errorf("%s says %q and names no decision it waits on",
			id, firstLines(rest, 1))
	}
	if open == 0 {
		t.Fatal("nothing on the list is still backlogged, so this guards nothing")
	}
}

// saysWhichDecision answers whether a verdict names a decision or a live token.
func saysWhichDecision(r Roots, verdict string) bool {
	// A PHRASE BROKEN BY A LINE WRAP IS STILL THE PHRASE. The detail is
	// wrapped, so a two-word phrase lands either side of a newline often
	// enough that matching the raw text would judge the wrapping.
	low := strings.Join(strings.Fields(strings.ToLower(verdict)), " ")
	for _, word := range decisionWords {
		if strings.Contains(low, word) {
			return true
		}
	}
	for _, id := range citedToken.FindAllString(verdict, -1) {
		if one, err := LoadToken(r, id); err == nil && !one.Status.Ended() {
			return true
		}
	}
	return false
}
