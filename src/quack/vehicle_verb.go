// The vehicle verb in Go: this vehicle, the project it drives, and a vehicle
// made elsewhere, over src/vehicle.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"quackitect/src/index"
	"quackitect/src/proc"
	"quackitect/src/vehicle"
)

func init() { register("vehicle", vehicleTwin(vehicleOutside)) }

// What the vehicle and stub verbs read off the outside: the environment, the tree they run from, the clock, the pid, git in a folder, and the platform. [[spec/design_output/doors#a-door-reads-the-outside]]
type vehicleDoors struct {
	env     map[string]string
	root    string
	now     func() time.Time
	pid     int
	windows bool
	git     func(dir string, args ...string) (string, bool)
}

// The real doors, read at each run. [[spec/design_output/doors#a-door-reads-the-outside]]
func vehicleOutside() vehicleDoors {
	return vehicleDoors{
		env:     vehicleEnv(os.Environ()),
		root:    vehicleRootHere(),
		now:     time.Now,
		pid:     os.Getpid(),
		windows: runtime.GOOS == "windows",
		git:     vehicleGit,
	}
}

// The environment as a map, the way process.env reads it. [[spec/design_output/doors#a-door-reads-the-outside]]
func vehicleEnv(pairs []string) map[string]string {
	out := map[string]string{}
	for _, one := range pairs {
		if key, value, ok := strings.Cut(one, "="); ok {
			out[key] = value
		}
	}
	return out
}

// The tree the verb runs from: the root the index door hands, else the tree the binary stands in, else the index's root. [[spec/design_output/vehicle#the-work-root-inherits]]
func vehicleRootHere() string {
	if said := os.Getenv("QUACKITECT_ROOT"); said != "" {
		if abs, err := filepath.Abs(said); err == nil {
			return abs
		}
	}
	if bin, err := os.Executable(); err == nil {
		if real, err := filepath.EvalSymlinks(bin); err == nil {
			bin = real
		}
		root := filepath.Dir(filepath.Dir(filepath.Dir(filepath.Dir(bin))))
		if filepath.Join(root, ".se", ".runtime", "bin") == filepath.Dir(bin) { // the runtime folder src/modules/check/folders.go owns
			return root
		}
	}
	if root, err := index.Root(); err == nil {
		return root
	}
	return "."
}

// Git in a folder: its trimmed output, and whether it exited zero, its errors kept quiet. [[spec/design_output/doors#a-door-standing-on-another]]
func vehicleGit(dir string, args ...string) (string, bool) {
	said := proc.Real(proc.Command{Argv: append([]string{"git"}, args...), Dir: dir})
	return strings.TrimSpace(said.Out), said.Code == 0
}

// The disk the verb writes through, which writes nothing where the run is dry. [[spec/tickets/runme-hands-verbs-to-quack]]
func vehicleDisk(dry bool) vehicle.Disk {
	if dry {
		return vehicle.Dry(vehicle.OS())
	}
	return vehicle.OS()
}

// The vehicle verb: here, produce, into, attach, detach, register, settle and enable, over the doors. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func vehicleTwin(doorsOf func() vehicleDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		doors := doorsOf()
		disk := vehicleDisk(dry)
		words := argv[1:]
		said := "here"
		if len(words) > 0 {
			said = words[0]
		}
		pair := vehicle.RootsHere(disk, doors.env, doors.root)
		id, entry, err := vehicle.EntryFor(disk, doors.now, pair.Method, vehicle.VersionOf(disk, doors.root), doors.pid)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		switch said {
		case "produce", "into":
			return vehicleProduce(disk, pair.Method, words, said == "into", out, errs)
		case "attach":
			settled, err := vehicle.AttachTo(disk, doors.env, doors.now, pair.Work, pair.Method, doors.pid, doors.windows)
			if err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
			fmt.Fprintf(out, "%s names %s as the vehicle driving it, at port %s.\n", pair.Work, id, vehicle.Number(settled.Port))
			return 0
		case "settle":
			return vehicleSettle(disk, doors, pair, out, errs)
		case "enable":
			return vehicleEnable(disk, pair, out, errs)
		case "detach":
			if err := vehicle.Detach(disk, pair.Work); err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
			fmt.Fprintf(out, "%s names no driver, so the next start asks again.\n", pair.Work)
			return 0
		case "register":
			if vehicle.RegisterVehicle(disk, doors.env, entry, doors.windows) {
				fmt.Fprintf(out, "%s stands in the register.\n", id)
				return 0
			}
			fmt.Fprintln(out, "no register takes a write here.")
			return exitFailed
		}
		return vehicleHere(disk, doors, pair, id, out)
	}
}

// Names the method root the work reaches, making the work a project of this vehicle where it reaches none. [[spec/tickets/extension-imports-stay-inside]]
func vehicleSettle(disk vehicle.Disk, doors vehicleDoors, pair vehicle.Pair, out, errs io.Writer) int {
	settled, err := vehicle.Settles(disk, doors.env, doors.now, pair.Work, pair.Method, doors.pid, doors.windows)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	fmt.Fprintf(out, "method %s\n", settled.Method)
	return 0
}

// Enables the plugin in the work root, the method its marketplace, so the stub shim runs no Node. [[spec/design_output/level0#a-stub-names-its-vehicle]]
func vehicleEnable(disk vehicle.Disk, pair vehicle.Pair, out, errs io.Writer) int {
	enabled, err := vehicle.EnablePlugin(disk, pair.Work, pair.Method)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if !enabled.OK {
		fmt.Fprintln(errs, enabled.Why)
		return exitFailed
	}
	fmt.Fprintf(out, "%s enables level0 from %s.\n", strings.ReplaceAll(pair.Work, `\`, "/"), pair.Method)
	return 0
}

// Copies the method where the words say, a folder standing there refused unless into says so. [[spec/design_output/vehicle#what-travels-into-a-vehicle]]
func vehicleProduce(disk vehicle.Disk, method string, words []string, into bool, out, errs io.Writer) int {
	if len(words) < 2 || words[1] == "" {
		fmt.Fprintln(errs, "se vehicle produce <folder>: say where the vehicle lands.")
		return exitUsage
	}
	dest := words[1]
	put, err := vehicle.Produce(disk, method, dest, into)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if !put.OK {
		fmt.Fprintln(errs, put.Why)
		return exitFailed
	}
	fmt.Fprintf(out, "%d file(s) copied into %s.\n", put.Count, dest)
	fmt.Fprintln(out, "It makes its own identity the first time it runs.")
	return 0
}

// The method, the work, this vehicle, and every vehicle the register holds. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func vehicleHere(disk vehicle.Disk, doors vehicleDoors, pair vehicle.Pair, id string, out io.Writer) int {
	fmt.Fprintf(out, "method  %s\n", pair.Method)
	// The work root prints slashed, as the method root comes, so here spells both roots one way on every box. [[spec/tickets/window-verbs-here-one-spelling]]
	fmt.Fprintf(out, "work    %s\n", strings.ReplaceAll(pair.Work, `\`, "/"))
	itself := ""
	if pair.Itself {
		itself = "  (this tree drives itself)"
	}
	fmt.Fprintf(out, "vehicle %s%s\n", id, itself)
	for _, one := range vehicle.ReadRegister(disk, doors.env, doors.windows) {
		fmt.Fprintf(out, "  %s  %s  %s\n", vehicleShown(one, "id"), vehicleShown(one, "version"), vehicleShown(one, "method_root"))
	}
	return 0
}

// A register field as a template string writes it. [[spec/design_output/vehicle#what-a-vehicle-needs]]
func vehicleShown(one *vehicle.Object, key string) string {
	return vehicle.Shown(vehicle.Get(one, key))
}
