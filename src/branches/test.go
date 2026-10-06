// The test verb: the tests the branch changes since the take, run once, and
// one word on what came back, as src/scripts/work-test.js answers it. A red
// run sets the sources aside and runs the test over HEAD's text.
// [[spec/design_output/pull#the-test-verb]]
package branches

import (
	"quackitect/src/yaml"

	"encoding/json"
	"path"
	"regexp"
	"slices"
	"sort"
	"strconv"
	"strings"
)

// How much of an error line a verdict carries, where the sources wait aside, and the flag and the word a red run reads. [[spec/design_output/pull#a-test-proves-red]]
const (
	cutError  = 160
	asideAt   = runtimeFolder + "/red"
	asideList = "sources.json"
	// The folder a golden stands in, and the root a package path opens with. [[spec/tickets/size-golden-drops-line-counts]]
	goldenFolder = "testdata"
	srcRoot      = "src/"
	redFlag      = "--red"
	assertion    = "assertion, "
)

var (
	jsTest     = regexp.MustCompile(`\.test\.js$`)
	goTest     = regexp.MustCompile(`^src/.*_test\.go$`)
	srcFolder  = regexp.MustCompile(`^src/[^.]*$`)
	goFail     = regexp.MustCompile(`(?m)^(---\s+)?FAIL`)
	goError    = regexp.MustCompile(`[Ee]rror|cannot|undefined`)
	testFunc   = regexp.MustCompile(`(?m)^func (Test\w+)\(`)
	notOK      = regexp.MustCompile(`(?m)^\s*not ok \d+ - (.+)$`)
	skipped    = regexp.MustCompile(`# (TODO|SKIP)\b`)
	loadFaults = regexp.MustCompile(`ERR_MODULE_NOT_FOUND|SyntaxError|Cannot find module|ReferenceError`)
	assertFail = regexp.MustCompile(`ERR_ASSERTION|AssertionError`)
)

// Runs the tests the branch changes, or the files named, and answers one word on them. [[spec/design_output/pull#the-test-verb]]
// The packages that read a changed golden: the golden folder's own, and every package whose test text names that folder. [[spec/tickets/size-golden-drops-line-counts]]
func goldenReaders(changed []string, tests map[string]string) []string {
	var out []string
	for _, one := range changed {
		folder, _, golden := strings.Cut(one, "/"+goldenFolder+"/")
		if !golden || !strings.HasPrefix(folder, srcRoot) {
			continue
		}
		out = append(out, folder)
		named := strings.TrimPrefix(folder, srcRoot) + "/" + goldenFolder
		for file, text := range tests {
			if strings.Contains(text, named) {
				out = append(out, path.Dir(file))
			}
		}
	}
	sort.Strings(out)
	return slices.Compact(out)
}

func testVerb(d *Doors, _ string, argv []string) int {
	if slices.Contains(argv, redFlag) {
		return d.redTest(argv[1:])
	}
	var named []string
	for _, one := range argv[1:] {
		if !strings.HasPrefix(one, "--") {
			named = append(named, one)
		}
	}
	since := ""
	changed := named
	if len(named) == 0 {
		since = d.sinceOf(d.holdOf(d.handOf()))
		changed = d.changedFiles(since)
	}
	var files []string
	for _, one := range changed {
		if jsTest.MatchString(one) {
			files = append(files, one)
		}
	}
	modules := goPackagesOf(changed)
	for _, one := range goldenReaders(changed, d.goTestTexts(changed)) {
		if !slices.Contains(modules, one) {
			modules = append(modules, one)
		}
	}
	if len(files) == 0 && len(modules) == 0 {
		point := "the branch point"
		if since != "" {
			point = shortOf(since)
		}
		d.say("missing, because the branch changes no test since %s", point)
		return codeRed
	}
	var said []string
	if len(files) > 0 {
		ran := d.rawEnv(d.Root, nil, "", append([]string{"node", "--test", "--test-reporter=tap"}, files...)...)
		said = append(said, testSays(ran, len(files)))
	}
	for _, one := range modules {
		only := []string{"./" + one + "/..."}
		if !slices.Contains(named, one) {
			var inside []string
			for _, file := range named {
				if path.Dir(file) == one {
					inside = append(inside, file)
				}
			}
			if own := d.goTestNames(inside); len(own) > 0 {
				only = []string{"-run", "^(" + strings.Join(own, "|") + ")$", "./" + one + "/"}
			}
		}
		said = append(said, goSays(d.rawEnv(d.Root, []string{"CGO_ENABLED=0"}, "", append([]string{"go", "test"}, only...)...), one))
	}
	for _, one := range said {
		if !strings.HasPrefix(one, "green") {
			d.say("%s", one)
			return codeRed
		}
	}
	d.say("%s", strings.Join(said, "; "))
	return codeOK
}

// The package folders a changed Go test or a named folder names. [[spec/tickets/go-code-shares-one-module]]
func goPackagesOf(paths []string) []string {
	var out []string
	for _, one := range paths {
		said := strings.TrimRight(one, "/")
		isTest := goTest.MatchString(said)
		if !isTest && !srcFolder.MatchString(said) {
			continue
		}
		if isTest {
			said = path.Dir(said)
		}
		if !slices.Contains(out, said) {
			out = append(out, said)
		}
	}
	return out
}

// The test functions the named Go test files hold. [[spec/design_output/pull#the-test-verb]]
// Every Go test file under src by its text, read only where a change touches a golden. [[spec/tickets/size-golden-drops-line-counts]]
func (d *Doors) goTestTexts(changed []string) map[string]string {
	out := map[string]string{}
	if !slices.ContainsFunc(changed, func(one string) bool { return strings.Contains(one, "/"+goldenFolder+"/") }) {
		return out
	}
	for _, one := range d.filesUnder("src") {
		if goTest.MatchString(one) {
			out[one] = d.read(one)
		}
	}
	return out
}

func (d *Doors) goTestNames(paths []string) []string {
	var out []string
	for _, one := range paths {
		if !strings.HasSuffix(one, "_test.go") {
			continue
		}
		for _, found := range testFunc.FindAllStringSubmatch(d.read(one), -1) {
			if !slices.Contains(out, found[1]) {
				out = append(out, found[1])
			}
		}
	}
	sort.Strings(out)
	return out
}

// The word a Go run answers: green, assertion or build. [[spec/design_output/pull#the-test-verb]]
func goSays(ran Said, where string) string {
	out := ran.Out + "\n" + ran.Err
	if ran.OK {
		return "green, " + where + " passes"
	}
	if goFail.MatchString(out) {
		return "assertion, a test of " + where + " fails"
	}
	line := "the run answers nothing"
	for _, row := range strings.Split(out, "\n") {
		if goError.MatchString(row) {
			line = row
			break
		}
	}
	return "build, because " + where + " builds not: " + cut(strings.TrimSpace(line), cutError)
}

// A text cut to a length. [[spec/design_output/pull#the-test-verb]]
func cut(said string, most int) string {
	units := []rune(said)
	if len(units) <= most {
		return said
	}
	return string(units[:most])
}

// The commit the branch's changes count from: the hold's first take, its hash, or the base with trunk. [[spec/design_output/pull#the-test-verb]]
func (d *Doors) sinceOf(held *holdFile) string {
	if held != nil && held.Path != "" {
		if d.exists(held.Path) {
			for _, one := range recordIn(d.read(held.Path)) {
				if yaml.Truthy(one.Get("hash_before")) {
					return asText(one.Get("hash_before"))
				}
			}
		}
		if held.Hash != "" {
			return held.Hash
		}
	}
	base, _ := d.Repo.MergeBase("origin/"+trunk, "HEAD")
	return base
}

// The files changed since a commit and in the tree, a deleted one past. [[spec/design_output/pull#the-test-verb]]
func (d *Doors) changedFiles(since string) []string {
	var out []string
	add := func(one string) {
		if one = strings.TrimSpace(one); one != "" && !slices.Contains(out, one) {
			out = append(out, one)
		}
	}
	if since != "" {
		changes, _ := d.Repo.Diff(since, "HEAD")
		for _, one := range changes {
			if one.Status != "D" {
				add(one.Path)
			}
		}
	}
	standing, _ := d.Repo.Status(true)
	for _, one := range standing {
		if !strings.Contains(one.Status, "D") {
			add(one.Path)
		}
	}
	sort.Strings(out)
	return out
}

// Each failing case above the verdict, the verdict last. [[spec/tickets/the-verbs-need-no-wrapper]]
func testSays(ran Said, files int) string {
	verdict := verdictOf(ran, files)
	if strings.HasPrefix(verdict, "green") {
		return verdict
	}
	var red []string
	for _, found := range notOK.FindAllStringSubmatch(ran.Out+"\n"+ran.Err, -1) {
		if !skipped.MatchString(found[1]) {
			red = append(red, "  not ok: "+strings.TrimSpace(found[1]))
		}
	}
	return strings.Join(append(red, verdict), "\n")
}

// The word a node test run answers. [[spec/design_output/pull#the-test-verb]]
func verdictOf(ran Said, files int) string {
	out := ran.Out + "\n" + ran.Err
	count := func(key string) int {
		found := regexp.MustCompile(`(?m)^# ` + key + ` (\d+)`).FindStringSubmatch(out)
		if found == nil {
			return 0
		}
		said, _ := strconv.Atoi(found[1])
		return said
	}
	errorLine := func(none string) string {
		for _, row := range strings.Split(out, "\n") {
			if strings.Contains(row, "Error") {
				return cut(strings.TrimSpace(row), cutError)
			}
		}
		return none
	}
	if ran.OK && count("tests") > 0 {
		return "green, " + strconv.Itoa(count("pass")) + " test(s) pass in " + strconv.Itoa(files) + " file(s)"
	}
	if loadFaults.MatchString(out) || count("tests") == 0 {
		return "build, because a file loads no test: " + errorLine("the run answers nothing")
	}
	if assertFail.MatchString(out) {
		return assertion + strconv.Itoa(count("fail")) + " test(s) fail on their own assertion"
	}
	return "build, because " + strconv.Itoa(count("fail")) + " test(s) fail outside an assertion: " + errorLine("")
}

// One source set aside: its path, and whether the tree held it. [[spec/design_output/pull#a-test-proves-red]]
type aside struct {
	Path string `json:"path"`
	Kept bool   `json:"kept"`
}

// Runs a test over each source as HEAD holds it, and answers red where an assertion fails. [[spec/design_output/pull#a-test-proves-red]]
func (d *Doors) redTest(argv []string) int {
	var words []string
	for _, one := range argv {
		if !strings.HasPrefix(one, "--") {
			words = append(words, one)
		}
	}
	if len(words) < 2 {
		d.say("refused, because the verb names a test and its sources: ./RUNME.sh test --red <test> <source>...")
		return codeRefused
	}
	file, sources := words[0], words[1:]
	d.putBack()
	d.setAside(sources)
	said := testSays(d.rawEnv(d.Root, nil, "", "node", "--test", "--test-reporter=tap", file), 1)
	d.putBack()
	rows := strings.Split(said, "\n")
	verdict := rows[len(rows)-1]
	if rest, ok := strings.CutPrefix(verdict, assertion); ok {
		d.say("%s", strings.Join(append(rows[:len(rows)-1], "red, "+rest), "\n"))
		return codeOK
	}
	d.say("refused, because the test answers %s with the sources set aside", verdict)
	return codeRed
}

// Each working text goes aside before HEAD's text takes its place, and a source HEAD lacks stands aside whole. [[spec/design_output/pull#a-test-proves-red]]
func (d *Doors) setAside(sources []string) {
	var list []aside
	for _, one := range sources {
		kept := d.exists(one)
		if kept {
			_ = d.write(asideAt+"/"+one, d.read(one))
		}
		list = append(list, aside{one, kept})
		text, _ := json.MarshalIndent(list, "", "  ")
		_ = d.write(asideAt+"/"+asideList, string(text)+"\n")
		if head, ok := d.Repo.Show("HEAD", one); ok {
			_ = d.write(one, head)
		} else if kept {
			d.remove(one)
		}
	}
}

// Puts every source set aside back, so a killed run leaves nothing behind. [[spec/design_output/pull#a-test-proves-red]]
func (d *Doors) putBack() {
	if !d.exists(asideAt + "/" + asideList) {
		return
	}
	var list []aside
	_ = json.Unmarshal([]byte(d.read(asideAt+"/"+asideList)), &list)
	for _, one := range list {
		if one.Kept {
			_ = d.write(one.Path, d.read(asideAt+"/"+one.Path))
		} else if d.exists(one.Path) {
			d.remove(one.Path)
		}
	}
	d.remove(asideAt)
}
