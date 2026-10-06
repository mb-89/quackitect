// The push verb: pushes the branch you stand on, once the check's stamp
// answers green on the commit you stand on.
// [[spec/design_output/work#one-verb-feeds-that-stamp]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/modules/hooks/command"
)

// The check's stamp. .claude/skills/level0/lib/folders.js owns the runtime folder and runs.js the stamp, and the verb spells them again as the hooks module does. [[spec/design_output/work#the-battery-answers-first]]
const checkStampAt = ".se/.runtime/check.json"

func init() {
	register("push", func(argv []string, dry bool, out, errs io.Writer) int {
		return pushVerb(landingHere())(argv, dry, out, errs)
	})
}

// The push verb over the doors. A dry run reads the stamp and pushes nothing. [[spec/design_output/work#one-verb-feeds-that-stamp]]
func pushVerb(d landingDoors) twin {
	return func(_ []string, dry bool, out, errs io.Writer) int {
		stamp, stands := rootDisk{d.root}.Read(checkStampAt)
		head, _ := d.git.Resolve("HEAD")
		if green, says := command.Battery(stamp, stands, head); !green {
			fmt.Fprintf(errs, "The push takes a green check, and %s.\n", says)
			fmt.Fprintln(errs, "Run `./RUNME.sh check` on the commit you stand on, then push again.")
			return exitFailed
		}
		if dry {
			return 0
		}
		branch, _ := d.git.Head()
		if pushed := d.git.Push(branch, false); !pushed.OK {
			fmt.Fprintf(errs, "The push of %s comes back refused:\n", branch)
			fmt.Fprintln(errs, pushed.Err)
			return exitFailed
		}
		fmt.Fprintf(out, "%s stands pushed.\n", branch)
		return 0
	}
}
