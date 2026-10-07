// The doctor verb over fake doors: every row it prints, each road a row
// takes, and the order the rows stand in. [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

// The doors with the variables a case names laid over the fake PATH. [[spec/tickets/box-verbs-port-to-go]]
func withEnv(d boxDoors, more map[string]string) boxDoors {
	was := d.env
	d.env = func(key string) string {
		if said, ok := more[key]; ok {
			return said
		}
		return was(key)
	}
	return d
}

// The doctor's rows by their label, each with its text. [[spec/tickets/box-verbs-port-to-go]]
func doctorRows(t *testing.T, d boxDoors, out *strings.Builder) map[string]string {
	t.Helper()
	out.Reset()
	if code := doctorVerb(d, nil); code != 0 {
		t.Fatalf("the doctor answers %d", code)
	}
	rows := map[string]string{}
	for _, line := range strings.Split(strings.TrimSuffix(out.String(), "\n"), "\n") {
		label, said := strings.TrimRight(line[:toolColumn], " "), line[toolColumn+1:]
		rows[label] = said
	}
	return rows
}

func TestTheDoctorPrintsEveryRowInOrderOnABareBox(t *testing.T) {
	t.Parallel()
	d, _, out, _ := fakeBoxDoors(t, "git")
	doctorVerb(d, nil)
	var labels []string
	for _, line := range strings.Split(strings.TrimSuffix(out.String(), "\n"), "\n") {
		if len(line) <= toolColumn || line[toolColumn] != ' ' {
			t.Fatalf("a row pads to no column: %q", line)
		}
		labels = append(labels, strings.TrimRight(line[:toolColumn], " "))
	}
	want := "node vale biome vale-ls go git claude sh python biome lsp-proxy quack lsp editor sidebar browser commit hook vale rules survey server"
	if got := strings.Join(labels, " "); got != want {
		t.Errorf("the rows read\n%s\nwant\n%s", got, want)
	}
	rows := doctorRows(t, d, out)
	for label, said := range map[string]string{
		"node":            "missing, run ./RUNME.sh",
		"git":             "1.2.3  " + d.env("PATH") + "/git",
		"biome lsp-proxy": "missing, run ./RUNME.sh",
		"quack lsp":       "missing, run ./RUNME.sh",
		"editor":          "missing",
		"sidebar":         "no editor folder on this box, so no link",
		"browser":         "missing, run ./RUNME.sh",
		"commit hook":     ".githooks/pre-commit stands nowhere",
		"vale rules":      "missing",
		"survey":          toolsFile,
		"server":          "none at http://127.0.0.1:6510/health",
	} {
		if rows[label] != said {
			t.Errorf("%s reads %q, want %q", label, rows[label], said)
		}
	}
}

func TestTheDoctorReadsTheSurveyThatStandsAndWritesOneWhereNoneDoes(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t, "git")
	hq1SeedDisk(t, d.disk, d.root, map[string]string{toolsFile: `{"node":{"path":"/opt/node","version":"22.0.0"}}`})
	rows := doctorRows(t, d, out)
	if rows["node"] != "22.0.0  /opt/node" || rows["git"] != "missing, run ./RUNME.sh" || len(runner.ran) != 0 {
		t.Errorf("a standing survey reads node %q, git %q, after %v", rows["node"], rows["git"], runner.ran)
	}
	d, _, out, _ = fakeBoxDoors(t)
	if rows := doctorRows(t, d, out); rows["survey"] != toolsFile || !d.disk.stands(filepath.Join(d.root, toolsFile)) {
		t.Errorf("a box with no survey reads %q", rows["survey"])
	}
	if text := d.disk.text(filepath.Join(d.root, toolsFile)); !strings.Contains(text, `"node": null`) {
		t.Errorf("the survey written reads %s", text)
	}
}

func TestTheSurveyRowNamesHowToWriteOne(t *testing.T) {
	t.Parallel()
	if got := surveyRow(newFakeDisk(), "/tree"); got != "absent, run ./RUNME.sh tools" {
		t.Errorf("the row reads %q", got)
	}
}

func TestTheBiomeRowAsksTheBiomeTheSurveyNames(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	biome := filepath.Join(d.root, "biome")
	hq1SeedDisk(t, d.disk, d.root, map[string]string{"biome": "", toolsFile: `{"biome":{"path":` + jsonString(biome) + `}}`})
	if rows := doctorRows(t, d, out); rows["biome lsp-proxy"] != "this biome carries one" {
		t.Errorf("the row reads %q", rows["biome lsp-proxy"])
	}
	if last := runner.ran[len(runner.ran)-1]; strings.Join(last, " ") != biome+" lsp-proxy --help" {
		t.Errorf("the doctor asks %v", last)
	}
	runner.answers["biome lsp-proxy"] = ranResult{code: 1}
	if rows := doctorRows(t, d, out); rows["biome lsp-proxy"] != "this biome carries none" {
		t.Errorf("the row reads %q", rows["biome lsp-proxy"])
	}
}

func TestTheQuackLspRowProbesTheIndexBinary(t *testing.T) {
	t.Parallel()
	d, runner, out, _ := fakeBoxDoors(t)
	hq1SeedDisk(t, d.disk, d.root, map[string]string{indexBinary: ""})
	runner.answers["se-index lsp"] = ranResult{code: 3, stderr: "no tree\n"}
	if rows := doctorRows(t, d, out); rows["quack lsp"] != "warn: quack lsp exits with 3 before it answers: no tree" {
		t.Errorf("the row reads %q", rows["quack lsp"])
	}
	if got := indexBuilt(d.disk, d.root); got != filepath.Join(d.root, filepath.FromSlash(indexBinary)) {
		t.Errorf("the index binary stands at %q", got)
	}
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, "/tree", map[string]string{indexBinary + ".exe": ""})
	if got := indexBuilt(disk, "/tree"); !strings.HasSuffix(got, "se-index.exe") {
		t.Errorf("a Windows index binary stands at %q", got)
	}
}

func TestTheEditorRowNamesTheSettingsThatStartBothServers(t *testing.T) {
	t.Parallel()
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, "/tree", map[string]string{editorSettings: "{}"})
	if got := editorRow(disk, "/tree"); got != ".vscode/settings.json, both servers" {
		t.Errorf("the row reads %q", got)
	}
}

// A tree holding the sidebar's manifest, a home with the editor's folder, and the folder the link lands as. [[spec/design_output/extension#a-link-pointing-nowhere]]
func sidebarBox(t *testing.T) (boxDoors, string, string) {
	t.Helper()
	d, _, _, _ := fakeBoxDoors(t)
	home := "/home/one"
	hq1SeedDisk(t, d.disk, d.root, map[string]string{"src/extension/package.json": `{"name":"quackitect","version":"0.1.0","publisher":"quackitect"}`})
	folder := filepath.Join(home, ".vscode", "extensions")
	if err := d.disk.makeAll(folder, 0o755); err != nil {
		t.Fatal(err)
	}
	return withEnv(d, map[string]string{"HOME": home}), folder, filepath.Join(folder, "quackitect.quackitect-0.1.0")
}

func TestTheSidebarRowReadsEveryShapeTheLinkStandsIn(t *testing.T) {
	t.Parallel()
	d, folder, dest := sidebarBox(t)
	source := filepath.Join(d.root, "src", "extension")
	if got := sidebarSays(d); got != "unlinked: run ./RUNME.sh" {
		t.Errorf("no link reads %q", got)
	}
	if err := d.disk.symlink(source, dest); err != nil {
		t.Fatal(err)
	}
	if got := sidebarSays(d); got != "linked, and the list misses quackitect.quackitect: run ./RUNME.sh" {
		t.Errorf("a link off the list reads %q", got)
	}
	hq1SeedDisk(t, d.disk, folder, map[string]string{editorList: `[{"identifier":{"id":"other.one"}},{"value":[{"identifier":{"id":"quackitect.quackitect"}}]}]`})
	if got := sidebarSays(d); got != "linked, and the list names quackitect.quackitect" {
		t.Errorf("a listed link reads %q", got)
	}
	other := "/other"
	if err := d.disk.makeAll(other, 0o755); err != nil {
		t.Fatal(err)
	}
	hq1Relink(t, d.disk, other, dest)
	if got := sidebarSays(d); got != "a link into another tree: run ./RUNME.sh" {
		t.Errorf("a link elsewhere reads %q", got)
	}
	hq1Relink(t, d.disk, filepath.Join(other, "gone"), dest)
	if got := sidebarSays(d); got != "a link pointing nowhere: run ./RUNME.sh" {
		t.Errorf("a dead link reads %q", got)
	}
	if err := d.disk.remove(dest); err != nil {
		t.Fatal(err)
	}
	if err := d.disk.makeAll(dest, 0o755); err != nil {
		t.Fatal(err)
	}
	if got := sidebarSays(d); got != "a copy in place of the link: run ./RUNME.sh" {
		t.Errorf("a copy reads %q", got)
	}
}

func TestTheEditorListReadsAnUnreadableFileAsNamingNothing(t *testing.T) {
	t.Parallel()
	disk, folder := newFakeDisk(), "/folder"
	hq1SeedDisk(t, disk, folder, map[string]string{editorList: "[{"})
	if editorRegistered(disk, folder, "quackitect.quackitect") {
		t.Error("a torn list names the id")
	}
	if editorRegistered(disk, "/empty", "quackitect.quackitect") {
		t.Error("a missing list names the id")
	}
}

func TestTheBrowserRowNamesEachRungOfTheOrder(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	home := "/home/one"
	hq1SeedDisk(t, d.disk, d.root, map[string]string{
		"x/chrome":                            "",
		"pw/chromium-9/chrome-linux/chrome":   "",
		"pw/chromium-12/chrome-linux/chrome":  "",
		"pw/chromium_headless_shell-12/shell": "",
		"a/chromium-browser":                  "",
		"b/google-chrome":                     "",
	})
	hq1SeedDisk(t, d.disk, home, map[string]string{".cache/ms-playwright/chromium-7/chrome-linux/chrome": ""})
	at := func(path string) string { return filepath.Join(d.root, filepath.FromSlash(path)) }
	twoFolders := map[string]string{"PATH": at("a") + string(filepath.ListSeparator) + at("b")}
	if runtime.GOOS == "windows" {
		twoFolders["PATHEXT"] = ".EXE"
	}
	for _, one := range []struct {
		env  map[string]string
		want string
	}{
		{map[string]string{"PLAYWRIGHT_CHROMIUM": at("x/chrome"), "PLAYWRIGHT_BROWSERS_PATH": at("pw"), "PATH": at("a")}, at("x/chrome") + ", off PLAYWRIGHT_CHROMIUM"},
		{map[string]string{"PLAYWRIGHT_CHROMIUM": "/gone", "PLAYWRIGHT_BROWSERS_PATH": at("pw")}, at("pw/chromium-12/chrome-linux/chrome") + ", off PLAYWRIGHT_BROWSERS_PATH"},
		{twoFolders, at("a/chromium-browser") + ", off PATH"},
		{map[string]string{"PATH": "/nowhere"}, filepath.Join(home, ".cache", "ms-playwright", "chromium-7", "chrome-linux", "chrome") + ", off playwright install"},
		{map[string]string{"PATH": "/nowhere", "HOME": "/home/nobody"}, "missing, run ./RUNME.sh"},
	} {
		env := map[string]string{"HOME": home}
		for key, value := range one.env {
			env[key] = value
		}
		if got := browserSays(withEnv(d, env)); got != one.want {
			t.Errorf("the browser over %v reads %q, want %q", one.env, got, one.want)
		}
	}
}

func TestThePlaywrightCacheReadsTheHomeEachBoxNames(t *testing.T) {
	t.Parallel()
	env := func(said map[string]string) func(string) string { return func(key string) string { return said[key] } }
	for _, one := range []struct {
		env  map[string]string
		mac  bool
		want string
	}{
		{map[string]string{"LOCALAPPDATA": "/l"}, false, filepath.Join("/l", "ms-playwright")},
		{map[string]string{"USERPROFILE": "/u", "HOME": "/h"}, false, filepath.Join("/u", ".cache", "ms-playwright")},
		{map[string]string{"HOME": "/h"}, true, filepath.Join("/h", "Library", "Caches", "ms-playwright")},
		{map[string]string{}, false, ""},
	} {
		if got := browserCache(env(one.env), one.mac); got != one.want {
			t.Errorf("the cache over %v reads %q, want %q", one.env, got, one.want)
		}
	}
	if got := browserUnder(newFakeDisk(), ""); got != "" {
		t.Errorf("no folder reads %q", got)
	}
}

func TestTheCommitHookRowReadsBothHooksAndTheFolderGitReads(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	hq1SeedDisk(t, d.disk, d.root, map[string]string{".githooks/pre-commit": ""})
	if got := hooksSay(d); got != ".githooks/pre-push stands nowhere" {
		t.Errorf("a lone pre-commit reads %q", got)
	}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{".githooks/pre-push": ""})
	for said, want := range map[string]string{
		".githooks\n":  ".githooks/pre-commit and .githooks/pre-push, which git reads",
		".git/hooks\n": "git reads .git/hooks, so run ./RUNME.sh",
		"":             "git reads its own folder, so run ./RUNME.sh",
	} {
		runner.answers["git config"] = ranResult{stdout: said}
		if got := hooksSay(d); got != want {
			t.Errorf("git reading %q reads %q, want %q", said, got, want)
		}
	}
	if last := runner.ran[len(runner.ran)-1]; strings.Join(last, " ") != "git config --get core.hooksPath" || runner.opts[len(runner.opts)-1].cwd != d.root {
		t.Errorf("the doctor asks git %v", last)
	}
}

func TestTheValeRowCountsTheRulesOfEachFolder(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, map[string]string{
		"spec/config/styles/VoiceVale/A.yml":   "",
		"spec/config/styles/VoiceVale/B.yml":   "",
		"spec/config/styles/VoiceVale/c.txt":   "",
		"spec/config/styles/VoiceScript/D.yml": "",
	})
	if got := valeRules(disk, root); got != "2 in VoiceVale, 0 in VoiceShape, 1 in VoiceScript" {
		t.Errorf("the row reads %q", got)
	}
}

func TestTheServerRowNamesABridgeStandingDownAndOneStandingUp(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	if got := serverLine(d); got != "none at http://127.0.0.1:6510/health" {
		t.Errorf("a bridge standing down reads %q", got)
	}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{vehiclePointer: `{"port":6517}`})
	var asked string
	d.get = func(where string, wait time.Duration) (string, error) {
		asked = where
		if wait != healthWait {
			t.Errorf("the health call waits %v", wait)
		}
		return `{"ok":true}`, nil
	}
	if got := serverLine(d); got != "stands at http://127.0.0.1:6517/health" || asked != "http://127.0.0.1:6517/health" {
		t.Errorf("a bridge answering reads %q off %q", got, asked)
	}
	d.get = answeringGet(map[string]string{"http://127.0.0.1:6517/health": `{"ok":false,"dead":"the index"}`})
	if got := serverLine(d); got != "none at http://127.0.0.1:6517/health" {
		t.Errorf("a bridge answering ill reads %q", got)
	}
	d.get = answeringGet(map[string]string{"http://127.0.0.1:6517/health": `not json`})
	if got := serverLine(d); got != "none at http://127.0.0.1:6517/health" {
		t.Errorf("a bridge answering no JSON reads %q", got)
	}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{vehiclePointer: `{"port":"6518"}`})
	if got := portHere(d.disk, d.root); got != 6518 {
		t.Errorf("a port written as text reads %d", got)
	}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{vehiclePointer: `{`})
	if got := portHere(d.disk, d.root); got != portBase {
		t.Errorf("a torn pointer reads %d", got)
	}
}

func TestTheDoctorPrintsARowAHookAfterTheServer(t *testing.T) {
	t.Parallel()
	d, _, out, _ := fakeBoxDoors(t)
	home := "/home/one"
	hq1SeedDisk(t, d.disk, home, map[string]string{settingsFile: hookSettings("http://127.0.0.1:36368/hook")})
	d = withEnv(d, map[string]string{"HOME": home})
	doctorVerb(d, nil)
	rows := strings.Split(strings.TrimSuffix(out.String(), "\n"), "\n")
	if last := rows[len(rows)-1]; last != "hook 127.0.0.1:36368 warn: answers nothing at http://127.0.0.1:36368/hook, off "+home+"/.claude/settings.json" {
		t.Errorf("the last row reads %q", last)
	}
	if !strings.HasPrefix(rows[len(rows)-2], "server ") {
		t.Errorf("the row before the hook reads %q", rows[len(rows)-2])
	}
}

// Takes the link at the destination away, and links the target in its place. [[spec/tickets/test-walks-move-onto-fakes]]
func hq1Relink(t *testing.T, disk diskDoors, target, dest string) {
	t.Helper()
	if err := disk.remove(dest); err != nil {
		t.Fatal(err)
	}
	if err := disk.symlink(target, dest); err != nil {
		t.Fatal(err)
	}
}
