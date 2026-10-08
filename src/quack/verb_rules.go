// The rules verb: the mechanical rules Vale holds, each with its message.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"strings"

	"quackitect/src/index"
)

// The column a rule's name pads to. [[spec/tickets/config-verbs-port-to-go]]
const ruleColumn = 20

// The styles the verb lists, the first of which stands or the verb refuses. [[spec/tickets/config-verbs-port-to-go]]
var ruleStyles = []string{"spec/config/styles/VoiceVale", "spec/config/styles/VoiceShape", "spec/config/styles/VoiceScript"}

// A rule's message line, its quotes left off. [[spec/tickets/config-verbs-port-to-go]]
var ruleMessage = regexp.MustCompile(`(?m)^message:[ \t]*"?(.*?)"?[ \t\r]*$`)

func init() { register("rules", rulesVerb(index.Root, realDisk())) }

// rules over the root: each yml of each style standing, its name padded, then its message. [[spec/tickets/config-verbs-port-to-go]]
func rulesVerb(root func() (string, error), disk diskDoors) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if !disk.stands(filepath.Join(at, filepath.FromSlash(ruleStyles[0]))) {
			fmt.Fprintln(errs, "The style folder is missing.")
			return exitUsage
		}
		for _, style := range ruleStyles {
			folder := filepath.Join(at, filepath.FromSlash(style))
			for _, name := range (rootDisk{folder}).Names("") {
				if !strings.HasSuffix(name, ".yml") {
					continue
				}
				message := ""
				if found := ruleMessage.FindStringSubmatch(disk.text(filepath.Join(folder, name))); found != nil {
					message = found[1]
				}
				fmt.Fprintf(out, "%-*s %s\n", ruleColumn, strings.TrimSuffix(name, ".yml"), message)
			}
		}
		return 0
	}
}
