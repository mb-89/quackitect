// WHAT THE ENGINE DOES WITH A CRITERION'S COMMAND, and nothing else.
//
// A criterion runs under cmd /c on Windows and sh -c elsewhere, started by Go.
// A shell one level out quotes differently, so a form tried in bash proves
// nothing about the form the engine will run.
//
//	go run ./.se/scratchpad/trycmd "<the command>" "<the folder>"
package main

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
)

func main() {
	name, args := "sh", []string{"-c", os.Args[1]}
	if runtime.GOOS == "windows" {
		name, args = "cmd", []string{"/c", os.Args[1]}
	}
	cmd := exec.Command(name, args...)
	cmd.Dir = os.Args[2]
	out, err := cmd.CombinedOutput()
	fmt.Printf("exit: %v\n%s\n", err, out)
}
