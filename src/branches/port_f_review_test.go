// The review over a real clone, ported off test/level0/review.test.js: what it
// gathers, the check a worktree of the branch runs, the report and the cases a
// red run names. The branch carries a stand-in for se-index, so the check runs.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// The group the review cases read, its ask and its handback. [[spec/tickets/work-verbs-port-to-go]]
const (
	pfName     = "the-config-holds-numbers"
	pfAsk      = "---\nkind: [[ticket]]\nstate: open\nprocess: [[group]]\n---\n\n# Ask\n\nHold the numbers.\n\n# retro\n\n## write\n\n### done\n\n<!-- what was done -->\n"
	pfWorktree = runtimeFolder + "/review/work-" + pfName
)

// The handback: the ask with its retro filled. [[spec/tickets/work-verbs-port-to-go]]
var pfHandback = strings.Replace(pfAsk, "<!-- what was done -->", "- it holds", 1)

// A stand-in for se-index that runs the checks named and answers red on the first that fails. [[spec/tickets/work-verbs-port-to-go]]
func pfProbe(checks string) string {
	return `package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

var _ = strings.HasSuffix
var _ = filepath.Join

func fail(why string) {
	fmt.Println("not ok 1 - " + why)
	os.Exit(1)
}

func stands(at string) bool {
	_, err := os.Stat(at)
	return err == nil
}

func linked(at string) bool {
	info, err := os.Lstat(at)
	return err == nil && info.Mode()&os.ModeSymlink != 0
}

func main() {
	here, _ := os.Getwd()
	_ = here
` + checks + `
	fmt.Println("1..3")
	fmt.Println("# pass 3")
}
`
}

// A stand-in answering green. [[spec/tickets/work-verbs-port-to-go]]
var pfGreen = pfProbe("")

// A tree whose work branch carries the ask in one commit, then the handback, a source and the check's stand-in. [[spec/tickets/work-verbs-port-to-go]]
func pfReviewTree(t *testing.T, probe, handback string) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.git("switch", "-q", "-c", workBranch+pfName, "main")
	one.land("the ask", map[string]string{ticketAt(pfName): pfAsk})
	one.land("the work", map[string]string{
		ticketAt(pfName):        handback,
		"go.mod":                "module pfreview\n\ngo 1.24\n",
		"src/quack/main.go":     probe,
		"src/front/cmd/main.go": "package main\n\nfunc main() {}\n",
		"src/a.js":              "export const a = 1;\n",
	})
	one.git("push", "-q", "origin", workBranch+pfName)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", workBranch+pfName)
	one.git("fetch", "-q", "origin")
	return one
}

// Runs the review as JSON and reads the material back. [[spec/tickets/work-verbs-port-to-go]]
func pfMaterial(t *testing.T, one *tree) material {
	t.Helper()
	if code := one.branchSays("review", pfName, "--json"); code != 0 {
		t.Fatalf("the review answers %d: %s", code, one.errs.String())
	}
	var said material
	if err := json.Unmarshal(one.out.Bytes(), &said); err != nil {
		t.Fatalf("the review prints no JSON: %v\n%s", err, one.out.String())
	}
	return said
}

// Fails where the check answers red. [[spec/tickets/work-verbs-port-to-go]]
func pfGreenCheck(t *testing.T, said material) {
	t.Helper()
	if !said.Check.OK {
		t.Fatalf("the check answers red: %+v", said.Check)
	}
}

// A retro chapter reads present where a hand writes a line, and absent where it holds placeholders or stands nowhere. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheRetroReadsOffTheTicket(t *testing.T) {
	t.Parallel()
	empty := "# Ask\n\nA thing.\n\n# retro\n\n## write\n\n### done\n\n<!-- what was done -->\n\n<!-- the form is list -->\n\n# Discussion\n\nNothing.\n"
	if retroOnTicket(empty) {
		t.Fatal("placeholders and headings read present")
	}
	if !retroOnTicket(strings.Replace(empty, "<!-- what was done -->", "- the shim resolves the vehicle", 1)) {
		t.Fatal("a filled retro reads absent")
	}
	if retroOnTicket("# Ask\n\nA thing.\n\n# Discussion\n\nA line.\n") {
		t.Fatal("a ticket with no retro chapter reads present")
	}
}

// The review gathers the ask off the first commit, the handback off the tip, and both diffs. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheReviewGathersTheAskTheHandbackAndTheDiffs(t *testing.T) {
	t.Parallel()
	said := pfMaterial(t, pfReviewTree(t, pfGreen, pfHandback))
	if said.Branch != workBranch+pfName || said.Ref != "origin/"+workBranch+pfName {
		t.Fatalf("the review reads %s at %s", said.Branch, said.Ref)
	}
	if said.Ask != strings.TrimSpace(pfAsk) || said.Handback != strings.TrimSpace(pfHandback) {
		t.Fatalf("the ask reads %q and the handback %q", said.Ask, said.Handback)
	}
	holds(t, said.Stat, "src/a.js")
	holds(t, said.Diff, "diff --git")
}

// The review answers a green check run in a worktree, and a present retro. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheReviewAnswersTheCheckAndTheRetro(t *testing.T) {
	t.Parallel()
	said := pfMaterial(t, pfReviewTree(t, pfGreen, pfHandback))
	pfGreenCheck(t, said)
	if said.Check.Code == nil || *said.Check.Code != 0 || !said.Retro {
		t.Fatalf("the check and the retro read %+v, %v", said.Check, said.Retro)
	}
}

// The check runs inside the worktree, with the caller's survey landed there first. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheCheckRunsInTheWorktreeOnTheSurvey(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	if !strings.HasSuffix(filepath.ToSlash(here), "/`+pfWorktree+`") {
		fail("the check runs at " + here)
	}
	if !stands(".se/.runtime/tools.json") {
		fail("no survey stands")
	}`), pfHandback)
	goAt, err := exec.LookPath("go")
	if err != nil {
		t.Skip("no go on this box")
	}
	survey, _ := json.Marshal(map[string]map[string]string{"go": {"path": goAt}, "node": {"path": "/node"}})
	one.write(map[string]string{toolsFile: string(survey)})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree carries the caller's brand before the check runs. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeCarriesTheBrand(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	if !stands(".claude-plugin/marketplace.json") {
		fail("no brand stands")
	}`), pfHandback)
	one.write(map[string]string{".claude-plugin/marketplace.json": "{}\n"})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree borrows the caller's two module folders, and gives them back before git removes it. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsTheModules(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	for _, at := range []string{"node_modules", "src/extension/webview/node_modules"} {
		if !linked(at) || !stands(at+"/held") {
			fail(at + " stands borrowed not")
		}
	}`), pfHandback)
	one.write(map[string]string{"node_modules/held": "", "src/extension/webview/node_modules/held": ""})
	pfGreenCheck(t, pfMaterial(t, one))
	for _, rel := range []string{"node_modules/held", "src/extension/webview/node_modules/held"} {
		if _, err := os.Stat(filepath.Join(one.root, rel)); err != nil {
			t.Fatalf("the caller's %s stands not: %v", rel, err)
		}
	}
	if _, err := os.Lstat(filepath.Join(one.root, filepath.FromSlash(pfWorktree))); err == nil {
		t.Fatal("the worktree and its links stay")
	}
}

// The worktree borrows the webview's modules alone where the caller carries those, and gives them back. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsTheWebviewModules(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	if !linked("src/extension/webview/node_modules") || !stands("src/extension/webview/node_modules/held") {
		fail("the webview modules stand borrowed not")
	}`), pfHandback)
	one.write(map[string]string{"src/extension/webview/node_modules/held": ""})
	pfGreenCheck(t, pfMaterial(t, one))
	if _, err := os.Stat(filepath.Join(one.root, "src/extension/webview/node_modules/held")); err != nil {
		t.Fatalf("the caller's modules stand not: %v", err)
	}
}

// The worktree borrows nothing out of the caller's bin, so a branch's build lands in its own. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsNoBin(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	if linked(".se/.runtime/bin") || stands(".se/.runtime/bin/logview") {
		fail("the caller's bin stands borrowed")
	}`), pfHandback)
	one.write(map[string]string{binFolder + "/logview": ""})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree builds the branch's own se-front into its own bin before the check. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBuildsItsOwnFront(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(`	if !stands(".se/.runtime/bin/se-front") && !stands(".se/.runtime/bin/se-front.exe") {
		fail("no se-front stands in the worktree's bin")
	}
	self, _ := os.Executable()
	if filepath.Dir(self) != filepath.Join(here, ".se", ".runtime", "bin") {
		fail("the check runs off " + self)
	}`), pfHandback)
	pfGreenCheck(t, pfMaterial(t, one))
}

// A red check comes back with its code and the rows the runner refused. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedCheckNamesTheRowsRefused(t *testing.T) {
	t.Parallel()
	red := `package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("ok 1 - a\nnot ok 2 - the door holds\nnot ok 3 - the rule fires")
	os.Exit(1)
}
`
	said := pfMaterial(t, pfReviewTree(t, red, pfHandback))
	if said.Check.OK || said.Check.Code == nil || *said.Check.Code != 1 {
		t.Fatalf("the check reads %+v", said.Check)
	}
	holds(t, said.Check.Says, "not ok 2 - the door holds")
	holds(t, said.Check.Says, "not ok 3 - the rule fires")
}

// A review of a branch standing nowhere refuses, and says which. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAReviewOfNothingRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("review", "gone"); code != codeRed {
		t.Fatalf("the review answers %d", code)
	}
	holds(t, one.errs.String(), "work/gone stands nowhere")
}

// A review of a branch carrying no commit beyond trunk refuses. [[spec/tickets/work-verbs-port-to-go]]
func TestPFABranchCarryingNoCommitRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.git("push", "-q", "origin", "main:"+workBranch+pfName)
	if code := one.branchSays("review", pfName); code != codeRed {
		t.Fatalf("the review answers %d", code)
	}
	holds(t, one.errs.String(), "carries no commit beyond origin/main")
}

// A review naming no branch refuses, and says it needs a name. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAReviewNamingNoBranchRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("review"); code != codeRefused {
		t.Fatalf("the review answers %d", code)
	}
	holds(t, one.errs.String(), "branch review needs a name")
	if code := one.branchSays("review", "none"); code != codeRed {
		t.Fatalf("a review of nothing answers %d", code)
	}
	holds(t, one.errs.String(), "work/none stands nowhere, here or on origin.")
}

// A report with nothing to fix fits on one line. [[spec/tickets/work-verbs-port-to-go]]
func TestPFACleanReportFitsOneLine(t *testing.T) {
	t.Parallel()
	code := 0
	said := report(material{Branch: workBranch + pfName, Check: checked{OK: true, Code: &code}, Retro: true})
	if strings.Contains(said, "\n") {
		t.Fatalf("the report runs over lines: %q", said)
	}
	holds(t, said, "nothing to fix. Run branch merge to take it in.")
}

// A red check and an absent retro each count one thing to fix, and the report holds no merge back. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedCheckAndAnAbsentRetroCountTwo(t *testing.T) {
	t.Parallel()
	code := 1
	said := report(material{Branch: workBranch + pfName, Check: checked{Code: &code}})
	for _, row := range []string{`(?m)^work/the-config-holds-numbers$`, `(?m)^check {6}answers 1$`, `(?m)^retro {6}absent from the handback$`, `(?m)^2 things to fix\. Run branch merge once every fix lands\.$`} {
		if !regexp.MustCompile(row).MatchString(said) {
			t.Fatalf("the report holds no %s:\n%s", row, said)
		}
	}
	if regexp.MustCompile(`(?i)\bblock|\brefus|\bdeny|\bgate\b`).MatchString(said) {
		t.Fatalf("the report holds the merge back:\n%s", said)
	}
}

// The report says what a red check broke on, under the check row. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheReportSaysWhatTheCheckBrokeOn(t *testing.T) {
	t.Parallel()
	code := 1
	said := report(material{Branch: workBranch + pfName, Retro: true, Check: checked{Code: &code, Says: "not ok 3 - the door holds"}})
	for _, row := range []string{`(?m)^check {6}answers 1:$`, `(?m)^ {11}not ok 3 - the door holds$`, `(?m)^1 thing to fix`} {
		if !regexp.MustCompile(row).MatchString(said) {
			t.Fatalf("the report holds no %s:\n%s", row, said)
		}
	}
}

// A run naming no failing row falls back to its last lines, the errors among them. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARunNamingNoRowFallsBackToItsLastLines(t *testing.T) {
	t.Parallel()
	holds(t, whatFailed("one\ntwo\n", "the rules refuse three\n"), "the rules refuse three")
}

// A red spec run answers each failing case once, and leaves the list header out. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedSpecRunNamesEachCaseOnce(t *testing.T) {
	t.Parallel()
	got := whatFailed("✔ one holds\n✖ two breaks (1ms)\n✖ failing tests:\n✖ two breaks (1ms)\nℹ fail 1\n", "")
	if got != "✖ two breaks (1ms)" {
		t.Fatalf("the cases read %q", got)
	}
	if got := whatFailed("not ok 1 - a\nnot ok 1 - a\nnot ok 2 - b\n", ""); got != "not ok 1 - a\nnot ok 2 - b" {
		t.Fatalf("the tap cases read %q", got)
	}
	if got := whatFailed("one\ntwo\n", "three"); got != "one\ntwo\nthree" {
		t.Fatalf("the last lines read %q", got)
	}
}

// A red lint answers with the lines naming the rule. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedLintNamesTheRule(t *testing.T) {
	t.Parallel()
	got := whatFailed("The rules pass.\nspec/a.md:8:11: PastTense: Write the present tense.\n", "")
	if got != "spec/a.md:8:11: PastTense: Write the present tense." {
		t.Fatalf("the lint reads %q", got)
	}
}

// The verb alone prints the two rows it owns, and no ask. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheVerbAlonePrintsItsTwoRows(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfGreen, pfAsk)
	if code := one.branchSays("review", pfName); code != 0 {
		t.Fatalf("the review answers %d: %s", code, one.errs.String())
	}
	said := one.out.String()
	for _, row := range []string{`(?m)^check {6}passes$`, `(?m)^retro {6}absent from the handback$`, `(?m)^1 thing to fix\. Run branch merge once every fix lands\.$`} {
		if !regexp.MustCompile(row).MatchString(said) {
			t.Fatalf("the report holds no %s:\n%s", row, said)
		}
	}
	if strings.Contains(said, "Hold the numbers") {
		t.Fatal("the ask rides the report")
	}
}

// The diff runs from the merge base, so trunk's own later work stays out. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheDiffRunsFromTheMergeBase(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfGreen, pfHandback)
	one.land("trunk moves", map[string]string{"trunk-only.txt": "trunk\n"})
	one.git("push", "-q", "origin", "main")
	said := pfMaterial(t, one)
	holds(t, said.Diff, "src/a.js")
	if strings.Contains(said.Diff, "trunk-only.txt") || strings.Contains(said.Stat, "trunk-only.txt") {
		t.Fatal("the diff reads trunk's later commit as the branch's")
	}
}

// A worktree opening nowhere answers so, with no code, and runs no check. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAWorktreeOpeningNowhereRunsNoCheck(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfGreen, pfHandback)
	one.write(map[string]string{reviewFolder: "a file where the folder stands\n"})
	said := pfMaterial(t, one)
	if said.Check.OK || said.Check.Code != nil {
		t.Fatalf("the check reads %+v", said.Check)
	}
	holds(t, said.Check.Says, "no worktree opens on origin/work")
}
