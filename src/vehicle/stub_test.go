// A stub out of a vehicle: the files it holds, the record it keeps, and the
// refusal where the vehicle has no upstream.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
package vehicle

import (
	"io/fs"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"
)

const stubSettings = `{"$comment":"the cage","env":{"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS":"1"},"permissions":{"allow":["mcp__level0"]},"skipAutoPermissionPrompt":true}`

// The vehicle the JavaScript cases call /tools, with its stub template. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
func stubVehicle(t *testing.T) (string, string) {
	t.Helper()
	where := t.TempDir()
	tools := filepath.Join(where, "tools")
	p := PluginFolder + "/"
	seed(t, tools, map[string]string{
		Marker:                       "{}",
		"RUNME.sh":                   "run me",
		"package.json":               `{"version":"0.1.0"}`,
		".claude/settings.json":      stubSettings,
		".se/.runtime/identity.json": `{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}`,
		"src/scripts/verbs/doors.js": "the verbs",
		"src/stub/RUNME.sh":          "the shim",
		"src/stub/" + p + ".claude-plugin/plugin.json": `{"name":"level0"}`,
		"src/stub/" + p + "hooks/hooks.json":           `{"modules":["./bridgehead.js"]}`,
		"src/stub/" + p + "hooks/bridgehead.js":        "export function register() {}",
	})
	return where, tools
}

// A git door answering the remote, or refusing it, and keeping what it was asked. [[spec/design_output/vehicle#the-record-names-the-vehicle]]
func origin(url string, asked *[]string) Git {
	return func(args ...string) (string, bool) {
		*asked = append(*asked, strings.Join(args, " "))
		if url == "" {
			return "", false
		}
		return url, true
	}
}

func walked(t *testing.T, at string) []string {
	t.Helper()
	out := []string{}
	filepath.WalkDir(at, func(path string, one fs.DirEntry, err error) error {
		if err == nil && !one.IsDir() {
			rel, _ := filepath.Rel(at, path)
			out = append(out, filepath.ToSlash(rel))
		}
		return nil
	})
	slices.Sort(out)
	return out
}

func TestStubTheBrandIsTheFolderTheVehicleStandsIn(t *testing.T) {
	for said, want := range map[string]string{
		"/home/agent/quackitect": "quackitect", "/home/agent/quackitect/": "quackitect", `C:\work\acme`: "acme",
		"/x/my.app": "my-app", "/x/Acme Tools": "acme-tools", "/x/.hidden": "hidden", "/x/...": "",
	} {
		if got := BrandOf(said); got != want {
			t.Fatalf("%s brands %q, want %q", said, got, want)
		}
	}
}

func TestStubTheUpstreamIsWhatItNamesElseTheRemote(t *testing.T) {
	if UpstreamOf("git@host:a/b.git\n", "https://host/c/d") != "https://host/c/d" || UpstreamOf("git@host:a/b.git\n", "") != "git@host:a/b.git" || UpstreamOf("", "") != "" {
		t.Fatal("the upstream reads --upstream, then the remote")
	}
}

func TestStubTheRecordCarriesItsFields(t *testing.T) {
	said := Stringify(LinkOf("abc123", "acme", "git@host:a/b.git", "0.1.0", fixedStamp))
	want := `{
  "vehicle": "abc123",
  "name": "acme",
  "upstream": "git@host:a/b.git",
  "version": "0.1.0",
  "made": "2026-01-01T00:00:00.000Z"
}`
	if said != want {
		t.Fatal(said)
	}
}

func TestStubTheSettingsDropEveryComment(t *testing.T) {
	said := SettingsOf(stubSettings)
	if !reflect.DeepEqual(said.Keys(), []string{"env", "permissions", "skipAutoPermissionPrompt"}) {
		t.Fatal(said.Keys())
	}
	if len(SettingsOf("not json").Keys()) != 0 {
		t.Fatal("a bad text keeps nothing")
	}
}

func TestStubTheListNamesFoldersRecordSettingsAndTemplate(t *testing.T) {
	said := StubFiles([]string{"RUNME.sh", PluginFolder + "/hooks/hooks.json"}, "/here/a-shop")
	want := []string{"a-shop/spec/tickets/.gitkeep", "a-shop/spec/guidance/.gitkeep", "a-shop/src/.gitkeep", "vehicle.json", ".claude/settings.json", "RUNME.sh", PluginFolder + "/hooks/hooks.json"}
	if !reflect.DeepEqual(said, want) {
		t.Fatal(said)
	}
	if said := StubFolders(""); !reflect.DeepEqual(said, []string{"project/spec/tickets", "project/spec/guidance", "project/src"}) {
		t.Fatal(said)
	}
}

func TestStubHoldsEveryFileTheListNamesAndNothingElse(t *testing.T) {
	where, tools := stubVehicle(t)
	dest := filepath.Join(where, "stub")
	asked := []string{}
	said, err := StubInto(OS(), origin("git@host:a/b.git", &asked), fixed, tools, dest, 7, "")
	if err != nil || !said.OK {
		t.Fatal(said.Why, err)
	}
	if !reflect.DeepEqual(asked, []string{"remote get-url origin"}) {
		t.Fatal("the stub asks git its remote, and nothing else", asked)
	}
	want := slices.Clone(said.Files)
	slices.Sort(want)
	if got := walked(t, dest); !reflect.DeepEqual(got, want) {
		t.Fatalf("the stub holds %v, the list names %v", got, want)
	}
	if marker := readOf(t, filepath.Join(dest, Marker)); marker != "{\n  \"name\": \"level0\",\n  \"version\": \"0.1.0\"\n}\n" {
		t.Fatalf("the plugin is the template's, wearing the tree's version: %q", marker)
	}
	if exists(filepath.Join(dest, "src/scripts")) {
		t.Fatal("the verbs stay behind")
	}
	if perm, held := permOf(t, filepath.Join(dest, "RUNME.sh")); held && perm != 0o755 || readOf(t, filepath.Join(dest, "RUNME.sh")) != "the shim" {
		t.Fatal("the shim carries its run bit")
	}
	if readOf(t, filepath.Join(dest, PluginFolder, "hooks/bridgehead.js")) != "export function register() {}" {
		t.Fatal("the bridgehead travels")
	}
}

func TestStubTheRecordReadsOffTheRegisterAndTheRemote(t *testing.T) {
	where, tools := stubVehicle(t)
	dest := filepath.Join(where, "stub")
	asked := []string{}
	if said, err := StubInto(OS(), origin("git@host:a/b.git", &asked), fixed, tools, dest, 7, ""); err != nil || !said.OK {
		t.Fatal(said.Why, err)
	}
	want := "{\n  \"vehicle\": \"abc123\",\n  \"name\": \"tools\",\n  \"upstream\": \"git@host:a/b.git\",\n  \"version\": \"0.1.0\",\n  \"made\": \"" + fixedStamp + "\"\n}\n"
	if said := readOf(t, filepath.Join(dest, Link)); said != want {
		t.Fatal(said)
	}
	settings := "{\n  \"env\": {\n    \"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS\": \"1\"\n  },\n  \"permissions\": {\n    \"allow\": [\n      \"mcp__level0\"\n    ]\n  },\n  \"skipAutoPermissionPrompt\": true\n}\n"
	if said := readOf(t, filepath.Join(dest, Settings)); said != settings {
		t.Fatal(said)
	}
}

func TestStubAVehicleWithNoRemoteRefusesAndWritesNothing(t *testing.T) {
	where, tools := stubVehicle(t)
	dest := filepath.Join(where, "stub")
	asked := []string{}
	said, err := StubInto(OS(), origin("", &asked), fixed, tools, dest, 7, "")
	if err != nil || said.OK || said.Why != "the vehicle has no remote a cloud box can clone. Give it one, or say --upstream <url>." {
		t.Fatal(said, err)
	}
	if exists(dest) {
		t.Fatal("a refusal writes nothing")
	}
	named, err := StubInto(OS(), origin("", &asked), fixed, tools, dest, 7, "https://host/c/d.git")
	if err != nil || !named.OK || !strings.Contains(readOf(t, filepath.Join(dest, Link)), `"upstream": "https://host/c/d.git"`) {
		t.Fatal("--upstream goes past the refusal", named, err)
	}
}

func TestStubLandsInTheVehicleNowhere(t *testing.T) {
	_, tools := stubVehicle(t)
	asked := []string{}
	said, err := StubInto(OS(), origin("git@host:a/b.git", &asked), fixed, tools, tools+"/", 7, "")
	if err != nil || said.OK || said.Why != "a stub lands beside its vehicle, elsewhere" || exists(filepath.Join(tools, Link)) {
		t.Fatal(said, err)
	}
}

// [[spec/design_output/vehicle#the-brand-a-vehicle-stamps]]
func TestStubAFolderSluggingToNothingRefuses(t *testing.T) {
	where := t.TempDir()
	// Windows names no folder ..., and --- slugs to nothing the same way. [[spec/tickets/window-verbs-windows-green]]
	at := filepath.Join(where, "---")
	seed(t, at, map[string]string{Marker: "{}", "package.json": `{"version":"0.1.0"}`, ".se/.runtime/identity.json": `{"id":"abc"}`})
	dest := filepath.Join(where, "stub")
	asked := []string{}
	said, err := StubInto(OS(), origin("git@host:a/b.git", &asked), fixed, at, dest, 7, "")
	if err != nil || said.OK || !strings.Contains(said.Why, "empty brand") || !strings.Contains(said.Why, "Rename the folder") || exists(dest) {
		t.Fatal(said, err)
	}
}

func TestStubAManifestWearsTheVersion(t *testing.T) {
	if said := VersionedJSON(`{"name":"level0","version":"9"}`, "0.1.0"); said != "{\n  \"name\": \"level0\",\n  \"version\": \"0.1.0\"\n}\n" {
		t.Fatal(said)
	}
	if said := VersionedJSON(`{"name":"level0"}`, ""); said != `{"name":"level0"}` {
		t.Fatal("an empty version leaves the text")
	}
	if said := VersionedJSON("[1]", "1"); said != "[1]" {
		t.Fatal("a list stands as it is")
	}
}
