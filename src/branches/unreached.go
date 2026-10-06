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
	added := d.quiet("diff", "--name-only", "--no-renames", "--diff-filter=A", trunkRef+"..."+at)
	if !added.OK {
		return nil
	}
	byFolder := map[string][]string{}
	var folders []string
	for _, one := range splitRows(added.Out) {
		if !strings.HasSuffix(one, ".go") {
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
	found := moduleLine.FindStringSubmatch(d.show(at + ":go.mod"))
	if found == nil {
		return nil
	}
	var out []string
	for _, folder := range folders {
		if !d.reached(at, found[1], folder, byFolder[folder]) {
			out = append(out, byFolder[folder]...)
		}
	}
	return out
}

// Whether a folder the branch adds files to stands reached: a new main, tests alone, test data, or its quoted import path in a Go file past it. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) reached(at, module, folder string, added []string) bool {
	if slices.Contains(strings.Split(folder, "/"), testData) {
		return true
	}
	for _, one := range added {
		if packageMain.MatchString(d.show(at + ":" + one)) {
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
	grep := d.quiet("grep", "-l", "-F", `"`+importPath+`"`, at, "--", "*.go")
	for _, one := range splitRows(grep.Out) {
		file := strings.TrimPrefix(one, at+":")
		if file != "" && path.Dir(file) != folder {
			return true
		}
	}
	return false
}

// Whether every Go file the folder holds at the ref is a test. [[spec/design_output/review#the-unreached-row]]
func (d *Doors) testsAlone(at, folder string) bool {
	listed := d.quiet("ls-tree", "--name-only", at+":"+folder)
	if !listed.OK {
		return false
	}
	for _, one := range splitRows(listed.Out) {
		if strings.HasSuffix(one, ".go") && !strings.HasSuffix(one, "_test.go") {
			return false
		}
	}
	return true
}
