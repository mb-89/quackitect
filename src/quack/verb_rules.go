// The rules verb: the mechanical rules Vale holds, each with its message.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"quackitect/src/index"
)

// The column a rule's name pads to, as COL in src/scripts/cli-doors.js names it. [[spec/tickets/config-verbs-port-to-go]]
const ruleColumn = 20

// The styles the verb lists, the first of which stands or the verb refuses, as STYLES, SHAPE and SCRIPTED in src/scripts/cli-doors.js name them. [[spec/tickets/config-verbs-port-to-go]]
var ruleStyles = []string{"spec/config/styles/VoiceVale", "spec/config/styles/VoiceShape", "spec/config/styles/VoiceScript"}

// A rule's message line, its quotes left off. [[spec/tickets/config-verbs-port-to-go]]
var ruleMessage = regexp.MustCompile(`(?m)^message:[ \t]*"?(.*?)"?[ \t]*$`)

func init() { register("rules", rulesVerb(index.Root)) }

// rules over the root: each yml of each style standing, its name padded, then its message. [[spec/tickets/config-verbs-port-to-go]]
func rulesVerb(root func() (string, error)) twin {
	return func(_ []string, _ bool, out, errs io.Writer) int {
		at, err := root()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if _, err := os.Stat(filepath.Join(at, filepath.FromSlash(ruleStyles[0]))); err != nil {
			fmt.Fprintln(errs, "The style folder is missing.")
			return exitUsage
		}
		for _, style := range ruleStyles {
			folder := filepath.Join(at, filepath.FromSlash(style))
			for _, name := range (rootDisk{folder}).Names("") {
				if !strings.HasSuffix(name, ".yml") {
					continue
				}
				text, _ := os.ReadFile(filepath.Join(folder, name))
				message := ""
				if found := ruleMessage.FindStringSubmatch(string(text)); found != nil {
					message = found[1]
				}
				fmt.Fprintf(out, "%-*s %s\n", ruleColumn, strings.TrimSuffix(name, ".yml"), message)
			}
		}
		return 0
	}
}
