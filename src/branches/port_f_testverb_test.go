// The test verb over a fake clone, its node and go runs off the fake disk, ported off test/level0/test-verb.test.js,
// go-modules.test.js and pull-leaves.test.js: named files and folders, the
// tests a branch changes, the red run over HEAD's text, and the words a run answers.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"testing"
)

// The module the Go cases stand in, the spawn tally, and the red case's test and sources. [[spec/tickets/work-verbs-port-to-go]]
const (
	pfMod     = "module quackitect\n\ngo 1.24\n"
	pfTally   = "/tree/.se/run/spawns.txt"
	pfRedTest = "test/level0/a.test.js"
	pfSource  = "src/scripts/a.js"
	pfFresh   = "src/scripts/b.js"
)

// A node test file holding passing cases, each reading the extra check. [[spec/tickets/work-verbs-port-to-go]]
func pfNodeTests(count int, check string) string {
	out := "const assert = require(\"node:assert/strict\");\nconst { test } = require(\"node:test\");\n"
	for at := 1; at <= count; at++ {
		out += "test(\"case " + strconv.Itoa(at) + "\", () => {\n" + check + "\n  assert.ok(true);\n});\n"
	}
	return out
}

// A red test that records what it reads of the sources, then fails or passes on its own assertion. [[spec/tickets/work-verbs-port-to-go]]
func pfRedProbe(fails bool) string {
	verdict := "assert.equal(1, 1);"
	if fails {
		verdict = "assert.equal(1, 2, \"the change is missing\");"
	}
	return `const assert = require("node:assert/strict");
const fs = require("fs");
const { test } = require("node:test");
test("it reads the sources", () => {
  const seen = {
    source: fs.existsSync("` + pfSource + `") ? fs.readFileSync("` + pfSource + `", "utf8") : null,
    fresh: fs.existsSync("` + pfFresh + `"),
    held: fs.existsSync(".se/.runtime/red/` + pfSource + `"),
  };
  fs.mkdirSync(".se", { recursive: true });
  fs.writeFileSync(".se/seen.json", JSON.stringify(seen));
  ` + verdict + `
});
`
}

// A tree whose HEAD holds the source, with the working text over it, a fresh source and the red test beside. [[spec/tickets/work-verbs-port-to-go]]
func pfRedTree(t *testing.T, fails bool) *tree {
	t.Helper()
	one := newTree(t, map[string]string{pfSource: "the text at HEAD\n"}).desk()
	one.write(map[string]string{pfSource: "the working text\n", pfFresh: "a new file\n", pfRedTest: pfRedProbe(fails)})
	return one
}

// Fails where the sources stand anything but their working texts, or anything stays aside. [[spec/tickets/work-verbs-port-to-go]]
func pfPutBack(t *testing.T, one *tree) {
	t.Helper()
	if one.read(pfSource) != "the working text\n" || one.read(pfFresh) != "a new file\n" {
		t.Fatalf("the sources read %q and %q", one.read(pfSource), one.read(pfFresh))
	}
	if one.d.exists(asideAt) {
		t.Fatal("something stays aside")
	}
}

// A named test file runs with the box's env, and a named Go folder runs its packages under the Go env. [[spec/tickets/work-verbs-port-to-go]]
func TestPFNamedFilesAndFoldersRunTogether(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{
		"go.mod":                  pfMod,
		"test/level0/x.test.js":   pfNodeTests(2, "  assert.equal(process.env.SE_SPAWNS, \""+pfTally+"\");"),
		"src/index/index_test.go": "package index\n\nimport (\n\t\"os\"\n\t\"testing\"\n)\n\nfunc TestEnv(t *testing.T) {\n\tif os.Getenv(\"CGO_ENABLED\") != \"0\" {\n\t\tt.Fatal(\"no Go env\")\n\t}\n}\n",
	})
	one.d.Env["SE_SPAWNS"] = pfTally
	if code := one.branchSays("test", "test/level0/x.test.js", "src/index"); code != 0 {
		t.Fatalf("the test verb answers %d: %s", code, one.out.String())
	}
	if got := strings.TrimSpace(one.out.String()); got != "green, 2 test(s) pass in 1 file(s); green, src/index passes" {
		t.Fatalf("the verb reads %q", got)
	}
}

// A named Go folder alone runs its packages. [[spec/tickets/work-verbs-port-to-go]]
func TestPFANamedGoFolderRunsAlone(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"go.mod": pfMod, "src/engine/swap/swap_test.go": "package swap\n\nimport \"testing\"\n\nfunc TestSwap(t *testing.T) {}\n"})
	if code := one.branchSays("test", "src/engine/swap"); code != 0 {
		t.Fatalf("the test verb answers %d: %s", code, one.out.String())
	}
	if got := strings.TrimSpace(one.out.String()); got != "green, src/engine/swap passes" {
		t.Fatalf("the verb reads %q", got)
	}
}

// A named Go test file runs the cases it declares alone, so a red case beside it stays out. [[spec/tickets/work-verbs-port-to-go]]
func TestPFANamedGoTestFileRunsItsOwnCases(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{
		"go.mod":          pfMod,
		"src/q/a_test.go": "package q\n\nimport \"testing\"\n\nfunc TestB(t *testing.T) {}\n\nfunc TestA(t *testing.T) {}\n",
		"src/q/b_test.go": "package q\n\nimport \"testing\"\n\nfunc TestC(t *testing.T) { t.Fatal(\"red\") }\n",
	})
	if code := one.branchSays("test", "src/q/a_test.go"); code != 0 {
		t.Fatalf("the test verb answers %d: %s", code, one.out.String())
	}
	if got := strings.TrimSpace(one.out.String()); got != "green, src/q passes" {
		t.Fatalf("the verb reads %q", got)
	}
}

// A folder names itself, a Go test names the folder holding it, and anything else names nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPFGoPackagesOfNamesFolders(t *testing.T) {
	t.Parallel()
	cases := []struct {
		in   []string
		want []string
	}{
		{[]string{"src/index"}, []string{"src/index"}},
		{[]string{"src/engine/swap/inner"}, []string{"src/engine/swap/inner"}},
		{[]string{"src/index/index_test.go"}, []string{"src/index"}},
		{[]string{"src/bridge/wait.js"}, nil},
		{[]string{"src/engine/swap/swap_test.go"}, []string{"src/engine/swap"}},
		{[]string{"src/tui/log/detail_test.go"}, []string{"src/tui/log"}},
		{[]string{"test/level0/one.test.js"}, nil},
		{nil, nil},
		{[]string{"src/tui/work_test.go", "src/tui/tree.go", "src/index/index_test.go", "src/index/index_test.go", "test/level0/one.test.js", "spec/tickets/one.md"}, []string{"src/tui", "src/index"}},
	}
	for _, one := range cases {
		if got := goPackagesOf(one.in); !slices.Equal(got, one.want) {
			t.Fatalf("%v names %v", one.in, got)
		}
	}
}

// A Go run answers green, assertion on a failing case, or build naming the broken line. [[spec/tickets/work-verbs-port-to-go]]
func TestPFGoSaysItsWord(t *testing.T) {
	t.Parallel()
	if got := goSays(Said{OK: true}, "src/tui"); got != "green, src/tui passes" {
		t.Fatalf("a green run reads %q", got)
	}
	if got := goSays(Said{Code: 1, Out: "--- FAIL: TestOne\nFAIL\n"}, "src/tui"); got != "assertion, a test of src/tui fails" {
		t.Fatalf("a failing run reads %q", got)
	}
	if got := goSays(Said{Code: 1, Err: "./work.go:9:2: undefined: nothing\n"}, "src/tui"); got != "build, because src/tui builds not: ./work.go:9:2: undefined: nothing" {
		t.Fatalf("a broken build reads %q", got)
	}
}

// A node run answers green, assertion, build on a load fault, or build on a throw outside an assertion. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTestSaysItsVerdict(t *testing.T) {
	t.Parallel()
	cases := [][2]string{
		{"^green, 3 test\\(s\\) pass in 1 file\\(s\\)", ""},
		{"assertion, 1 test\\(s\\) fail on their own assertion", ""},
		{"build, because a file loads no test: SyntaxError", ""},
		{"build, because 1 test\\(s\\) fail outside an assertion: TypeError", ""},
	}
	runs := []Said{
		{OK: true, Out: "# tests 3\n# pass 3\n# fail 0\n"},
		{Code: 1, Out: "not ok 1\n  code: 'ERR_ASSERTION'\n# tests 2\n# pass 1\n# fail 1\n"},
		{Code: 1, Err: "SyntaxError: Unexpected token\n", Out: "# tests 0\n"},
		{Code: 1, Out: "not ok 1\n  TypeError: x is not a function\n# tests 1\n# pass 0\n# fail 1\n"},
	}
	for at, ran := range runs {
		rows := strings.Split(testSays(ran, 1), "\n")
		if last := rows[len(rows)-1]; !regexp.MustCompile("^" + strings.TrimPrefix(cases[at][0], "^")).MatchString(last) {
			t.Fatalf("run %d reads %q", at, last)
		}
	}
	red := testSays(Said{Out: "not ok 1 - it adds\n# tests 1\n# fail 1\nAssertionError\n"}, 1)
	if red != "  not ok: it adds\nassertion, 1 test(s) fail on their own assertion" {
		t.Fatalf("a red run reads %q", red)
	}
}

// A red run names each failing case above its verdict, a todo case left out, and the verdict stays last. [[spec/tickets/work-verbs-port-to-go]]
func TestPFARedRunNamesItsCasesAboveTheVerdict(t *testing.T) {
	t.Parallel()
	out := strings.Join([]string{
		"ok 1 - a green case",
		"not ok 2 - a first red case",
		"  ---",
		"  error: AssertionError [ERR_ASSERTION]: it broke",
		"  ...",
		"not ok 3 - a second red case",
		"not ok 4 - a todo case # TODO the owner lands it",
		"# tests 3",
		"# pass 1",
		"# fail 2",
	}, "\n")
	rows := strings.Split(testSays(Said{Code: 1, Out: out}, 1), "\n")
	if !slices.Equal(rows[:len(rows)-1], []string{"  not ok: a first red case", "  not ok: a second red case"}) {
		t.Fatalf("the cases read %q", rows)
	}
	if !strings.HasPrefix(rows[len(rows)-1], "assertion, 2 test(s) fail on their own assertion") {
		t.Fatalf("the verdict reads %q", rows[len(rows)-1])
	}
}

// A branch changing no test answers missing, naming the branch point. [[spec/tickets/work-verbs-port-to-go]]
func TestPFABranchChangingNoTestAnswersMissingSinceTheBase(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	base := one.rev("HEAD")
	one.cut(workBranch+"x", "")
	one.land("a source", map[string]string{"src/x.js": "x\n"})
	if code := one.branchSays("test"); code != codeRed {
		t.Fatalf("the test verb answers %d", code)
	}
	if !strings.HasPrefix(one.out.String(), "missing, because the branch changes no test since "+shortOf(base)) {
		t.Fatalf("the verb reads %q", one.out.String())
	}
}

// A branch changing a test runs it, and answers green. [[spec/tickets/work-verbs-port-to-go]]
func TestPFABranchChangingATestRunsIt(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.cut(workBranch+"x", "")
	one.land("a test", map[string]string{"test/level0/x.test.js": pfNodeTests(3, ""), "src/x.js": "x\n"})
	if code := one.branchSays("test"); code != 0 {
		t.Fatalf("the test verb answers %d: %s", code, one.out.String())
	}
	if !strings.HasPrefix(one.out.String(), "green") {
		t.Fatalf("the verb reads %q", one.out.String())
	}
}

// A deleted test runs nowhere, and an untracked folder names each test under it. [[spec/tickets/work-verbs-port-to-go]]
func TestPFADeletedTestStaysOutAndAnUntrackedFolderRuns(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"test/level0/gone.test.js": "require(\"node:test\").test(\"gone\", () => { throw new Error(\"it ran\"); });\n"}).desk()
	one.erase("test/level0/gone.test.js")
	one.write(map[string]string{"test/level0/fresh/new.test.js": pfNodeTests(1, "")})
	if code := one.branchSays("test"); code != 0 {
		t.Fatalf("the test verb answers %d: %s", code, one.out.String())
	}
	if got := strings.TrimSpace(one.out.String()); got != "green, 1 test(s) pass in 1 file(s)" {
		t.Fatalf("the verb reads %q", got)
	}
}

// The red run sets the sources aside, answers red on an assertion, and puts them back. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheRedRunSetsTheSourcesAside(t *testing.T) {
	t.Parallel()
	one := pfRedTree(t, true)
	if code := one.branchSays("test", "--red", pfRedTest, pfSource, pfFresh); code != 0 {
		t.Fatalf("the red run answers %d: %s", code, one.out.String())
	}
	rows := strings.Split(strings.TrimSpace(one.out.String()), "\n")
	if !strings.HasPrefix(rows[len(rows)-1], "red, 1 test(s) fail on their own assertion") {
		t.Fatalf("the red run reads %q", one.out.String())
	}
	var seen struct {
		Source *string `json:"source"`
		Fresh  bool    `json:"fresh"`
		Held   bool    `json:"held"`
	}
	if err := json.Unmarshal([]byte(one.read(".se/seen.json")), &seen); err != nil {
		t.Fatalf("the test records nothing: %v", err)
	}
	if seen.Source == nil || *seen.Source != "the text at HEAD\n" || seen.Fresh || !seen.Held {
		t.Fatalf("the test reads %+v", seen)
	}
	pfPutBack(t, one)
}

// A red run after a killed one puts the working texts back first, a new source among them. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheRedRunAfterAKilledRunPutsTheTextsBack(t *testing.T) {
	t.Parallel()
	one := pfRedTree(t, true)
	one.d.remove(pfFresh)
	list, _ := json.Marshal([]aside{{pfSource, true}, {pfFresh, true}})
	one.write(map[string]string{
		pfSource:                  "the text at HEAD\n",
		asideAt + "/" + pfSource:  "the working text\n",
		asideAt + "/" + pfFresh:   "a new file\n",
		asideAt + "/" + asideList: string(list),
	})
	if code := one.branchSays("test", "--red", pfRedTest, pfSource, pfFresh); code != 0 {
		t.Fatalf("the red run answers %d: %s", code, one.out.String())
	}
	pfPutBack(t, one)
}

// A red run refuses where the test passes with the sources set aside, and puts them back. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheRedRunRefusesAPassingTest(t *testing.T) {
	t.Parallel()
	one := pfRedTree(t, false)
	if code := one.branchSays("test", "--red", pfRedTest, pfSource, pfFresh); code != codeRed {
		t.Fatalf("the red run answers %d: %s", code, one.out.String())
	}
	if !regexp.MustCompile(`^refused, because .*green`).MatchString(one.out.String()) {
		t.Fatalf("the red run reads %q", one.out.String())
	}
	pfPutBack(t, one)
}
