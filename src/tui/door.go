// The window root's door. The root prints its refusals and ends the process
// here, so every other file of this package reads the box nowhere.
// [[spec/design_output/doors#a-door-reads-the-outside]]

package main

import (
	"io"
	"os"
)

// The outside every other file of this package reads through. [[spec/design_output/doors#a-door-reads-the-outside]]
var stderr io.Writer = os.Stderr

func exits(code int) { os.Exit(code) }
