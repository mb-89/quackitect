// The tools verb and the survey under it: the places a PATH names, the
// version read, the file it writes whole, and the rows it prints.
// [[spec/design_output/tools#what-the-survey-writes]]
package main

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func TestThePlacesStartAtTheTreesBinariesAndTakeEachEnding(t *testing.T) {
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
	for said, want := range map[string]string{"go version go1.24.7 linux/amd64": "1.24.7", "v22.22.0\n": "22.22.0", "Python 3.11": "3.11", "none\n1.2.3": ""} {
		if got := versionOf(said); got != want {
			t.Errorf("versionOf(%q) = %q, want %q", said, got, want)
		}
	}
}

func TestTheToolsVerbWritesTheSurveyWholeAndPrintsARowATool(t *testing.T) {
	d, runner, out, _ := fakeBoxDoors(t, "git", "sh", "python3")
	runner.answers["git"] = ranResult{stdout: "git version 2.43.0\n"}
	runner.answers["python3"] = ranResult{stderr: "Python 3.11.15\n"}
	if code := toolsVerb(d, nil); code != 0 {
		t.Fatalf("the verb answers %d", code)
	}
	path := d.env("PATH")
	written, _ := readText(filepath.Join(d.root, filepath.FromSlash(toolsFile)))
	want := "{\n  \"node\": null,\n  \"vale\": null,\n  \"biome\": null,\n  \"vale-ls\": null,\n  \"go\": null,\n" +
		"  \"git\": {\n    \"path\": \"" + path + "/git\",\n    \"version\": \"2.43.0\"\n  },\n  \"claude\": null,\n" +
		"  \"sh\": {\n    \"path\": \"" + path + "/sh\"\n  },\n" +
		"  \"python\": {\n    \"path\": \"" + path + "/python3\",\n    \"version\": \"3.11.15\"\n  }\n}\n"
	if written != want {
		t.Errorf("the survey reads\n%s", written)
	}
	if _, err := os.Stat(filepath.Join(d.root, filepath.FromSlash(toolsFile)) + ".part"); err == nil {
		t.Error("the part file stands")
	}
	rows := strings.Split(out.String(), "\n")
	if rows[0] != "node               missing, run ./RUNME.sh" || rows[5] != "git                2.43.0  "+path+"/git" || rows[7] != "sh                 "+path+"/sh" {
		t.Errorf("the rows read\n%s", out)
	}
	if !strings.HasSuffix(out.String(), "\n.se/.runtime/tools.json says this, and every caller reads it.\n") {
		t.Errorf("the closing line reads\n%s", out)
	}
	if got := readSurvey(d.root); got["git"] == nil || got["node"] != nil {
		t.Errorf("the survey reads back as %v", got)
	}
}

func TestACallerLooksAtTheSurveyThenTheTreesBinaryThenTheBareName(t *testing.T) {
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
