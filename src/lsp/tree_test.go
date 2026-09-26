package main

import (
	"strings"
	"testing"
)

const goodSettings = `{
  "vale.valeCLI.path": ".se/.runtime/bin/vale",
  "vale.valeCLI.config": "spec/config/editor.vale.ini",
  "vale.valeCLI.installVale": false,
  "vale.valeCLI.minAlertLevel": "inherited",
  "vale.valeCLI.lintOnChange": true,
  "vale.enableSpellcheck": false,
  "biome.lsp.bin": { "linux-x64": ".se/.runtime/bin/biome", "win32-x64": ".se/.runtime/bin/biome.exe" },
  "biome.configurationPath": "spec/config/biome.json"
}
`

const goodInstall = `here() {
  case $1 in
    node)    have node ;;
    vale)    [ -x "$bin/vale${exe}" ] ;;
    biome)   [ -x "$bin/biome${exe}" ] ;;
  esac
}
`

func wholeTree(t *testing.T, over map[string]string) *Tree {
	t.Helper()
	files := map[string]string{
		Settings:  goodSettings,
		Offered:   `{"recommendations": ["chrischinchilla.vale-vscode", "biomejs.biome"]}`,
		Install:   goodInstall,
		ValeIni:   "MinAlertLevel = suggestion\n",
		EditorIni: "StylesPath = styles\nMinAlertLevel = suggestion\n",
		ToolsAt:   `{"node": {"version": "1.2.3"}}`,
	}
	for name, text := range over {
		files[name] = text
	}
	tree := fixture(t, files)
	tree.Node = "1.2.3"
	tree.Survey = files[ToolsAt]
	return tree
}

func TestACleanTreePasses(t *testing.T) {
	if found := treeFaults(wholeTree(t, nil)); len(found) != 0 {
		t.Fatalf("a clean tree answers %v", found)
	}
}

func TestSettingsNameTheBinaries(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		Settings: strings.Replace(goodSettings, `".se/.runtime/bin/vale"`, `"vale"`, 1),
	})
	one := onlyOne(t, settingsNameBinaries(tree), "SettingsNameBinaries")
	if !strings.Contains(one.Message, "vale.valeCLI.path names something else") {
		t.Errorf("the message reads %q", one.Message)
	}
}

// The install writes vale.exe on Windows, so the rule takes both names, and the tracked settings keep the plain one. [[spec/tickets/the-small-faults-land]]
func TestSettingsTakeTheValeTheInstallWrites(t *testing.T) {
	for _, path := range []string{".se/.runtime/bin/vale", ".se/.runtime/bin/vale.exe"} {
		tree := wholeTree(t, map[string]string{
			Settings: strings.Replace(goodSettings, `".se/.runtime/bin/vale"`, `"`+path+`"`, 1),
		})
		if found := settingsNameBinaries(tree); len(found) != 0 {
			t.Errorf("%s answers %v", path, found)
		}
	}
	tree := wholeTree(t, map[string]string{
		Settings: strings.Replace(goodSettings, `".se/.runtime/bin/vale"`, `".se/.runtime/bin/vale.cmd"`, 1),
	})
	one := onlyOne(t, settingsNameBinaries(tree), "SettingsNameBinaries")
	if !strings.Contains(one.Message, "vale.valeCLI.path names something else") {
		t.Errorf("a vale.cmd reads %q", one.Message)
	}
}

func TestTheInstallScriptWritesWhatTheSettingsRun(t *testing.T) {
	tree := wholeTree(t, map[string]string{Install: "here() {\n  case $1 in\n    node) have node ;;\n  esac\n}\n"})
	found := settingsNameBinaries(tree)
	if names(found, "SettingsNameBinaries") != 2 {
		t.Fatalf("a script installing neither answers %v", found)
	}
}

func TestUnreadableSettingsStandUnchecked(t *testing.T) {
	tree := wholeTree(t, map[string]string{Settings: "{ not json"})
	one := onlyOne(t, settingsNameBinaries(tree), "SettingsNameBinaries")
	if !strings.Contains(one.Message, "reads as no JSON") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestTheEditorDrawsTheWriteRules(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		Settings: strings.Replace(goodSettings, `"inherited"`, `"error"`, 1),
	})
	one := onlyOne(t, editorDrawsWriteRules(tree), "EditorDrawsWriteRules")
	if !strings.Contains(one.Message, "minAlertLevel to inherited") {
		t.Errorf("the message reads %q", one.Message)
	}
}

// [[spec/design_output/lsp#the-panel-reads-the-battery]]
func TestTheEditorsValeTurnsOnNoStyle(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		EditorIni: "StylesPath = styles\n[*.md]\nBasedOnStyles = VoiceParagraph\n",
	})
	one := onlyOne(t, editorDrawsWriteRules(tree), "EditorDrawsWriteRules")
	if !strings.Contains(one.Message, "turns on a style") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestBiomeRunsTheWindowsBinary(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		Settings: strings.Replace(goodSettings, `"win32-x64": ".se/.runtime/bin/biome.exe"`, `"win32-x64": ".se/.runtime/bin/biome"`, 1),
	})
	one := onlyOne(t, biomeOnWindows(tree), "BiomeOnWindows")
	if !strings.Contains(one.Message, "installs .se/.runtime/bin/biome.exe there") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestEveryExtensionStandsOnOffer(t *testing.T) {
	tree := wholeTree(t, map[string]string{Offered: `{"recommendations": ["someone.else"]}`})
	found := extensionsOnOffer(tree)
	if names(found, "ExtensionsOnOffer") != 3 {
		t.Fatalf("a stranger on the list answers %v", found)
	}
}

func TestNoLineDeletesALog(t *testing.T) {
	tree := wholeTree(t, map[string]string{"src/scripts/one.js": "const a = 1;\nremove(logFile);\n"})
	one := onlyOne(t, noLogDeleted(tree), "NoLogDeleted")
	if one.Line != 2 {
		t.Errorf("the finding names line %d", one.Line)
	}
}

func TestANameHoldsTheWords(t *testing.T) {
	tree := wholeTree(t, map[string]string{"spec/one-two-three-four-five-six.md": "text\n"})
	one := onlyOne(t, nameHoldsTheWords(tree), "NameHoldsTheWords")
	if !strings.Contains(one.Message, "more than 5 words") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestNothingPrivateTravels(t *testing.T) {
	tree := wholeTree(t, map[string]string{"spec/one.md": "The owner is Hypatia of Alexandria.\n"})
	tree.Box = Box{Name: "Hypatia"}
	one := onlyOne(t, nothingPrivateTravels(tree), "NothingPrivateTravels")
	if one.Line != 1 || !strings.Contains(one.Message, "the git name on this box") {
		t.Errorf("the finding reads %d %q", one.Line, one.Message)
	}
}

func TestANameNobodyOwnsTravels(t *testing.T) {
	tree := wholeTree(t, map[string]string{"spec/one.md": "The runner is root here.\n"})
	tree.Box = Box{Name: "root", User: "runner"}
	if found := nothingPrivateTravels(tree); len(found) != 0 {
		t.Fatalf("a name nobody owns answers %v", found)
	}
}

func TestTheSurveyNamesEveryInstall(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		Install: goodInstall + "second() {\n  case $1 in\n    weirdo) [ -x \"$bin/weirdo${exe}\" ] ;;\n  esac\n}\n",
	})
	one := onlyOne(t, surveyNamesInstalls(tree), "SurveyNamesInstalls")
	if !strings.Contains(one.Message, "names no weirdo") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestTheSurveyFindsThisNode(t *testing.T) {
	tree := wholeTree(t, map[string]string{ToolsAt: `{"node": {"version": "0.0.1"}}`})
	one := onlyOne(t, surveyFindsNode(tree), "SurveyFindsNode")
	if !strings.Contains(one.Message, "names node 0.0.1") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestNoSurveyAtAllRefuses(t *testing.T) {
	tree := wholeTree(t, map[string]string{ToolsAt: ""})
	one := onlyOne(t, surveyFindsNode(tree), "SurveyFindsNode")
	if !strings.Contains(one.Message, "stands nowhere") {
		t.Errorf("the message reads %q", one.Message)
	}
}

// A case drives the tree over the memory disk the package holds, so it touches no folder on the box. [[spec/tickets/a-door-holds-file-calls]]
func TestTheTreeReadsThroughTheDiskACaseHandsIt(t *testing.T) {
	t.Parallel()
	tree := fakeTree(map[string]string{
		"spec/one.md":   "# One\n",
		"spec/two.md":   "# Two\n",
		"spec/data.yml": "kind: data\n",
	})

	if tree.Read("spec/one.md") != "# One\n" {
		t.Fatalf("the tree reads %q, and the fake holds the note", tree.Read("spec/one.md"))
	}
	if !tree.Exists("spec/two.md") || tree.Exists("spec/three.md") {
		t.Fatal("the tree answers a note the fake lacks, or misses one it holds")
	}
	if got := strings.Join(tree.Names("spec", ".md"), " "); got != "one.md two.md" {
		t.Fatalf("the names read %q, and the fake holds two notes", got)
	}
	if got := strings.Join(tree.Paths(), " "); got != "spec/data.yml spec/one.md spec/two.md" {
		t.Fatalf("the paths read %q, and the fake holds three files", got)
	}
}
