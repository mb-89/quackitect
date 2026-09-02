//go:build windows

package main

import "testing"

// THE WINDOW FLAGS SURVIVE A QUOTED SCRIPT.
//
// This is the half no other criterion here can see: the other three assert on
// output and exit codes, and a dropped flag changes neither. A fresh
// SysProcAttr written over the one Quietly made would take HideWindow and
// CreationFlags off every child the engine starts.
func TestTheWindowFlagsSurviveAQuotedScript(t *testing.T) {
	t.Parallel()
	r := lane(t)
	cmd := evidenceCommand(r, `rg -q "a phrase with spaces" held.md`)
	if cmd.SysProcAttr == nil {
		t.Fatal("the command carries no SysProcAttr, so both window flags are gone")
	}
	if !cmd.SysProcAttr.HideWindow {
		t.Error("HideWindow is off, so a program that makes its own window shows one")
	}
	if cmd.SysProcAttr.CreationFlags != 0x08000000 {
		t.Errorf("CreationFlags is %#x rather than CREATE_NO_WINDOW, so a console is made",
			cmd.SysProcAttr.CreationFlags)
	}
	// AND THE SCRIPT IS THERE WHOLE, which is what the flags had to survive.
	if cmd.SysProcAttr.CmdLine == "" {
		t.Error("the command line is empty, so the script never reached cmd verbatim")
	}
}
