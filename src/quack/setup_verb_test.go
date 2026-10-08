// The setup verb over fake doors: every item, the skip list, the survey, the
// Copilot setup, the brand and the Windows shims.
// [[spec/tickets/install-drops-node]] [[spec/tickets/box-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os" // level0: OutsideInDoors - the case reads the tracked settings file the tree holds, as a build check reads source
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
func heldTree(t *testing.T, d *boxDoors) map[string]string {
	t.Helper()
	hq1SeedDisk(t, d.disk, d.root, map[string]string{setupClient: "{}", toolsFile: "{}", "chrome": ""})
	env := map[string]string{"PLAYWRIGHT_CHROMIUM": filepath.Join(d.root, "chrome")}
	d.env = func(key string) string { return env[key] }
	return env
}

func saidLine(out *strings.Builder, start string) bool {
	return slices.ContainsFunc(strings.Split(out.String(), "\n"), func(one string) bool { return strings.HasPrefix(one, start) })
}

func TestTheSetupGetsEachMissingItemAndSkipsTheOnesTheSkipListNames(t *testing.T) {
	t.Parallel()
	home := "/home"
	d, runner, out, lines := setupBox(t, map[string]string{"HOME": home, "SE_INSTALL_SKIP": "browser editor-link"})
	hq1SeedDisk(t, d.disk, home, map[string]string{".vscode/extensions/extensions.json": "[]"})
	hq1SeedDisk(t, d.disk, d.root, map[string]string{toolsFile: "{}"})
	runner.answers["code --list-extensions"] = ranResult{}
	fake := d.run
	d.run = func(argv []string, o runOpts) ranResult {
		if argv[0] == "npm" {
			hq1SeedDisk(t, d.disk, d.root, map[string]string{setupClient: "{}"})
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
	if d.disk.stands(filepath.Join(home, ".vscode", "extensions", editorTestID+"-0.1.0")) {
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
	t.Parallel()
	d, runner, out, _ := setupBox(t, nil)
	env := heldTree(t, &d)
	env["TERM_PROGRAM"] = "vscode"
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}

	if code := setupVerb(d, []string{"--landed"}); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if survey := d.disk.text(filepath.Join(d.root, filepath.FromSlash(toolsFile))); !strings.Contains(survey, `"node": null`) {
		t.Errorf("a landed setup writes no survey: %s", survey)
	}
	for _, one := range copilotRegistrations() {
		if !d.disk.stands(filepath.Join(d.root, filepath.FromSlash(one.name))) {
			t.Errorf("%s stands not", one.name)
		}
	}
	brand := brandOf(d.root)
	market := d.disk.text(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget)))
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
	heldTree(t, &quiet)
	quietRunner.answers["code --list-extensions"] = runner.answers["code --list-extensions"]
	setupVerb(quiet, nil)
	if survey := quiet.disk.text(filepath.Join(quiet.root, filepath.FromSlash(toolsFile))); survey != "{}" {
		t.Error("a survey standing, with nothing landed, takes a write")
	}
	missing, _, _, _ := setupBox(t, nil)
	heldTree(t, &missing)
	_ = missing.disk.remove(filepath.Join(missing.root, filepath.FromSlash(toolsFile)))
	setupVerb(missing, nil)
	if !missing.disk.stands(filepath.Join(missing.root, filepath.FromSlash(toolsFile))) {
		t.Error("a box with no survey writes none")
	}
}

// A box with no code on the PATH skips the extensions, and a code that answers an error still installs them. [[spec/tickets/code-failure-reads-missing]]
func TestACodeListExitingPastZeroReadsAsMissingAndTheSetupInstallsTheExtensions(t *testing.T) {
	t.Parallel()
	d, runner, _, lines := setupBox(t, nil)
	heldTree(t, &d)
	runner.answers["code --list-extensions"] = ranResult{code: 1}
	setupVerb(d, nil)
	for _, id := range editorExtensions {
		if !slices.Contains(lines(), "code --install-extension "+id+" --force") {
			t.Errorf("%s installs not", id)
		}
	}

	d, runner, out, lines := setupBox(t, nil)
	heldTree(t, &d)
	runner.answers["code"] = ranResult{code: exitFailed, missing: true}
	setupVerb(d, nil)
	if slices.ContainsFunc(lines(), func(one string) bool { return strings.Contains(one, "--install-extension") }) || saidLine(out, "editor-extensions:") {
		t.Error("a box with no code installs an extension")
	}
}

// Windows ships the three as cmd shims, so the setup reaches each through cmd. [[spec/tickets/setup-reaches-windows-shims]]
func TestOnWindowsTheSetupReachesNpmNpxAndCodeThroughCmd(t *testing.T) {
	t.Parallel()
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
	t.Parallel()
	d, runner, out, lines := setupBox(t, nil)
	heldTree(t, &d)
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
	t.Parallel()
	d, runner, out, _ := setupBox(t, nil)
	env := heldTree(t, &d)
	env["TERM_PROGRAM"] = "vscode"
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{".github/workflows/copilot-setup-steps.yml": "user workflow"})
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if !saidLine(out, "  the copilot setup stopped") {
		t.Errorf("the stop names itself not:\n%s", out)
	}
	if !d.disk.stands(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget))) {
		t.Error("the brand runs not past the stop")
	}
}

// A folder slugging to nothing stamps no brand, and the setup still answers zero. [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func TestAFolderSluggingToNothingSaysTheBrandReachedNoName(t *testing.T) {
	t.Parallel()
	d, _, out, _ := setupBox(t, nil)
	d.root = filepath.Join(d.root, "___")
	heldTree(t, &d)
	if code := setupVerb(d, nil); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if !saidLine(out, "  the brand reached no name") || !strings.Contains(d.errs.(*strings.Builder).String(), "slugs to an empty brand") {
		t.Errorf("the setup says\n%s", out)
	}
}

// The browser is a want, so a box with no browser still runs every verb, and the drawing ships in git. [[spec/design_output/drawing#the-drawing-ships-prebuilt]]
func TestTheSetupResolvesABrowserAsAWant(t *testing.T) {
	t.Parallel()
	d, runner, out, lines := setupBox(t, nil)
	hq1SeedDisk(t, d.disk, d.root, map[string]string{setupClient: "{}", toolsFile: "{}"})
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
	if !d.disk.stands(filepath.Join(d.root, filepath.FromSlash(marketplaceTarget))) {
		t.Error("the setup goes not on to the brand")
	}
}

// The editor link links the sidebar where the editor's folder stands, and a second run finds it standing. [[spec/design_output/extension#the-link-stands]]
func TestTheSetupLinksTheSidebarWhereTheEditorStands(t *testing.T) {
	t.Parallel()
	home := "/home"
	d, runner, out, _ := setupBox(t, map[string]string{"HOME": home})
	hq1SeedDisk(t, d.disk, home, map[string]string{".vscode/extensions/.keep": ""})
	env := heldTree(t, &d)
	env["HOME"] = home
	runner.answers["code --list-extensions"] = ranResult{stdout: strings.Join(editorExtensions, "\n")}
	hq1SeedDisk(t, d.disk, d.root, map[string]string{"src/extension/package.json": `{"publisher":"quackitect","name":"quackitect","version":"0.1.0"}`})
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
	t.Parallel()
	text, _ := readText(filepath.Join("..", "..", ".vscode", "extensions.json"))
	var said struct{ Recommendations []string }
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		t.Fatal(err)
	}
	if !slices.Equal(said.Recommendations, editorExtensions) {
		t.Errorf("the settings recommend %v, the setup installs %v", said.Recommendations, editorExtensions)
	}
}

// The setup workflow's last step runs the setup with --cloud, which writes the registrations and the cloud mark where no editor stands. [[spec/tickets/copilot-hooks-run-in-go]]
func TestTheSetupVerbWritesTheCloudMarkUnderCloud(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := setupBox(t, nil)
	heldTree(t, &d)
	runner.answers["code"] = ranResult{missing: true}
	runner.answers["code-insiders"] = ranResult{missing: true}
	if code := setupVerb(d, []string{"--cloud"}); code != 0 {
		t.Fatalf("the setup answers %d", code)
	}
	if mark := d.disk.text(filepath.Join(d.root, filepath.FromSlash(copilotCloudMark))); mark != "cloud\n" {
		t.Errorf("the cloud mark reads %q, and wants cloud under --cloud", mark)
	}
	for _, one := range copilotRegistrations() {
		if !d.disk.stands(filepath.Join(d.root, filepath.FromSlash(one.name))) {
			t.Errorf("%s stands not under --cloud", one.name)
		}
	}
}

func TestTheRegistrationsEqualTheTrackedFiles(t *testing.T) {
	t.Parallel()
	for _, one := range copilotRegistrations() {
		tracked, ok := readText(filepath.Join("..", "..", filepath.FromSlash(one.name)))
		if !ok {
			t.Errorf("%s stands untracked", one.name)
			continue
		}
		if tracked != one.content {
			t.Errorf("%s reads\n%s\nand the setup writes\n%s", one.name, tracked, one.content)
		}
	}
}

// The copilot road assembles no Vale styles, since the Go rules read their own. [[spec/tickets/vale-leaves-the-tree]]
func TestTheCopilotRoadAssemblesNoStyles(t *testing.T) {
	t.Parallel()
	for _, one := range copilotRegistrations() {
		if strings.Contains(one.name, "styles") || strings.Contains(one.content, "styles") {
			t.Errorf("%s assembles styles", one.name)
		}
	}
}

func TestTheSetupWritesOnceAndLeavesTheClaudeSettings(t *testing.T) {
	t.Parallel()
	d, _, _, _ := boxDoorsOnDisk(t)
	seedTree(t, d.root, map[string]string{".claude/settings.json": "original"})
	written, err := copilotSetup(d, "vscode")
	if err != nil || len(written) != 2 {
		t.Fatalf("the setup writes %v, %v", written, err)
	}
	if again, err := copilotSetup(d, "vscode"); err != nil || len(again) != 0 {
		t.Errorf("a second setup writes %v, %v", again, err)
	}
	if text, _ := readText(filepath.Join(d.root, ".claude", "settings.json")); text != "original" {
		t.Error("the Claude settings moved")
	}
}

func TestTheSetupRefusesAFileAPersonOwns(t *testing.T) {
	t.Parallel()
	d, _, _, _ := boxDoorsOnDisk(t)
	seedTree(t, d.root, map[string]string{".github/workflows/copilot-setup-steps.yml": "user workflow"})
	if _, err := copilotSetup(d, "vscode"); err == nil || err.Error() != "Keep .github/workflows/copilot-setup-steps.yml: it belongs to you. Merge the generated registration manually." {
		t.Errorf("the setup answers %v", err)
	}
	if text, _ := readText(filepath.Join(d.root, ".github", "workflows", "copilot-setup-steps.yml")); text != "user workflow" {
		t.Error("the person's workflow moved")
	}
	if stands(filepath.Join(d.root, ".github", "hooks", "level0.json")) {
		t.Error("the refusal still wrote the hooks")
	}
	if _, err := copilotSetup(d, "desk"); err == nil {
		t.Error("an unknown target reads as one")
	}
}

func TestAutoWaitsOnCopilotAndCloudWritesItsMark(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := boxDoorsOnDisk(t)
	if written, err := copilotSetup(d, "auto"); err != nil || len(written) != 0 {
		t.Errorf("auto with no Copilot writes %v, %v", written, err)
	}
	if !slices.ContainsFunc(runner.ran, func(argv []string) bool { return slices.Equal(argv, []string{"code-insiders", "--list-extensions"}) }) {
		t.Errorf("auto asks no editor: %v", runner.ran)
	}
	if written, err := copilotSetup(d, "cloud"); err != nil || len(written) != 2 {
		t.Errorf("cloud writes %v, %v", written, err)
	}
	if text, _ := readText(filepath.Join(d.root, filepath.FromSlash(copilotCloudMark))); text != "cloud\n" {
		t.Errorf("the mark reads %q", text)
	}
}

func TestAnEditorListingCopilotOrTheEditorsTerminalTurnsAutoOn(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := boxDoorsOnDisk(t)
	runner.answers["code --list-extensions"] = ranResult{stdout: "GitHub.copilot-chat\n"}
	if !copilotDetected(d) {
		t.Error("an editor listing Copilot reads as none")
	}
	d, _, _, _ = boxDoorsOnDisk(t)
	d.env = func(key string) string { return map[string]string{"TERM_PROGRAM": "vscode"}[key] }
	if !copilotDetected(d) {
		t.Error("the editor's terminal reads as no Copilot")
	}
	d.env = func(key string) string {
		return map[string]string{"GITHUB_COPILOT_GIT_TOKEN": "t", "COPILOT_AGENT_PROMPT": "p"}[key]
	}
	if !copilotCloud(d) {
		t.Error("the cloud agent's variables read as no cloud")
	}
	d, runner, _, _ = boxDoorsOnDisk(t)
	d.goos = "windows"
	copilotDetected(d)
	if len(runner.ran) == 0 || runner.ran[0][0] != "cmd" {
		t.Errorf("Windows asks the editor past cmd: %v", runner.ran)
	}
}

// The roads a session merges a pull request by, one a GitHub connector the box loads and the CLI, which the settings deny, and the auto-merge the work skill turns on, which they leave open. [[spec/tickets/probe-at-revision-guards-merges]] [[spec/tickets/merge-deny-every-connector]]
var (
	mergeRoads = []string{
		"mcp__github__merge_pull_request",
		"mcp__b6be2f0a-1533-41f3-8991-00692028c4db__merge_pull_request",
		"Bash(gh pr merge:*)",
	}
	autoMerge = "enable_pr_auto_merge"
)

func TestTheSettingsDenyTheMergeToolUnderEveryConnectorAndLeaveAutoMergeOpen(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(settingsFile)))
	if err != nil {
		t.Fatal(err)
	}
	var read struct {
		Permissions struct {
			Deny []string `json:"deny"`
		} `json:"permissions"`
	}
	if err := json.Unmarshal(text, &read); err != nil {
		t.Fatal(err)
	}
	for _, road := range mergeRoads {
		if !slices.Contains(read.Permissions.Deny, road) {
			t.Errorf("the settings deny %v, and no %s", read.Permissions.Deny, road)
		}
	}
	for _, one := range read.Permissions.Deny {
		if strings.Contains(one, autoMerge) {
			t.Errorf("the settings deny %s, which the work skill turns auto-merge on with", one)
		}
	}
}
