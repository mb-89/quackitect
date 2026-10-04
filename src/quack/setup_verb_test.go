// The setup verb over fake doors: every item, the skip list, the survey, the
// Copilot setup, the brand and the Windows shims.
// [[spec/tickets/install-drops-node]] [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

const setupClient = "src/extension/node_modules/vscode-languageclient/package.json"

// The fake doors with the env a case names past the PATH, and every run read as one line. [[spec/tickets/install-drops-node]]
func setupBox(t *testing.T, env map[string]string) (boxDoors, *fakeRunner, *strings.Builder, func() []string) {
	t.Helper()
	d, runner, out, _ := fakeBoxDoors(t)
	path := d.env("PATH")
	d.env = func(key string) string {
		if key == "PATH" {
			return path
		}
		return env[key]
	}
	lines := func() []string {
		var said []string
		for _, one := range runner.ran {
			said = append(said, strings.Join(one, " "))
		}
		return said
	}
	return d, runner, out, lines
}

// A tree holding the client, a browser and the survey, so no item but the ones a case drops stands missing. [[spec/tickets/install-drops-node]]
func heldTree(t *testing.T, d boxDoors) map[string]string {
	t.Helper()
	seedTree(t, d.root, map[string]string{setupClient: "{}", toolsFile: "{}", "chrome": ""})
	return map[string]string{"PLAYWRIGHT_CHROMIUM": filepath.Join(d.root, "chrome")}
}

func saidLine(out *strings.Builder, start string) bool {
	return slices.ContainsFunc(strings.Split(out.String(), "\n"), func(one string) bool { return strings.HasPrefix(one, start) })
}

func TestTheSetupGetsEachMissingItemAndSkipsTheOnesTheSkipListNames(t *testing.T) {
	home := t.TempDir()
	seedTree(t, home, map[string]string{".vscode/extensions/extensions.json": "[]"})
	d, runner, out, lines := setupBox(t, map[string]string{"HOME": home, "SE_INSTALL_SKIP": "browser editor-link"})
	seedTree(t, d.root, map[string]string{toolsFile: "{}"})
	runner.answers["code --list-extensions"] = ranResult{}
	fake := d.run
	d.run = func(argv []string, o runOpts) ranResult {
		if argv[0] == "npm" {
			seedTree(t, d.root, map[string]string{setupClient: "{}"})
		}
		return fake(argv, o)
	}
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	said := lines()
	if !slices.Contains(said, "npm install --no-audit --no-fund --silent") {
		t.Errorf("the client installs not: %v", said)
	}
	if at := slices.Index(said, "npm install --no-audit --no-fund --silent"); runner.opts[at].cwd != filepath.Join(d.root, "src", "extension") || !runner.opts[at].inherit {
		t.Errorf("npm runs as %+v", runner.opts[at])
	}
	for _, id := range editorExtensions {
		if !slices.Contains(said, "code --install-extension "+id+" --force") {
			t.Errorf("%s installs not", id)
		}
	}
	if slices.ContainsFunc(said, func(one string) bool { return strings.Contains(one, "playwright") }) {
		t.Error("a skipped browser downloads")
	}
	if stands(filepath.Join(home, ".vscode", "extensions", editorTestID+"-0.1.0")) {
		t.Error("a skipped editor link links")
	}
	if !saidLine(out, "editor-client:") || saidLine(out, "browser:") || saidLine(out, "editor-link:") {
		t.Errorf("the setup says\n%s", out)
	}
	if saidLine(out, "  no language client here") {
		t.Error("a client that landed reads as missed")
	}
}

func TestTheSetupWritesTheSurveyThenTheCopilotSetupAndTheBrand(t *testing.T) {
	d, runner, out, _ := setupBox(t, nil)
	env := heldTree(t, d)
	env["TERM_PROGRAM"] = "vscode"
	d.env = func(key string) string { return env[key] }
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}

	if code := setupVerb(d, []string{"--landed"}); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if survey, _ := readText(filepath.Join(d.root, filepath.FromSlash(toolsFile))); !strings.Contains(survey, `"node": null`) {
		t.Errorf("a landed setup writes no survey: %s", survey)
	}
	for _, one := range copilotRegistrations() {
		if !stands(filepath.Join(d.root, filepath.FromSlash(one.name))) {
			t.Errorf("%s stands not", one.name)
		}
	}
	brand := brandOf(d.root)
	market, _ := readText(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget)))
	var held struct{ Name string }
	if json.Unmarshal([]byte(market), &held) != nil || held.Name != brand {
		t.Errorf("the marketplace reads\n%s", market)
	}
	want := "Copilot: .github/hooks/level0.json, .github/workflows/copilot-setup-steps.yml\n" +
		"  " + marketplaceTarget + " reads " + brand + "\n  " + pluginTarget + " reads " + brand + "\n"
	if out.String() != want {
		t.Errorf("a box holding every item says\n%s", out)
	}

	quiet, quietRunner, _, _ := setupBox(t, nil)
	quietEnv := heldTree(t, quiet)
	quiet.env = func(key string) string { return quietEnv[key] }
	quietRunner.answers["code --list-extensions"] = runner.answers["code --list-extensions"]
	setupVerb(quiet, nil)
	if survey, _ := readText(filepath.Join(quiet.root, filepath.FromSlash(toolsFile))); survey != "{}" {
		t.Error("a survey standing, with nothing landed, takes a write")
	}
	missing, _, _, _ := setupBox(t, nil)
	missingEnv := heldTree(t, missing)
	missing.env = func(key string) string { return missingEnv[key] }
	_ = os.Remove(filepath.Join(missing.root, filepath.FromSlash(toolsFile)))
	setupVerb(missing, nil)
	if !stands(filepath.Join(missing.root, filepath.FromSlash(toolsFile))) {
		t.Error("a box with no survey writes none")
	}
}

// A box with no code on the PATH skips the extensions, and a code that answers an error still installs them. [[spec/tickets/code-failure-reads-missing]]
func TestACodeListExitingPastZeroReadsAsMissingAndTheSetupInstallsTheExtensions(t *testing.T) {
	d, runner, _, lines := setupBox(t, nil)
	env := heldTree(t, d)
	d.env = func(key string) string { return env[key] }
	runner.answers["code --list-extensions"] = ranResult{code: 1}
	setupVerb(d, nil)
	for _, id := range editorExtensions {
		if !slices.Contains(lines(), "code --install-extension "+id+" --force") {
			t.Errorf("%s installs not", id)
		}
	}

	d, runner, out, lines := setupBox(t, nil)
	env = heldTree(t, d)
	d.env = func(key string) string { return env[key] }
	runner.answers["code"] = ranResult{code: exitFailed, missing: true}
	setupVerb(d, nil)
	if slices.ContainsFunc(lines(), func(one string) bool { return strings.Contains(one, "--install-extension") }) || saidLine(out, "editor-extensions:") {
		t.Error("a box with no code installs an extension")
	}
}

// Windows ships the three as cmd shims, so the setup reaches each through cmd. [[spec/tickets/setup-reaches-windows-shims]]
func TestOnWindowsTheSetupReachesNpmNpxAndCodeThroughCmd(t *testing.T) {
	d, _, _, lines := setupBox(t, nil)
	d.goos = "windows"
	setupVerb(d, nil)
	said := lines()
	for _, want := range []string{
		"cmd /c npm install --no-audit --no-fund --silent",
		"cmd /c npx --yes playwright-core install chromium",
		"cmd /c code --list-extensions",
		"cmd /c code --install-extension " + editorExtensions[0] + " --force",
	} {
		if !slices.Contains(said, want) {
			t.Errorf("%q runs not: %v", want, said)
		}
	}
}

// cmd answers its own exit where no code stands, and that reads as no code. [[spec/tickets/windows-missing-code-reads-absent]]
func TestOnWindowsACmdAnsweringNoSuchCommandReadsAsNoCode(t *testing.T) {
	d, runner, out, lines := setupBox(t, nil)
	env := heldTree(t, d)
	d.env = func(key string) string { return env[key] }
	d.goos = "windows"
	runner.answers["cmd /c"] = ranResult{code: cmdMissing}
	setupVerb(d, nil)
	if slices.ContainsFunc(lines(), func(one string) bool { return strings.Contains(one, "--install-extension") }) {
		t.Error("an extension installs")
	}
	if saidLine(out, "editor-extensions:") {
		t.Error("the item reads as missing")
	}
}

// The setup runs before every verb, so a step that stops says a warning and the next one runs. [[spec/design_output/copilot#setup-and-discovery]]
func TestACopilotSetupThatStopsSaysAWarningAndTheBrandStillRuns(t *testing.T) {
	d, runner, out, _ := setupBox(t, nil)
	env := heldTree(t, d)
	env["TERM_PROGRAM"] = "vscode"
	d.env = func(key string) string { return env[key] }
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}
	seedTree(t, d.root, map[string]string{".github/workflows/copilot-setup-steps.yml": "user workflow"})
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if !saidLine(out, "  the copilot setup stopped") {
		t.Errorf("the stop names itself not:\n%s", out)
	}
	if !stands(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget))) {
		t.Error("the brand runs not past the stop")
	}
}

// A folder slugging to nothing stamps no brand, and the setup still answers zero. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func TestAFolderSluggingToNothingSaysTheBrandReachedNoName(t *testing.T) {
	d, _, out, _ := setupBox(t, nil)
	d.root = filepath.Join(d.root, "...")
	env := heldTree(t, d)
	d.env = func(key string) string { return env[key] }
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if !saidLine(out, "  the brand reached no name") || !strings.Contains(d.errs.(*strings.Builder).String(), "slugs to an empty brand") {
		t.Errorf("the setup says\n%s", out)
	}
}

// The browser is a want, so a box with no browser still runs every verb, and the drawing ships in git. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
func TestTheSetupResolvesABrowserAsAWant(t *testing.T) {
	d, runner, out, lines := setupBox(t, nil)
	seedTree(t, d.root, map[string]string{setupClient: "{}", toolsFile: "{}"})
	runner.answers["npx"] = ranResult{code: 1}
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if at := slices.Index(lines(), "npx --yes playwright-core install chromium"); at < 0 || runner.opts[at].cwd != filepath.Join(d.root, "src", "extension", "webview") {
		t.Errorf("the want downloads not: %v", lines())
	}
	if !saidLine(out, "browser:") || !saidLine(out, "  no browser here") {
		t.Errorf("the miss names not what the box loses:\n%s", out)
	}
	if slices.ContainsFunc(lines(), func(one string) bool { return strings.Contains(one, "bundle") }) {
		t.Error("a step bundles the drawing")
	}
	if !stands(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget))) {
		t.Error("the setup goes not on to the brand")
	}
}

// The editor link links the sidebar where the editor's folder stands, and a second run finds it standing. [[spec/design_output/extension#the-link-stands]]
func TestTheSetupLinksTheSidebarWhereTheEditorStands(t *testing.T) {
	home := t.TempDir()
	seedTree(t, home, map[string]string{".vscode/extensions/.keep": ""})
	d, runner, out, _ := setupBox(t, map[string]string{"HOME": home})
	env := heldTree(t, d)
	env["HOME"] = home
	d.env = func(key string) string { return env[key] }
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}
	seedTree(t, d.root, map[string]string{"src/extension/package.json": `{"publisher":"quackitect","name":"quackitect","version":"0.1.0"}`})
	setupVerb(d, nil)
	if !saidLine(out, "editor-link:") || !saidLine(out, "quackitect.quackitect: the entry went in.") || saidLine(out, "  the sidebar stays unlinked") {
		t.Errorf("the link says\n%s", out)
	}
	out.Reset()
	setupVerb(d, nil)
	if saidLine(out, "editor-link:") {
		t.Errorf("a standing link reads as missing:\n%s", out)
	}
}

// The extension list is the one the tracked settings recommend. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func TestTheExtensionsAreTheOnesTheTrackedSettingsRecommend(t *testing.T) {
	text, _ := readText(filepath.Join("..", "..", ".vscode", "extensions.json"))
	var said struct{ Recommendations []string }
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(said.Recommendations, editorExtensions) {
		t.Errorf("the settings recommend %v, the setup installs %v", said.Recommendations, editorExtensions)
	}
}
