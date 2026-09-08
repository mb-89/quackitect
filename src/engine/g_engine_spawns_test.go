package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE EXTENSION AS IT STANDS, in the shapes the real one is written in: a
// renamed binding, a wrapper that forwards somebody else's array, a call site
// that binds its array first, and a door that spreads the array it was handed.
// A door that refused everything would pass every planted row below for the
// wrong reason, so this one has to come back clean.
const theExtensionAsItStands = `import { spawn as spawnRaw, ChildProcess, SpawnOptions } from "node:child_process";

function workRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function spawn(exe: string, args: string[], options: SpawnOptions = {}): ChildProcess {
  return spawnRaw(exe, args, { ...options, windowsHide: true });
}

function rotate(context: vscode.ExtensionContext) {
  const work = workRoot();
  const exe = binary(context, "se");
  return spawn(exe, [...rotateArgs(), "--work", work], { cwd: work });
}

function setValue(context: vscode.ExtensionContext, key: string, value: unknown) {
  const work = workRoot();
  const exe = binary(context, "se");
  const args = [...setArgs(key, asText(value), methodRoot(context)), "--work", work];
  return spawn(exe, args, { cwd: work });
}

function askEngine(context: vscode.ExtensionContext, args: string[]) {
  const work = workRoot();
  const exe = binary(context, "se");
  return spawn(exe, [...args, "--work", work], { cwd: work });
}
`

// THE START THE ROWS BELOW PLANT A SHAPE AT.
const theStartPlantedAt = "  return spawn(exe, [...rotateArgs(), \"--work\", work], { cwd: work });"

func theExtensionWith(plant string) string {
	return strings.Replace(theExtensionAsItStands, theStartPlantedAt, plant, 1)
}

func TestAStartOfTheEngineWritingItsOwnFlags(t *testing.T) {
	dir := t.TempDir()
	roots := Roots{Work: dir, Method: dir}
	for _, row := range []struct {
		name    string
		rel     string
		text    string
		refused bool
		says    string
	}{
		{
			name: "the tree as it stands is left alone",
			rel:  "src/extension/extension.ts",
			text: theExtensionAsItStands,
		},
		{
			name: "a file that starts nothing is left alone",
			rel:  "src/extension/panel.ts",
			text: "// a worker that has spawned and not pulled yet would go missing.\n" +
				"export function draw(rows: string[]) {\n  return rows.join(\"\\n\");\n}\n",
		},
		{
			name: "a start outside the extension is not this door's business",
			rel:  "src/notes/other.ts",
			text: theExtensionWith("  return spawn(exe, [\"--form\", \"x\", \"--work\", work], { cwd: work });"),
		},
		{
			// THE DEFECT AS IT ARRIVES. Nobody breaks a working call site. Somebody
			// writes a new one beside it, spreading no builder, with its flags as
			// literals, and every builder is still spread somewhere else.
			name: "a new call site writes its flags as literals",
			rel:  "src/extension/extension.ts",
			text: theExtensionWith("  spawnRaw(binary(context, \"se\"), [\"--form\", \"x\", \"--work\", work], { cwd: work });\n" +
				theStartPlantedAt),
			refused: true,
			says:    "writes --form at the call site",
		},
		{
			name: "a namespace import binds nothing the door can read",
			rel:  "src/extension/planted-ns.ts",
			text: "import * as cp from \"node:child_process\";\n" +
				"export function plantedStart(exe: string, work: string) {\n" +
				"  return cp.spawn(exe, [\"--form\", \"x\", \"--work\", work], { cwd: work });\n}\n",
			refused: true,
			says:    "binds no starter this door can read",
		},
		{
			name:    "a start written in a shape nothing can read",
			rel:     "src/extension/extension.ts",
			text:    theExtensionWith("  return spawn(...[exe, [\"--form\", \"x\", \"--work\", work], { cwd: work });"),
			refused: true,
			says:    "cannot read the call",
		},
		{
			name: "a flag held in an object on one line",
			rel:  "src/extension/extension.ts",
			text: theExtensionWith("  const carriedA = { form: \"--form\" };\n" +
				"  return spawn(exe, [...rotateArgs(), carriedA.form, \"--work\", work], { cwd: work });"),
			refused: true,
			says:    "--form reaches the call site through it",
		},
		{
			name: "a flag held in an object two lines below",
			rel:  "src/extension/extension.ts",
			text: theExtensionWith("  const carriedB = {\n    form: \"--form\",\n  };\n" +
				"  return spawn(exe, [...rotateArgs(), carriedB.form, \"--work\", work], { cwd: work });"),
			refused: true,
			says:    "--form reaches the call site through it",
		},
		{
			// THE BUG IN THE CHECK THIS REPLACES. It said it read an object whole and
			// then answered clean for anything opening with a bracket, so it saw only a
			// flag spelled out inside the object. One hop further in walked past it.
			name: "a flag one hop inside an object",
			rel:  "src/extension/extension.ts",
			text: theExtensionWith("  const flag = \"--form\";\n  const held = { form: flag };\n" +
				"  return spawn(exe, [...rotateArgs(), held.form, \"--work\", work], { cwd: work });"),
			refused: true,
			says:    "--form reaches the call site through it",
		},
		{
			name: "a value that reaches the edge of the window",
			rel:  "src/extension/extension.ts",
			text: theExtensionWith("  const edgeC = [{\n" +
				"    form: spawn(exe, [...rotateArgs(), edgeC, \"--work\", work], { cwd: work }),\n" +
				"  }];\n  return edgeC;"),
			refused: true,
			says:    "bracket this door cannot follow to its end",
		},
	} {
		t.Run(row.name, func(t *testing.T) {
			// THE CASE IS PLANTED ON DISK AND READ BACK, so the row is judged on the
			// bytes a write would carry and never on the tree this test runs in.
			at := filepath.Join(dir, filepath.FromSlash(row.rel))
			if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(at, []byte(row.text), 0o644); err != nil {
				t.Fatal(err)
			}
			planted, err := os.ReadFile(at)
			if err != nil {
				t.Fatal(err)
			}
			said := aStartOfTheEngineWritingItsOwnFlags(roots, true, row.rel, string(planted))
			if row.refused && said == nil {
				t.Fatalf("the door let this through and it should not have")
			}
			if !row.refused && said != nil {
				t.Fatalf("the door refused a clean write: %v", said)
			}
			if said != nil && !strings.Contains(said.Error(), row.says) {
				t.Fatalf("it refused for another reason, wanted %q in %v", row.says, said)
			}
		})
	}
}
