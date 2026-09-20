// The one file of this package running a command. Every other file calls one of
// these, so a reader finds the outside in one place.
// [[spec/design_output/doors#a-door-reads-the-outside]]
package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func runs(name string, argv ...string) (string, error) {
	said, err := exec.Command(name, argv...).Output()
	return string(said), err
}

// [[spec/design_output/private#the-box-names-the-owner]]
func gitSays(root, key string) string {
	said := exec.Command("git", "config", key)
	said.Dir = root
	read, err := said.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(read))
}

// [[spec/design_output/tree#the-tree-handed-in]]
func gitFiles(root string) (string, error) {
	said := exec.Command("git", "ls-files")
	said.Dir = root
	read, err := said.Output()
	return string(read), err
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func starts(root string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	one := exec.Command(self, "serve")
	one.Dir = root
	one.Env = append(os.Environ(), "QUACKITECT_ROOT="+root)
	if err := one.Start(); err != nil {
		return err
	}
	go one.Wait()

	for waited := 0; waited < standPolls; waited++ {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		time.Sleep(standPoll)
	}
	return errorOf(fmt.Sprintf("the server took longer than %s to stand", time.Duration(standPolls)*standPoll))
}
