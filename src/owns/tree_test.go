// The declarations the tree holds: every IO module and every door under
// src/doors stands in one, and each door names a walk planted outside it and
// none planted inside it.
// [[spec/design_output/doors#nothing-walks-around-a-door]]
package owns

import (
	"io/fs"
	"os" // level0: OutsideInDoors - the case reads the declarations the tree holds, as a build check reads source
	"path"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

const root = "../.."

// The folders a walk of the tree passes, as the lint's walk passes them. [[spec/design_output/lsp#the-server-runs-the-tools]]
var passed = map[string]bool{".git": true, "node_modules": true, ".se": true, ".claude": true, ".claude-plugin": true}

// Whether the guard's walk reaches a path: no folder the lint passes, past the agent's folder on the road to its skills, and no draft. [[spec/design_output/doors#nothing-walks-around-a-door]]
func reached(rel string) bool {
	skills := OnSkills(rel)
	for _, part := range strings.Split(rel, "/") {
		if (passed[part] && !(skills && part == AgentFolder)) || strings.HasPrefix(part, "_") {
			return false
		}
	}
	return true
}

// Every file of the tree by its slash path, and the declarations among them. [[spec/design_output/doors#a-door-declares-its-names]]
func treeOf(t *testing.T) (map[string]bool, map[string]string) {
	t.Helper()
	files, declared := map[string]bool{}, map[string]string{}
	err := filepath.WalkDir(root, func(at string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(root, at)
		rel = filepath.ToSlash(rel)
		if entry.IsDir() {
			if rel != "." && !reached(rel) {
				return filepath.SkipDir
			}
			return nil
		}
		if !reached(rel) {
			return nil
		}
		files[rel] = true
		if Declares(rel) {
			text, err := os.ReadFile(at)
			if err != nil {
				return err
			}
			declared[rel] = string(text)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	return files, declared
}

func doorsOf(t *testing.T) ([]Door, map[string]bool) {
	t.Helper()
	files, declared := treeOf(t)
	doors, faults := Read(declared, func(at string) bool { return files[at] })
	for _, one := range faults {
		t.Errorf("%s:%d: %s", one.File, one.Line, one.Says)
	}
	return doors, files
}

// A file that uses the owned name, in the language the name belongs to. [[spec/design_output/doors#a-door-declares-its-names]]
func usesGo(name string) string {
	pkg, member := name, ""
	if cut := strings.LastIndex(name, "/"); strings.Contains(name[cut+1:], ".") {
		dot := cut + 1 + strings.Index(name[cut+1:], ".")
		pkg, member = name[:dot], name[dot+1:]
	}
	if member == "" {
		return "package planted\n\nimport _ \"" + pkg + "\"\n"
	}
	return "package planted\n\nimport one \"" + pkg + "\"\n\nvar _ = one." + member + "\n"
}

func usesJS(name string) string {
	if strings.HasPrefix(name, "node:") {
		return "import \"" + name + "\";\n"
	}
	return "const planted = " + name + ";\n"
}

func TestEveryDoorNamesAPlantedWalk(t *testing.T) {
	t.Parallel()
	doors, _ := doorsOf(t)
	if len(doors) == 0 {
		t.Fatal("the tree declares no door")
	}
	for _, door := range doors {
		for lang, names := range map[string][]string{".go": door.Go, ".js": door.JS} {
			for _, name := range names {
				text := usesGo(name)
				if lang == ".js" {
					text = usesJS(name)
				}
				out := "src/planted/walk" + lang
				if walks := Walks(out, text, doors); len(walks) != 1 || walks[0].Name != name {
					t.Errorf("%s at %s owns %s, and a use outside it reads %+v", door.Name, door.At, name, walks)
				}
				if in := insideOf(door, lang); in != "" {
					if walks := Walks(in, text, doors); len(walks) != 0 {
						t.Errorf("%s at %s owns %s, and a use in %s reads %+v", door.Name, door.At, name, in, walks)
					}
				}
			}
		}
	}
}

// A file the door holds in the language, or nothing where it holds none. [[spec/design_output/doors#a-door-declares-its-names]]
func insideOf(door Door, lang string) string {
	if door.Files == nil {
		return door.At + "/planted" + lang
	}
	for _, one := range door.Files {
		if path.Ext(one) == lang {
			return one
		}
	}
	return ""
}

// Whether a line of code, past the comments, calls q.IO(). [[spec/design_output/model#io-modules-are-modules]]
func callsIO(text string) bool {
	for _, line := range strings.Split(text, "\n") {
		if code, _, _ := strings.Cut(line, "//"); strings.Contains(code, "q.IO()") && !strings.Contains(code, "\"q.IO()\"") {
			return true
		}
	}
	return false
}

// Every package carrying q.IO() and every door under src/doors stands in a declaration. [[spec/design_output/doors#a-door-declares-its-names]]
func TestEveryIOModuleAndDoorDeclares(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	held := func(at string) bool {
		for _, one := range doors {
			if one.Holds(at) {
				return true
			}
		}
		return false
	}
	for at := range files {
		switch {
		case path.Dir(at) == "src/doors" && path.Ext(at) == ".js":
		case strings.HasSuffix(at, ".go") && !strings.HasSuffix(at, "_test.go") && strings.HasPrefix(at, "src/"):
			text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(at)))
			if err != nil {
				t.Fatal(err)
			}
			if !callsIO(string(text)) && path.Base(at) != "door.go" {
				continue
			}
		default:
			continue
		}
		if !held(at) {
			t.Errorf("%s is a door, and no %s holds it", at, File)
		}
	}
}

// The process door declares itself, so its contract test has an owner and its runs walk around nothing. [[spec/design_output/doors#the-process-door]]
func TestTheProcessDoorOwnsTheRunsAndNamesItsContract(t *testing.T) {
	t.Parallel()
	doors, _ := doorsOf(t)
	for _, one := range doors {
		if one.At == "src/proc" {
			if !slices.Contains(one.Go, "os/exec") || !slices.Contains(one.Contract, "src/proc/proc_contract_test.go") || !one.Holds("src/proc/proc.go") {
				t.Fatalf("the process door reads %+v, and wants os/exec owned, its contract named and src/proc/proc.go held", one)
			}
			return
		}
	}
	t.Fatal("no door named proc stands in the tree")
}

// No door stands at report, so the guard refuses every walk-around the tree meets. [[spec/tickets/the-guard-refuses]]
func TestNoDoorStandsAtReport(t *testing.T) {
	t.Parallel()
	doors, _ := doorsOf(t)
	for _, one := range doors {
		if one.Report {
			t.Errorf("%s in %s stands at report, so its walk-arounds land unrefused", one.Name, one.At)
		}
	}
}

// The random door owns Math.random and holds no file, so every call walks around it. [[spec/tickets/the-guard-refuses]]
func TestTheRandomDoorOwnsMathRandomAndHoldsNoFile(t *testing.T) {
	t.Parallel()
	doors, _ := doorsOf(t)
	for _, one := range doors {
		if one.At == "src/doors" && one.Name == "random" {
			if !slices.Contains(one.JS, "Math.random") || one.Files == nil || len(one.Files) != 0 {
				t.Fatalf("the random door reads %+v, and wants Math.random owned and no file held", one)
			}
			return
		}
	}
	t.Fatal("no door named random stands in src/doors")
}

func TestEveryContractTestNamesItsDoor(t *testing.T) {
	t.Parallel()
	doors, files := doorsOf(t)
	named := map[string]bool{}
	for _, one := range doors {
		for _, at := range one.Contract {
			named[at] = true
		}
	}
	for at := range files {
		door, isDoorsTest := strings.CutSuffix(strings.TrimPrefix(at, "test/contract/"), ".test.js")
		isDoorsTest = isDoorsTest && path.Dir(at) == "test/contract" && files["src/doors/"+door+".js"]
		if (isDoorsTest || strings.HasSuffix(at, "_contract_test.go")) && !named[at] {
			t.Errorf("%s is a contract test, and no door names it under contract", at)
		}
	}
}
