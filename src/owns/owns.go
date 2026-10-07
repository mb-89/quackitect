// What each door owns, off the owns.yaml beside it, and every use of an owned
// name standing outside the doors that own it.
// [[spec/design_output/doors#a-door-declares-its-names]]
package owns

import (
	"fmt"
	"path"
	"regexp"
	"slices"
	"sort"
	"strings"

	"quackitect/src/yaml"
)

// The declaration's file name, and the marker passing one line. [[spec/design_output/doors#a-door-declares-its-names]]
const (
	File   = "owns.yaml"
	Marker = "level0: OutsideInDoors - "
)

// The agent's folder, which the lint's walk passes, and the skills folder inside it, whose scripts the guard reads all the same. [[spec/design_output/doors#nothing-walks-around-a-door]]
const (
	AgentFolder  = ".claude"
	skillsFolder = "skills"
)

// How a walk reads: around the doors owning its name, or past every door where none declares it. [[spec/design_output/doors#nothing-walks-around-a-door]]
const (
	walksAround = "%s walks around %s"
	noDoorSays  = "%s is a module no door declares"
)

// The keys an entry takes. [[spec/design_output/doors#a-door-declares-its-names]]
const (
	goKey       = "go"
	jsKey       = "js"
	filesKey    = "files"
	contractKey = "contract"
	outsideKey  = "outside"
)

// Where a contract test stands: a Go test file ending so, or a file of the contract run. [[spec/design_output/doors#a-door-names-its-contracts]]
const (
	contractGo     = "_contract_test.go"
	contractFolder = "test/contract/"
)

// The forms a door's name, a Go name, a JS name and the marker take. [[spec/design_output/doors#a-door-declares-its-names]]
var (
	doorName = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)
	goName   = regexp.MustCompile(`^[a-z][a-z0-9_]*(/[a-z0-9_]+)*(\.[A-Za-z_][A-Za-z0-9_]*)?$`)
	jsName   = regexp.MustCompile(`^(node:[a-z_][a-z0-9_/]*|new [A-Z][A-Za-z0-9_]*\(\)|[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)?)$`)
	markedAt = regexp.MustCompile(`(?://|/\*|#)\s*` + regexp.QuoteMeta(strings.TrimSpace(Marker)) + `(.*)$`)
)

// One door's declaration: its name, the folder its owns.yaml stands in, the names it owns in each language, its files, its contract tests, and whether it stands as its own outside. [[spec/design_output/doors#a-door-declares-its-names]]
type Door struct {
	Name     string
	At       string
	Line     int
	Go       []string
	JS       []string
	Files    []string
	Contract []string
	Outside  bool
}

// One use of an owned name outside every door owning it. [[spec/design_output/doors#nothing-walks-around-a-door]]
type Walk struct {
	File   string
	Line   int
	Column int
	Name   string
	Doors  []string
	Marked bool
	Reason string
}

// Whether a slash path names the agent's folder or stands under its skills folder, so the guard's walk reaches it. [[spec/design_output/doors#nothing-walks-around-a-door]]
func OnSkills(path string) bool {
	parts := strings.Split(path, "/")
	for k, part := range parts {
		if part == AgentFolder {
			return k+1 == len(parts) || parts[k+1] == skillsFolder
		}
	}
	return false
}

// The walk in words, naming its doors, or the module no door declares. [[spec/design_output/doors#nothing-walks-around-a-door]]
func (w Walk) Says() string {
	if len(w.Doors) == 0 {
		return fmt.Sprintf(noDoorSays, w.Name)
	}
	return fmt.Sprintf(walksAround, w.Name, strings.Join(w.Doors, ", "))
}

// A declaration that reads as none, and where. [[spec/design_output/doors#a-door-declares-its-names]]
type Fault struct {
	File string
	Line int
	Says string
}

// Every door the declarations name, and each fault of their form. [[spec/design_output/doors#a-door-declares-its-names]]
func Read(declared map[string]string, exists func(string) bool) ([]Door, []Fault) {
	paths := make([]string, 0, len(declared))
	for at := range declared {
		paths = append(paths, at)
	}
	sort.Strings(paths)
	var doors []Door
	var faults []Fault
	for _, at := range paths {
		read, faulted := readOne(at, declared[at], exists)
		doors = append(doors, read...)
		faults = append(faults, faulted...)
	}
	return doors, faults
}

// The doors one declaration names, line by line, so a fault names its line. [[spec/design_output/doors#a-door-declares-its-names]]
func readOne(at, text string, exists func(string) bool) ([]Door, []Fault) {
	folder := path.Dir(at)
	var doors []Door
	var faults []Fault
	fault := func(line int, says string) { faults = append(faults, Fault{File: at, Line: line, Says: says}) }
	var open *Door
	faultsAtOpen, keys := 0, 0
	finish := func() {
		if open == nil {
			return
		}
		switch {
		case len(faults) > faultsAtOpen:
		case keys == 0:
			fault(open.Line, open.Name+" holds no entry: write go: [] where it owns nothing yet")
		default:
			doors = append(doors, *open)
		}
		open = nil
	}
	for n, raw := range yaml.SplitLines(text) {
		line := n + 1
		body := strings.TrimSpace(raw)
		if body == "" || strings.HasPrefix(body, "#") {
			continue
		}
		pair := yaml.PairAt.FindStringSubmatch(body)
		if pair == nil {
			fault(line, body+" reads as no key: write <key>: <value>")
			continue
		}
		key, rest := strings.TrimSpace(pair[1]), strings.TrimSpace(pair[2])
		if raw[0] != ' ' && raw[0] != '\t' {
			finish()
			switch {
			case !doorName.MatchString(key):
				fault(line, key+" reads as no door's name: write lower-case words joined by a dash")
			case rest != "":
				fault(line, key+" holds no entry: write its keys on the lines below it")
			default:
				open, faultsAtOpen, keys = &Door{Name: key, At: folder, Line: line}, len(faults), 0
			}
			continue
		}
		if open == nil {
			fault(line, key+" stands under no door")
			continue
		}
		keys++
		value := yaml.AsDoc(yaml.Read("v: " + rest)).Get("v")
		switch key {
		case goKey, jsKey:
			form, into := goName, &open.Go
			if key == jsKey {
				form, into = jsName, &open.JS
			}
			for _, name := range yaml.StringsOf(value) {
				if !form.MatchString(name) {
					fault(line, fmt.Sprintf("%s reads as no %s name", name, key))
					continue
				}
				*into = append(*into, name)
			}
		case filesKey:
			if open.Files == nil {
				open.Files = []string{}
			}
			for _, name := range yaml.StringsOf(value) {
				joined := path.Join(folder, name)
				switch {
				case path.IsAbs(name) || !within(folder, joined):
					fault(line, name+" stands outside "+folder)
				case !exists(joined):
					fault(line, joined+" stands nowhere")
				default:
					open.Files = append(open.Files, joined)
				}
			}
		case contractKey:
			for _, name := range yaml.StringsOf(value) {
				switch {
				case !IsContract(name):
					fault(line, name+" names no contract test: write a path ending "+contractGo+" or under "+contractFolder)
				case !exists(name):
					fault(line, name+" stands nowhere")
				default:
					open.Contract = append(open.Contract, name)
				}
			}
		case outsideKey:
			flag, ok := value.(bool)
			if !ok {
				fault(line, rest+" reads as no flag: write true or false")
				continue
			}
			open.Outside = flag
		default:
			fault(line, key+" is no key a declaration takes: write go, js, files, contract or outside")
		}
	}
	finish()
	return doors, faults
}

// Whether a joined path stands under the folder. [[spec/design_output/doors#a-door-declares-its-names]]
func within(folder, joined string) bool {
	if folder == "." {
		return joined != ".." && !strings.HasPrefix(joined, "../")
	}
	return strings.HasPrefix(joined, folder+"/")
}

// Whether a path names a declaration. [[spec/design_output/doors#a-door-declares-its-names]]
func Declares(at string) bool {
	return path.Base(strings.ReplaceAll(at, "\\", "/")) == File
}

// Whether a path from the root names a contract test. [[spec/design_output/doors#a-door-names-its-contracts]]
func IsContract(at string) bool {
	return !path.IsAbs(at) && at == path.Clean(at) && (strings.HasSuffix(at, contractGo) || strings.HasPrefix(at, contractFolder))
}

// Whether the door's files hold the path: its contract tests, then the files it names, or every file standing in its folder. [[spec/design_output/doors#a-door-declares-its-names]]
func (one Door) Holds(at string) bool {
	if slices.Contains(one.Contract, at) {
		return true
	}
	if one.Files != nil {
		return slices.Contains(one.Files, at)
	}
	return path.Dir(at) == one.At
}

// The doors owning one name, and whether one holds the file at hand. [[spec/design_output/doors#nothing-walks-around-a-door]]
type claim struct {
	doors []string
	held  bool
}

// Every name the doors own in one language, against the file at hand. [[spec/design_output/doors#nothing-walks-around-a-door]]
func claims(at string, doors []Door, names func(Door) []string) map[string]*claim {
	out := map[string]*claim{}
	for _, door := range doors {
		if door.Outside && !door.Holds(at) {
			continue
		}
		for _, name := range names(door) {
			one := out[name]
			if one == nil {
				one = &claim{}
				out[name] = one
			}
			if !slices.Contains(one.doors, door.Name) {
				one.doors = append(one.doors, door.Name)
			}
			one.held = one.held || door.Holds(at)
		}
	}
	return out
}

// Every use of an owned name the file makes outside the doors owning it, in the order the file holds them. [[spec/design_output/doors#nothing-walks-around-a-door]]
func Walks(at, text string, doors []Door) []Walk {
	var out []Walk
	switch path.Ext(at) {
	case ".go":
		out = goWalks(at, text, claims(at, doors, func(one Door) []string { return one.Go }))
	case ".js", ".mjs", ".cjs":
		out = jsWalks(at, text, claims(at, doors, func(one Door) []string { return one.JS }))
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].Line != out[b].Line {
			return out[a].Line < out[b].Line
		}
		return out[a].Column < out[b].Column
	})
	return out
}

// One walk at a place, marked where the line or the comment line above names why. [[spec/design_output/doors#nothing-walks-around-a-door]]
func walkAt(at string, lines []string, line, column int, name string, owner *claim) Walk {
	one := Walk{File: at, Line: line, Column: column, Name: name, Doors: slices.Clone(owner.doors)}
	one.Reason = markOf(lines, line)
	one.Marked = one.Reason != ""
	return one
}

// The reason a marker on the line, or on a comment line above it, names. [[spec/design_output/doors#nothing-walks-around-a-door]]
func markOf(lines []string, line int) string {
	if line < 1 || line > len(lines) {
		return ""
	}
	if said := reasonIn(lines[line-1]); said != "" {
		return said
	}
	if line < 2 {
		return ""
	}
	above := strings.TrimSpace(lines[line-2])
	for _, opener := range []string{"//", "/*", "*", "#"} {
		if strings.HasPrefix(above, opener) {
			return reasonIn(above)
		}
	}
	return ""
}

func reasonIn(line string) string {
	found := markedAt.FindStringSubmatch(line)
	if found == nil {
		return ""
	}
	return strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(found[1]), "*/"))
}

// The package of a Go name and its member, empty where the name owns the package whole. [[spec/design_output/doors#a-door-declares-its-names]]
func split(name string) (string, string) {
	cut := strings.LastIndex(name, "/")
	if dot := strings.Index(name[cut+1:], "."); dot >= 0 {
		return name[:cut+1+dot], name[cut+2+dot:]
	}
	return name, ""
}

// The Go packages the declarations name, whole or by a member, sorted. [[spec/design_output/model#the-build-checks-imports]]
func Packages(doors []Door) []string {
	return packagesOf(doors, false)
}

// The Go packages a door owns whole, sorted. [[spec/design_output/model#the-build-checks-imports]]
func Whole(doors []Door) []string {
	return packagesOf(doors, true)
}

func packagesOf(doors []Door, whole bool) []string {
	out := []string{}
	for _, door := range doors {
		for _, name := range door.Go {
			pkg, member := split(name)
			if (!whole || member == "") && !slices.Contains(out, pkg) {
				out = append(out, pkg)
			}
		}
	}
	sort.Strings(out)
	return out
}
