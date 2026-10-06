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
		if (change.Status != "A" && change.Status != "R") || !strings.HasSuffix(one, ".go") {
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
	sources := d.goSources(at)
	var out []string
	for _, folder := range folders {
		if !d.reached(at, found[1], folder, byFolder[folder], sources) {
			out = append(out, byFolder[folder]...)
		}
	}
	return out
}

// Whether a folder the branch adds files to stands reached: a new main, tests alone, test data, or its quoted import path in a Go file past it. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) reached(at, module, folder string, added []string, sources map[string]string) bool {
	if slices.Contains(strings.Split(folder, "/"), testData) {
		return true
	}
	for _, one := range added {
		if packageMain.MatchString(d.show(at, one)) {
			return true
		}
	}
	if d.testsAlone(at, folder) {
		return true
	}
	importPath := module
	if folder != "." {
		importPath += "/" + folder
	}
	for file, text := range sources {
		if path.Dir(file) != folder && strings.Contains(text, `"`+importPath+`"`) {
			return true
		}
	}
	return false
}

// Every Go file the ref holds, by its path. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) goSources(at string) map[string]string {
	files, err := d.Repo.Files(at, "")
	if err != nil {
		return nil
	}
	var asks []string
	for _, one := range files {
		if strings.HasSuffix(one, ".go") {
			asks = append(asks, at+":"+one)
		}
	}
	read, err := d.Repo.ShowMany(asks)
	if err != nil {
		return nil
	}
	sources := make(map[string]string, len(read))
	for ask, text := range read {
		sources[strings.TrimPrefix(ask, at+":")] = text
	}
	return sources
}

// Whether every Go file the folder holds at the ref is a test. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) testsAlone(at, folder string) bool {
	listed, err := d.Repo.Files(at, folder)
	if err != nil {
		return false
	}
	for _, one := range listed {
		if path.Dir(one) == folder && strings.HasSuffix(one, ".go") && !strings.HasSuffix(one, "_test.go") {
			return false
		}
	}
	return true
}
