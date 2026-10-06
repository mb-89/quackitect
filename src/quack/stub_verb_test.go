// The stub verb over a temp method: the usage, a stub beside its vehicle, no
// upstream, an empty brand and a written stub.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/vehicle"
)

// Runs the stub twin over the doors, and answers its code, its output and its errors. [[spec/guidance/code/testing]]
func stubRun(doors vehicleDoors, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	code := stubTwin(func() vehicleDoors { return doors })(append([]string{"stub"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

const stubUsage = "se stub into <folder> [--upstream <url>]: say where the stub lands.\n"

func TestStubVerbUsage(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	for _, argv := range [][]string{{}, {"into"}, {"onto", "x"}, {"into", "--upstream", "u"}} {
		if code, out, errs := stubRun(doors, argv...); code != 2 || out != "" || errs != stubUsage {
			t.Fatalf("%v answers %d %q %q", argv, code, out, errs)
		}
	}
}

func TestStubVerbBesideItsVehicle(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	code, _, errs := stubRun(doors, "into", doors.root)
	if code != 1 || errs != "a stub lands beside its vehicle, elsewhere\n" {
		t.Fatalf("%d %q", code, errs)
	}
}

func TestStubVerbNoUpstream(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	asked := ""
	doors.git = func(dir string, args ...string) (string, bool) {
		asked = dir + " " + strings.Join(args, " ")
		return "", false
	}
	dest := filepath.Join(where, "stub")
	code, out, errs := stubRun(doors, "into", dest)
	if code != 1 || out != "" || errs != "the vehicle has no remote a cloud box can clone. Give it one, or say --upstream <url>.\n" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	if asked != filepath.ToSlash(doors.root)+" remote get-url origin" {
		t.Fatal("git runs in the method root:", asked)
	}
	if vehicleExists(dest) {
		t.Fatal("a refusal writes nothing")
	}
}

func TestStubVerbEmptyBrand(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	// Windows names no folder ..., and --- slugs to nothing the same way. [[spec/tickets/window-verbs-windows-green]]
	nameless := filepath.Join(filepath.Dir(doors.root), "---")
	if err := os.Rename(doors.root, nameless); err != nil {
		t.Fatal(err)
	}
	doors.root = nameless
	code, _, errs := stubRun(doors, "into", "stub")
	if code != 1 || errs != "--- carries no letter and no digit, so it slugs to an empty brand. Rename the folder to one a marketplace takes, or move the vehicle into one.\n" {
		t.Fatalf("%d %q", code, errs)
	}
}

func TestStubVerbWritesAStubUnderTheUpstreamItNames(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	dest := filepath.Join(where, "stub")
	code, out, errs := stubRun(doors, "into", dest, "--upstream", "https://host/c/d.git")
	want := "7 file(s) written into " + dest + ".\nIts shim finds the vehicle through SE_VEHICLE, the register, or where a cloud box clones it.\n"
	if code != 0 || out != want || errs != "" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	record := vehicleRead(t, filepath.Join(dest, vehicle.Link))
	wantRecord := "{\n  \"vehicle\": \"abc123\",\n  \"name\": \"method\",\n  \"upstream\": \"https://host/c/d.git\",\n  \"version\": \"0.1.0\",\n  \"made\": \"" + vehicleTestStamp + "\"\n}\n"
	if record != wantRecord {
		t.Fatalf("the record reads\n%s", record)
	}
	if vehicleRead(t, filepath.Join(dest, vehicle.Settings)) != "{\n  \"env\": {}\n}\n" {
		t.Fatal("the settings drop their comment")
	}
	if !vehicleExists(filepath.Join(dest, "stub", "spec", "tickets", ".gitkeep")) {
		t.Fatal("the folders take the stub's own name")
	}
}

// A relative folder lands under the root, as atRoot places it. [[spec/design_output/vehicle#the-work-root-inherits]]
func TestStubVerbPlacesARelativeFolderUnderTheRoot(t *testing.T) {
	t.Parallel()
	_, doors := vehicleFixture(t)
	code, out, _ := stubRun(doors, "into", "inner")
	if code != 0 || !strings.HasPrefix(out, "7 file(s) written into inner.\n") {
		t.Fatalf("%d %q", code, out)
	}
	if !vehicleExists(filepath.Join(doors.root, "inner", vehicle.Link)) {
		t.Fatal("the stub lands under the root")
	}
}

func TestStubVerbStandsInTheRegistry(t *testing.T) {
	t.Parallel()
	if _, one := twinOf([]string{"stub", "into"}, registry); one == nil {
		t.Fatal("the registry holds stub")
	}
}
