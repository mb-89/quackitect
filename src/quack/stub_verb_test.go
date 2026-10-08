// The stub verb over a temp method: the usage, a stub beside its vehicle, no
// upstream, an empty brand and a written stub.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"slices"
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
	vehicleSeed(t, nameless, map[string]string{vehicle.Marker: "{}", "package.json": `{"version":"0.1.0"}`, ".se/.runtime/identity.json": `{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}`})
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

func TestAFolderNameAnswersTheSlugAMarketplaceTakes(t *testing.T) {
	t.Parallel()
	for path, want := range map[string]string{
		"/x/quackitect": "quackitect", "/x/my.app": "my-app", "/x/Acme Tools": "acme-tools",
		"/x/.hidden": "hidden", `C:\x\Desk\`: "desk", "/x/...": "",
	} {
		if got := brandOf(path); got != want {
			t.Errorf("brandOf(%q) = %q, want %q", path, got, want)
		}
	}
}

func TestTheBrandReachesTheMarketplaceNameItsOwnerAndThePluginsAuthor(t *testing.T) {
	t.Parallel()
	got := brandedJSON(`{"name":"old","owner":{"name":"old","email":"e"},"plugins":[]}`, "acme")
	want := "{\n  \"name\": \"acme\",\n  \"owner\": {\n    \"name\": \"acme\",\n    \"email\": \"e\"\n  },\n  \"plugins\": []\n}\n"
	if got != want {
		t.Errorf("the marketplace reads\n%s", got)
	}
	got = brandedJSON(`{"name":"level0","author":{}}`, "acme")
	want = "{\n  \"name\": \"level0\",\n  \"author\": {\n    \"name\": \"acme\"\n  }\n}\n"
	if got != want {
		t.Errorf("the plugin reads\n%s", got)
	}
}

func TestTextThatReadsAsNoObjectStandsAsItIs(t *testing.T) {
	t.Parallel()
	for _, text := range []string{"not json", "[1]", `"x"`, "{} {}"} {
		if got := brandedJSON(text, "acme"); got != text {
			t.Errorf("brandedJSON(%q) = %q", text, got)
		}
		if got := versionedJSON(text, "1.0.0"); got != text {
			t.Errorf("versionedJSON(%q) = %q", text, got)
		}
	}
}

func TestTheVersionLandsInPlaceOrLastAndAnEmptyOneLeavesTheText(t *testing.T) {
	t.Parallel()
	if got := versionedJSON(`{"version":"0","name":"n"}`, "2.0.0"); got != "{\n  \"version\": \"2.0.0\",\n  \"name\": \"n\"\n}\n" {
		t.Errorf("in place: %q", got)
	}
	if got := versionedJSON(`{"name":"n"}`, "2.0.0"); got != "{\n  \"name\": \"n\",\n  \"version\": \"2.0.0\"\n}\n" {
		t.Errorf("last: %q", got)
	}
	if got := versionedJSON(`{"name":"n"}`, ""); got != `{"name":"n"}` {
		t.Errorf("empty: %q", got)
	}
}

func TestAStampWritesEveryTargetOffTheBrandFolderAndASecondWritesNothing(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, map[string]string{
		"package.json":                    `{"version":"1.2.3"}`,
		brandFolder + "/marketplace.json": `{"name":"","owner":{"name":""}}`,
		brandFolder + "/plugin.json":      `{"name":"level0","author":{"name":""}}`,
		brandFolder + "/icon.svg":         "<svg/>",
		extensionTarget:                   `{"name":"ext","version":"0.0.0"}`,
	})
	done, err := stamps(disk, root, "acme")
	if err != nil {
		t.Fatal(err)
	}
	if want := []string{marketplaceTarget, pluginTarget, extensionTarget, iconTarget}; !slices.Equal(done, want) {
		t.Fatalf("the stamp writes %v, want %v", done, want)
	}
	plugin := disk.text(filepath.Join(root, filepath.FromSlash(pluginTarget)))
	if plugin != "{\n  \"name\": \"level0\",\n  \"author\": {\n    \"name\": \"acme\"\n  },\n  \"version\": \"1.2.3\"\n}\n" {
		t.Errorf("the plugin reads\n%s", plugin)
	}
	if again, _ := stamps(disk, root, "acme"); len(again) != 0 {
		t.Errorf("a second stamp writes %v", again)
	}
}

func TestACloneHoldingNoSourceAndNoTargetTakesTheShapes(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	if err := disk.makeAll(root, 0o755); err != nil {
		t.Fatal(err)
	}
	done, err := stamps(disk, root, "acme")
	if err != nil {
		t.Fatal(err)
	}
	if want := []string{marketplaceTarget, pluginTarget}; !slices.Equal(done, want) {
		t.Fatalf("the stamp writes %v, want %v", done, want)
	}
	market := disk.text(filepath.Join(root, filepath.FromSlash(marketplaceTarget)))
	if held := objectOf(market); held == nil || held.values["name"] != "acme" || len(held.values["plugins"].([]any)) != 1 {
		t.Errorf("the marketplace reads\n%s", market)
	}
}

func TestATargetStandingWithNoSourceReadsAsItsOwnSource(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	hq1SeedDisk(t, disk, root, map[string]string{marketplaceTarget: "{\n  \"name\": \"acme\",\n  \"owner\": {\n    \"name\": \"acme\"\n  }\n}\n"})
	done, _ := stamps(disk, root, "acme")
	if slices.Contains(done, marketplaceTarget) {
		t.Errorf("a stamped target with no source takes a write: %v", done)
	}
}
