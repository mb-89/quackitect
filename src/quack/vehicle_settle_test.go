// The vehicle verb's settle word, which names the method root a work reaches,
// making the work a project of this vehicle where it names none.
// [[spec/design_output/vehicle#the-register-holds-the-port]]
package main

import (
	"path/filepath"
	"testing"

	"quackitect/src/vehicle"
)

func TestVehicleSettleNamesThePointedMethod(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	work := filepath.Join(where, "work")
	vehicleSeed(t, work, map[string]string{vehicle.Pointer: `{"method":"/elsewhere","port":6511}`})
	doors.env["SE_WORK_ROOT"] = work
	code, out, errs := vehicleRun(doors, false, "settle")
	if code != 0 || out != "method /elsewhere\n" || errs != "" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	if vehicleExists(filepath.Join(work, vehicle.PluginFolder, "lib/apply.js")) {
		t.Fatal("a work naming its method takes no copy of the plugin")
	}
}

func TestVehicleSettleMakesABareWorkAProject(t *testing.T) {
	t.Parallel()
	where, doors := vehicleFixture(t)
	work := filepath.Join(where, "work")
	doors.env["SE_WORK_ROOT"] = work
	code, out, errs := vehicleRun(doors, false, "settle")
	if code != 0 || out != "method "+doors.root+"\n" || errs != "" {
		t.Fatalf("%d %q %q", code, out, errs)
	}
	if method, _, ok := vehicle.PointerOf(vehicleRead(t, filepath.Join(work, filepath.FromSlash(vehicle.Pointer)))); !ok || method != doors.root {
		t.Fatal("the work's pointer names this vehicle", method)
	}
	if vehicleRead(t, filepath.Join(work, vehicle.PluginFolder, "lib/apply.js")) != "export const a = 1;\n" {
		t.Fatal("the hook's closure travels into the work")
	}
}
