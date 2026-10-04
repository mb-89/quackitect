// A vehicle, the project it drives, and the register between them, each case
// over a temp folder in place of the fake disk the JavaScript cases read.
// [[spec/guidance/code/testing]]
package vehicle

import (
	"os"
	"path"
	"path/filepath"
	"reflect"
	"slices"
	"strconv"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/hooks/brief"
)

// The stamp every case reads, as fakeClock hands it. [[spec/design_output/doors#a-fake-behaves]]
const fixedStamp = "2026-01-01T00:00:00.000Z"

func fixed() time.Time { return time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC) }

// Writes each file under the root, its folders first. [[spec/guidance/code/testing]]
func seed(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for rel, text := range files {
		at := filepath.Join(root, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

func readOf(t *testing.T, at string) string {
	t.Helper()
	said, err := os.ReadFile(at)
	if err != nil {
		t.Fatal(err)
	}
	return string(said)
}

func exists(at string) bool {
	_, err := os.Stat(at)
	return err == nil
}

// The method tree the JavaScript cases call /tools. [[spec/guidance/code/testing]]
func tree(t *testing.T, extra map[string]string) (string, string) {
	t.Helper()
	where := t.TempDir()
	tools := filepath.Join(where, "tools")
	files := map[string]string{
		Marker:                       "{}",
		"RUNME.sh":                   "run me",
		"spec/guidance/voice.md":     "# Actionables\n\n1. Say it plain.",
		".git/HEAD":                  "ref: main",
		".se/.runtime/identity.json": `{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}`,
	}
	for rel, text := range extra {
		files[rel] = text
	}
	seed(t, tools, files)
	return where, tools
}

func TestVehicleJSONMatchesStringify(t *testing.T) {
	read, ok := Parse(`{"b":1,"2":"<&>","a":[],"o":{},"n":null,"x":[1.5,1e21,1.5e-7,-0,0.1],"s":"\u2028\u001f\t\"\\é","b":true}`)
	if !ok {
		t.Fatal("the text parses")
	}
	want := "{\n  \"2\": \"<&>\",\n  \"b\": true,\n  \"a\": [],\n  \"o\": {},\n  \"n\": null,\n  \"x\": [\n    1.5,\n    1e+21,\n    1.5e-7,\n    0,\n    0.1\n  ],\n  \"s\": \"\u2028\\u001f\\t\\\"\\\\é\"\n}"
	if said := Stringify(read); said != want {
		t.Fatalf("stringify reads\n%s\nwant\n%s", said, want)
	}
	if _, ok := Parse("not json"); ok {
		t.Fatal("a bad text parses nothing")
	}
	if _, ok := Parse("{} {}"); ok {
		t.Fatal("two values parse as nothing")
	}
}

// [[spec/tickets/box-keys-fold-drive-letters]]
func TestVehicleRootKeyFoldsADriveLetter(t *testing.T) {
	if said := RootKey(`C:\work\tree\`); said != "c:/work/tree" {
		t.Fatal(said)
	}
	if said := RootKey("/home/user/Tree/"); said != "/home/user/Tree" {
		t.Fatal(said)
	}
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
func TestVehicleAWindowsRootInEitherCaseIsOneVehicle(t *testing.T) {
	if !Same(`C:\work\tree`, "c:/work/tree/") {
		t.Fatal("either case is one root")
	}
	if Same("/home/user/Tree", "/home/user/tree") {
		t.Fatal("a POSIX path keeps its case")
	}
	upper := `[{"id":"one","method_root":"C:\\work\\tree","port":6510}]`
	entry := NewObject()
	entry.Set("id", "two")
	entry.Set("method_root", `c:\work\tree`)
	kept := Registers(upper, entry)
	if len(kept) != 1 || JSString(get(kept[0], "id")) != "two" {
		t.Fatalf("the lower-case spelling replaces the upper-case one: %v", Stringify(kept))
	}
	list, _ := Parse(upper)
	if port := PortOf(objects(list), `c:\work\tree`); port != 6510 {
		t.Fatal(port)
	}
}

func get(v any, key string) any {
	said, _ := Get(v, key)
	return said
}

func objects(list any) []*Object {
	out := []*Object{}
	for _, one := range list.([]any) {
		out = append(out, one.(*Object))
	}
	return out
}

func TestVehicleKeepsTheIdentityItHolds(t *testing.T) {
	held, made := IdentityOf(`{"id":"abc123"}`, "fresh", "now")
	if JSString(get(held, "id")) != "abc123" || made {
		t.Fatal("a held identity stands")
	}
	fresh, made := IdentityOf("", "fresh", "now")
	if JSString(get(fresh, "id")) != "fresh" || !made {
		t.Fatal("a missing identity is made")
	}
}

func TestVehicleTheIdentityLivesInTheMethodTree(t *testing.T) {
	_, tools := tree(t, nil)
	if id, err := IdentityHere(OS(), fixed, tools, 7); err != nil || id != "abc123" {
		t.Fatal(id, err)
	}
	os.Remove(filepath.Join(tools, filepath.FromSlash(Identity)))
	made, err := IdentityHere(OS(), fixed, tools, 7)
	if err != nil {
		t.Fatal(err)
	}
	want := strconv.FormatInt(101000000000, 16) + "7"
	if made != want {
		t.Fatalf("the identity reads %s, want %s", made, want)
	}
	if again, _ := IdentityHere(OS(), fixed, tools, 7); again != made {
		t.Fatal("the identity holds")
	}
	file := readOf(t, filepath.Join(tools, filepath.FromSlash(Identity)))
	if file != "{\n  \"id\": \""+want+"\",\n  \"made\": \""+fixedStamp+"\"\n}\n" {
		t.Fatalf("the identity file reads %q", file)
	}
}

func TestVehicleARootIsFoundByItsMarker(t *testing.T) {
	where, tools := tree(t, nil)
	if said := MethodRootFrom(OS(), filepath.Join(tools, "src", "scripts")); said != filepath.ToSlash(tools) {
		t.Fatal(said)
	}
	if said := MethodRootFrom(OS(), tools); said != filepath.ToSlash(tools) {
		t.Fatal(said)
	}
	if said := MethodRootFrom(OS(), filepath.Join(where, "elsewhere", "project")); said != "" {
		t.Fatal(said)
	}
}

func TestVehicleAProjectNamesItsDriverAndForgetsIt(t *testing.T) {
	where, _ := tree(t, nil)
	work := filepath.Join(where, "work")
	if err := Attach(OS(), fixed, work, "abc123"); err != nil {
		t.Fatal(err)
	}
	at := filepath.Join(work, filepath.FromSlash(Project))
	if said := readOf(t, at); said != "{\n  \"driver\": \"abc123\",\n  \"since\": \""+fixedStamp+"\"\n}\n" {
		t.Fatalf("the project reads %q", said)
	}
	if err := Detach(OS(), work); err != nil || exists(at) {
		t.Fatal("detach removes the project", err)
	}
}

func TestVehicleTheRegisterTurnsAnIdentityIntoAPlace(t *testing.T) {
	list := Registers("[]", EntryOf("abc123", "0.1.0", "/tools", "now"))
	if Resolves(objects(list), "abc123") != "/tools" || Resolves(objects(list), "nobody") != "" {
		t.Fatal("the register resolves an identity")
	}
	again := Registers(Stringify(list), EntryOf("abc123", "0.2.0", "/tools", "later"))
	if len(again) != 1 || JSString(get(again[0], "version")) != "0.2.0" {
		t.Fatal(Stringify(again))
	}
}

func TestVehicleAnEntryNamingAPlaceNobodyHoldsIsSkipped(t *testing.T) {
	where, tools := tree(t, nil)
	home := filepath.Join(where, "home")
	seed(t, home, map[string]string{".se/.runtime/registry.json": Stringify([]any{
		EntryOf("abc123", "0.1.0", tools, "now"),
		EntryOf("gone999", "0.1.0", filepath.Join(where, "vanished"), "now"),
	})})
	list := ReadRegister(OS(), map[string]string{"HOME": home}, false)
	if len(list) != 1 || JSString(get(list[0], "id")) != "abc123" {
		t.Fatal(Stringify(list))
	}
}

func TestVehicleOneVehicleIsNoQuestion(t *testing.T) {
	if OnlyVehicle([]*Object{EntryOf("a", "1", "/tools", "now")}) != "/tools" {
		t.Fatal("one vehicle answers")
	}
	if OnlyVehicle([]*Object{EntryOf("a", "1", "/one", "now"), EntryOf("b", "1", "/two", "now")}) != "" {
		t.Fatal("two vehicles answer none")
	}
	if OnlyVehicle(nil) != "" {
		t.Fatal("none answers none")
	}
}

func TestVehicleAProjectReachesItsDriverThroughTheRegister(t *testing.T) {
	where, tools := tree(t, nil)
	env := map[string]string{"HOME": filepath.Join(where, "home")}
	work := filepath.Join(where, "work")
	if !RegisterVehicle(OS(), env, EntryOf("abc123", "0.1.0", tools, "now"), false) {
		t.Fatal("the register takes the write")
	}
	if err := Attach(OS(), fixed, work, "abc123"); err != nil {
		t.Fatal(err)
	}
	pair := RootsHere(OS(), env, work)
	if pair != (Pair{Method: tools, Work: work, Itself: false}) {
		t.Fatalf("%+v", pair)
	}
}

func TestVehicleATreeCarryingTheMarkerDrivesItself(t *testing.T) {
	where, tools := tree(t, nil)
	env := map[string]string{"HOME": filepath.Join(where, "home")}
	pair := RootsHere(OS(), env, tools)
	if pair != (Pair{Method: filepath.ToSlash(tools), Work: tools, Itself: true}) {
		t.Fatalf("%+v", pair)
	}
	if !PairOf("", "/only").Itself {
		t.Fatal("an empty method drives itself")
	}
}

// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func TestVehicleTheShimsWorkRootBeatsTheTree(t *testing.T) {
	where, tools := tree(t, nil)
	home := filepath.Join(where, "home")
	pair := RootsHere(OS(), map[string]string{"HOME": home, "SE_WORK_ROOT": "/stub"}, tools)
	if pair != (Pair{Method: filepath.ToSlash(tools), Work: "/stub", Itself: false}) {
		t.Fatalf("%+v", pair)
	}
	blank := RootsHere(OS(), map[string]string{"HOME": home, "SE_WORK_ROOT": "  "}, tools)
	if blank.Work != tools {
		t.Fatal("a blank value names nothing")
	}
}

func TestVehicleCarriesTheMethodAndNothingPrivate(t *testing.T) {
	where, tools := tree(t, nil)
	dest := filepath.Join(where, "vehicle")
	put, err := Produce(OS(), tools, dest, false)
	if err != nil || !put.OK {
		t.Fatal(put.Why, err)
	}
	if !exists(filepath.Join(dest, Marker)) || !exists(filepath.Join(dest, "spec/guidance/voice.md")) {
		t.Fatal("the method travels")
	}
	if exists(filepath.Join(dest, ".git")) || exists(filepath.Join(dest, ".se")) {
		t.Fatal("the private folders stay behind")
	}
	if Travels(".git") || Travels(".se/.runtime/bin/vale") || !Travels("src/parts/one.js") || Travels("") || Travels(".") {
		t.Fatal("travels reads the first folder")
	}
}

// [[spec/tickets/disk-door-copies-a-folder]]
func TestVehicleCopiesANestedFileByteExactAndCounts(t *testing.T) {
	bytes := "line one\r\nline two\n\ttabbed ünïcode\n"
	where, tools := tree(t, map[string]string{"src/parts/deep/one.js": bytes})
	os.Chmod(filepath.Join(tools, "RUNME.sh"), 0o755)
	dest := filepath.Join(where, "vehicle")
	put, err := Produce(OS(), tools, dest, false)
	if err != nil {
		t.Fatal(err)
	}
	if readOf(t, filepath.Join(dest, "src/parts/deep/one.js")) != bytes {
		t.Fatal("the bytes travel exact")
	}
	if info, _ := os.Stat(filepath.Join(dest, "RUNME.sh")); info.Mode().Perm()&0o100 == 0 {
		t.Fatal("the run bit travels")
	}
	count := 0
	filepath.WalkDir(dest, func(at string, one os.DirEntry, _ error) error {
		if !one.IsDir() {
			count++
		}
		return nil
	})
	if put.Count != count || count != 4 {
		t.Fatalf("the count reads %d over %d files", put.Count, count)
	}
}

func TestVehicleLandsInANewPlaceAndNeverOverItsMethod(t *testing.T) {
	where, tools := tree(t, nil)
	taken := filepath.Join(where, "taken")
	os.MkdirAll(taken, 0o755)
	if put, _ := Produce(OS(), tools, taken, false); put.OK || put.Why != taken+" stands already. A vehicle lands in a new place" {
		t.Fatal(put)
	}
	if put, _ := Produce(OS(), tools, taken, true); !put.OK {
		t.Fatal(put)
	}
	if put, _ := Produce(OS(), tools, tools, true); put.OK || put.Why != "a vehicle lands beside its method, elsewhere" {
		t.Fatal(put)
	}
	if _, err := Produce(OS(), tools, filepath.Join(tools, "inside"), false); err == nil {
		t.Fatal("a copy into its own folder fails")
	}
}

// [[spec/design_output/vehicle#a-vehicle-stands-alone]]
func TestVehicleAProducedVehicleStandsAlone(t *testing.T) {
	where := t.TempDir()
	method := filepath.Join(where, "method")
	seed(t, method, map[string]string{Marker: "{}\n", "RUNME.sh": "#!/bin/sh\n", "package.json": "{}\n", ".se/held.md": "{}\n"})
	os.Chmod(filepath.Join(method, "RUNME.sh"), 0o755)
	dest := filepath.Join(where, "vehicle")
	put, err := Produce(OS(), method, dest, false)
	if err != nil || put.Count != 3 {
		t.Fatal(put, err)
	}
	mine, _ := IdentityHere(OS(), time.Now, method, os.Getpid()+1)
	other, _ := IdentityHere(OS(), time.Now, dest, os.Getpid())
	if other == "" || other == mine || !exists(filepath.Join(dest, filepath.FromSlash(Identity))) {
		t.Fatal("the vehicle holds its own identity")
	}
	pair := RootsHere(OS(), map[string]string{}, dest)
	if pair.Method != filepath.ToSlash(dest) || pair.Work != dest || !pair.Itself {
		t.Fatalf("%+v", pair)
	}
}

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func TestVehicleImportsReadOffTheSource(t *testing.T) {
	source := strings.Join([]string{
		`import { a } from "../lib/apply.js";`,
		"import {",
		"  b,",
		`} from "./level0.js";`,
		"import c from './c.js';",
		`import "./side.js";`,
		`export { d } from "../lib/d.js";`,
		`import { join } from "node:path";`,
		`import test from "node:test";`,
		`// import { gone } from "./gone.js";`,
		`const said = "from ./text.js";`,
	}, "\n")
	want := []string{"../lib/apply.js", "./level0.js", "./c.js", "./side.js", "../lib/d.js"}
	if said := ImportsOf(source); !reflect.DeepEqual(said, want) {
		t.Fatal(said)
	}
	if len(ImportsOf("")) != 0 {
		t.Fatal("an empty source imports nothing")
	}
	if said := ModulesOf(`{"modules":["./pull-tool.js","./other.js"]}`); !reflect.DeepEqual(said, []string{"hooks/pull-tool.js", "hooks/other.js"}) {
		t.Fatal(said)
	}
	if len(ModulesOf("not json")) != 0 || len(ModulesOf("{}")) != 0 {
		t.Fatal("no manifest names no module")
	}
}

// The hook's closure, three imports deep. [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
func plugin(hook string) map[string]string {
	p := PluginFolder + "/"
	return map[string]string{
		p + "hooks/hooks.json":   `{"modules":["./pull-tool.js"]}`,
		p + "hooks/pull-tool.js": "import { register } from \"./level0.js\";\nimport {\n  spawnPromptIn,\n} from \"../lib/pull.js\";\n",
		p + "hooks/level0.js":    hook,
		p + "lib/apply.js":       "import { inRun } from \"./folders.js\";\nexport const a = 1;\n",
		p + "lib/folders.js":     "the folders lib",
		p + "lib/pull.js":        "the pull lib",
		p + "lib/log.js":         "the log lib",
		p + "lib/stray.js":       "a lib nothing imports",
		"package.json":           `{"version":"0.1.0"}`,
	}
}

const applyHook = "import { a } from \"../lib/apply.js\";\n"

func TestVehicleTheCopyTakesTheManifestsAndTheClosure(t *testing.T) {
	_, tools := tree(t, plugin(applyHook))
	said := FilesOf(OS(), tools)
	slices.Sort(said)
	want := []string{".claude-plugin/plugin.json", "hooks/hooks.json", "hooks/level0.js", "hooks/pull-tool.js", "lib/apply.js", "lib/folders.js", "lib/pull.js"}
	if !reflect.DeepEqual(said, want) {
		t.Fatal(said)
	}
}

func TestVehicleAHookTakingANewImportHandsTheCopyThatFile(t *testing.T) {
	where, tools := tree(t, plugin(applyHook))
	env := map[string]string{"HOME": filepath.Join(where, "home")}
	stub := filepath.Join(where, "stub")
	if _, err := AttachTo(OS(), env, fixed, stub, tools, 7, false); err != nil {
		t.Fatal(err)
	}
	if exists(filepath.Join(stub, PluginFolder, "lib/log.js")) {
		t.Fatal("the hook imports no log lib yet")
	}

	where, tools = tree(t, plugin(applyHook+"import { SESSION } from \"../lib/log.js\";\n"))
	stub = filepath.Join(where, "stub")
	if _, err := AttachTo(OS(), env, fixed, stub, tools, 7, false); err != nil {
		t.Fatal(err)
	}
	if readOf(t, filepath.Join(stub, PluginFolder, "lib/log.js")) != "the log lib" {
		t.Fatal("the copy reads the new import off the hook")
	}
}

func TestVehicleAttachWritesDriverRegisterPointerAndClosure(t *testing.T) {
	where, tools := tree(t, plugin(applyHook))
	home := filepath.Join(where, "home")
	env := map[string]string{"HOME": home}
	stub := filepath.Join(where, "stub")
	said, err := AttachTo(OS(), env, fixed, stub, tools, 7, false)
	if err != nil {
		t.Fatal(err)
	}
	if said.Method != tools || said.Port != 6510 || said.Itself || !said.Made {
		t.Fatalf("%+v", said)
	}
	if driven := DrivenOf(readOf(t, filepath.Join(stub, filepath.FromSlash(Project)))); driven == nil || JSString(get(driven, "driver")) != "abc123" {
		t.Fatal("the driver")
	}
	pointer := readOf(t, filepath.Join(stub, filepath.FromSlash(Pointer)))
	quoted := Stringify(tools)
	if pointer != "{\n  \"method\": "+quoted+",\n  \"port\": 6510\n}\n" {
		t.Fatalf("the pointer reads %q", pointer)
	}
	into := filepath.Join(stub, PluginFolder)
	if readOf(t, filepath.Join(into, "hooks/hooks.json")) != `{"modules":["./pull-tool.js"]}` || readOf(t, filepath.Join(into, ".claude-plugin/plugin.json")) != "{}" {
		t.Fatal("the manifests")
	}
	for _, rel := range []string{"hooks/pull-tool.js", "hooks/level0.js", "lib/apply.js", "lib/folders.js", "lib/pull.js"} {
		if readOf(t, filepath.Join(into, rel)) != readOf(t, filepath.Join(tools, PluginFolder, rel)) {
			t.Fatal(rel + " travels")
		}
	}
	if exists(filepath.Join(into, "lib/stray.js")) {
		t.Fatal("a lib nothing imports stays behind")
	}
	register := readOf(t, filepath.Join(home, ".se/.runtime/registry.json"))
	want := "[\n  {\n    \"id\": \"abc123\",\n    \"version\": \"0.1.0\",\n    \"method_root\": " + quoted + ",\n    \"registered\": \"" + fixedStamp + "\",\n    \"port\": 6510\n  }\n]\n"
	if register != want {
		t.Fatalf("the register reads\n%s", register)
	}
	again, err := AttachTo(OS(), env, fixed, stub, tools, 7, false)
	if err != nil || again.Port != 6510 || again.Made {
		t.Fatalf("a second attach keeps the port: %+v", again)
	}
}

// [[spec/design_output/doors#a-door-reads-the-outside]]
func TestVehicleThePortRoadMakesAnIdentityOffThePid(t *testing.T) {
	where := t.TempDir()
	tools := filepath.Join(where, "tools")
	seed(t, tools, map[string]string{"package.json": `{"version":"0.1.0"}`})
	if _, err := RegisteredPort(OS(), map[string]string{"SE_REGISTRY": filepath.Join(where, "reg")}, fixed, tools, 7, false); err != nil {
		t.Fatal(err)
	}
	made, _ := Parse(readOf(t, filepath.Join(tools, filepath.FromSlash(Identity))))
	if !strings.HasSuffix(JSString(get(made, "id")), "7") {
		t.Fatal(Stringify(made))
	}
}

func TestVehicleTheRegisterSplitsItsListTheWayTheCallerSays(t *testing.T) {
	env := map[string]string{"SE_REGISTRY": "/one;/two"}
	if said := RegisterDirs(env, true); !reflect.DeepEqual(said, []string{"/one", "/two"}) {
		t.Fatal(said)
	}
	if said := RegisterDirs(env, false); !reflect.DeepEqual(said, []string{"/one;/two"}) {
		t.Fatal(said)
	}
	if said := RegisterDirs(map[string]string{"SE_REGISTRY": "/one:/two"}, false); !reflect.DeepEqual(said, []string{"/one", "/two"}) {
		t.Fatal(said)
	}
	if said := RegisterDirs(map[string]string{"HOME": "/h", "USERPROFILE": "/u"}, false); !reflect.DeepEqual(said, []string{filepath.Join("/u", ".se", ".runtime")}) {
		t.Fatal(said)
	}
	if said := RegisterDirs(map[string]string{}, false); len(said) != 0 {
		t.Fatal(said)
	}
}

func TestVehicleThePortReadingTakesThePlatform(t *testing.T) {
	where := t.TempDir()
	tools := filepath.Join(where, "tools")
	one := filepath.Join(where, "one")
	seed(t, tools, map[string]string{Marker: "{}"})
	seed(t, one, map[string]string{Register: Stringify([]any{EntryOf("abc123", "0.1.0", tools, "now")})})
	list, _ := Parse(readOf(t, filepath.Join(one, Register)))
	list.([]any)[0].(*Object).Set("port", float64(6543))
	seed(t, one, map[string]string{Register: Stringify(list)})
	port, err := RegisteredPort(OS(), map[string]string{"SE_REGISTRY": one + ";" + filepath.Join(where, "two")}, fixed, tools, 7, true)
	if err != nil || port != 6543 {
		t.Fatal(port, err)
	}
}

func TestVehicleWithPortTakesTheFirstFreePort(t *testing.T) {
	list, _ := Parse(`[{"id":"a","method_root":"/a","port":6510},{"id":"b","method_root":"/b","port":"6511"}]`)
	said := WithPort(objects(list), EntryOf("c", "1", "/c", "now"))
	if Stringify(get(said, "port")) != "6512" {
		t.Fatal(Stringify(said))
	}
	mine := WithPort(objects(list), EntryOf("a", "1", "/a", "now"))
	if Stringify(get(mine, "port")) != "6510" {
		t.Fatal("an entry's own port stays free to it")
	}
	if method, port, ok := PointerOf(`{"method":"/m"}`); !ok || method != "/m" || port != PortBase {
		t.Fatal(method, port, ok)
	}
}

// The pointer stands under the runtime folder brief.ToolsFile names, which .claude/skills/level0/lib/folders.js owns. [[spec/design_input/the-runtime-files-stand-apart]]
func TestPointerStandsInTheRuntimeFolder(t *testing.T) {
	if !strings.HasPrefix(Pointer, path.Dir(brief.ToolsFile)+"/") {
		t.Errorf("%s stands outside %s", Pointer, path.Dir(brief.ToolsFile))
	}
}
