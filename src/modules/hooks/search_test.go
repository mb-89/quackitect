// Grep and Glob answer off the index through the door, in the shapes the
// bridge's answersFromIndex hands the harness, and pass to the disk wherever
// the bridge passes. Each case runs over a fake index scanning seeded texts.
// [[spec/tickets/grep-glob-answer-off-index]]
package hooks

import (
	"encoding/json"
	"errors"
	"path"
	"reflect"
	"regexp"
	"sort"
	"strings"
	"testing"
)

// An index over seeded texts: a grep scans each line, a glob matches each path, and every answer travels as JSON, as se-index prints it. It keeps each ask, and answers its fault where the case sets one. [[spec/tickets/grep-glob-answer-off-index]]
type fakeIndex struct {
	texts map[string]string
	fault error
	asks  []fakeAsk
}

type fakeAsk struct {
	Method string
	Params map[string]any
}

func (one *fakeIndex) ask(method string, params map[string]any) (map[string]any, error) {
	one.asks = append(one.asks, fakeAsk{method, params})
	if one.fault != nil {
		return nil, one.fault
	}
	var said any
	switch method {
	case "grep":
		said = one.grep(params)
	case "glob":
		said = one.glob(params)
	default:
		return nil, errors.New("the index knows no method " + method)
	}
	text, err := json.Marshal(said)
	if err != nil {
		return nil, err
	}
	var out map[string]any
	return out, json.Unmarshal(text, &out)
}

func (one *fakeIndex) paths() []string {
	out := make([]string, 0, len(one.texts))
	for at := range one.texts {
		out = append(out, at)
	}
	sort.Strings(out)
	return out
}

func (one *fakeIndex) grep(params map[string]any) map[string]any {
	shape := regexp.MustCompile(params["pattern"].(string))
	glob, _ := params["glob"].(string)
	files := []map[string]any{}
	total := 0
	for _, at := range one.paths() {
		if !fits(glob, at) {
			continue
		}
		var lines []map[string]any
		for n, line := range strings.Split(one.texts[at], "\n") {
			if shape.MatchString(line) {
				lines = append(lines, map[string]any{"line": n + 1, "text": line, "match": true})
			}
		}
		if len(lines) > 0 {
			files = append(files, map[string]any{"path": at, "count": len(lines), "lines": lines})
			total += len(lines)
		}
	}
	return map[string]any{"files": files, "total": total, "cut": false}
}

func (one *fakeIndex) glob(params map[string]any) map[string]any {
	paths := []string{}
	for _, at := range one.paths() {
		if fits(params["pattern"].(string), at) {
			paths = append(paths, at)
		}
	}
	return map[string]any{"paths": paths, "cut": false}
}

// A glob with no slash, or opening on **/, matches the base name. [[spec/tickets/grep-glob-answer-off-index]]
func fits(glob, at string) bool {
	if glob == "" {
		return true
	}
	glob = strings.TrimPrefix(glob, "**/")
	if !strings.Contains(glob, "/") {
		at = path.Base(at)
	}
	ok, _ := path.Match(glob, at)
	return ok
}

// A door over the case's index, with two Go files and a note seeded. [[spec/tickets/grep-glob-answer-off-index]]
func searchDoor(t *testing.T) (over, *fakeIndex) {
	t.Helper()
	ix := &fakeIndex{texts: map[string]string{
		"src/a.go":    "package a\nfunc One() {}",
		"src/b.go":    "package b\nfunc One() {}\nvar two = One",
		"spec/one.md": "One note.",
	}}
	world := doorOver(t, &calls{}, &book{})
	world.door.from.Index = ix.ask
	return world, ix
}

func searchCall(tool string, input map[string]any) Post {
	return Post{Event: "tool.call", E: map[string]any{"tool": tool, "input": input, "session_id": "s1"}}
}

// The result the door answers a search with, or nil where it passes. [[spec/tickets/grep-glob-answer-off-index]]
func resultOf(t *testing.T, door *Door, post Post) map[string]any {
	t.Helper()
	for _, one := range hooks(t, door, post).Effects {
		if one.Kind == resultKind {
			shape, ok := one.Result.(map[string]any)
			if !ok {
				t.Fatalf("the door answers the result %#v, and wants the tool's shape", one)
			}
			return shape
		}
	}
	return nil
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGrepAnswersTheIndexsLines(t *testing.T) {
	world, ix := searchDoor(t)
	shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "func One", "output_mode": "content", "glob": "*.go"}))
	want := map[string]any{
		"mode": "content", "numFiles": 2, "filenames": []string{"src/a.go", "src/b.go"},
		"content": "src/a.go:2:func One() {}\nsrc/b.go:2:func One() {}", "numLines": 2,
	}
	if !reflect.DeepEqual(shape, want) {
		t.Errorf("the Grep answers %#v, and wants the index's lines: %#v", shape, want)
	}
	if len(ix.asks) != 1 || ix.asks[0].Method != "grep" || ix.asks[0].Params["limit"] != 250 || ix.asks[0].Params["glob"] != "*.go" {
		t.Errorf("the door asks the index %+v, and wants one grep over *.go at the limit of 250", ix.asks)
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGlobAnswersTheIndexsPaths(t *testing.T) {
	world, _ := searchDoor(t)
	shape := resultOf(t, world.door, searchCall("Glob", map[string]any{"pattern": "**/*.go"}))
	want := map[string]any{"durationMs": 0, "numFiles": 2, "filenames": []string{"src/a.go", "src/b.go"}, "truncated": false}
	if !reflect.DeepEqual(shape, want) {
		t.Errorf("the Glob answers %#v, and wants the index's paths: %#v", shape, want)
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGrepCountsAndListsFilesAsTheBridgeSays(t *testing.T) {
	world, _ := searchDoor(t)
	counted := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "One", "output_mode": "count"}))
	want := map[string]any{
		"mode": "count", "numFiles": 3, "filenames": []string{"spec/one.md", "src/a.go", "src/b.go"},
		"content": "spec/one.md:1\nsrc/a.go:1\nsrc/b.go:2", "numMatches": 4,
	}
	if !reflect.DeepEqual(counted, want) {
		t.Errorf("the counting Grep answers %#v, and wants %#v", counted, want)
	}
	listed := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "package"}))
	want = map[string]any{"mode": "files_with_matches", "numFiles": 2, "filenames": []string{"src/a.go", "src/b.go"}}
	if !reflect.DeepEqual(listed, want) {
		t.Errorf("the listing Grep answers %#v, and wants %#v", listed, want)
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGrepTypeReadsAsItsGlob(t *testing.T) {
	world, ix := searchDoor(t)
	if shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "One", "type": "Go"})); shape == nil {
		t.Fatalf("the Grep of type Go passes, and wants the index's answer")
	}
	if len(ix.asks) != 1 || ix.asks[0].Params["glob"] != "*.go" {
		t.Errorf("the door asks the index %+v, and wants the glob *.go the type go reads as", ix.asks)
	}
	if shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "One", "type": "go", "glob": "*.md"})); shape != nil {
		t.Errorf("a Grep naming both a type and a glob answers %#v, and wants a pass to the disk", shape)
	}
	if shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "One", "type": "cobol"})); shape != nil {
		t.Errorf("a Grep of a type the index knows no glob for answers %#v, and wants a pass to the disk", shape)
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGrepTheIndexRefusesPassesToTheDisk(t *testing.T) {
	world, ix := searchDoor(t)
	ix.fault = errors.New("the pattern takes a lookahead")
	if shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "(?=One)"})); shape != nil {
		t.Errorf("a Grep the index refuses answers %#v, and wants a pass to the disk", shape)
	}
	if len(ix.asks) != 1 {
		t.Errorf("the door asks the index %d times, and wants one ask before it passes", len(ix.asks))
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestAGrepOnAnAbsolutePathPasses(t *testing.T) {
	world, ix := searchDoor(t)
	for _, at := range []string{"/etc", `C:\work`} {
		if shape := resultOf(t, world.door, searchCall("Grep", map[string]any{"pattern": "One", "path": at})); shape != nil {
			t.Errorf("a Grep under %s answers %#v, and wants a pass to the disk", at, shape)
		}
	}
	if len(ix.asks) != 0 {
		t.Errorf("the door asks the index %+v over absolute paths, and wants no ask", ix.asks)
	}
}

// [[spec/tickets/grep-glob-answer-off-index]]
func TestADoorWithNoIndexPassesGrepAndGlob(t *testing.T) {
	world := doorOver(t, &calls{}, &book{})
	for _, post := range []Post{searchCall("Grep", map[string]any{"pattern": "One"}), searchCall("Glob", map[string]any{"pattern": "*.go"})} {
		if shape := resultOf(t, world.door, post); shape != nil {
			t.Errorf("a door with no index answers %#v, and wants a pass", shape)
		}
	}
}
