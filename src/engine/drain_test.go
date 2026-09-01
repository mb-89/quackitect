package main

import (
	"os"
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
			found = true
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
		"src/engine/nosuchfile.go":         "there is no such file",
		"src/engine/drain_test.go:99999":   "that file has fewer lines than that",
		"wk-0000000000":                    "there is no such token",
		`section "a heading nobody wrote"`: "no guidance carries that section",
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

// A citation is a path with a line, a path, a section named in quotes, or a
// token id.
var (
	citedPath  = regexp.MustCompile(`\b((?:src|doc|util|\.se)/[\w./-]+?\.\w+)(?::(\d+))?\b`)
	citedToken = regexp.MustCompile(`\bwk-[0-9a-f]{10}\b`)
	citedHead  = regexp.MustCompile(`section "([^"]+)"`)
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
	return out
}

// resolves answers what is wrong with a citation, or nothing.
func resolves(r Roots, root, cited string) string {
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
			if err == nil && strings.Contains(string(b), name) {
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
