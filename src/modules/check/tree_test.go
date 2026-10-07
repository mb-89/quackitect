// The rules weighing one file against another, each broken on a tree a case seeds, then handed the
// whole seed and read clean. The seed stands for the tracked settings and installer.
// [[spec/design_output/tree#the-rules-over-two-files]]
package check

import (
	"path/filepath"
	"strings"
	"testing"
)

const seedSettings = `{
  "vale.valeCLI.installVale": false,
  "vale.valeCLI.path": ".se/.runtime/bin/vale",
  "vale.valeCLI.config": "spec/config/editor.vale.ini",
  "vale.valeCLI.minAlertLevel": "inherited",
  "vale.valeCLI.lintOnChange": true,
  "vale.enableSpellcheck": false,
  "biome.lsp.bin": {
    "linux-x64": ".se/.runtime/bin/biome",
    "win32-x64": ".se/.runtime/bin/biome.exe"
  },
  "biome.configurationPath": "spec/config/biome.json",
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
`

const seedOffered = `{
  "recommendations": ["chrischinchilla.vale-vscode", "biomejs.biome", "bierner.markdown-mermaid"]
}
`

const seedEditorIni = "StylesPath = styles\nMinAlertLevel = suggestion\n"

const seedInstall = "here() {\n  case $1 in\n    vale) [ -x \"$bin/vale\" ] ;;\n    biome) [ -x \"$bin/biome\" ] ;;\n  esac\n}\n"

// The seed with one file changed, and every rule's findings named alone. [[spec/design_output/tree#the-rules-over-two-files]]
func seededTree(change map[string]string) *Tree {
	texts := Texts{Settings: seedSettings, Offered: seedOffered, EditorIni: seedEditorIni, Install: seedInstall}
	for at, text := range change {
		if text == "" {
			delete(texts, at)
			continue
		}
		texts[at] = text
	}
	return TreeOver("/tree", texts)
}

// Each finding's rule, file and message, so a row asserts a part of each. [[spec/design_output/tree#what-a-rule-answers]]
func saidBy(found []Finding) []string {
	out := []string{}
	for _, one := range found {
		out = append(out, one.Rule+" "+one.File+" "+one.Message)
	}
	return out
}

// A rule over each row's tree draws one finding a row wants, or none where the row wants none. [[spec/design_output/tree#the-rules-over-two-files]]
func rowsOf(t *testing.T, rule func(*Tree) []Finding, rows []ruleRow) {
	t.Helper()
	for _, one := range rows {
		t.Run(one.name, func(t *testing.T) {
			said := saidBy(rule(one.tree))
			if len(said) != len(one.wants) {
				t.Fatalf("the rule draws %q, and wants one finding a part of %q", said, one.wants)
			}
			for at, part := range one.wants {
				if !strings.Contains(said[at], part) {
					t.Errorf("finding %d reads %q, and wants %q", at, said[at], part)
				}
			}
		})
	}
}

type ruleRow struct {
	name  string
	tree  *Tree
	wants []string
}

func TestSettingsNameBinariesRefusesAnotherBinaryAndAnInstallWithNoVale(t *testing.T) {
	plain := strings.Replace(seedSettings, `"vale.valeCLI.path": ".se/.runtime/bin/vale"`, `"vale.valeCLI.path": "vale"`, 1)
	windows := strings.Replace(seedSettings, "bin/vale\"", "bin/vale.exe\"", 1)
	noVale := strings.Replace(seedInstall, "    vale) [ -x \"$bin/vale\" ] ;;", "    vale) true ;;", 1)
	rowsOf(t, settingsNameBinaries, []ruleRow{
		{"the seed", seededTree(nil), nil},
		{"another binary", seededTree(map[string]string{Settings: plain}), []string{"SettingsNameBinaries " + Settings + " vale.valeCLI.path"}},
		{"the Windows vale", seededTree(map[string]string{Settings: windows}), nil},
		{"an install with no vale", seededTree(map[string]string{Install: noVale}), []string{"SettingsNameBinaries " + Install + " " + Settings + " runs " + Bin + "/vale, and this script installs no vale."}},
	})
	if found := settingsNameBinaries(seededTree(map[string]string{Settings: plain})); len(found) != 1 || found[0].Line <= 1 {
		t.Fatalf("another binary draws %+v, and wants one finding at the line naming the binary", found)
	}
}

func TestEditorDrawsWriteRulesRefusesItsOwnLevelAStyleAndAMissingConfig(t *testing.T) {
	ownLevel := strings.Replace(seedSettings, `"vale.valeCLI.minAlertLevel": "inherited"`, `"vale.valeCLI.minAlertLevel": "warning"`, 1)
	rowsOf(t, editorDrawsWriteRules, []ruleRow{
		{"the seed", seededTree(nil), nil},
		{"its own level", seededTree(map[string]string{Settings: ownLevel}), []string{"EditorDrawsWriteRules " + Settings + " " + EditorIni + " draws at suggestion. Set vale.valeCLI.minAlertLevel to inherited."}},
		{"a style turned on", seededTree(map[string]string{EditorIni: seedEditorIni + "[*.md]\nBasedOnStyles = VoiceParagraph\n"}), []string{"turns on a style"}},
		{"a config nobody wrote", seededTree(map[string]string{EditorIni: ""}), []string{"vale.valeCLI.config"}},
	})
}

func TestBiomeOnWindowsRefusesAPlainPath(t *testing.T) {
	plain := strings.Replace(seedSettings, "bin/biome.exe", "bin/biome", 1)
	rowsOf(t, biomeOnWindows, []ruleRow{
		{"the seed", seededTree(nil), nil},
		{"a plain path on Windows", seededTree(map[string]string{Settings: plain}), []string{"BiomeOnWindows " + Settings + " win32-x64"}},
	})
}

func TestExtensionsOnOfferRefusesADroppedExtensionAndAStrangeFormatter(t *testing.T) {
	dropped := strings.Replace(seedOffered, `"biomejs.biome", `, "", 1)
	stranger := strings.Replace(seedSettings, `"editor.defaultFormatter": "biomejs.biome"`, `"editor.defaultFormatter": "somebody.else"`, 1)
	rowsOf(t, extensionsOnOffer, []ruleRow{
		{"the seed", seededTree(nil), nil},
		{"a dropped extension", seededTree(map[string]string{Offered: dropped}), []string{"ExtensionsOnOffer " + Offered + " A clone opens without biomejs.biome", "ExtensionsOnOffer " + Settings + " [json] formats through biomejs.biome"}},
		{"a strange formatter", seededTree(map[string]string{Settings: stranger}), []string{"ExtensionsOnOffer " + Settings + " [json] formats through somebody.else"}},
	})
}

func TestNoLogDeletedRefusesALineReachingALog(t *testing.T) {
	tree := TreeOver("/tree", Texts{"src/doors/log.js": "export function log() {\n  files.remove(logFolder);\n}\n"})
	found := noLogDeleted(tree)
	if len(found) != 1 || found[0].Rule != "NoLogDeleted" || found[0].File != "src/doors/log.js" || found[0].Line != 2 {
		t.Fatalf("a line deleting a log draws %+v, and wants NoLogDeleted on src/doors/log.js line 2", found)
	}
}

// A fixture spells no home path whole, so the commit door reads none in this file. [[spec/design_output/private#a-fixture-carries-no-shape]]
func TestNothingPrivateTravelsRefusesTheBoxNamesAndPassesNobody(t *testing.T) {
	home := strings.Join([]string{"C:/Users", "fnordwick"}, "/")
	over := func(line string, box Box) *Tree {
		tree := TreeOver("/tree", Texts{"spec/funnel/one.md": line + "\n"})
		tree.Box = box
		return tree
	}
	rowsOf(t, nothingPrivateTravels, []ruleRow{
		{"the user and the home folder", over("const ROOT = \""+home+"/ai\";", Box{User: "fnordwick", Home: home}),
			[]string{"NothingPrivateTravels spec/funnel/one.md This line carries the user this box runs as", "This line carries the home folder on this box"}},
		{"the git name and address", over("Ask Fnordwick, or fnordwick@example.com.", Box{Home: "/home/user", Name: "Fnordwick", Email: "fnordwick@example.com"}),
			[]string{"This line carries the git name on this box", "This line carries the git address on this box"}},
		{"a box naming nobody", over("A cloud box writes under /home/user, as root.", Box{User: "root", Home: "/home/user", Name: "Claude"}), nil},
		{"a name inside a longer word", over("The oxygen in the galaxy holds.", Box{User: "xy", Home: strings.Join([]string{"/home", "xy"}, "/")}), nil},
	})
}

// The installer stands beside RUNME.sh, so every rule over it reads the file the tree runs. [[spec/tickets/scripts-folder-leaves]]
func TestTheInstallTheRulesReadStandsInTheTree(t *testing.T) {
	found, err := filepath.Glob(filepath.Join("..", "..", "..", filepath.FromSlash(Install)))
	if err != nil || len(found) != 1 || strings.Contains(Install, "/") {
		t.Fatalf("the rules read %s, which stands at %v, and want the installer at the root", Install, found)
	}
}

func TestSurveyNamesInstallsRefusesAToolTheSurveyMisses(t *testing.T) {
	probe := strings.Replace(seedInstall, "  esac", "    probe) [ -x \"$bin/probe\" ] ;;\n  esac", 1)
	rowsOf(t, surveyNamesInstalls, []ruleRow{
		{"the seed", seededTree(nil), nil},
		{"a tool the survey misses", seededTree(map[string]string{Install: probe}), []string{"SurveyNamesInstalls " + Install + " The survey names no probe"}},
	})
}

func TestSurveyFindsNodeRefusesAnotherNodeAndAMissingSurvey(t *testing.T) {
	over := func(survey string) *Tree {
		tree := seededTree(nil)
		tree.Node, tree.Survey = "22.0.0", survey
		return tree
	}
	rowsOf(t, surveyFindsNode, []ruleRow{
		{"the node running", over(`{"node": {"version": "22.0.0"}}`), nil},
		{"another node", over(`{"node": {"version": "18.0.0"}}`), []string{"SurveyFindsNode " + ToolsAt + " The survey names node 18.0.0"}},
		{"no survey", over(""), []string{"SurveyFindsNode " + Install + " "}},
	})
}
