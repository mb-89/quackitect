// The survey's reads: the places a PATH names, the version a tool says, and
// where a caller looks for a tool.
// [[spec/design_output/tools#reading-the-path-variable]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os"
	"path/filepath"
	"slices"
	"testing"
)

func TestThePlacesStartAtTheTreesBinariesAndTakeEachEnding(t *testing.T) {
	t.Parallel()
	unix := map[string]string{"PATH": "/a::/b"}
	if got := placesFor("go", func(k string) string { return unix[k] }, "/bin"); !slices.Equal(got, []string{"/bin/go", "/a/go", "/b/go"}) {
		t.Errorf("unix places %v", got)
	}
	windows := map[string]string{"Path": `C:\a;C:\b`, "PATHEXT": ".EXE; .CMD"}
	got := placesFor("go", func(k string) string { return windows[k] }, "/bin")
	want := []string{"/bin/go", "/bin/go.exe", "/bin/go.cmd", `C:\a/go`, `C:\a/go.exe`, `C:\a/go.cmd`, `C:\b/go`, `C:\b/go.exe`, `C:\b/go.cmd`}
	if !slices.Equal(got, want) {
		t.Errorf("windows places %v", got)
	}
}

func TestTheVersionComesOffTheFirstLine(t *testing.T) {
	t.Parallel()
	for said, want := range map[string]string{"go version go1.24.7 linux/amd64": "1.24.7", "v22.22.0\n": "22.22.0", "Python 3.11": "3.11", "none\n1.2.3": ""} {
		if got := versionOf(said); got != want {
			t.Errorf("versionOf(%q) = %q, want %q", said, got, want)
		}
	}
}

func TestACallerLooksAtTheSurveyThenTheTreesBinaryThenTheBareName(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t, "vale")
	at := d.env("PATH") + "/vale"
	if got := whereIs(d.root, "vale", map[string]*toolAt{"vale": {Path: at}}); got != at {
		t.Errorf("off the survey %q", got)
	}
	bin := filepath.Join(d.root, filepath.FromSlash(binFolder))
	_ = os.MkdirAll(bin, 0o755)
	_ = os.WriteFile(filepath.Join(bin, "biome"), nil, 0o755)
	if got := whereIs(d.root, "biome", map[string]*toolAt{"biome": {Path: "/gone"}}); got != d.root+"/"+binFolder+"/biome" {
		t.Errorf("off the tree %q", got)
	}
	if got := whereIs(d.root, "claude", nil); got != "claude" {
		t.Errorf("bare %q", got)
	}
}
