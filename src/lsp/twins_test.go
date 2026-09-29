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
)

var twinsUpdate = flag.Bool("twins", false, "write the twin golden files again off the tree")

// The golden folder under the check module, from this package's folder. [[spec/tickets/check-names-meet-their-goldens]]
var twinsAt = filepath.Join("..", "modules", "check", "testdata")

// The name the private twin looks for, as src/scripts/check-twins.js names it. [[spec/tickets/check-names-meet-their-goldens]]
const twinName = "owner"

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

// The real disk, listing the tracked files as the index lists them. [[spec/tickets/check-names-meet-their-goldens]]
type trackedDisk struct {
	realDisk
	list []string
}

func (one trackedDisk) tracked() []string { return one.list }

func rowOf(one Finding) twinRow {
	return twinRow{File: one.File, Rule: one.Rule, Line: one.Line, Message: one.Message}
}

func funcName(fn any) string {
	name := runtime.FuncForPC(reflect.ValueOf(fn).Pointer()).Name()
	return name[strings.LastIndex(name, ".")+1:]
}

// Each Go twin's rows over the tree, as src/scripts/check-twins.js reports the JavaScript ones. [[spec/tickets/check-names-meet-their-goldens]]
func goTwins(t *testing.T, tree *Tree, all []string, vale, biome string) map[string][]twinRow {
	t.Helper()
	paths := tree.Paths()
	out := map[string][]twinRow{}
	for _, rule := range Rules {
		out["tree"] = append(out["tree"], twinRow{Rule: funcName(rule), Message: "runs"})
	}
	for _, one := range treeFaults(tree) {
		out["tree"] = append(out["tree"], rowOf(one))
	}
	kinds := schemasIn(tree).Names()
	sort.Strings(kinds)
	for _, kind := range kinds {
		out["schema"] = append(out["schema"], twinRow{Rule: kind, Message: "kind"})
	}
	file, function := config.Count(tree.Root, "code.fileLines"), config.Count(tree.Root, "code.functionLines")
	for _, path := range paths {
		text := tree.Read(path)
		for _, one := range sizeFaults(path, text, function, file) {
			out["size"] = append(out["size"], rowOf(one))
		}
		for _, one := range magicIn(path, text) {
			out["magic"] = append(out["magic"], rowOf(one))
		}
		if said := overLong(path, tree.Words); said != "" {
			out["names"] = append(out["names"], twinRow{File: path, Rule: "overLong", Message: said})
		}
		for i, line := range strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n") {
			if carriesTheName(line, twinName) {
				out["private"] = append(out["private"], twinRow{File: path, Rule: "carriesTheName", Line: i + 1, Message: twinName})
			}
			if strings.HasSuffix(path, ".md") {
				if heading := twinHeading.FindStringSubmatch(line); heading != nil {
					out["slug"] = append(out["slug"], twinRow{File: path, Rule: "slugOf", Line: i + 1, Message: slugOf(heading[1])})
				}
			}
		}
	}
	for _, path := range all {
		if isDraft(path) {
			out["paths"] = append(out["paths"], twinRow{File: path, Rule: "isDraft", Message: "draft"})
		}
	}
	rows, fault := valeRowsOf(tree.Root, vale)
	if fault != "" {
		t.Fatalf("the captured Vale output reads as a fault: %s", fault)
	}
	for _, one := range rows {
		out["vale"] = append(out["vale"], twinRow{File: one.File, Rule: one.Rule, Line: one.Line, Message: fmt.Sprintf("%s [%s]", one.Message, one.Severity)})
	}
	for _, one := range biomeRowsOf(tree.Root, biome, ".") {
		out["biome"] = append(out["biome"], twinRow{File: one.File, Rule: one.Rule, Line: one.Line, Message: fmt.Sprintf("%s [%s]", one.Message, one.Severity)})
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
	root, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	listed, err := exec.Command("git", "-C", root, "ls-files").Output()
	if err != nil {
		t.Fatalf("git lists no tracked file: %v", err)
	}
	all := strings.Fields(string(listed))
	tree := treeOver(root, trackedDisk{list: all})
	tree.Words = config.Count(root, "names.words")
	vale, err := os.ReadFile(filepath.Join(twinsAt, "vale.out"))
	if err != nil {
		t.Fatal(err)
	}
	biome, err := os.ReadFile(filepath.Join(twinsAt, "biome.out"))
	if err != nil {
		t.Fatal(err)
	}
	goSide := goTwins(t, tree, all, string(vale), string(biome))

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
		said := twinGolden{JavaScript: aloneIn(jsSide[twin], goSide[twin]), Go: aloneIn(goSide[twin], jsSide[twin])}
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
			t.Errorf("no golden file stands for %s: run go test ./src/lsp -run TestTwinGoldens -twins", twin)
			continue
		}
		var held twinGolden
		if err := json.Unmarshal(body, &held); err != nil {
			t.Fatalf("%s's golden reads as no JSON: %v", twin, err)
		}
		if !reflect.DeepEqual(said, held) {
			t.Errorf("%s's twins part otherwise than its golden holds: the JavaScript side alone %v, the Go side alone %v. Run go test ./src/lsp -run TestTwinGoldens -twins, and read the difference at the merge", twin, said.JavaScript, said.Go)
		}
	}
}
