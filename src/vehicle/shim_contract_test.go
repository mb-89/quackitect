//go:build contract

// The real shim, run by sh against a vehicle of one script that says what
// reaches it, so each case proves the hand-over and runs no install.
// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
package vehicle

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A vehicle of one script at the folder named. [[spec/design_output/vehicle#a-vehicle-stands-alone]]
func shimVehicle(t *testing.T, at string) string {
	t.Helper()
	seed(t, at, map[string]string{"RUNME.sh": shimSays})
	return at
}

// A path as sh prints it, in either slash, read without case, since pwd -W answers a drive letter on Windows. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func samePath(said, want string) bool {
	flat := func(path string) string { return strings.ToLower(filepath.ToSlash(path)) }
	return flat(said) == flat(want)
}

// The vehicle answers every argument, and the stub stands as the work root. [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
func handsOver(t *testing.T, stdout, stub, argv string) {
	t.Helper()
	lines := strings.Split(strings.TrimSpace(stdout), "\n")
	if len(lines) != 2 || lines[0] != "argv="+argv || !samePath(strings.TrimPrefix(lines[1], "work="), stub) {
		t.Fatalf("the vehicle reads %q, and wants argv=%s and work=%s", stdout, argv, stub)
	}
}

func TestTheShimHandsEveryArgumentToTheVehicleSEVehicleNames(t *testing.T) {
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": vehicle, "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "check", "one")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "check one")
}

func TestTheShimFindsTheVehicleThroughTheRegisterWhereSEVehicleStandsEmpty(t *testing.T) {
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	register := filepath.Join(where, "register")
	seed(t, register, map[string]string{
		"registry.json": `[{"id": "other", "method_root": "` + filepath.ToSlash(filepath.Join(where, "nowhere")) + `"}, {"id": "` + shimID + `", "method_root": "` + filepath.ToSlash(vehicle) + `"}]`,
	})
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": "", "SE_REGISTRY": register, "HOME": where}, "vehicle")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "vehicle")
}

func TestTheShimFindsTheCloneUnderHomeWhereNeitherRoadAnswers(t *testing.T) {
	where, stub := shimStub(t)
	shimVehicle(t, filepath.Join(where, ".se", "vehicles", shimName))
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": "", "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "vehicle")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "vehicle")
}

// The shim calls the vehicle's binary with vehicle enable, the stub as the work root, discards what it says, and still hands every argument on. [[spec/tickets/stub-settings-shim-runs-in-go]]
func TestTheShimEnablesThePluginThroughTheVehicleBinary(t *testing.T) {
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	said := filepath.Join(where, "enabled")
	bin := filepath.Join(vehicle, ".se", ".runtime", "bin", "se-index")
	seed(t, vehicle, map[string]string{
		".se/.runtime/bin/se-index": "#!/usr/bin/env sh\nprintf 'argv=%s\\nwork=%s\\n' \"$*\" \"$SE_WORK_ROOT\" > '" + said + "'\nprintf 'the binary speaks\\n'\n",
	})
	if err := os.Chmod(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": vehicle, "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "check", "one")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "check one")
	recorded, err := os.ReadFile(said)
	if err != nil {
		t.Fatalf("the shim never calls the vehicle binary: %v", err)
	}
	lines := strings.Split(strings.TrimSpace(string(recorded)), "\n")
	if len(lines) != 2 {
		t.Fatalf("the binary records %q", recorded)
	}
	argv := strings.Fields(strings.TrimPrefix(lines[0], "argv="))
	if len(argv) != 4 || argv[0] != "verb" || !samePath(argv[1], filepath.Join(vehicle, "src", "scripts")) || argv[2] != "vehicle" || argv[3] != "enable" {
		t.Fatalf("the binary hears %q, and wants verb %s vehicle enable", lines[0], filepath.Join(vehicle, "src", "scripts"))
	}
	if !samePath(strings.TrimPrefix(lines[1], "work="), stub) {
		t.Fatalf("the binary runs with %q, and wants work=%s", lines[1], stub)
	}
}

// Where the vehicle binary fails, the shim prints the standing fallback line and still hands every argument on. [[spec/tickets/stub-settings-shim-runs-in-go]]
func TestTheShimPrintsTheFallbackAndStillHandsOnWhereTheVehicleBinaryFails(t *testing.T) {
	const fallback = "The marketplace reached no settings, so this session loads the plugin from wherever it already stands."
	where, stub := shimStub(t)
	vehicle := shimVehicle(t, filepath.Join(where, "vehicle"))
	bin := filepath.Join(vehicle, ".se", ".runtime", "bin", "se-index")
	seed(t, vehicle, map[string]string{
		".se/.runtime/bin/se-index": "#!/usr/bin/env sh\nprintf 'the binary fails\\n' >&2\nexit 1\n",
	})
	if err := os.Chmod(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": vehicle, "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "check", "one")
	if code != 0 {
		t.Fatalf("the shim exits %d: %s", code, errs)
	}
	handsOver(t, out, stub, "check one")
	if !strings.Contains(errs, fallback) {
		t.Fatalf("the shim says %q on stderr, and wants the fallback line %q", errs, fallback)
	}
}

func TestAShimFindingNoVehicleExitsOneOnALineNamingTheUpstreamAndTheCloneFolder(t *testing.T) {
	where, stub := shimStub(t)
	code, out, errs := runShim(t, stub, map[string]string{"SE_VEHICLE": filepath.Join(where, "nowhere"), "SE_REGISTRY": filepath.Join(where, "empty"), "HOME": where}, "vehicle")
	line := strings.TrimSpace(errs)
	if code != 1 || out != "" || strings.Contains(line, "\n") {
		t.Fatalf("the shim exits %d with %q and %q, and wants one, nothing and one line", code, out, errs)
	}
	if !strings.Contains(line, shimUpstream) || !strings.Contains(filepath.ToSlash(line), ".se/vehicles/"+shimName) {
		t.Fatalf("the line %q names no upstream or clone folder", line)
	}
}
