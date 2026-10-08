// The stub verb in Go: a bare project this vehicle drives, written by
// src/vehicle.
// [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"slices"

	"quackitect/src/vehicle"
)

func init() { register("stub", stubTwin(vehicleOutside)) }

// A path the root leaves alone: one opening on a slash or a drive letter. [[spec/design_output/vehicle#the-work-root-inherits]]
var stubAbsolute = regexp.MustCompile(`^(/|[A-Za-z]:)`)

// The stub verb: into a folder, under the upstream --upstream names or the vehicle's remote. [[spec/design_output/vehicle#a-stub-takes-its-vehicle]]
func stubTwin(doorsOf func() vehicleDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		words := argv[1:]
		flag := slices.Index(words, "--upstream")
		upstream, plain := "", words
		if flag >= 0 {
			if flag+1 < len(words) {
				upstream = words[flag+1]
			}
			plain = []string{}
			for at, one := range words {
				if at != flag && at != flag+1 {
					plain = append(plain, one)
				}
			}
		}
		if len(plain) < 2 || plain[0] != "into" || plain[1] == "" {
			fmt.Fprintln(errs, "se stub into <folder> [--upstream <url>]: say where the stub lands.")
			return exitUsage
		}
		dest := plain[1]
		doors := doorsOf()
		disk := vehicleDisk(dry)
		pair := vehicle.RootsHere(disk, doors.env, doors.root)
		git := func(args ...string) (string, bool) { return doors.git(pair.Method, args...) }
		put, err := vehicle.StubInto(disk, git, doors.now, pair.Method, stubAtRoot(doors.root, dest), doors.pid, upstream)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if !put.OK {
			fmt.Fprintln(errs, put.Why)
			return exitFailed
		}
		fmt.Fprintf(out, "%d file(s) written into %s.\n", len(put.Files), dest)
		fmt.Fprintln(out, "Its shim finds the vehicle through SE_VEHICLE, the register, or where a cloud box clones it.")
		return 0
	}
}

// A path under the root, or the path itself where it stands absolute. [[spec/design_output/vehicle#the-work-root-inherits]]
func stubAtRoot(root, path string) string {
	if stubAbsolute.MatchString(path) {
		return path
	}
	return filepath.Join(root, path)
}
