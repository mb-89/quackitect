// The tools verb: the survey file it writes whole, and the rows it prints.
// [[spec/design_output/tools#what-the-survey-writes]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

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
