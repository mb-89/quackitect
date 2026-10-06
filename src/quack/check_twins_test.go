// Every check twin runs over the whole tree both ways, and the golden file
// under the check module holds the rows one side reports alone. The JavaScript
// side comes off node test/level0/check-twins.js, run from the root.
// [[spec/tickets/check-names-meet-their-goldens]]
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"regexp"
	"runtime"
	"slices"
	"sort"
	"strings"
	"testing"

	"quackitect/src/config"
	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
)

var twinsUpdate = flag.Bool("twins", false, "write the twin golden files again off the tree")

// The golden folder under the check module, from this package's folder. [[spec/tickets/check-names-meet-their-goldens]]
var twinsAt = filepath.Join("..", "modules", "check", "testdata")

// The name the private twin looks for, as src/scripts/check-twins.js names it. [[spec/tickets/check-names-meet-their-goldens]]
const twinName = "owner"

// The rules that read the box beside the tree, so their rows part with each runner and sit outside the golden. [[spec/tickets/check-names-meet-their-goldens]]
var boxBound = []string{"SurveyFindsNode"}

// The rows of a side with every box-bound rule taken out. [[spec/tickets/check-names-meet-their-goldens]]
func treeBound(rows []twinRow) []twinRow {
	return slices.DeleteFunc(slices.Clone(rows), func(row twinRow) bool { return slices.Contains(boxBound, row.Rule) })
}

var twinHeading = regexp.MustCompile(`^#{1,6}\s+(.+?)\s*#*\s*$`)

// One row a twin reports, in the shape both sides write. [[spec/tickets/check-names-meet-their-goldens]]
type twinRow struct {
	File    string `json:"file"`
	Rule    string `json:"rule"`
	Line    int    `json:"line"`
	Message string `json:"message"`
}

// A twin's golden: the rows the JavaScript side reports alone, and the rows the Go side reports alone. [[spec/tickets/check-names-meet-their-goldens]]
type twinGolden struct {
	JavaScript []twinRow `json:"javascript"`
	Go         []twinRow `json:"go"`
}

// The real disk under the root, listing the tracked files as the index lists them. [[spec/tickets/check-names-meet-their-goldens]]
type trackedDisk struct {
	root string
	list []string
}

func (one trackedDisk) at(path string) string {
	return filepath.Join(one.root, filepath.FromSlash(path))
}

func (one trackedDisk) Read(path string) (string, bool) {
	read, err := os.ReadFile(one.at(path))
	return string(read), err == nil
}

func (one trackedDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

func (one trackedDisk) Folder(path string) bool {
	said, err := os.Stat(one.at(path))
	return err == nil && said.IsDir()
}

func (one trackedDisk) Names(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := []string{}
	for _, entry := range found {
		if !entry.IsDir() {
			out = append(out, entry.Name())
		}
	}
	return out
}

func (one trackedDisk) Paths() []string { return one.list }

func rowOf(file, rule string, line int, message string) twinRow {
	return twinRow{File: file, Rule: rule, Line: line, Message: message}
}

func funcName(fn any) string {
	name := runtime.FuncForPC(reflect.ValueOf(fn).Pointer()).Name()
	return name[strings.LastIndex(name, ".")+1:]
}

// Each Go twin's rows over the tree, as src/scripts/check-twins.js reports the JavaScript ones. [[spec/tickets/check-names-meet-their-goldens]]
func goTwins(t *testing.T, tree *check.Tree, all []string, biome string) map[string][]twinRow {
	t.Helper()
	paths := tree.Paths()
	out := map[string][]twinRow{}
	for _, rule := range check.Rules {
		out["tree"] = append(out["tree"], twinRow{Rule: funcName(rule), Message: "runs"})
	}
	for _, one := range check.TreeFaults(tree) {
		out["tree"] = append(out["tree"], rowOf(one.File, one.Rule, one.Line, one.Message))
	}
	kinds := check.SchemasIn(tree).Names()
	sort.Strings(kinds)
	for _, kind := range kinds {
		out["schema"] = append(out["schema"], twinRow{Rule: kind, Message: "kind"})
	}
	file, function := config.Count(tree.Root, "code.fileLines"), config.Count(tree.Root, "code.functionLines")
	for _, path := range paths {
		text := tree.Read(path)
		for _, one := range check.SizeFaults(path, text, function, file) {
			out["size"] = append(out["size"], rowOf(one.File, one.Rule, one.Line, one.Message))
		}
		for _, one := range check.MagicIn(path, text) {
			out["magic"] = append(out["magic"], rowOf(one.File, one.Rule, one.Line, one.Message))
		}
		if said := check.OverLong(path, tree.Words); said != "" {
			out["names"] = append(out["names"], twinRow{File: path, Rule: "overLong", Message: said})
		}
		for i, line := range strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n") {
			if check.CarriesTheName(line, twinName) {
				out["private"] = append(out["private"], twinRow{File: path, Rule: "carriesTheName", Line: i + 1, Message: twinName})
			}
			if strings.HasSuffix(path, ".md") {
				if heading := twinHeading.FindStringSubmatch(line); heading != nil {
					out["slug"] = append(out["slug"], twinRow{File: path, Rule: "slugOf", Line: i + 1, Message: check.SlugOf(heading[1])})
				}
			}
		}
	}
	for _, path := range all {
		if check.IsDraft(path) {
			out["paths"] = append(out["paths"], twinRow{File: path, Rule: "isDraft", Message: "draft"})
		}
	}
	tools := &lsp.Tools{Root: tree.Root, Check: lspChecks(tree.Root)}
	for _, one := range tools.BiomeRows(biome, ".") {
		out["biome"] = append(out["biome"], rowOf(one.File, one.Rule, one.Line, fmt.Sprintf("%s [%s]", one.Message, one.Severity)))
	}
	return out
}

// The rows of one side the other side reports nowhere, each row once for each time it stands unmatched. [[spec/tickets/check-names-meet-their-goldens]]
func aloneIn(one, other []twinRow) []twinRow {
	left := map[twinRow]int{}
	for _, row := range other {
		left[row]++
	}
	out := []twinRow{}
	for _, row := range one {
		if left[row] > 0 {
			left[row]--
			continue
		}
		out = append(out, row)
	}
	sort.Slice(out, func(i, j int) bool {
		a, b := out[i], out[j]
		if a.File != b.File {
			return a.File < b.File
		}
		if a.Line != b.Line {
			return a.Line < b.Line
		}
		if a.Rule != b.Rule {
			return a.Rule < b.Rule
		}
		return a.Message < b.Message
	})
	return out
}

func TestTwinGoldens(t *testing.T) {
	t.Parallel()
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	listed, err := exec.Command("git", "-C", root, "ls-files").Output()
	if err != nil {
		t.Fatalf("git lists no tracked file: %v", err)
	}
	all := strings.Fields(string(listed))
	tree := check.TreeOver(root, trackedDisk{root: root, list: all})
	tree.Words = config.Count(root, "names.words")
	biome, err := os.ReadFile(filepath.Join(twinsAt, "biome.out"))
	if err != nil {
		t.Fatal(err)
	}
	goSide := goTwins(t, tree, all, string(biome))

	node := exec.Command("node", filepath.Join("test", "level0", "check-twins.js"))
	node.Dir = root
	var stderr bytes.Buffer
	node.Stderr = &stderr
	printed, err := node.Output()
	if err != nil {
		t.Fatalf("node prints no JavaScript twins: %v %s", err, stderr.String())
	}
	var jsSide map[string][]twinRow
	if err := json.Unmarshal(printed, &jsSide); err != nil {
		t.Fatalf("the JavaScript twins read as no JSON: %v", err)
	}

	// The check module owns the list of twins, so a twin the JavaScript side drops or adds fails here. [[spec/tickets/twin-goldens-walk-every-twin]]
	for twin := range jsSide {
		if !slices.Contains(check.Twins, twin) {
			t.Errorf("the JavaScript side prints %s, a twin check.Twins leaves out", twin)
		}
	}
	for _, twin := range check.Twins {
		if _, ok := jsSide[twin]; !ok {
			t.Errorf("the JavaScript side prints no %s twin, which check.Twins names", twin)
			continue
		}
		jsRows, goRows := treeBound(jsSide[twin]), treeBound(goSide[twin])
		said := twinGolden{JavaScript: aloneIn(jsRows, goRows), Go: aloneIn(goRows, jsRows)}
		at := filepath.Join(twinsAt, twin+".golden.json")
		if *twinsUpdate {
			body, err := json.MarshalIndent(said, "", "  ")
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(at, append(body, '\n'), 0o644); err != nil {
				t.Fatal(err)
			}
			continue
		}
		body, err := os.ReadFile(at)
		if err != nil {
			t.Errorf("no golden file stands for %s: run go test ./src/quack -run TestTwinGoldens -twins", twin)
			continue
		}
		var held twinGolden
		if err := json.Unmarshal(body, &held); err != nil {
			t.Fatalf("%s's golden reads as no JSON: %v", twin, err)
		}
		if !reflect.DeepEqual(said, held) {
			t.Errorf("%s's twins part otherwise than its golden holds: the JavaScript side alone %v, the Go side alone %v. Run go test ./src/quack -run TestTwinGoldens -twins, and read the difference at the merge", twin, said.JavaScript, said.Go)
		}
	}
}
