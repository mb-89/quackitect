// The review over a fake clone: what it
// gathers, the check a worktree of the branch runs, the report and the cases a
// red run names. The runner builds se-index off the branch, and the built
// stand-in runs the case's check, so the check runs.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported review steps: material, checked, report and whatFailed

import (
	"encoding/json"
	"path"
	"regexp"
	"slices"
	"strings"
	"testing"

	"quackitect/src/proc"
)

// The group the review cases read, its ask and its handback. [[spec/tickets/work-verbs-port-to-go]]
const (
	pfName     = "the-config-holds-numbers"
	pfAsk      = "---\nkind: [[ticket]]\nstate: open\nprocess: [[group]]\n---\n\n# Ask\n\nHold the numbers.\n\n# retro\n\n## write\n\n### done\n\n<!-- what was done -->\n"
	pfWorktree = runtimeFolder + "/review/work-" + pfName
)

// The handback: the ask with its retro filled. [[spec/tickets/work-verbs-port-to-go]]
var pfHandback = strings.Replace(pfAsk, "<!-- what was done -->", "- it holds", 1)

// What the stand-in for se-index prints and exits with, run in the worktree at the path named. [[spec/tickets/work-verbs-port-to-go]]
type pfCheck func(one *tree, at string) (string, int)

// A stand-in answering green. [[spec/tickets/work-verbs-port-to-go]]
func pfGreen(*tree, string) (string, int) { return "1..3\n# pass 3\n", 0 }

// A stand-in failing with the line the case answers, and green where it answers none. [[spec/tickets/work-verbs-port-to-go]]
func pfProbe(fails func(one *tree, at string) string) pfCheck {
	return func(one *tree, at string) (string, int) {
		if why := fails(one, at); why != "" {
			return "not ok 1 - " + why + "\n", 1
		}
		return pfGreen(one, at)
	}
}

// Whether a path of the fake disk stands as a link, listed whole beside its folder's files. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pfLinked(at string) bool {
	under, _ := one.disk.List(path.Dir(at))
	return slices.Contains(under, at) && !one.stands(at)
}

// A tree whose work branch carries the ask in one commit, then the handback, a source and the packages the worktree builds, with the built se-index running the check. [[spec/tickets/work-verbs-port-to-go]]
func pfReviewTree(t *testing.T, check pfCheck, handback string) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.cut(workBranch+pfName, "main")
	one.land("the ask", map[string]string{ticketAt(pfName): pfAsk})
	one.land("the work", map[string]string{
		ticketAt(pfName):        handback,
		"go.mod":                "module pfreview\n\ngo 1.24\n",
		"src/quack/main.go":     "package main\n\nfunc main() {}\n",
		"src/front/cmd/main.go": "package main\n\nfunc main() {}\n",
		"src/a.js":              "export const a = 1;\n",
	})
	one.push(workBranch + pfName)
	one.switchTo("main")
	one.drop(workBranch + pfName)
	one.fetch()
	bin := pfWorktree + "/" + binFolder + "/se-index" + exe()
	one.teach(one.d.at(bin), func(ran proc.Command) proc.Said {
		if one.rel(ran.Dir) != pfWorktree || !one.stands(bin) {
			return proc.Said{Err: "no se-index stands built in the worktree", Code: proc.NotStarted}
		}
		out, code := check(one, pfWorktree)
		return proc.Said{Out: out, Code: code}
	})
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

// The check runs inside the worktree, with the caller's survey landed there first, and builds with the go the survey names. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheCheckRunsInTheWorktreeOnTheSurvey(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		if !one.stands(at + "/" + toolsFile) {
			return "no survey stands"
		}
		return ""
	}), pfHandback)
	const goAt = "/fake/bin/go"
	one.teach(goAt, one.pfGo)
	delete(one.run.Programs, "go")
	survey, _ := json.Marshal(map[string]map[string]string{"go": {"path": goAt}, "node": {"path": "/node"}})
	one.write(map[string]string{toolsFile: string(survey)})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree carries the caller's brand before the check runs. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeCarriesTheBrand(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		if !one.stands(at + "/.claude-plugin/marketplace.json") {
			return "no brand stands"
		}
		return ""
	}), pfHandback)
	one.write(map[string]string{".claude-plugin/marketplace.json": "{}\n"})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree borrows the caller's two module folders, and gives them back before git removes it. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsTheModules(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		for _, rel := range []string{"node_modules", "src/extension/webview/node_modules"} {
			if !one.pfLinked(at+"/"+rel) || !one.stands(at+"/"+rel+"/held") {
				return rel + " stands borrowed not"
			}
		}
		return ""
	}), pfHandback)
	one.write(map[string]string{"node_modules/held": "", "src/extension/webview/node_modules/held": ""})
	pfGreenCheck(t, pfMaterial(t, one))
	for _, rel := range []string{"node_modules/held", "src/extension/webview/node_modules/held"} {
		if !one.stands(rel) {
			t.Fatalf("the caller's %s stands not", rel)
		}
	}
	if under, _ := one.disk.List(pfWorktree); len(under) > 0 {
		t.Fatalf("the worktree and its links stay: %v", under)
	}
}

// The worktree borrows the webview's modules alone where the caller carries those, and gives them back. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsTheWebviewModules(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		if !one.pfLinked(at+"/src/extension/webview/node_modules") || !one.stands(at+"/src/extension/webview/node_modules/held") {
			return "the webview modules stand borrowed not"
		}
		return ""
	}), pfHandback)
	one.write(map[string]string{"src/extension/webview/node_modules/held": ""})
	pfGreenCheck(t, pfMaterial(t, one))
	if !one.stands("src/extension/webview/node_modules/held") {
		t.Fatal("the caller's modules stand not")
	}
}

// The worktree borrows nothing out of the caller's bin, so a branch's build lands in its own. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBorrowsNoBin(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		if one.pfLinked(at+"/"+binFolder) || one.stands(at+"/"+binFolder+"/logview") {
			return "the caller's bin stands borrowed"
		}
		return ""
	}), pfHandback)
	one.write(map[string]string{binFolder + "/logview": ""})
	pfGreenCheck(t, pfMaterial(t, one))
}

// The worktree builds the branch's own se-front into its own bin before the check. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheWorktreeBuildsItsOwnFront(t *testing.T) {
	t.Parallel()
	one := pfReviewTree(t, pfProbe(func(one *tree, at string) string {
		if !one.stands(at + "/" + binFolder + "/se-front" + exe()) {
			return "no se-front stands in the worktree's bin"
		}
		return ""
	}), pfHandback)
	pfGreenCheck(t, pfMaterial(t, one))
}

// A red check comes back with its code and the rows the runner refused. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedCheckNamesTheRowsRefused(t *testing.T) {
	t.Parallel()
	red := func(*tree, string) (string, int) {
		return "ok 1 - a\nnot ok 2 - the door holds\nnot ok 3 - the rule fires\n", 1
	}
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
	one.pushAt("main", "refs/heads/"+workBranch+pfName)
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
	one.push("main")
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
