// The vehicle verb over a temp method: here, produce, into, attach, detach and
// register, each line as the JavaScript verb prints it.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/vehicle"
)

// The stamp the fixed clock answers. [[spec/design_output/doors#a-fake-behaves]]
const vehicleTestStamp = "2026-01-01T00:00:00.000Z"

// Writes each file under the root through the vehicle's disk door, its folders first. [[spec/guidance/code/testing]]
func vehicleSeed(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for rel, text := range files {
		at := filepath.Join(root, filepath.FromSlash(rel))
		if err := vehicle.OS().MakeDir(filepath.Dir(at)); err != nil {
			t.Fatal(err)
		}
		if err := vehicle.OS().Write(at, text); err != nil {
			t.Fatal(err)
		}
	}
}

// The text a file holds, read through the vehicle's disk door. [[spec/tickets/test-walks-move-onto-fakes]]
func vehicleRead(t *testing.T, at string) string {
	t.Helper()
	said, err := vehicle.OS().Read(at)
	if err != nil {
		t.Fatal(err)
	}
	return said
}

// Whether a path stands, read through the vehicle's disk door. [[spec/tickets/test-walks-move-onto-fakes]]
func vehicleExists(at string) bool { return vehicle.OS().Exists(at) }

// A method holding the marker, its identity, the package and the hook's closure, and the doors over it. [[spec/design_output/doors#a-door-reads-the-outside]]
func vehicleFixture(t *testing.T) (string, vehicleDoors) {
	t.Helper()
	where := t.TempDir()
	method := filepath.Join(where, "method")
	p := vehicle.PluginFolder + "/"
	vehicleSeed(t, method, map[string]string{
		vehicle.Marker:               "{}",
		"RUNME.sh":                   "#!/bin/sh\n",
		"package.json":               `{"version":"0.1.0"}`,
		".se/.runtime/identity.json": `{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}`,
		".se/held.md":                "private",
		p + "hooks/hooks.json":       `{"modules":["./level0.js"]}`,
		p + "hooks/level0.js":        "import { a } from \"../lib/apply.js\";\n",
		p + "lib/apply.js":           "export const a = 1;\n",
		".claude/settings.json":      `{"$comment":"x","env":{}}`,
		"src/stub/RUNME.sh":          "the shim",
		"src/stub/" + vehicle.Marker: `{"name":"level0"}`,
	})
	return where, vehicleDoors{
		env:  map[string]string{"HOME": filepath.Join(where, "home")},
		root: method,
		now:  func() time.Time { return time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC) },
		pid:  7,
		git: func(string, ...string) (string, bool) {
			return "git@host:a/b.git", true
		},
	}
}

// Runs the vehicle twin over the doors, and answers its code, its output and its errors. [[spec/guidance/code/testing]]
func vehicleRun(doors vehicleDoors, dry bool, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := vehicleTwin(func() vehicleDoors { return doors })(append([]string{"vehicle"}, argv...), dry, &out, &errs)
	return code, out.String(), errs.String()
}

func TestVehicleVerbHereNamesTheRootsAndTheRegister(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	// Both roots print slashed, the method as methodRootFrom answered it. [[spec/tickets/window-verbs-windows-green]] [[spec/tickets/window-verbs-here-one-spelling]]
	method := filepath.ToSlash(doors.root)
	code, out, _ := vehicleRun(doors, false)
	want := "method  " + method + "\nwork    " + method + "\nvehicle abc123  (this tree drives itself)\n"
	if code != 0 || out != want {
		t.Fatalf("here answers %d:\n%s", code, out)
	}
	if code, _, _ := vehicleRun(doors, false, "register"); code != 0 {
		t.Fatal("the register takes the write")
	}
	work := filepath.ToSlash(filepath.Join(where, "work"))
	doors.env["SE_WORK_ROOT"] = strings.ReplaceAll(work, "/", `\`)
	code, out, _ = vehicleRun(doors, false, "here")
	want = "method  " + method + "\nwork    " + work + "\nvehicle abc123\n  abc123  0.1.0  " + method + "\n"
	if code != 0 || out != want {
		t.Fatalf("here answers %d:\n%s", code, out)
	}
}

func TestVehicleVerbProduceSaysWhereTheVehicleLands(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	code, out, errs := vehicleRun(doors, false, "produce")
	if code != 2 || out != "" || errs != "se vehicle produce <folder>: say where the vehicle lands.\n" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	if code, _, errs := vehicleRun(doors, false, "into"); code != 2 || !strings.HasPrefix(errs, "se vehicle produce") {
		t.Fatal("into takes the same usage")
	}
}

func TestVehicleVerbProduceCopiesTheMethod(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	dest := filepath.Join(where, "vehicle")
	code, out, errs := vehicleRun(doors, false, "produce", dest)
	if code != 0 || errs != "" {
		t.Fatalf("%d %q", code, errs)
	}
	want := "9 file(s) copied into " + dest + ".\nIt makes its own identity the first time it runs.\n"
	if out != want {
		t.Fatalf("produce prints\n%s", out)
	}
	if vehicleExists(filepath.Join(dest, ".se")) || !vehicleExists(filepath.Join(dest, vehicle.Marker)) {
		t.Fatal("the method travels and its private folder stays")
	}
	code, out, errs = vehicleRun(doors, false, "produce", dest)
	if code != 1 || out != "" || errs != dest+" stands already. A vehicle lands in a new place\n" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	if code, out, _ := vehicleRun(doors, false, "into", dest); code != 0 || !strings.HasPrefix(out, "9 file(s) copied") {
		t.Fatal("into lands over a folder standing", code, out)
	}
	if code, _, errs := vehicleRun(doors, false, "into", doors.root); code != 1 || errs != "a vehicle lands beside its method, elsewhere\n" {
		t.Fatal(code, errs)
	}
}

func TestVehicleVerbAttachAndDetach(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	work := filepath.Join(where, "work")
	doors.env["SE_WORK_ROOT"] = work
	code, out, errs := vehicleRun(doors, false, "attach")
	if code != 0 || out != work+" names abc123 as the vehicle driving it, at port 6510.\n" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	project := filepath.Join(work, filepath.FromSlash(vehicle.Project))
	if vehicleRead(t, project) != "{\n  \"driver\": \"abc123\",\n  \"since\": \""+vehicleTestStamp+"\"\n}\n" {
		t.Fatal(vehicleRead(t, project))
	}
	if vehicleRead(t, filepath.Join(work, vehicle.PluginFolder, "lib/apply.js")) != "export const a = 1;\n" {
		t.Fatal("the hook's closure travels")
	}
	code, out, _ = vehicleRun(doors, false, "detach")
	if code != 0 || out != work+" names no driver, so the next start asks again.\n" || vehicleExists(project) {
		t.Fatalf("%d %q", code, out)
	}
}

func TestVehicleVerbRegister(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	code, out, _ := vehicleRun(doors, false, "register")
	if code != 0 || out != "abc123 stands in the register.\n" {
		t.Fatalf("%d %q", code, out)
	}
	want := "[\n  {\n    \"id\": \"abc123\",\n    \"version\": \"0.1.0\",\n    \"method_root\": \"" + filepath.ToSlash(doors.root) + "\",\n    \"registered\": \"" + vehicleTestStamp + "\"\n  }\n]\n"
	if said := vehicleRead(t, filepath.Join(where, "home", ".se", ".runtime", "registry.json")); said != want {
		t.Fatalf("the register reads\n%s", said)
	}
	doors.env = map[string]string{}
	code, out, _ = vehicleRun(doors, false, "register")
	if code != 1 || out != "no register takes a write here.\n" {
		t.Fatalf("%d %q", code, out)
	}
}

// The version off the root's package, as cli-read.js version reads it. [[spec/design_output/vehicle#one-file-holds-the-version]]
func TestVehicleVerbMakesAnIdentityOnEveryRoad(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	_ = vehicle.OS().Remove(filepath.Join(doors.root, filepath.FromSlash(vehicle.Identity)))
	code, _, _ := vehicleRun(doors, false, "detach")
	if code != 0 || !vehicleExists(filepath.Join(doors.root, filepath.FromSlash(vehicle.Identity))) {
		t.Fatal("every road makes the identity")
	}
}

// A dry run answers its lines and writes nothing. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestVehicleVerbDryWritesNothing(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	dest := filepath.Join(where, "vehicle")
	code, out, _ := vehicleRun(doors, true, "produce", dest)
	if code != 0 || !strings.HasPrefix(out, "9 file(s) copied") || vehicleExists(dest) {
		t.Fatalf("%d %q", code, out)
	}
	if code, _, _ := vehicleRun(doors, true, "register"); code != 0 || vehicleExists(filepath.Join(where, "home")) {
		t.Fatal("a dry register writes nothing")
	}
}

// The node module answers the verb through goAnswer, into one builder. [[spec/tickets/quack-registers-each-verb]]
func TestVehicleVerbAnswersThroughTheNodeModule(t *testing.T) {
	t.Parallel()
	if _, one := twinOf([]string{"vehicle", "here"}, registry); one == nil {
		t.Fatal("the registry holds vehicle")
	}
	_, doors := vehicleFixture(t)
	said, err := goAnswer([]string{"vehicle", "produce"}, vehicleTwin(func() vehicleDoors { return doors }))
	if err == nil || said != nil || !strings.Contains(err.Error(), "exit status 2: se vehicle produce <folder>") {
		t.Fatal(said, err)
	}
}
