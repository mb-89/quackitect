// The unreached scan: every Go file a branch adds in a folder nothing past it
// imports, read off git at the branch's ref, never the working tree.
// [[spec/design_output/review#the-unreached-row]]
package branches

import (
	"path"
	"regexp"
	"slices"
	"strings"
)

// The folder a Go file under test data stands in, which nothing imports. [[spec/design_output/review#the-unreached-row]]
const testData = "testdata"

// The every-file listing at a ref the scan reads, and the Go texts it reads once it needs them. [[spec/design_output/review#the-unreached-row]]
type goFiles struct {
	d     *Doors
	at    string
	files []string
	read  map[string]string
}

// The statuses a diff names a path the branch adds by: an add, and a move's new path, which git reads as an add without rename detection. [[spec/design_output/review#the-unreached-row]]
var addsPath = map[string]bool{"A": true, "R": true, "C": true}

var (
	moduleLine  = regexp.MustCompile(`(?m)^module\s+(\S+)`)
	packageMain = regexp.MustCompile(`(?m)^package\s+main\s*$`)
)

// The Go files the branch adds past trunk in a folder nothing reaches, in the order git lists them. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) unreached(trunkRef, at string) []string {
	base, ok := d.Repo.MergeBase(trunkRef, at)
	if !ok {
		return nil
	}
	changes, err := d.Repo.Diff(base, at)
	if err != nil {
		return nil
	}
	byFolder := map[string][]string{}
	var folders []string
	for _, change := range changes {
		one := change.Path
		if !addsPath[change.Status] || !strings.HasSuffix(one, ".go") {
			continue
		}
		folder := path.Dir(one)
		if _, seen := byFolder[folder]; !seen {
			folders = append(folders, folder)
		}
		byFolder[folder] = append(byFolder[folder], one)
	}
	if len(folders) == 0 {
		return nil
	}
	found := moduleLine.FindStringSubmatch(d.show(at, "go.mod"))
	if found == nil {
		return nil
	}
	files, err := d.Repo.Files(at, "")
	if err != nil {
		return nil
	}
	scan := &goFiles{d: d, at: at, files: files}
	var out []string
	for _, folder := range folders {
		if !scan.reached(found[1], folder, byFolder[folder]) {
			out = append(out, byFolder[folder]...)
		}
	}
	return out
}

// Whether a folder the branch adds files to stands reached: a new main, tests alone, test data, or its quoted import path in a Go file past it. [[spec/design_output/review#the-unreached-row]]
func (s *goFiles) reached(module, folder string, added []string) bool {
	if slices.Contains(strings.Split(folder, "/"), testData) {
		return true
	}
	for _, one := range added {
		if packageMain.MatchString(s.d.show(s.at, one)) {
			return true
		}
	}
	if s.testsAlone(folder) {
		return true
	}
	importPath := module
	if folder != "." {
		importPath += "/" + folder
	}
	quoted := `"` + importPath + `"`
	for file, text := range s.texts() {
		if path.Dir(file) != folder && strings.Contains(text, quoted) {
			return true
		}
	}
	return false
}

// Whether every Go file the folder holds at the ref is a test. [[spec/design_output/review#the-unreached-row]]
func (s *goFiles) testsAlone(folder string) bool {
	for _, one := range s.files {
		if path.Dir(one) == folder && strings.HasSuffix(one, ".go") && !strings.HasSuffix(one, "_test.go") {
			return false
		}
	}
	return true
}

// The Go files at the ref, read once through the door, keyed by path. [[spec/design_output/review#the-unreached-row]]
func (s *goFiles) texts() map[string]string {
	if s.read != nil {
		return s.read
	}
	s.read = map[string]string{}
	var asks []string
	for _, one := range s.files {
		if strings.HasSuffix(one, ".go") {
			asks = append(asks, s.at+":"+one)
		}
	}
	said, err := s.d.Repo.ShowMany(asks)
	if err != nil {
		return s.read
	}
	for ask, text := range said {
		s.read[strings.TrimPrefix(ask, s.at+":")] = text
	}
	return s.read
}
