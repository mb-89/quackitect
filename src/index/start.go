// The start of the tree's index: the claim the first caller takes, and the
// wait for the door the index it spawns stands. Every outside call runs
// through door.go.
// [[spec/design_output/index#a-door-comes-back]]
package index

import (
	"fmt"
	"path/filepath"

	"quackitect/src/q"
)

// The command line asks for a door, and this spawns the tree's index where none stands, whatever build the caller runs. [[spec/design_output/index#a-door-comes-back]]
func starts(clock q.Clock, root string) error {
	self, err := executableOf()
	if err != nil {
		return err
	}
	bin := serverOf(self, root)
	if _, err := statOf(bin); err != nil {
		return fmt.Errorf("no index binary stands at %s, and ./RUNME.sh builds one: %w", bin, err)
	}
	marker := startingPath(root)
	var exited <-chan error
	spawned := false
	from := clock.Now()
	for {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		if !spawned && claims(clock, marker) {
			defer removeFile(marker)
			spawned = true
			if exited, err = spawns(bin, root); err != nil {
				return err
			}
		}
		if spawned {
			select {
			case said := <-exited:
				if _, err := standingOf(root); err == nil {
					return nil
				}
				return errorOf(fmt.Sprintf("the index exits before its door stands: %v", said))
			default:
			}
			now := clock.Now()
			_ = chtimesOf(marker, now, now)
		}
		if clock.Now().Sub(from) >= startHang {
			return errorOf(fmt.Sprintf("the index neither stands its door nor exits within %v, so it hangs", startHang))
		}
		<-clock.After(startPollPause)
	}
}

// The claim a caller holds while the index it spawned comes up. [[spec/tickets/reaches-keeps-the-post-fault]]
func startingPath(root string) string {
	return filepath.Join(root, Runtime, "index.starting")
}
